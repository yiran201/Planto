<script setup>
import { reactive, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { AddRound, DeleteOutlineRound, RedeemRound } from '@vicons/material';
import { store } from '../state/store.js';
import { createReward, deleteReward, updateReward, redeemReward, computeRewardBalance } from '../domain/rewards.js';
// REQ-058：带 `seedKey` 的奖励（REQ-067 之前的老数据可能还有）展示统一
// 走 `rewardLabel(t, reward)` 查 i18n；没有 `seedKey`（新建表单一律不带，
// REQ-067 起新装用户也不会再有内置奖励）就回退显示原始 `reward.title`
// （新建表单本身仍然直接写 `title`，不受影响，见 `submitReward()`）。
import { rewardLabel } from '../utils/i18nLabels.js';

const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const message = useMessage();
const { t, d } = useI18n();

function emptyDraft() {
  return { title: '', value: 0 };
}
const draft = reactive(emptyDraft());

function submitReward() {
  if (!draft.title.trim()) {
    message.warning(t('reward.titleRequired'));
    return;
  }
  createReward(store, { title: draft.title.trim(), value: draft.value });
  Object.assign(draft, emptyDraft());
  message.success(t('reward.createdToast'));
}

function handleDelete(reward) {
  deleteReward(store, reward.id);
  message.success(t('reward.deletedToast'));
}

function handleValueChange(reward, value) {
  updateReward(store, reward.id, { value: Math.max(0, value || 0) });
}

// REQ-046：点数余额从存储字段改成派生计算（见 domain/rewards.js 顶部
// 注释），这里用一个 computed 现算，`state` 的 `dayTimelines`/`rewards`
// 任何一处变化都会自动重新算，不需要手动同步。
const balance = computed(() => computeRewardBalance(props.state));

// 兑换（REQ-019，REQ-022 加二次确认）：点数余额够不够由
// domain/rewards.redeemReward 内部判断，这里只按返回值决定提示成功还是
// "点数不够"——按钮本身也会用 canAfford() 提前置灰，正常操作路径下点
// 不到"点数不够"这个分支，但保留这层提示是为了防御性（比如两个标签页
// 同时开着操作导致余额被抢先花掉的极端情况）。用户要求兑换前要有确认
// 框，模板里用 `<n-popconfirm>` 包住兑换按钮（trigger 插槽放按钮本身，
// 默认插槽放确认文案），`@positive-click` 才真正调用这个函数——按钮本身
// 的点击不再直接触发兑换。
function canAfford(reward) {
  return balance.value >= reward.value;
}

function handleRedeem(reward) {
  const ok = redeemReward(store, reward.id);
  if (ok) message.success(t('reward.redeemedToast', { title: rewardLabel(t, reward) }));
  else message.warning(t('reward.notEnoughPoints', { needed: reward.value - balance.value }));
}

const unclaimedRewards = computed(() => props.state.rewards.filter((r) => !r.claimed));
const claimedRewards = computed(() => props.state.rewards.filter((r) => r.claimed));
</script>

<template>
  <div class="reward-panel">
    <div class="view-header">
      <div class="view-header__left"><h2>{{ t('reward.title') }}</h2></div>
      <div class="view-header__right">
        <n-tag type="success" size="large" round>{{ t('reward.pointsBalance', { points: balance }) }}</n-tag>
      </div>
    </div>
    <p class="settings-hint">{{ t('reward.pointsHint') }}</p>

    <div class="activity-form">
      <div class="settings-inline-row settings-goal-form">
        <n-input v-model:value="draft.title" :placeholder="t('reward.titlePlaceholder')" style="width: 220px" />
        <n-input-number v-model:value="draft.value" :min="0" :step="1000" style="width: 180px">
          <template #suffix>{{ t('reward.valueSuffix') }}</template>
        </n-input-number>
        <n-button type="primary" @click="submitReward">
          <template #icon><n-icon><AddRound /></n-icon></template>
          {{ t('reward.addReward') }}
        </n-button>
      </div>
    </div>

    <div class="settings-section">
      <h3>{{ t('reward.unclaimedSection') }}</h3>
      <div v-if="unclaimedRewards.length" class="table-scroll">
        <table class="quota-table">
          <thead>
            <tr>
              <th>{{ t('reward.nameHeader') }}</th>
              <th>{{ t('reward.valueHeader') }}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reward in unclaimedRewards" :key="reward.id">
              <td>{{ rewardLabel(t, reward) }}</td>
              <td>
                <n-input-number
                  :value="reward.value"
                  :min="0"
                  :step="1000"
                  size="small"
                  style="width: 150px"
                  @update:value="(v) => handleValueChange(reward, v)"
                />
              </td>
              <td>
                <n-popconfirm @positive-click="handleRedeem(reward)">
                  <template #trigger>
                    <n-button size="small" type="primary" :disabled="!canAfford(reward)">
                      <template #icon><n-icon><RedeemRound /></n-icon></template>
                      {{ canAfford(reward) ? t('reward.redeemBtn') : t('reward.notEnoughPoints', { needed: reward.value - balance }) }}
                    </n-button>
                  </template>
                  {{ t('reward.redeemConfirm', { title: rewardLabel(t, reward), points: reward.value }) }}
                </n-popconfirm>
              </td>
              <td>
                <n-button quaternary size="small" type="error" @click="handleDelete(reward)">
                  <template #icon><n-icon><DeleteOutlineRound /></n-icon></template>
                </n-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="settings-hint">{{ t('reward.unclaimedEmpty') }}</p>
    </div>

    <div class="settings-section">
      <h3>{{ t('reward.claimedSection') }}</h3>
      <div v-if="claimedRewards.length" class="table-scroll">
        <table class="quota-table">
          <thead>
            <tr>
              <th>{{ t('reward.nameHeader') }}</th>
              <th>{{ t('reward.valueHeader') }}</th>
              <th>{{ t('reward.claimedAtHeader') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reward in claimedRewards" :key="reward.id">
              <td>{{ rewardLabel(t, reward) }}</td>
              <td>{{ reward.value }}</td>
              <td>{{ d(new Date(reward.claimedAt), 'long') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="settings-hint">{{ t('reward.claimedEmpty') }}</p>
    </div>
  </div>
</template>
