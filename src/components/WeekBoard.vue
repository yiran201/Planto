<script setup>
import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { getWeekStart, getWeekDates, getDateKey, addDays, addWeeks, weekdayIndex, parseDateKey } from '../utils/dateUtils.js';
import { computeBlockLayout, columnBoxStyle } from '../utils/blockOverlap.js';
import { store } from '../state/store.js';
import { getHolidayInfo } from '../domain/holidays.js';
import {
  TIMELINE_RANGE,
  DISPLAY_START_HOUR,
  toDisplayOffset,
  fromDisplayRatio,
  displayStartHour,
  needsDisplaySplit,
  splitDisplaySegments,
} from '../constants/timelineRange.js';
import { useNow } from '../composables/useNow.js';

const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const message = useMessage();
const { t, tm } = useI18n();

// 时间轴高度由 CSS flex 铺满可视区域决定，不是固定像素，块的位置/高度
// 用百分比（相对 totalHours）；见 DayTimeline.vue 同款注释。
const totalHours = TIMELINE_RANGE.end - TIMELINE_RANGE.start;

const weekStart = computed(() => getWeekStart(props.uiState.selectedWeekStart || new Date()));
const weekDates = computed(() => getWeekDates(weekStart.value));

const rangeLabel = computed(() => {
  const dates = weekDates.value;
  return `${dates[0].getMonth() + 1}/${dates[0].getDate()} - ${dates[6].getMonth() + 1}/${dates[6].getDate()}`;
});

// 时间轴从 DISPLAY_START_HOUR（6 点）开始画，见 DayTimeline.vue 同款注释。
const hours = computed(() => Array.from({ length: totalHours }, (_, i) => (DISPLAY_START_HOUR + i) % 24));
const gridLineOffsets = computed(() => Array.from({ length: totalHours + 1 }, (_, i) => (i / totalHours) * 100));

function blocksForDate(date) {
  const dateKey = getDateKey(date);
  return (props.state.dayTimelines[dateKey]?.blocks || []).slice().sort((a, b) => a.start - b.start);
}

// REQ-045 起真实起止时间跨过 DISPLAY_START_HOUR（6 点）分界线的块拆成
// 两个渲染片段；REQ-047 改成前半段挪去前一天渲染，和 DayTimeline.vue
// 同款处理，完整原理见该组件条目里的注释，这里不重复展开。`dayBlocks`
// （第二个参数传给 `blockStyle`）用完整的 `blocksForDate()` 结果（真实
// start/end），重叠分栏判定只看这一天自己的块，不含"借来"的片段。
function renderItemsForDate(date) {
  const dateKey = getDateKey(date);
  const dayBlocks = blocksForDate(date);
  const nextDate = addDays(date, 1);
  const nextDateKey = getDateKey(nextDate);
  const nextDayBlocks = blocksForDate(nextDate);
  const items = [];
  for (const block of dayBlocks) {
    if (needsDisplaySplit(block)) {
      const [, seg2] = splitDisplaySegments(block);
      items.push({ key: `${block.id}-b`, block, dateKey, segStart: seg2.start, segEnd: seg2.end, isClosing: true });
    } else {
      items.push({ key: block.id, block, dateKey, segStart: block.start, segEnd: block.end, isClosing: true });
    }
  }
  for (const block of nextDayBlocks) {
    if (needsDisplaySplit(block)) {
      const [seg1] = splitDisplaySegments(block);
      items.push({ key: `${block.id}-a`, block, dateKey: nextDateKey, segStart: seg1.start, segEnd: seg1.end, isClosing: false });
    }
  }
  return items;
}

// top 用 displayStartHour() 做起点留白、height 再减去几像素做块间间隙，
// 见 DayTimeline.vue 同款注释，两边逻辑一致。时间上重叠的两个块改成左右
// 各占一半宽度，见 utils/blockOverlap.js。
//
// 【bug 修复，同 DayTimeline.vue】原来的固定 `minHeight:'18px'` 在块本身
// 时长很短、且后面紧跟着另一个不重叠的块时，会把撑高的部分一路啃到下一
// 个块的起点，吃掉两者之间该有的视觉间隔——改成用 CSS `min()`/`max()`
// 把最小可读高度钳制在"到下一个块之前还剩多少空间"以内，见
// DayTimeline.vue 里更详细的注释。
//
// 【bug 修复 #2，同 DayTimeline.vue】nextBlock 只找时间上不重叠的下一个
// 块，左右分栏显示的重叠块（比如 8:00-9:00 和 8:30-9:00）互相都不算
// 对方的 nextBlock，导致时长较短、又没有 nextBlock 兜底的那个块被
// 18px 可读性下限撑出来的部分越过自己真实的结束时间——只在这个块确实
// 分栏（`columns>1`）时才加一层"不能超过自己真实高度"的上限，孤立块
// （`columns===1`）不受影响，仍然可以为了可读性撑得比真实比例高，详细
// 原理见 DayTimeline.vue 同款注释。
// REQ-045：参数从 block 改成渲染片段 item（{block, segStart, segEnd}），
// 同 DayTimeline.vue 的 blockStyle 注释——绝大多数块 segStart/segEnd 就是
// 它自己的 start/end，只有跨界拆分的块会用各自片段的范围算位置/高度。
function blockStyle(item, dayBlocks) {
  const { block, segStart, segEnd } = item;
  const seg = { start: segStart, end: segEnd };
  const startDisplay = displayStartHour(seg);
  const top = (toDisplayOffset(startDisplay) / totalHours) * 100;
  const naturalHeight = ((segEnd - startDisplay) / totalHours) * 100;
  const { column, columns } = computeBlockLayout(dayBlocks).get(block.id) || { column: 0, columns: 1 };

  // 拆分出来的两个片段不互相当 nextBlock，见 DayTimeline.vue 同款注释。
  const isSplitSegment = segStart !== block.start || segEnd !== block.end;
  const nextBlock = isSplitSegment
    ? null
    : dayBlocks.filter((b) => b.id !== block.id && b.start >= segEnd).sort((a, b) => a.start - b.start)[0];

  const ceilings = [];
  if (columns > 1) ceilings.push(`${naturalHeight}%`);
  if (nextBlock) {
    const availableHours = displayStartHour(nextBlock) - startDisplay;
    const availablePercent = (availableHours / totalHours) * 100;
    ceilings.push(`calc(${availablePercent}% - 4px)`);
  }
  const floored = `max(calc(${naturalHeight}% - 4px), 18px)`;
  const heightExpr = ceilings.length ? `min(${floored}, ${ceilings.join(', ')})` : floored;

  const style = { top: `${top}%`, height: heightExpr };
  Object.assign(style, columnBoxStyle(column, columns));
  return style;
}

// 节假日只做展示（REQ-011），不参与排程逻辑，见 domain/holidays.js 顶部注释。
function holidayInfo(date) {
  return getHolidayInfo(getDateKey(date), props.state.settings.region || 'CN');
}

function isToday(date) {
  return getDateKey(new Date()) === getDateKey(date);
}

function weekdayLabel(date) {
  return tm('domain.weekdayFull')[weekdayIndex(date)];
}

// "现在"横线：只在今天那一列显示，每 30 秒刷新一次（见 useNow）。范围
// 已经是全天 24 小时，"现在"必然落在这个范围内，不需要再额外判断可见性。
const now = useNow();
const nowHour = computed(() => now.value.getHours() + now.value.getMinutes() / 60);
const nowTop = computed(() => `${(toDisplayOffset(nowHour.value) / totalHours) * 100}%`);

const dragOverDateKey = ref(null);

function onDragStart(event, blockId, fromDateKey) {
  event.dataTransfer.setData('text/plain', JSON.stringify({ blockId, fromDateKey }));
  event.dataTransfer.effectAllowed = 'move';
}

function onDragOver(toDateKey) {
  dragOverDateKey.value = toDateKey;
}

function onDragLeave(toDateKey) {
  if (dragOverDateKey.value === toDateKey) dragOverDateKey.value = null;
}

function onDrop(event, toDateKey) {
  dragOverDateKey.value = null;
  const raw = event.dataTransfer.getData('text/plain');
  if (!raw) return;
  try {
    const { blockId, fromDateKey } = JSON.parse(raw);
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const newStart = Math.round(fromDisplayRatio(offsetY / rect.height, totalHours) * 4) / 4;
    moveBlock(blockId, fromDateKey, toDateKey, newStart);
  } catch (err) {
    console.warn('[Planto] drop payload 解析失败', err);
  }
}

function moveBlock(blockId, fromKey, toKey, newStart) {
  store.setState((s) => {
    const fromBlocks = s.dayTimelines[fromKey]?.blocks || [];
    const block = fromBlocks.find((b) => b.id === blockId);
    if (!block || block.source === 'google' || needsDisplaySplit(block)) return {};

    const duration = block.end - block.start;
    let start = Math.max(TIMELINE_RANGE.start, Math.min(TIMELINE_RANGE.end - duration, newStart));
    start = Math.round(start * 4) / 4;
    const movedBlock = { ...block, start, end: start + duration, source: 'manual' };

    if (fromKey === toKey) {
      const next = fromBlocks.map((b) => (b.id === blockId ? movedBlock : b)).sort((a, b) => a.start - b.start);
      return { dayTimelines: { ...s.dayTimelines, [fromKey]: { blocks: next } } };
    }

    const newFrom = fromBlocks.filter((b) => b.id !== blockId);
    const toBlocks = s.dayTimelines[toKey]?.blocks || [];
    const newTo = [...toBlocks, movedBlock].sort((a, b) => a.start - b.start);

    return {
      dayTimelines: {
        ...s.dayTimelines,
        [fromKey]: { blocks: newFrom },
        [toKey]: { blocks: newTo },
      },
    };
  });
  message.success(t('week.movedToast'));
}

function onDayGridClick(event, date) {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  const clickedStart = Math.round(fromDisplayRatio(offsetY / rect.height, totalHours) * 2) / 2;
  props.navigate('week', { modal: { mode: 'create', dateKey: getDateKey(date), defaultStart: clickedStart } });
}
</script>

<template>
  <div class="week-board">
    <div class="view-header">
      <div class="view-header__left">
        <n-button quaternary @click="navigate('week', { selectedWeekStart: addWeeks(weekStart, -1) })">{{ t('week.prevWeek') }}</n-button>
        <h2>{{ t('week.title', { range: rangeLabel }) }}</h2>
        <n-button quaternary @click="navigate('week', { selectedWeekStart: addWeeks(weekStart, 1) })">{{ t('week.nextWeek') }}</n-button>
      </div>
    </div>

    <div class="week-timeline">
      <div class="week-timeline__hours">
        <div class="week-timeline__corner" />
        <div v-for="h in hours" :key="h" class="hour-label">
          {{ String(h).padStart(2, '0') }}:00
        </div>
      </div>
      <div class="week-timeline__days">
        <div
          v-for="date in weekDates"
          :key="getDateKey(date)"
          class="week-timeline__day"
          :class="{ 'week-timeline__day--today': isToday(date) }"
        >
          <div
            class="week-timeline__day-header"
            :title="holidayInfo(date)?.name"
            @click="navigate('day', { selectedDate: date })"
          >
            <div class="week-column__weekday">{{ weekdayLabel(date) }}</div>
            <div
              class="week-column__date"
              :class="{
                'week-column__date--holiday': holidayInfo(date)?.type === 'holiday',
                'week-column__date--workday': holidayInfo(date)?.type === 'workday',
              }"
            >
              {{ date.getDate() }}
            </div>
          </div>
          <div
            class="week-timeline__day-grid"
            :class="{ 'drop-target': dragOverDateKey === getDateKey(date) }"
            @click.self="onDayGridClick($event, date)"
            @dragover.prevent="onDragOver(getDateKey(date))"
            @dragleave="onDragLeave(getDateKey(date))"
            @drop="onDrop($event, getDateKey(date))"
          >
            <div v-for="offset in gridLineOffsets" :key="offset" class="grid-line" :style="{ top: `${offset}%` }" />
            <div v-if="isToday(date)" class="now-line" :style="{ top: nowTop }" />
            <div
              v-for="item in renderItemsForDate(date)"
              :key="item.key"
              class="timeline-block"
              :class="[
                `timeline-block--${item.block.type}`,
                {
                  'timeline-block--locked': item.block.source === 'google',
                  'timeline-block--skipped': item.block.status === 'skipped',
                },
              ]"
              :style="blockStyle(item, blocksForDate(date))"
              :draggable="item.isClosing && item.block.source !== 'google' && !needsDisplaySplit(item.block)"
              @click="navigate('day', { selectedDate: parseDateKey(item.dateKey) })"
              @dragstart="onDragStart($event, item.block.id, item.dateKey)"
            >
              <div class="timeline-block__title">{{ item.block.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
