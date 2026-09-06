<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { EditRound } from '@vicons/material';
import { store } from '../state/store.js';
import { getYearStart, addYears, getMonthGridDates, getDateKey, getMonthKey } from '../utils/dateUtils.js';
import { getHolidayInfo } from '../domain/holidays.js';

const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const { t, tm } = useI18n();

const yearDate = computed(() => getYearStart(props.uiState.selectedYear || new Date()));
const todayKey = computed(() => getDateKey(new Date()));

// 12 份月历网格数据，每份复用和 MonthBoard.vue 相同的
// `getMonthGridDates()`（6 周 × 7 天，周一起始，补齐月首/月末）。年
// 视图一屏要放 12 个月，格子远比月视图小，不适合再展示假日名/事件圆点
// 这类细节——`monthsInYear` 只留下"这个格子属不属于当前月"和"这天算不
// 算有安排"两个判断，多余信息留给点进去之后的月/日视图。
const monthsInYear = computed(() => {
  const year = yearDate.value.getFullYear();
  return Array.from({ length: 12 }, (_, month) => {
    const start = new Date(year, month, 1);
    return { month, start, key: getMonthKey(start), gridDates: getMonthGridDates(start) };
  });
});

function goToday() {
  props.navigate('year', { selectedYear: getYearStart(new Date()) });
}

// 节假日标注（REQ-068，用户要求"年视图的节假日要标上"）：格子太小
// （9px 字号）放不下 MonthBoard.vue 那种假日名文字，改成给格子本身
// 染色（放假用 --danger 红、调休上班用一条静音色描边）+ 原生 `title`
// 属性 hover 提示完整假日名。地区取 settings.region，逻辑和
// `MonthBoard.vue`/`WeekBoard.vue` 完全一样，查不到当年数据时返回
// null（domain/holidays.js 的既有约定），调用方按"这天没有特殊标记"
// 处理。
function holidayInfo(date) {
  return getHolidayInfo(getDateKey(date), props.state.settings.region || 'CN');
}

// 月度标语（REQ-068，取代了 REQ-060 时期"按事件数量染色的热力图"——用户
// 反馈"不要标注事件颜色深的深度"，改成用户自己给某个月手写一句标语，
// 给月份目标做标记用，纯自由文本。`editingMonthKey` 同一时间只允许编辑
// 一个月份（和 PlanPanel.vue 的追加关键事件表单是同一类"单份草稿"写法，
// 不需要给 12 个月份各自维护一份 ref）。输入框用 `n-input` 自带的
// `autofocus` prop（核对过 naive-ui 的 Input 组件确实支持这个 prop，
// 见 node_modules 类型定义）自动聚焦，`v-if` 每次进入编辑态都会重新
// 挂载这个 `n-input`，不需要手动管理 ref + nextTick + focus()。
const editingMonthKey = ref(null);
const labelDraft = ref('');

function monthLabel(key) {
  return props.state.monthLabels?.[key] || '';
}

function startEditLabel(key) {
  editingMonthKey.value = key;
  labelDraft.value = monthLabel(key);
}

// `@keyup.enter`/`@blur` 都会调用这个函数（回车确认时手动触发一次，
// 之后 `n-input` 因为 `v-if` 变 false 被卸载，浏览器会紧跟着再派发一次
// 原生 blur，`@blur` 也会调用一次）；`editingMonthKey.value !== key` 这
// 个前置判断让第二次调用（以及 Escape 取消后紧跟的那次 blur）安全地
// 变成空操作，不会重复写 state，也不会在按 Escape 取消后把草稿"补救性"
// 存进去。
function saveLabel(key) {
  if (editingMonthKey.value !== key) return;
  const text = labelDraft.value.trim();
  store.setState((s) => {
    const next = { ...s.monthLabels };
    if (text) next[key] = text;
    else delete next[key];
    return { monthLabels: next };
  });
  editingMonthKey.value = null;
}

function cancelEditLabel() {
  editingMonthKey.value = null;
}

// 网格里补位用的"上月/下月边角日期"（同一批 42 个格子里，属于别的月份
// 的那些）在年视图里直接留空、不可点——见上面 monthsInYear 的注释，年
// 视图这一屏容不下把它们当真实日期处理的细节，点进某个月份卡片本身
// 已经能到月视图里看这些边角日期。
function onDayClick(date, monthIndex) {
  if (date.getMonth() !== monthIndex) return;
  props.navigate('day', { selectedDate: date });
}
</script>

<template>
  <div class="year-board">
    <div class="view-header">
      <div class="view-header__left">
        <n-button quaternary @click="navigate('year', { selectedYear: addYears(yearDate, -1) })">{{ t('year.prevYear') }}</n-button>
        <h2>{{ yearDate.getFullYear() }}</h2>
        <n-button quaternary @click="navigate('year', { selectedYear: addYears(yearDate, 1) })">{{ t('year.nextYear') }}</n-button>
      </div>
      <div class="view-header__right">
        <n-button type="tertiary" @click="goToday">{{ t('year.goToday') }}</n-button>
      </div>
    </div>

    <div class="year-grid">
      <div
        v-for="m in monthsInYear"
        :key="m.month"
        class="year-month"
        @click="navigate('month', { selectedMonth: m.start })"
      >
        <div class="year-month__title">{{ tm('domain.monthShort')[m.month] }}</div>

        <div class="year-month__label" @click.stop>
          <n-input
            v-if="editingMonthKey === m.key"
            v-model:value="labelDraft"
            size="tiny"
            autofocus
            :placeholder="t('year.labelPlaceholder')"
            @keyup.enter="saveLabel(m.key)"
            @keyup.esc="cancelEditLabel"
            @blur="saveLabel(m.key)"
          />
          <div v-else-if="monthLabel(m.key)" class="year-month__label-text" @click="startEditLabel(m.key)">
            {{ monthLabel(m.key) }}
          </div>
          <button v-else type="button" class="year-month__label-add" @click="startEditLabel(m.key)">
            <n-icon size="12"><EditRound /></n-icon>
            {{ t('year.addLabelBtn') }}
          </button>
        </div>

        <div class="year-month__cells">
          <div
            v-for="date in m.gridDates"
            :key="getDateKey(date)"
            class="year-day"
            :class="[
              date.getMonth() === m.month ? 'year-day--in-month' : 'year-day--blank',
              {
                'year-day--today': date.getMonth() === m.month && getDateKey(date) === todayKey,
                'year-day--holiday': date.getMonth() === m.month && holidayInfo(date)?.type === 'holiday',
                'year-day--workday': date.getMonth() === m.month && holidayInfo(date)?.type === 'workday',
              },
            ]"
            :title="date.getMonth() === m.month ? holidayInfo(date)?.name : null"
            @click.stop="onDayClick(date, m.month)"
          >
            {{ date.getMonth() === m.month ? date.getDate() : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
