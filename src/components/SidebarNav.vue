<script setup>
import { computed, h } from 'vue';
import { NIcon } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { ViewWeekRound, CalendarMonthRound, GridViewRound, FlagRound, CardGiftcardRound, ExploreRound, SettingsRound, SyncRound, LightModeRound, DarkModeRound } from '@vicons/material';
import { store } from '../state/store.js';
import { PHASES, PHASE_COLORS, getPhaseForDate } from '../domain/yearPhases.js';
import { computePhaseWeeksFromGoals } from '../domain/goals.js';

const props = defineProps({
  state: { type: Object, required: true },
  uiState: { type: Object, required: true },
  navigate: { type: Function, required: true },
});

const { t } = useI18n();

// Material 图标（Round 风格），替代原来的 emoji 导航图标——emoji 在不同
// 系统上渲染不一致，看起来不够"正式"，换成矢量图标是这轮"学 Google 风格"
// 改版里对"看起来太老"这条反馈最直接的回应之一。
// REQ-017：新增"计划"导航项，紧跟在"体验库"后面——计划是用户主动定义
// 的里程碑清单，和体验库（活动素材）性质接近，都属于"内容/数据管理"类
// 视图，排在日历类视图（周/月）之后、设置/同步之前。
// REQ-018：新增"奖励"导航项，紧跟在"计划"后面——奖励名单是计划的配对
// 数据（完成计划才能从奖励名单里领取），排在一起比较符合"这两个是一套"
// 的直觉。
// REQ-060：新增"年度视图"导航项，紧跟在"月度视图"后面——和周/月view是
// 同一类"日历类视图"，用户从周→月→年逐级放大着看，排在一起比夹在别处
// 更符合直觉；图标用 GridViewRound（12 宫格网格），和月视图的单张日历
// 图标 CalendarMonthRound 区分开，不会看混。
const NAV_ICONS = {
  week: ViewWeekRound,
  month: CalendarMonthRound,
  year: GridViewRound,
  plan: FlagRound,
  reward: CardGiftcardRound,
  library: ExploreRound,
  settings: SettingsRound,
  sync: SyncRound,
};
const NAV_VIEWS = ['week', 'month', 'year', 'plan', 'reward', 'library', 'settings', 'sync'];

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions = computed(() =>
  NAV_VIEWS.map((view) => ({
    label: t(`nav.${view}`),
    key: view,
    icon: renderIcon(NAV_ICONS[view]),
  }))
);

// REQ-027：窄屏下侧边栏是覆盖式抽屉（见 css/layout.css 的 .sidebar--open
// 断点样式），点导航项之后应该顺带收起抽屉，不然选完一个视图还得再点一次
// 汉堡按钮/遮罩层才能看到内容，多一步不必要的操作。宽屏下 sidebarOpen
// 这个字段不影响任何样式，这里照样把它设成 false 也没有副作用。
function onMenuUpdate(key) {
  props.navigate(key, { sidebarOpen: false });
}

// 阶段周数由长期目标累加得出，不再是设置里手填的固定值，见
// domain/goals.js（REQ-016）。
const phaseInfo = computed(() =>
  getPhaseForDate(new Date(), props.state.meta.yearStart, computePhaseWeeksFromGoals(props.state.goals))
);

const isDark = computed(() => (props.state.settings.theme || 'dark') === 'dark');

function toggleTheme() {
  store.setState((s) => ({ settings: { ...s.settings, theme: isDark.value ? 'light' : 'dark' } }));
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': uiState.sidebarOpen }">
    <div class="sidebar__brand">
      <span class="sidebar__logo">🌱</span>
      <span class="sidebar__name">{{ t('app.name') }}</span>
    </div>

    <div class="phase-progress">
      <div class="phase-progress__bar">
        <div
          v-for="phase in PHASES"
          :key="phase"
          class="phase-segment"
          :class="{ 'phase-segment--current': phase === phaseInfo.phase }"
          :style="{ background: PHASE_COLORS[phase] }"
          :title="t('domain.phase.' + phase)"
        />
      </div>
      <div class="phase-progress__year">{{ t('sidebar.yearProgress', { percent: Math.round(phaseInfo.progress * 100) }) }}</div>
    </div>

    <n-menu :value="uiState.activeView" :options="menuOptions" @update:value="onMenuUpdate" />

    <n-button class="theme-toggle" quaternary block @click="toggleTheme">
      <template #icon>
        <n-icon><LightModeRound v-if="isDark" /><DarkModeRound v-else /></n-icon>
      </template>
      {{ isDark ? t('theme.toLight') : t('theme.toDark') }}
    </n-button>
  </aside>
</template>
