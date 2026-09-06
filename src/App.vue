<script setup>
import { computed, reactive, watchEffect, watch, onMounted } from 'vue';
import { darkTheme, zhCN, dateZhCN, enUS, dateEnUS, jaJP, dateJaJP, NIcon } from 'naive-ui';
import { MenuRound, BlurOnRound, AddRound, MoreHorizRound } from '@vicons/material';
import { useI18n } from 'vue-i18n';
import { store } from './state/store.js';
import { i18n } from './i18n/index.js';
import { getWeekStart, getMonthStart, getYearStart, getDateKey } from './utils/dateUtils.js';
import { FONT_STACKS, DEFAULT_FONT_FAMILY } from './constants/fontStacks.js';
import { settleCompletedBlocks, clearClaimedRewards } from './domain/rewards.js';
import { extendAllRecurringSeries } from './domain/recurringEvents.js';
import { consumeRedirectToken } from './calendar/googleAuthClient.js';
import { useNow } from './composables/useNow.js';
import SidebarNav from './components/SidebarNav.vue';
import WeekBoard from './components/WeekBoard.vue';
import DayTimeline from './components/DayTimeline.vue';
import MonthBoard from './components/MonthBoard.vue';
import YearBoard from './components/YearBoard.vue';
import PlanPanel from './components/PlanPanel.vue';
import RewardPanel from './components/RewardPanel.vue';
import ActivityLibraryPanel from './components/ActivityLibraryPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import GoogleSyncPanel from './components/GoogleSyncPanel.vue';
import EventModal from './components/EventModal.vue';

// store.getState() 是 Vue reactive() 代理对象，直接引用即保持响应式，
// 不需要 App.vue 自己再包一层 ref/reactive。
const state = store.getState();
const { t } = useI18n();

// uiState 是不持久化的界面导航状态（当前视图/选中日期等），与
// REQ-001/REQ-002 时期的 renderApp.js 里的 uiState 语义一致。
// sidebarOpen（REQ-027，响应式适配）：只在窄屏（css/layout.css 里
// max-width:900px 断点）下有意义——侧边栏变成默认收起的抽屉，这个字段
// 控制它是否展开；宽屏下侧边栏一直可见，这个字段的值不影响任何样式
// （对应的 CSS 规则整段包在媒体查询里）。
// toolbarExpanded（REQ-079）：右下角悬浮工具栏里"功能按钮是否展开显示"
// 的开关，纯 UI 便利状态，和 sidebarOpen 是同一类——不持久化，刷新页面
// 回到默认展开，不需要用户每次重新打开都再点一次才能看到工具栏里的
// 按钮。
const uiState = reactive({
  activeView: 'week',
  selectedWeekStart: getWeekStart(new Date()),
  selectedDate: new Date(),
  selectedMonth: getMonthStart(new Date()),
  selectedYear: getYearStart(new Date()),
  modal: null,
  sidebarOpen: false,
  toolbarExpanded: true,
});

function navigate(view, extra = {}) {
  uiState.activeView = view;
  Object.assign(uiState, extra);
}

// REQ-046：实时结算（取代 REQ-020 时期"一天延迟"的一次性结算）。
// `useNow()` 每 30 秒刷新一次，这里不再只在跨天时才重新结算，而是每次
// `now` 变化（也就是每 30 秒）都调用一次 `settleCompletedBlocks`——这样
// 某个事件的真实结束时间一过，最多 30 秒内点数就会自动到账，不需要用户
// 手动刷新页面，见 domain/rewards.settleCompletedBlocks 顶部注释。
//
// REQ-033：清空"已兑换"奖励记录，是一次性操作，用
// `state.meta.claimedRewardsClearedAt` 做幂等标记，见
// domain/rewards.clearClaimedRewards 顶部注释。
// （REQ-028/034 时期的"重置点数从本周一开始算"——`resetPointsFromMonday`
// ——REQ-046 把点数余额改成派生计算后，"重置一个存储余额"这个操作本身
// 没有意义了，已经整个删除，见 domain/rewards.js 顶部注释。REQ-031 时期
// 的"奖励名单价格对齐到最新日元参考价"——`refreshRewardValuesFromSeedPrices`
// ——REQ-067 删除内置示例奖励种子数据后同样没有意义了，已经整个删除，
// 见 domain/rewards.js 顶部注释。）
//
// REQ-070：周期事件滚动续期——`extendAllRecurringSeries()` 把所有还没
// "生成到头"的周期事件规则续期到"今天 + 一年"（或者它们自己更早的
// 截止条件）。挂载时调一次，覆盖"重新打开应用"这个最主要的场景；同时
// 挂进下面 `watch(now, ...)` 里，覆盖"长时间开着标签页不关、正好跨过
// 午夜"这种少见场景——这个函数内部已经做了"没有需要续期的规则就直接
// return、不触发任何 state 写入"的判断（见 domain/recurringEvents.js
// 顶部注释），每 30 秒调一次的开销可以忽略，不需要额外做节流。
// REQ-072：`consumeRedirectToken()` 检查这次页面加载是不是刚从 Google
// 登录跳转回来的（见 calendar/googleAuthClient.js 顶部注释——登录改成
// 整页跳转取代弹窗，规避 COOP:same-origin 会切断弹窗通信的问题）。跳转
// 回来是全新的一次应用启动，`uiState.activeView` 会重置回默认的
// 'week'，用户体感上是"登录完发现自己又回到周视图，还得自己点回 Google
// 同步页面才能看到登录状态"；这里检测到确实是刚登录成功就直接
// `navigate('sync', ...)` 跳回同步页，让"登录完成"这件事立刻有一个看得
// 见的反馈，呼应用户反馈过的"登录完成之后页面没有显示已登录状态"。
const now = useNow();
onMounted(() => {
  if (consumeRedirectToken()) navigate('sync');
  if (!state.meta.claimedRewardsClearedAt) clearClaimedRewards(store);
  settleCompletedBlocks(store);
  extendAllRecurringSeries(store);
});
watch(now, () => {
  settleCompletedBlocks(store);
  extendAllRecurringSeries(store);
});

const isDark = computed(() => (state.settings.theme || 'dark') === 'dark');
const naiveTheme = computed(() => (isDark.value ? darkTheme : null));

// 让 Naive UI 的主色和自定义日历网格（css/variables.css）保持一致，
// 两套主题系统视觉对齐——这里用的是 Google 自己产品用的蓝色（浅色
// 主题下的 #1a73e8 是 Gmail/Calendar 链接和按钮的标准蓝，深色主题下的
// #8ab4f8 是 Google 自家暗色界面用的那种更亮的蓝），呼应"学习 Google
// 风格"的整体改版方向。
// REQ-011：用户可以在设置页里自定义强调色（settings.appearance.accentColor），
// 有值时整个覆盖掉下面这套 Google 蓝默认配色；没有自动生成 hover/pressed
// 深浅变体的能力（需要引入颜色处理库），四个状态色统一用同一个颜色，
// 交互状态会少一点层次感，这是简化后的取舍，不是遗漏。
const themeOverrides = computed(() => {
  const appearance = state.settings.appearance || {};
  const basePalette = isDark.value
    ? {
        primaryColor: '#8ab4f8',
        primaryColorHover: '#aecbfa',
        primaryColorPressed: '#669df6',
        primaryColorSuppl: '#8ab4f8',
        errorColor: '#f28b82',
        warningColor: '#fdd663',
        successColor: '#81c995',
      }
    : {
        primaryColor: '#1a73e8',
        primaryColorHover: '#1765cc',
        primaryColorPressed: '#185abc',
        primaryColorSuppl: '#1a73e8',
        errorColor: '#d93025',
        warningColor: '#b06000',
        successColor: '#188038',
      };
  const palette = appearance.accentColor
    ? {
        ...basePalette,
        primaryColor: appearance.accentColor,
        primaryColorHover: appearance.accentColor,
        primaryColorPressed: appearance.accentColor,
        primaryColorSuppl: appearance.accentColor,
      }
    : basePalette;
  return {
    common: {
      ...palette,
      fontFamily: FONT_STACKS[appearance.fontFamily] || FONT_STACKS[DEFAULT_FONT_FAMILY],
      borderRadius: '8px',
    },
  };
});

watchEffect(() => {
  document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light';
});

// 自定义 CSS（css/*.css 里手写的 .timeline-block 等，走 var(--accent) 这
// 类变量，不受 Naive UI 的 theme-overrides 管）也要跟着字体/强调色变，
// 不然会出现"Naive UI 组件换了颜色、自己写的日历网格没换"这种两套视觉
// 不一致的情况。用行内样式覆盖 :root 里的默认值（行内样式优先级更高，
// 不需要 !important）；没设置自定义强调色时用 removeProperty 让它退回
// css/variables.css 里跟主题绑定的默认值。
watchEffect(() => {
  const appearance = state.settings.appearance || {};
  const root = document.documentElement;
  root.style.setProperty('--font-sans', FONT_STACKS[appearance.fontFamily] || FONT_STACKS[DEFAULT_FONT_FAMILY]);
  if (appearance.accentColor) {
    root.style.setProperty('--accent', appearance.accentColor);
    root.style.setProperty('--accent-strong', appearance.accentColor);
  } else {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-strong');
  }
});

// 背景图片（REQ-011，新增；REQ-075 去掉透明度调节）：单独一层固定定位
// 的图层，铺在 .app-shell 后面。原来还有一个透明度滑块（默认 20%），
// 是为了"图层本身调淡、不影响正文/卡片的可读性"；用户反馈"背景图的
// 效果不用设置透明化"，改成直接按图片原样全不透明显示（卡片自己有
// 不透明的背景色，图片只在卡片之间的空隙露出来，可读性本来就不受
// 影响，透明度调节不是必需的）。没设置图片时直接隐藏这一层。
const backgroundStyle = computed(() => {
  const appearance = state.settings.appearance || {};
  if (!appearance.backgroundImage) return { display: 'none' };
  return { backgroundImage: `url(${JSON.stringify(appearance.backgroundImage)})` };
});

// 悬浮工具栏（REQ-077 先加了透明化切换按钮，REQ-078 挪到右下角、改成
// 可以放多个按钮的工具栏容器，`.floating-toolbar`，见 css/layout.css）。
//
// 透明化切换：只在设了背景图时才有意义（没有背景图，"透明"只是让界面
// 素色变淡，看不到任何东西透过来），按钮本身也只在这时渲染
// （模板里 `v-if="state.settings.appearance.backgroundImage"`）。开关
// 状态存进 `settings.appearance.transparentMode`（和主题/字体一样是
// 持久化的外观偏好，不是临时 UI 状态），效果是给整个 `.app-shell`
// （侧边栏+主内容区）加一层 `opacity`（见 css/layout.css 的
// `.app-shell--transparent`），让下面 `.app-background` 那张背景图
// 透出来——选择"整体调透明"而不是"只把每张卡片背景单独换成半透明色"，
// 是因为后者要逐个组件重新适配自己的卡片背景色（`--bg-secondary`/
// `--bg-tertiary` 这类变量目前都是纯色 hex，不支持透明通道），影响面
// 太大；整体 `opacity` 一行 CSS 就能对全局生效，代价是文字对比度也会
// 跟着变淡，属于"开这个效果就是要牺牲一点可读性换取穿透感"的预期
// 取舍，用户不想要了随时点一下按钮关掉。
function toggleTransparentMode() {
  store.setState((s) => ({
    settings: { ...s.settings, appearance: { ...s.settings.appearance, transparentMode: !s.settings.appearance.transparentMode } },
  }));
}

// 快速添加事件（REQ-078，用户要求"试着集成一些常见功能"）：不管当前
// 停在哪个视图，都能一键弹出新建事件表单，不需要先切到日/周视图找到
// 具体某一天再点格子。默认日期是今天、默认开始时间取"现在"这一刻按
// 15 分钟取整（和 `EventModal.vue` 表单里时间输入的最小粒度一致），
// `uiState.modal` 这个字段不管当前 `activeView` 是什么都会触发
// `EventModal.vue` 弹出（`App.vue` 模板里 `<EventModal v-if=
// "uiState.modal">` 是独立于视图切换的覆盖层），所以这里不需要先
// `navigate()` 切视图，直接 `Object.assign(uiState, {...})` 设置
// `modal` 字段即可，停留在原来的视图上，弹层是叠加上去的。
function openQuickAddModal() {
  const now = new Date();
  const defaultStart = Math.min(23.75, Math.round((now.getHours() + now.getMinutes() / 60) * 4) / 4);
  navigate(uiState.activeView, { modal: { mode: 'create', dateKey: getDateKey(now), defaultStart } });
}

// 多语言：应用自己的文案走 vue-i18n（locales/*.js）；Naive UI 组件内部
// 自带的文案（日期/时间选择器的"确定"/"清除"这类按钮）另外用它自己的
// locale/date-locale 对象跟着切，两边都要切换才是真正的整体多语言。
const NAIVE_LOCALES = {
  zh: { locale: zhCN, dateLocale: dateZhCN },
  en: { locale: enUS, dateLocale: dateEnUS },
  ja: { locale: jaJP, dateLocale: dateJaJP },
};

const currentLocale = computed(() => state.settings.locale || 'zh');
const naiveLocale = computed(() => NAIVE_LOCALES[currentLocale.value]?.locale || zhCN);
const naiveDateLocale = computed(() => NAIVE_LOCALES[currentLocale.value]?.dateLocale || dateZhCN);

watchEffect(() => {
  i18n.global.locale.value = currentLocale.value;
});

const viewComponents = {
  week: WeekBoard,
  day: DayTimeline,
  month: MonthBoard,
  year: YearBoard,
  plan: PlanPanel,
  reward: RewardPanel,
  library: ActivityLibraryPanel,
  settings: SettingsPanel,
  sync: GoogleSyncPanel,
};

const currentViewComponent = computed(() => viewComponents[uiState.activeView] || WeekBoard);
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides" :locale="naiveLocale" :date-locale="naiveDateLocale">
    <n-message-provider>
      <div class="app-background" :style="backgroundStyle" />
      <!-- 悬浮工具栏（REQ-078 挪到右下角；REQ-079 改横排 + 加展开/收起
           开关）：固定右下角，横向排列，不管当前在哪个视图都常驻可见。
           功能按钮放在开关左边（DOM 顺序在前）——容器用 right 定位，
           越靠后的子元素越贴近固定的右边缘，展开时功能按钮从开关左侧
           冒出来，开关本身位置不移动。 -->
      <div class="floating-toolbar">
        <button
          v-if="uiState.toolbarExpanded"
          class="floating-toolbar__btn"
          type="button"
          @click="openQuickAddModal"
          :aria-label="t('nav.quickAdd')"
          :title="t('nav.quickAdd')"
        >
          <n-icon size="20"><AddRound /></n-icon>
        </button>
        <button
          v-if="uiState.toolbarExpanded && state.settings.appearance.backgroundImage"
          class="floating-toolbar__btn"
          type="button"
          :class="{ 'floating-toolbar__btn--active': state.settings.appearance.transparentMode }"
          @click="toggleTransparentMode"
          :aria-label="t('nav.toggleTransparent')"
          :title="t('nav.toggleTransparent')"
        >
          <n-icon size="20"><BlurOnRound /></n-icon>
        </button>
        <button
          class="floating-toolbar__btn"
          type="button"
          @click="uiState.toolbarExpanded = !uiState.toolbarExpanded"
          :aria-label="t('nav.toggleToolbar')"
          :title="t('nav.toggleToolbar')"
        >
          <n-icon size="20"><MoreHorizRound /></n-icon>
        </button>
      </div>
      <!-- 透明化效果需要同时满足"用户开着这个开关"和"确实设了背景图"
           两个条件（REQ-079，用户反馈"没有背景图片时不要进行透明化"）
           ——只判断 transparentMode 的话，用户开过透明化之后又把背景图
           删掉，transparentMode 这个持久化字段不会跟着自动复位，界面会
           在没有任何东西可透出来的情况下继续变淡，纯粹是缺陷。按钮本身
           已经在没背景图时隐藏（不会诱导用户开新的透明化），但已经开着
           的旧状态需要在效果这里也补一层判断才能真正生效。 -->
      <div
        class="app-shell"
        :class="{ 'app-shell--transparent': state.settings.appearance.transparentMode && state.settings.appearance.backgroundImage }"
      >
        <!-- 汉堡菜单按钮：只在窄屏下可见（见 css/layout.css 的
             .sidebar-toggle），宽屏下侧边栏本来就一直展开，不需要这个
             按钮，CSS 里 display:none 隐藏，不额外用 v-if 判断视口宽度。 -->
        <button class="sidebar-toggle" type="button" @click="uiState.sidebarOpen = !uiState.sidebarOpen" :aria-label="t('nav.toggleSidebar')">
          <n-icon size="22"><MenuRound /></n-icon>
        </button>
        <div v-if="uiState.sidebarOpen" class="sidebar-backdrop" @click="uiState.sidebarOpen = false" />
        <SidebarNav :state="state" :ui-state="uiState" :navigate="navigate" />
        <main class="main-content">
          <transition name="view-fade" mode="out-in">
            <component :is="currentViewComponent" :key="uiState.activeView" :state="state" :ui-state="uiState" :navigate="navigate" />
          </transition>
        </main>
      </div>
      <EventModal v-if="uiState.modal" :state="state" :ui-state="uiState" :navigate="navigate" />
    </n-message-provider>
  </n-config-provider>
</template>
