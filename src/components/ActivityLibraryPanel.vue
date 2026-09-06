<script setup>
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { AddRound, SearchRound } from '@vicons/material';
import { store } from '../state/store.js';
import { removeActivity } from '../domain/activityPool.js';
import ActivityCard from './ActivityCard.vue';
import ActivityModal from './ActivityModal.vue';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const message = useMessage();
const { t } = useI18n();

// REQ-048："体验库"改名"兴趣活动"重做：标题模糊搜索（子串匹配，和项目
// 里其它地方说的"模糊搜索"是同一个意思，不是纠错式的真模糊匹配）。
// REQ-049：搜索框从页头右上角挪到页头下面单独一行、水平居中
// （`.activity-library__filters`，css/components.css），页头右上角现在
// 只留"添加活动"按钮。
// （REQ-050/053 期间这里还有一套类别筛选——`TOP_CATEGORY_COUNT` 个
// 按使用次数最高的类别铺成可多选 chip，其余塞进一个"更多分类"下拉框，
// 跟标题搜索叠加过滤；REQ-082 应用户要求"分类搜索的功能去除掉，搜索时
// 的根据标题匹配搜索就行"，这一整套（`filterCategories`/
// `sortedCategories`/`topCategories`/`overflowCategories`/
// `overflowCategoryIds`/`overflowOptions`/`toggleCategory()`/
// `overflowSelected`）整个删除，只保留标题子串匹配。）
const searchQuery = ref('');

const activities = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return props.state.activityPool.filter((a) => !query || a.title.toLowerCase().includes(query));
});

// modalTarget：null 表示不显示弹层；字符串 'new' 表示新建；一个真实的
// activity 对象表示查看/编辑那一条。和 EventModal.vue 用 uiState.modal
// 挂载的方式不同——这个面板自己的局部 UI 状态，不需要跨组件共享，用
// 组件内的 ref 更简单，不需要污染 App.vue 的全局 uiState。
const modalTarget = ref(null);

function openAddModal() {
  modalTarget.value = 'new';
}
function openActivityModal(activity) {
  modalTarget.value = activity;
}
function closeModal() {
  modalTarget.value = null;
}

// 卡片右上角的快捷删除（已经过 ActivityCard.vue 自己的
// <n-popconfirm> 二次确认）；弹层里的"删除"走 ActivityModal.vue 自己的
// 二次确认 + removeActivity 调用，两条入口分别处理，不共用这个函数。
function handleQuickDelete(activity) {
  removeActivity(store, activity.id);
  message.success(t('library.deletedToast'));
}
</script>

<template>
  <div class="activity-library">
    <div class="view-header">
      <div class="view-header__left"><h2>{{ t('library.title') }}</h2></div>
      <div class="view-header__right">
        <n-button type="primary" @click="openAddModal">
          <template #icon><n-icon><AddRound /></n-icon></template>
          {{ t('library.addActivity') }}
        </n-button>
      </div>
    </div>

    <div class="activity-library__filters">
      <n-input
        v-model:value="searchQuery"
        class="activity-library__search"
        :placeholder="t('library.searchPlaceholder')"
        clearable
        round
        size="large"
      >
        <template #prefix><n-icon size="18"><SearchRound /></n-icon></template>
      </n-input>
    </div>

    <div v-if="activities.length" class="activity-grid">
      <ActivityCard
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
        @open="openActivityModal"
        @edit="openActivityModal"
        @delete="handleQuickDelete"
      />
    </div>
    <div v-else class="empty-state">{{ t('library.empty') }}</div>

    <ActivityModal
      v-if="modalTarget !== null"
      :activity="modalTarget === 'new' ? null : modalTarget"
      @close="closeModal"
    />
  </div>
</template>
