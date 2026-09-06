<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMonthStart, addMonths, getMonthGridDates, getDateKey } from '../utils/dateUtils.js';
import { BLOCK_TYPE_COLORS } from '../constants/colors.js';
import { getHolidayInfo } from '../domain/holidays.js';

const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const { t, tm } = useI18n();

const MAX_DOTS = 4;

const monthDate = computed(() => getMonthStart(props.uiState.selectedMonth || new Date()));
const gridDates = computed(() => getMonthGridDates(monthDate.value));
const todayKey = computed(() => getDateKey(new Date()));
const monthTitle = computed(() => t('month.titleFormat', { year: monthDate.value.getFullYear(), month: monthDate.value.getMonth() + 1 }));

// REQ-068：用户反馈月视图"主要标注节假日之类的，周期事件不进行数量
// 标注"——周期事件的物化实例（`block.recurringId` 存在）天天/每周都会
// 出现，同一个周期事件会在很多天里重复占一个点，对"这天有什么特别安排"
// 这个信息的参考价值低，反而挤占本就只有 4 个点位的展示空间；只保留
// 一次性（非周期）事件参与点数标注，周期事件的具体安排还是能在点进
// 日/周视图之后看到，这里只是不再占月历格子里的点位。
function blocksForDate(date) {
  const blocks = props.state.dayTimelines[getDateKey(date)]?.blocks || [];
  return blocks.filter((b) => !b.recurringId);
}

function isCurrentMonth(date) {
  return date.getMonth() === monthDate.value.getMonth();
}

function dotColor(block) {
  return BLOCK_TYPE_COLORS[block.type] || '#a3a3a3';
}

// 节假日只做展示（REQ-011），不参与排程逻辑，见 domain/holidays.js 顶部
// 注释。地区取 settings.region，默认 'CN'，查不到当年数据时返回 null。
function holidayInfo(date) {
  return getHolidayInfo(getDateKey(date), props.state.settings.region || 'CN');
}

function goToday() {
  props.navigate('month', { selectedMonth: getMonthStart(new Date()) });
}
</script>

<template>
  <div class="month-board">
    <div class="view-header">
      <div class="view-header__left">
        <n-button quaternary @click="navigate('month', { selectedMonth: addMonths(monthDate, -1) })">{{ t('month.prevMonth') }}</n-button>
        <h2>{{ monthTitle }}</h2>
        <n-button quaternary @click="navigate('month', { selectedMonth: addMonths(monthDate, 1) })">{{ t('month.nextMonth') }}</n-button>
      </div>
      <div class="view-header__right">
        <n-button type="tertiary" @click="goToday">{{ t('month.goToday') }}</n-button>
      </div>
    </div>

    <div class="month-grid">
      <div class="month-grid__weekdays">
        <div v-for="label in tm('domain.weekdayFull')" :key="label" class="month-grid__weekday">{{ label }}</div>
      </div>
      <div class="month-grid__cells">
        <div
          v-for="date in gridDates"
          :key="getDateKey(date)"
          class="month-cell"
          :class="{
            'month-cell--outside': !isCurrentMonth(date),
            'month-cell--today': getDateKey(date) === todayKey,
          }"
          @click="navigate('day', { selectedDate: date })"
        >
          <div class="month-cell__date">{{ date.getDate() }}</div>
          <div
            v-if="holidayInfo(date)"
            class="month-cell__holiday"
            :class="{ 'month-cell__holiday--workday': holidayInfo(date).type === 'workday' }"
          >
            {{ holidayInfo(date).name }}
          </div>
          <div class="month-cell__dots">
            <span
              v-for="block in blocksForDate(date).slice(0, MAX_DOTS)"
              :key="block.id"
              class="event-dot"
              :style="{ background: dotColor(block) }"
            />
            <span v-if="blocksForDate(date).length > MAX_DOTS" class="event-dot-more">
              +{{ blocksForDate(date).length - MAX_DOTS }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
