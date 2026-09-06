<script setup>
import { reactive, ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { AddRound, DeleteOutlineRound, CheckCircleRound, EditRound, CheckRound, CloseRound, KeyboardArrowDownRound } from '@vicons/material';
import { store } from '../state/store.js';
import { createPlan, abolishPlan, removeKeyEvent, computePlanProgress, updatePlan, updateKeyEvent, addKeyEvent } from '../domain/plans.js';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const message = useMessage();
const { t } = useI18n();

// 新建计划表单：标题 + 一组关键事件草稿（每条都有标题和预计时长），
// 提交后一次性通过 createPlan 建好整个计划——关键事件的顺序就是数组
// 顺序，不需要额外的排序字段，见 domain/plans.js 顶部注释。
function emptyKeyEventDraft() {
  return { title: '', estimatedHours: 1 };
}
function emptyPlanDraft() {
  return { title: '', keyEvents: [emptyKeyEventDraft()] };
}
const formOpen = ref(false);
const planDraft = reactive(emptyPlanDraft());

function openCreateForm() {
  Object.assign(planDraft, emptyPlanDraft());
  formOpen.value = true;
}
function closeCreateForm() {
  formOpen.value = false;
}
function addDraftRow() {
  planDraft.keyEvents.push(emptyKeyEventDraft());
}
function removeDraftRow(index) {
  if (planDraft.keyEvents.length <= 1) return;
  planDraft.keyEvents.splice(index, 1);
}

function submitPlan() {
  if (!planDraft.title.trim()) {
    message.warning(t('plan.titleRequired'));
    return;
  }
  const keyEvents = planDraft.keyEvents.filter((ke) => ke.title.trim());
  if (!keyEvents.length) {
    message.warning(t('plan.keyEventRequired'));
    return;
  }
  createPlan(store, {
    title: planDraft.title.trim(),
    keyEvents: keyEvents.map((ke) => ({ title: ke.title.trim(), estimatedHours: ke.estimatedHours })),
  });
  message.success(t('plan.createdToast'));
  closeCreateForm();
}

// 取消计划（REQ-038 时叫"废止计划"，REQ-081 用户要求按钮文案改成
// "取消计划"并加二次确认）：底层数据模型/domain 函数名（`abolished`
// 字段、`domain/plans.abolishPlan()`）保留不改——这次只是 UI 展示层面
// 的措辞调整，不是语义变化，没必要连带改动数据结构和函数名这类更大的
// 改动面；计划数据不会被删掉，只是标记 `abolished:true`，模板里据此
// 隐藏标题/关键事件的编辑入口、整卡片视觉变淡，见 domain/plans.js 顶部
// 注释。没有"恢复"入口，用户没有要求可撤销，也是二次确认要着重提醒的
// 点。二次确认参考 RewardPanel.vue 兑换按钮的实现（`<n-popconfirm
// @positive-click>`），同一套"危险操作二次确认"惯例。
function handleCancelPlan(plan) {
  abolishPlan(store, plan.id);
  message.success(t('plan.cancelPlanToast'));
}

function handleRemoveKeyEvent(plan, keyEvent) {
  removeKeyEvent(store, plan.id, keyEvent.id);
}

// 计划标题编辑（REQ-032，用户反馈"计划设置可以进行修改，现在修改不了"）
// ——原来只能创建/删除整份计划，没有编辑入口。行内编辑：点铅笔图标把
// h3 换成输入框，回车/勾选保存，叉号取消，草稿只在编辑期间存在。
const titleEditingId = ref(null);
const titleDraft = ref('');
function startEditTitle(plan) {
  titleEditingId.value = plan.id;
  titleDraft.value = plan.title;
}
function cancelEditTitle() {
  titleEditingId.value = null;
}
function saveTitle(plan) {
  const trimmed = titleDraft.value.trim();
  if (!trimmed) {
    message.warning(t('plan.titleRequired'));
    return;
  }
  updatePlan(store, plan.id, { title: trimmed });
  titleEditingId.value = null;
  message.success(t('plan.updatedToast'));
}

// 关键事件编辑：同样是行内编辑，只对还没完成的关键事件显示编辑入口
// （domain/plans.updateKeyEvent 本身也会拒绝改已完成的，这里在 UI 层
// 提前不显示按钮，避免用户点了却没反应）。
const keyEventEditingId = ref(null);
const keyEventDraft = reactive({ title: '', estimatedHours: 1 });
function startEditKeyEvent(keyEvent) {
  keyEventEditingId.value = keyEvent.id;
  keyEventDraft.title = keyEvent.title;
  keyEventDraft.estimatedHours = keyEvent.estimatedHours;
}
function cancelEditKeyEvent() {
  keyEventEditingId.value = null;
}
function saveKeyEvent(plan, keyEvent) {
  const trimmed = keyEventDraft.title.trim();
  if (!trimmed) {
    message.warning(t('plan.keyEventTitleRequired'));
    return;
  }
  updateKeyEvent(store, plan.id, keyEvent.id, { title: trimmed, estimatedHours: keyEventDraft.estimatedHours });
  keyEventEditingId.value = null;
  message.success(t('plan.keyEventUpdatedToast'));
}

// 在已有计划末尾追加新关键事件（REQ-054）——每张计划卡片自己一份草稿
// （`newKeyEventDrafts`，按 planId 存，和 `expandedPlans` 同一个"局部
// UI 状态用 reactive 对象按 id 存"的惯例），首次访问某个 planId 时懒
// 初始化一份空草稿，提交成功后重置回空，方便连续添加多条。
function emptyNewKeyEventDraft() {
  return { title: '', estimatedHours: 1 };
}
const newKeyEventDrafts = reactive({});
function getNewKeyEventDraft(planId) {
  if (!newKeyEventDrafts[planId]) newKeyEventDrafts[planId] = emptyNewKeyEventDraft();
  return newKeyEventDrafts[planId];
}
function handleAddKeyEvent(plan) {
  const draft = getNewKeyEventDraft(plan.id);
  const trimmed = draft.title.trim();
  if (!trimmed) {
    message.warning(t('plan.keyEventTitleRequired'));
    return;
  }
  addKeyEvent(store, plan.id, { title: trimmed, estimatedHours: draft.estimatedHours });
  newKeyEventDrafts[plan.id] = emptyNewKeyEventDraft();
  message.success(t('plan.keyEventAddedToast'));
}

// 整份计划折叠（REQ-037，用户反馈"计划通过点击可以折叠计划"——和
// REQ-036 删掉的"关键事件列表单独展开/收起"不是同一回事：这次是整张
// 计划卡片一起收起/展开，用卡片头部一个 chevron 图标按钮触发，纯界面
// 状态，不写进 store。折叠只隐藏进度条/关键事件列表/"当前待完成"提示，
// 标题和进度标签（在卡片头部）折叠状态下仍然可见，一眼能看出这份计划
// 的大致进度。REQ-057：默认改成收起，用户反馈"计划不要默认细节展开"——
// 计划一多，逐个展开的细节会把列表拉得很长，默认收起、按需点开更清爽。
// 存的字段从"是否折叠"倒过来改存"是否手动展开过"（`expandedPlans`），
// 语义上更直接对应"默认是收起的，展开需要用户主动点一下"这句话，避免
// 用一个默认值是 `undefined`（falsy）但含义要读成"没折叠"的绕弯写法。
const expandedPlans = reactive({});
function toggleCollapse(planId) {
  expandedPlans[planId] = !expandedPlans[planId];
}

// 关键事件状态：已完成 / 当前解锁（可以添加到时间轴、也可以在时间轴上
// 标记完成）/ 还被锁着（前面还有没完成的）。纯展示判断，不改数据。
function keyEventStatus(plan, keyEvent) {
  if (keyEvent.completedAt) return 'done';
  const progress = computePlanProgress(plan);
  return progress.activeKeyEvent && progress.activeKeyEvent.id === keyEvent.id ? 'active' : 'locked';
}

const plansWithProgress = computed(() => props.state.plans.map((plan) => ({ plan, progress: computePlanProgress(plan) })));
</script>

<template>
  <div class="plan-panel">
    <div class="view-header">
      <div class="view-header__left"><h2>{{ t('plan.title') }}</h2></div>
      <div class="view-header__right">
        <n-button type="primary" @click="openCreateForm">
          <template #icon><n-icon><AddRound /></n-icon></template>
          {{ t('plan.addPlan') }}
        </n-button>
      </div>
    </div>

    <div v-if="formOpen" class="activity-form">
      <label class="field-label plan-form__title">
        {{ t('plan.titleLabel') }}
        <n-input v-model:value="planDraft.title" :placeholder="t('plan.titlePlaceholder')" />
      </label>

      <div class="plan-form__key-events">
        <div class="field-label">{{ t('plan.keyEventsLabel') }}</div>
        <div v-for="(ke, idx) in planDraft.keyEvents" :key="idx" class="plan-form__key-event-row">
          <span class="plan-key-event__index">{{ idx + 1 }}</span>
          <n-input v-model:value="ke.title" :placeholder="t('plan.keyEventTitlePlaceholder')" style="flex: 1" />
          <n-input-number v-model:value="ke.estimatedHours" :min="0.25" :step="0.25" style="width: 130px">
            <template #suffix>{{ t('plan.hoursSuffix') }}</template>
          </n-input-number>
          <n-button quaternary circle size="small" :disabled="planDraft.keyEvents.length <= 1" @click="removeDraftRow(idx)">
            <template #icon><n-icon><DeleteOutlineRound /></n-icon></template>
          </n-button>
        </div>
        <n-button quaternary size="small" @click="addDraftRow">
          <template #icon><n-icon><AddRound /></n-icon></template>
          {{ t('plan.addKeyEventRow') }}
        </n-button>
      </div>

      <div class="activity-form__actions">
        <n-button type="primary" @click="submitPlan">{{ t('plan.saveNew') }}</n-button>
        <n-button quaternary @click="closeCreateForm">{{ t('plan.cancel') }}</n-button>
      </div>
    </div>

    <div v-if="plansWithProgress.length" class="plan-list">
      <div v-for="{ plan, progress } in plansWithProgress" :key="plan.id" class="plan-card" :class="{ 'plan-card--abolished': plan.abolished }">
        <div class="plan-card__header">
          <div class="plan-card__title-row">
            <n-button quaternary circle size="tiny" @click="toggleCollapse(plan.id)">
              <template #icon>
                <n-icon size="16" class="plan-card__collapse-icon" :class="{ 'plan-card__collapse-icon--collapsed': !expandedPlans[plan.id] }">
                  <KeyboardArrowDownRound />
                </n-icon>
              </template>
            </n-button>
            <template v-if="titleEditingId === plan.id">
              <n-input v-model:value="titleDraft" size="small" style="width: 220px" @keyup.enter="saveTitle(plan)" />
              <n-button quaternary circle size="tiny" @click="saveTitle(plan)">
                <template #icon><n-icon size="14"><CheckRound /></n-icon></template>
              </n-button>
              <n-button quaternary circle size="tiny" @click="cancelEditTitle">
                <template #icon><n-icon size="14"><CloseRound /></n-icon></template>
              </n-button>
            </template>
            <template v-else>
              <h3>{{ plan.title }}</h3>
              <n-button v-if="!plan.abolished" quaternary circle size="tiny" @click="startEditTitle(plan)">
                <template #icon><n-icon size="14"><EditRound /></n-icon></template>
              </n-button>
            </template>
            <n-tag :type="progress.isFinished ? 'success' : 'default'" size="small" round>
              {{ progress.isFinished ? t('plan.finishedTag') : t('plan.progressTag', { done: progress.completedCount, total: progress.total }) }}
            </n-tag>
            <n-tag v-if="plan.abolished" size="small" round :bordered="false">{{ t('plan.cancelPlanTag') }}</n-tag>
          </div>
          <n-popconfirm v-if="!plan.abolished" @positive-click="handleCancelPlan(plan)">
            <template #trigger>
              <n-button quaternary size="small" type="warning">
                {{ t('plan.cancelPlanBtn') }}
              </n-button>
            </template>
            {{ t('plan.cancelPlanConfirm') }}
          </n-popconfirm>
        </div>

        <template v-if="expandedPlans[plan.id]">
          <n-progress
            type="line"
            :percentage="progress.total ? Math.round((progress.completedCount / progress.total) * 100) : 0"
            :show-indicator="false"
            :height="6"
          />

          <ol class="plan-key-event-list">
            <li
              v-for="ke in plan.keyEvents"
              :key="ke.id"
              class="plan-key-event"
              :class="`plan-key-event--${keyEventStatus(plan, ke)}`"
            >
              <template v-if="keyEventEditingId === ke.id">
                <n-input v-model:value="keyEventDraft.title" size="tiny" style="flex: 1" @keyup.enter="saveKeyEvent(plan, ke)" />
                <n-input-number v-model:value="keyEventDraft.estimatedHours" :min="0.25" :step="0.25" size="tiny" style="width: 100px">
                  <template #suffix>{{ t('plan.hoursSuffix') }}</template>
                </n-input-number>
                <n-button quaternary circle size="tiny" @click="saveKeyEvent(plan, ke)">
                  <template #icon><n-icon size="14"><CheckRound /></n-icon></template>
                </n-button>
                <n-button quaternary circle size="tiny" @click="cancelEditKeyEvent">
                  <template #icon><n-icon size="14"><CloseRound /></n-icon></template>
                </n-button>
              </template>
              <template v-else>
                <n-icon v-if="ke.completedAt" size="16" class="plan-key-event__icon"><CheckCircleRound /></n-icon>
                <span v-else class="plan-key-event__icon plan-key-event__icon--placeholder" />
                <span class="plan-key-event__title">{{ ke.title }}</span>
                <span class="plan-key-event__hours">{{ t('plan.hoursValue', { hours: ke.estimatedHours }) }}</span>
                <n-button v-if="!ke.completedAt && !plan.abolished" quaternary circle size="tiny" @click="startEditKeyEvent(ke)">
                  <template #icon><n-icon size="14"><EditRound /></n-icon></template>
                </n-button>
                <n-button
                  v-if="!ke.completedAt && !plan.abolished"
                  quaternary
                  circle
                  size="tiny"
                  @click="handleRemoveKeyEvent(plan, ke)"
                >
                  <template #icon><n-icon size="14"><DeleteOutlineRound /></n-icon></template>
                </n-button>
              </template>
            </li>
          </ol>

          <div v-if="!plan.abolished" class="plan-key-event-row plan-key-event-row--add">
            <n-input
              v-model:value="getNewKeyEventDraft(plan.id).title"
              size="small"
              :placeholder="t('plan.keyEventTitlePlaceholder')"
              style="flex: 1"
              @keyup.enter="handleAddKeyEvent(plan)"
            />
            <n-input-number v-model:value="getNewKeyEventDraft(plan.id).estimatedHours" :min="0.25" :step="0.25" size="small" style="width: 120px">
              <template #suffix>{{ t('plan.hoursSuffix') }}</template>
            </n-input-number>
            <n-button quaternary size="small" @click="handleAddKeyEvent(plan)">
              <template #icon><n-icon><AddRound /></n-icon></template>
              {{ t('plan.appendKeyEventBtn') }}
            </n-button>
          </div>

          <p v-if="progress.activeKeyEvent && !plan.abolished" class="settings-hint">
            {{ t('plan.activeHint', { title: progress.activeKeyEvent.title }) }}
          </p>
        </template>
      </div>
    </div>
    <div v-else class="empty-state">{{ t('plan.empty') }}</div>
  </div>
</template>
