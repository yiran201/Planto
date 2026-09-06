<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { EditRound, DeleteOutlineRound } from '@vicons/material';
import { extractPlainTextSummary } from '../utils/markdown.js';

const props = defineProps({
  activity: { type: Object, required: true },
});

const emit = defineEmits(['open', 'edit', 'delete']);

const { t } = useI18n();

// REQ-048：卡片整体重做——横屏封面图 + 标题，点卡片本体打开详情弹层看
// 完整内容，编辑/删除两个小按钮浮在封面右上角（`@click.stop` 防止点到
// 它们时也触发打开详情）。旧版的评价按钮/标签/时长这些字段随 REQ-048
// 一起从数据模型里删掉了，见 domain/activityPool.js 顶部注释。
// （REQ-053/058 期间这里还有类别标签——颜色/emoji 按 id 哈希取值，
// 文字走 `categoryLabel()` 查 i18n 或原文；REQ-082 应用户要求把分类
// 功能整个去掉，`categories` prop、类别标签、`categoryColor`/
// `categoryEmoji`/`categoryLabel` 相关的三个 computed 一起删除，没有
// 图片时的占位改成固定的 emoji + 固定的强调色渐变，不再需要任何"按什么
// 取色/取值"的逻辑。）

const coverStyle = computed(() =>
  props.activity.imageUrl ? { backgroundImage: `url(${JSON.stringify(props.activity.imageUrl)})` } : undefined
);
// REQ-080：卡片露出一小段纯文本摘要——之前卡片只有封面图+分类+标题，
// 看不出这条记录到底记的是什么内容，感觉像图片收藏夹而不是一篇篇
// 笔记；摘要长度 70 字符是给两行文字（`.activity-card__summary` 用
// `-webkit-line-clamp:2` 截断）估出来的经验值，不需要精确对应像素宽度。
const summary = computed(() => extractPlainTextSummary(props.activity.content, 70));
</script>

<template>
  <div class="activity-card" @click="emit('open', activity)">
    <div class="activity-card__cover" :class="{ 'activity-card__cover--placeholder': !activity.imageUrl }" :style="coverStyle">
      <span v-if="!activity.imageUrl" class="activity-card__cover-icon">📝</span>
      <div class="activity-card__cover-actions">
        <button class="activity-card__icon-btn" :title="t('library.editAction')" @click.stop="emit('edit', activity)">
          <n-icon size="15"><EditRound /></n-icon>
        </button>
        <n-popconfirm @positive-click="emit('delete', activity)">
          <template #trigger>
            <button class="activity-card__icon-btn" :title="t('library.deleteAction')" @click.stop>
              <n-icon size="15"><DeleteOutlineRound /></n-icon>
            </button>
          </template>
          {{ t('library.deleteConfirm') }}
        </n-popconfirm>
      </div>
    </div>
    <div class="activity-card__title">{{ activity.title }}</div>
    <div v-if="summary" class="activity-card__summary">{{ summary }}</div>
  </div>
</template>
