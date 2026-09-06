<script setup>
import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { AddRound, CloseRound, BlockRound } from '@vicons/material';
import { getDateKey, addDays, hourToLabel, weekdayIndex } from '../utils/dateUtils.js';
import { computeBlockLayout, columnBoxStyle } from '../utils/blockOverlap.js';
import { store } from '../state/store.js';
import { uncompleteLastKeyEvent } from '../domain/plans.js';
import { BLOCK_TYPE_COLORS } from '../constants/colors.js';
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

// 时间轴的高度由 CSS flex 铺满 .day-view 剩余可视高度决定（见
// css/timeline.css），不再是"每小时固定多少像素"的写死值；块的位置/
// 高度改用百分比（相对这个总小时数），拖拽/点击这类需要把像素坐标换算
// 成小时数的交互，改成用交互发生时容器的实际渲染高度（getBoundingClientRect）
// 现算像素/小时比例，而不是用一个固定常量。
const totalHours = TIMELINE_RANGE.end - TIMELINE_RANGE.start;

const date = computed(() => props.uiState.selectedDate || new Date());
const dateKey = computed(() => getDateKey(date.value));
const blocks = computed(() =>
  (props.state.dayTimelines[dateKey.value]?.blocks || []).slice().sort((a, b) => a.start - b.start)
);
// 时间重叠的事件左右分栏显示，见 utils/blockOverlap.js 顶部注释。
// blockLayout 用完整的 blocks（真实 start/end）算重叠分栏，不能用下面
// 拆分后的渲染片段算——重叠判定应该看真实时间，不应该因为一个块被拆成
// 两段渲染就影响它和其他块的分栏结果。故意不把"借来"的凌晨片段（见下面
// renderItems）算进来一起分栏——那是极少见的边界情况叠加边界情况，
// 不值得为它重新推导"借来的片段要不要参与本地分栏"，已知局限。
const blockLayout = computed(() => computeBlockLayout(blocks.value));

// REQ-045 起真实起止时间跨过 DISPLAY_START_HOUR（6 点）分界线的块（比如
// 4:00-8:00）会拆成两段渲染，见 constants/timelineRange.js 顶部注释。
// REQ-047：用户反馈"凌晨其实是显示在前一天那里的"——4:00-8:00 这个块
// 虽然按日期算是属于"今天"，但 4:00-6:00 这一段在直觉上是"昨晚熬夜到
// 凌晨"的延续，应该画在**前一天**时间轴的底部，而不是今天自己的底部
// （今天自己的底部应该留给真正属于今天凌晨、且没有跨界的事件）。所以
// 拆分后的两段不再都画在同一天：前半段（`[block.start, 6)`）挪到前一天
// 的视图里渲染，后半段（`[6, block.end)`）留在块自己真实所在的这一天。
// 因此 `renderItems` 要看两天的数据：自己这天的块（把跨界块的前半段
// 从这里排除，只渲染后半段）+ 明天的块（把明天里跨界块的前半段借来渲染
// 在"今天"这个视图的底部）。两段共用同一个 block 对象，标题/编辑/删除/
// 跳过都指向同一份数据，天然"一件事、操作一次两段一起生效"；只有真实
// 结束时间所在的那一段（`isClosing`）显示时间标注和操作按钮、允许点击
// 打开编辑弹层，"借来"的前半段纯视觉展示，不可点击/不可拖拽——它的
// `dateKey` 和当前查看的日期不是同一天，点它去操作会对错日期的
// dayTimelines 数组，索性不让它可交互，真正要编辑/跳过/删除，去它自己
// 真实所在的那一天点后半段即可。
const nextDateKey = computed(() => getDateKey(addDays(date.value, 1)));
const nextDayBlocks = computed(() => props.state.dayTimelines[nextDateKey.value]?.blocks || []);

const renderItems = computed(() => {
  const items = [];
  for (const block of blocks.value) {
    if (needsDisplaySplit(block)) {
      const [, seg2] = splitDisplaySegments(block);
      items.push({ key: `${block.id}-b`, block, dateKey: dateKey.value, segStart: seg2.start, segEnd: seg2.end, isClosing: true });
    } else {
      items.push({ key: block.id, block, dateKey: dateKey.value, segStart: block.start, segEnd: block.end, isClosing: true });
    }
  }
  for (const block of nextDayBlocks.value) {
    if (needsDisplaySplit(block)) {
      const [seg1] = splitDisplaySegments(block);
      items.push({ key: `${block.id}-a`, block, dateKey: nextDateKey.value, segStart: seg1.start, segEnd: seg1.end, isClosing: false });
    }
  }
  return items;
});
const defaultStart = computed(() => Math.min(Math.max(new Date().getHours(), TIMELINE_RANGE.start), TIMELINE_RANGE.end - 1));
// 时间轴从 DISPLAY_START_HOUR（6 点）开始画，往下依次是 7、8...23、0、1...5，
// 而不是从 0 点开始——一天的"起点"更符合直觉（凌晨时段排在最后）。
const hours = computed(() => Array.from({ length: totalHours }, (_, i) => (DISPLAY_START_HOUR + i) % 24));
const gridLineOffsets = computed(() => Array.from({ length: totalHours + 1 }, (_, i) => (i / totalHours) * 100));

const dateHeading = computed(() =>
  t('day.dateHeading', {
    year: date.value.getFullYear(),
    month: date.value.getMonth() + 1,
    day: date.value.getDate(),
    weekday: tm('domain.weekdayFull')[weekdayIndex(date.value)],
  })
);

// 节假日只做展示（REQ-011），不参与排程逻辑，见 domain/holidays.js 顶部注释。
const holidayInfo = computed(() => getHolidayInfo(dateKey.value, props.state.settings.region || 'CN'));

// "现在"横线：只在查看的是今天时显示，每 30 秒刷新一次（见 useNow）。
const now = useNow();
const isViewingToday = computed(() => getDateKey(now.value) === dateKey.value);
const nowHour = computed(() => now.value.getHours() + now.value.getMinutes() / 60);
const nowTop = computed(() => `${(toDisplayOffset(nowHour.value) / totalHours) * 100}%`);

// 时间标签用 block.start 本身的真实值，不读 displayStartHour() 的留白值
// ——用户反馈过标签跟着一起错开（比如显示"16:05"）看着奇怪，容易让人
// 以为存的时间真的是 16:05。"留白"这个效果只用来挪一下块的渲染位置
// （见 blockStyle），文字标注永远如实显示真实时间。
function displayTimeLabel(block) {
  return `${hourToLabel(block.start)}-${hourToLabel(block.end)}`;
}

// top 用 displayStartHour() 而不是 block.start，块的渲染起点比实际时间
// 往后错开几分钟，视觉上不贴着整点格线；height 再减去几像素形成块与块
// 之间固定的视觉间隙——即使排的是无缝衔接的连续计划（上一个的结束时间
// 正好是下一个的开始时间），也不会看起来糊成一整块。这两处都只影响
// 渲染，不影响 block.start/end 本身，拖拽/排序等逻辑一律用真实值。
// 时间上重叠的两个块（见 blockLayout）改成左右各占一半宽度，不再互相
// 盖住；三个及以上互相重叠时维持整宽（见 utils/blockOverlap.js 说明）。
//
// 【bug 修复】原来另外还设了 `minHeight:'20px'`，用来保证时长很短的块
// 至少能露出一行文字。但 CSS 里 min-height 的优先级高于百分比算出来的
// height，块自身的自然高度（真实时长换算成的百分比）比 20px 还小时，
// 浏览器会强行把它撑到 20px——而 top 是固定的，撑高只会往下扩张，如果
// 这个块后面紧跟着另一个块（时间上相邻但不重叠，比如 9:00-9:15 后面
// 紧接着 9:15 开始的下一个事件），撑高的部分会正好越过自己的真实结束
// 时间，一路啃到下一个块的起点，把两者之间本该有的 5px 间隔完全吃掉，
// 看上去就像后一个事件紧贴着前一个、没有缝隙——这是用户反馈"时间上
// 紧邻的两个事件之间看不出间隔"的根因。
// 改成：不再用固定 CSS min-height，而是在 JS 里找到当天排在这个块结束
// 之后、且和它不重叠的下一个块（真正意义上的"紧邻"，不是 blockLayout
// 那种左右分栏的重叠），算出到它为止还有多少可用空间，把"保证可读性的
// 最小高度"钳制在这个空间以内——CSS `min()`/`max()` 函数把最终決定权交
// 给浏览器在实际渲染时用真实像素计算，不需要在 JS 里现算容器的实际
// 像素高度。没有下一个块（或下一个块离得还很远）时，行为和原来一致。
//
// 【bug 修复 #2】上面这个 nextBlock 判断只找"时间上不重叠"的下一个块
// （`b.start >= block.end`），时间上重叠、左右分栏显示的块（比如
// 8:00-9:00 和 8:30-9:00 这种一大一小、都在 9 点结束的两个块）互相
// 都不会被对方算作 nextBlock——两者各占一列，互不算"挡路"。这就导致
// 时长较短的那个块（8:30-9:00，自然高度换算成像素本来就没有 20px）
// 在没有 nextBlock 兜底的情况下被 20px 的可读性下限直接撑高，撑出来的
// 部分一路越过它自己真实的结束时间（9:00），显示得比同一竖排的另一个
// 块更长——两个块明明同一时刻结束，读起来却像该短的那个更晚才结束，
// 这是用户反馈"8点半到9点的事件显示得很奇怪"的根因。
// 修复：只在这个块确实和别的块左右分栏（`columns>1`）时，才给 `min()`
// 加一层上限——可读性下限撑出来的高度不能超过这个块自己真实的高度
// （`naturalHeight`，不减 5px 间隙的那个满值），也就是"最多撑到自己
// 真实结束的位置，绝不会撑穿"。**特意不对孤立块（`columns===1`）也加
// 这层上限**：一个完全孤立、旁边什么都没有的短块（比如一天最后一个
// 10 分钟的事件）撑高到 20px，只是往下方的空白网格里多占一点地方，
// 不会撑穿任何东西、也不会和别的块显示得不一致，这正是 REQ-010 时
// "为了可读性可以比真实比例更高"的设计初衷，不应该被这次修复连带削弱。
// REQ-045：参数从"一个 block"改成"一个渲染片段"（{block, segStart,
// segEnd}，见上面 renderItems）——绝大多数块 segStart/segEnd 就是它自己
// 的 start/end，行为不变；只有跨过 6 点分界线被拆成两段的块，这个函数
// 会分别用各自片段的 [segStart, segEnd) 算位置/高度，而不是整个块的真实
// 范围（那样算出来的高度会超过 100% 或跑到网格外面，就是拆分之前"显示
// 很奇怪"的根因）。`displayStartHour()` 只读 `.start`/`.end`，传一个
// `{start: segStart, end: segEnd}` 的轻量对象进去同样能用，不需要改那个
// 函数本身。
function blockStyle(item) {
  const { block, segStart, segEnd } = item;
  const seg = { start: segStart, end: segEnd };
  const startDisplay = displayStartHour(seg);
  const top = (toDisplayOffset(startDisplay) / totalHours) * 100;
  const naturalHeight = ((segEnd - startDisplay) / totalHours) * 100;
  const { column, columns } = blockLayout.value.get(block.id) || { column: 0, columns: 1 };

  // 拆分出来的两个片段之间不需要（也不应该）互相当对方的 nextBlock——
  // 它们本来就是同一个块，紧挨着渲染在网格的顶/底两端是预期效果，不是
  // 需要空隙分隔的"相邻事件"。只在片段没有被拆分（`isClosing` 且
  // segStart===block.start，即普通整段块）时才做这层"避免撞到下一个块"
  // 的可读性优化；被拆分的两个片段各自只用最基本的比例高度，不做这层
  // 额外优化——它们通常横跨 2 小时以上（4:00-8:00 这类，见
  // needsDisplaySplit 的判断条件），天然不会矮到需要这层保护，为了这种
  // 少见场景重新推导"旋转后的相邻关系"不划算，见 constants/timelineRange.js
  // 顶部注释里记录的取舍。
  const isSplitSegment = segStart !== block.start || segEnd !== block.end;
  const nextBlock = isSplitSegment
    ? null
    : blocks.value.filter((b) => b.id !== block.id && b.start >= segEnd).sort((a, b) => a.start - b.start)[0];

  // 只有真的存在左右分栏的重叠块（columns>1）时才加"不能超过自己真实
  // 高度"这道上限——一个完全孤立、旁边什么都没有的短块（比如一天最后
  // 一个 10 分钟的事件），撑高到 20px 只是往下方的空白网格里多占一点
  // 地方，不会撑穿任何东西，保持 REQ-010 时的原有行为（为了可读性可以
  // 比真实比例更高）。只有和别的块分栏并排、时长又短的那个块，撑高才
  // 会越过自己的真实结束时间、显得比同一竖排的另一个块"更晚结束"，这
  // 才是需要这道上限的场景，见上面 bug 修复 #2 的说明。
  const ceilings = [];
  if (columns > 1) ceilings.push(`${naturalHeight}%`);
  if (nextBlock) {
    const availableHours = displayStartHour(nextBlock) - startDisplay;
    const availablePercent = (availableHours / totalHours) * 100;
    ceilings.push(`calc(${availablePercent}% - 5px)`);
  }
  const floored = `max(calc(${naturalHeight}% - 5px), 20px)`;
  const heightExpr = ceilings.length ? `min(${floored}, ${ceilings.join(', ')})` : floored;

  const style = {
    top: `${top}%`,
    height: heightExpr,
    borderLeftColor: BLOCK_TYPE_COLORS[block.type] || '#a3a3a3',
  };
  Object.assign(style, columnBoxStyle(column, columns));
  return style;
}

function getBlocks() {
  return props.state.dayTimelines[dateKey.value]?.blocks || [];
}

function setBlocks(next) {
  store.setState((s) => ({
    dayTimelines: { ...s.dayTimelines, [dateKey.value]: { blocks: next } },
  }));
}

function moveBlock(blockId, newStart) {
  const list = getBlocks();
  const block = list.find((b) => b.id === blockId);
  if (!block || block.source === 'google' || needsDisplaySplit(block)) return;

  const duration = block.end - block.start;
  let start = Math.max(TIMELINE_RANGE.start, Math.min(TIMELINE_RANGE.end - duration, newStart));
  start = Math.round(start * 4) / 4;
  const end = start + duration;

  const next = list.map((b) => (b.id === blockId ? { ...b, start, end, source: 'manual' } : b));
  setBlocks(next.sort((a, b) => a.start - b.start));
}

function resizeBlock(blockId, newEnd) {
  const list = getBlocks();
  const block = list.find((b) => b.id === blockId);
  if (!block || block.source === 'google' || needsDisplaySplit(block)) return;

  let end = Math.max(block.start + 0.25, Math.min(TIMELINE_RANGE.end, newEnd));
  end = Math.round(end * 4) / 4;

  setBlocks(list.map((b) => (b.id === blockId ? { ...b, end } : b)));
}

// 删除一个块（REQ-046：点数余额是派生计算，见 domain/rewards.js 顶部
// 注释——块整个从 dayTimelines 里消失后，`computeRewardBalance()` 求和
// 时自然不会再算到它，不需要像以前那样显式调用任何"退点数"的函数）。
// 不联动撤销关联的计划进度——"这件事确实做过"这个事实不因为日历记录
// 被删掉而改变，和 toggleSkip() 里"跳过会联动撤销计划进度"是不同的
// 取舍：跳过是"我确认没做"，删除只是"把这条记录从日历上拿掉"，语义不
// 一样（已知的简化取舍）。
function removeBlock(blockId) {
  setBlocks(getBlocks().filter((b) => b.id !== blockId));
  message.success(t('day.blockDeletedToast'));
}

// 计划关键事件：block.planId/keyEventId 是在 EventModal.vue 从计划添加
// 时写入的引用。这里只是找出这个块对应哪份计划的哪个关键事件——完成
// 状态本身存在 state.plans 那份数据里（不是 block 自己的字段），block
// 只是这个关键事件"排在哪一天哪个时间段"的具体安排，两者是引用关系，
// 不是复制。
function findPlanKeyEvent(block) {
  if (!block.planId || !block.keyEventId) return null;
  const plan = props.state.plans.find((p) => p.id === block.planId);
  const keyEvent = plan?.keyEvents.find((ke) => ke.id === block.keyEventId);
  return keyEvent ? { plan, keyEvent } : null;
}

// 跳过（REQ-020 起是这个组件里唯一的手动完成状态操作）：用户明确要求
// "事件不需要完成点击，默认没有点击跳过就算完成"——不再有"标记完成"
// 按钮，一个块只要没被标记跳过、真实结束时间已经过去，就会被
// `domain/rewards.computeRewardBalance()` 现算进点数余额（REQ-051 起
// 点数不再是结算时存的快照，每次都用当前比率现算，见该函数顶部注释），
// 标记跳过会让它在下一次现算时自然被排除，不需要在这里做任何"退点数"
// 的操作。这里唯一要做的是计划进度：标记跳过时，如果这个块的
// `pointsSettled` 是 `true`（说明它已经因为自己推进过关联的计划，
// REQ-051 起这个字段的含义收窄为"计划推进过没有"，和点数无关，见
// `domain/rewards.js` 顶部注释），要把那次推进撤销掉，并把
// `pointsSettled` 清回 `false`——这样如果之后又取消跳过，下一次
// `settleCompletedBlocks` 扫描到这个块时会看到它"没跳过、没结算过"，
// 重新正常推进一次计划。跳过在任何时候都是一次有效的"反悔"，不因为
// 已经结算过就失效。
function toggleSkip(block) {
  const willSkip = block.status !== 'skipped';
  if (willSkip && block.pointsSettled) {
    const info = findPlanKeyEvent(block);
    if (info) uncompleteLastKeyEvent(store, info.plan.id);
  }
  const next = getBlocks().map((b) => {
    if (b.id !== block.id) return b;
    const patch = { status: willSkip ? 'skipped' : undefined };
    if (willSkip && b.pointsSettled) patch.pointsSettled = false;
    return { ...b, ...patch };
  });
  setBlocks(next);
  message.success(willSkip ? t('day.skippedToast') : t('day.unskippedToast'));
}

function onBlockClick(block) {
  if (block.source === 'google') return;
  props.navigate('day', { modal: { mode: 'edit', dateKey: dateKey.value, block } });
}

function onBlockDragStart(event, block) {
  if (block.source === 'google' || needsDisplaySplit(block)) return;
  event.dataTransfer.setData('text/plain', JSON.stringify({ blockId: block.id }));
  event.dataTransfer.effectAllowed = 'move';
}

// 时间轴容器高度由 CSS flex 铺满可视区域决定，不是固定像素，所以点击/
// 拖拽这类需要把鼠标 Y 坐标换算成小时数的交互，都在交互发生的当下用
// getBoundingClientRect().height 现算"每小时多少像素"，而不是用一个
// 写死的常量。
function onGridClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  const clickedStart = Math.round(fromDisplayRatio(offsetY / rect.height, totalHours) * 2) / 2;
  props.navigate('day', { modal: { mode: 'create', dateKey: dateKey.value, defaultStart: clickedStart } });
}

const isDragOver = ref(false);

function onGridDrop(event) {
  isDragOver.value = false;
  const raw = event.dataTransfer.getData('text/plain');
  if (!raw) return;
  try {
    const { blockId } = JSON.parse(raw);
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const newStart = Math.round(fromDisplayRatio(offsetY / rect.height, totalHours) * 4) / 4;
    moveBlock(blockId, newStart);
  } catch (err) {
    console.warn('[Planto] drop payload 解析失败', err);
  }
}

function openCreateModal() {
  props.navigate('day', { modal: { mode: 'create', dateKey: dateKey.value, defaultStart: defaultStart.value } });
}

// 拉伸交互：拖拽过程中直接改 DOM style 做实时视觉反馈（不经 Vue 响应式，
// 避免每像素都触发一次组件更新），mouseup 时才把最终值提交到 store。
// pxPerHour 取自拉伸开始那一刻网格容器的实际渲染高度，不是固定常量。
function startResize(event, block) {
  event.preventDefault();
  event.stopPropagation();
  const blockEl = event.currentTarget.closest('.timeline-block');
  const gridEl = event.currentTarget.closest('.day-timeline__grid');
  const pxPerHour = gridEl.getBoundingClientRect().height / totalHours;
  const baseHeight = (block.end - block.start) * pxPerHour;
  const startY = event.clientY;

  function onMouseMove(moveEvent) {
    const deltaY = moveEvent.clientY - startY;
    blockEl.style.height = `${Math.max(18, baseHeight + deltaY)}px`;
  }
  function onMouseUp(upEvent) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    const deltaHours = (upEvent.clientY - startY) / pxPerHour;
    resizeBlock(block.id, block.end + deltaHours);
  }
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
</script>

<template>
  <div class="day-view">
    <div class="view-header">
      <div class="view-header__left">
        <n-button quaternary @click="navigate('week')">{{ t('day.backToWeek') }}</n-button>
        <n-button quaternary @click="navigate('day', { selectedDate: addDays(date, -1) })">{{ t('day.prevDay') }}</n-button>
        <h2>{{ dateHeading }}</h2>
        <n-tag v-if="holidayInfo" size="small" :type="holidayInfo.type === 'workday' ? 'default' : 'error'">
          {{ holidayInfo.name }}
        </n-tag>
        <n-button quaternary @click="navigate('day', { selectedDate: addDays(date, 1) })">{{ t('day.nextDay') }}</n-button>
      </div>
      <div class="view-header__right">
        <n-button type="primary" @click="openCreateModal">
          <template #icon><n-icon><AddRound /></n-icon></template>
          {{ t('day.addEvent') }}
        </n-button>
      </div>
    </div>

    <div class="day-timeline">
      <div class="day-timeline__hours">
        <div v-for="h in hours" :key="h" class="hour-label">
          {{ hourToLabel(h) }}
        </div>
      </div>

      <div
        class="day-timeline__grid"
        :class="{ 'drop-target': isDragOver }"
        @click.self="onGridClick"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop="onGridDrop"
      >
        <div v-for="offset in gridLineOffsets" :key="offset" class="grid-line" :style="{ top: `${offset}%` }" />
        <div v-if="isViewingToday" class="now-line" :style="{ top: nowTop }" />

        <div
          v-for="item in renderItems"
          :key="item.key"
          class="timeline-block"
          :class="[
            `timeline-block--${item.block.type}`,
            {
              'timeline-block--locked': item.block.source === 'google',
              'timeline-block--skipped': item.block.status === 'skipped',
            },
          ]"
          :style="blockStyle(item)"
          :draggable="item.isClosing && item.block.source !== 'google' && !needsDisplaySplit(item.block)"
          @click="item.isClosing && onBlockClick(item.block)"
          @dragstart="onBlockDragStart($event, item.block)"
        >
          <div class="timeline-block__title-row">
            <span class="timeline-block__title">{{ item.block.title }}</span>
            <span v-if="item.isClosing" class="timeline-block__time">{{ displayTimeLabel(item.block) }}</span>
          </div>

          <div v-if="item.block.source === 'google'" class="timeline-block__locked-tag">{{ t('day.lockedTag') }}</div>
          <template v-else-if="item.isClosing">
            <button
              class="timeline-block__skip"
              :class="{ 'timeline-block__skip--active': item.block.status === 'skipped' }"
              :title="t('day.skipToggle')"
              @click.stop="toggleSkip(item.block)"
            >
              <n-icon size="13"><BlockRound /></n-icon>
            </button>
            <button class="timeline-block__delete" :title="t('day.deleteBlockTitle')" @click.stop="removeBlock(item.block.id)">
              <n-icon size="13"><CloseRound /></n-icon>
            </button>
            <div
              v-if="!needsDisplaySplit(item.block)"
              class="timeline-block__resize-handle"
              @mousedown="startResize($event, item.block)"
            />
          </template>
        </div>
      </div>
    </div>

    <div v-if="blocks.length === 0" class="day-timeline__empty">
      {{ t('day.emptyDay') }}
    </div>
  </div>
</template>
