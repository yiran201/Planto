// 周期事件：每天 / 每周固定星期几 / 每月固定日期重复。
// 采用"物化未来实例"的策略而非按需展开：把具体的 block 直接写入
// state.dayTimelines（source:'manual'），这样完全复用
// domain/dayPlanner.js 里"保留 manual 块、不覆盖、且把它当作已占用区间
// 排除在自动排程可用空档之外"的既有逻辑，dayPlanner.js 不需要为周期事件
// 做任何改动。
//
// REQ-070（用户明确要求）：物化策略从"创建时一次性生成、之后再也不管"
// 改成"滚动续期"——不设结束条件（'never'）的系列，不再是创建时生成完
// 200 个实例就永久停在那里（高频的"每天"系列甚至撑不到一年），而是
// 始终保持"从今天往后 ROLLING_HORIZON_DAYS 天"都已经物化好，每次应用
// 启动时（见 App.vue 的 extendAllRecurringSeries() 调用）自动检查续期，
// 不需要用户手动切换月份触发。'until'/'count' 这两种有限系列同样受益：
// 老版本如果截止日期/总次数超出当初的一次性生成范围会被静默截断，现在
// 也会随着应用使用逐步补齐，直到真正到达自己的截止条件为止。
//
// 每条规则新增 `materializedUntil`（已经生成到哪一天，dateKey 字符串）/
// `materializedCount`（已经生成了多少个实例，供 'count' 型结束条件判断）
// 两个字段，创建和续期共用同一套 `materializeUpTo()` 逻辑——创建时只是
// "从一个空白起点续期一次"的特殊情况，不是单独一套代码。
import { createId } from '../utils/id.js';
import { getDateKey, addDays, parseDateKey } from '../utils/dateUtils.js';

export const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly'];
export const RECURRENCE_END_TYPES = ['never', 'until', 'count'];

// 滚动物化窗口：'never' 类型的系列始终保持物化到"今天 + 这么多天"。
export const ROLLING_HORIZON_DAYS = 366;
// 单次生成/续期调用的安全上限，防止"每天，直到 3000 年"这类极端输入
// 让一次调用生成过多实例或扫描过久——不是日常场景会撞到的数字，日常的
// 滚动窗口一次最多也就补 366 天。
const MAX_INSTANCES_PER_OP = 3000;
const MAX_SCAN_DAYS = 3660;

function matchesRecurrence(date, recurrence) {
  switch (recurrence.freq) {
    case 'daily':
      return true;
    case 'weekly':
      return (recurrence.byWeekday || []).includes(date.getDay());
    case 'monthly':
      return date.getDate() === recurrence.byMonthDay;
    default:
      return false;
  }
}

// 一条规则是否已经"生成到头"，不需要再续期：until 类型看物化进度是否
// 追上截止日，count 类型看已生成数量是否达到总数，never 类型永远不算
// 到头。
function isFullyMaterialized(rule) {
  if (rule.end.type === 'until') return rule.materializedUntil >= rule.end.until;
  if (rule.end.type === 'count') return rule.materializedCount >= rule.end.count;
  return false;
}

// 纯函数：[fromDate, toDate] 闭区间内按 recurrence 规则筛出匹配的日期。
// startingCount 是这条系列在 fromDate 之前已经生成过的实例总数，供
// count 型结束条件判断这次还能不能再生成。
function occurrencesInRange(rule, fromDate, toDate, startingCount) {
  const { recurrence, end } = rule;
  const dates = [];
  let cursor = new Date(fromDate);
  let count = startingCount;
  for (let step = 0; step < MAX_SCAN_DAYS && cursor <= toDate && dates.length < MAX_INSTANCES_PER_OP; step++) {
    if (end.type === 'count' && count >= end.count) break;
    if (matchesRecurrence(cursor, recurrence)) {
      dates.push(new Date(cursor));
      count++;
    }
    cursor = addDays(cursor, 1);
  }
  return dates;
}

// 这条系列这一次应该续期到哪一天：'never' 永远是"今天 + 滚动窗口天数"
// 这个不断往后移的终点；'until'/'count' 如果自己的截止日比这个滚动
// 终点更早，用自己的截止日封顶——不会因为滚动窗口把已经该结束的系列
// 继续往后推。'count' 类型没有天然的日期上限，同样先用滚动终点封顶，
// 数量够了自然会被 occurrencesInRange() 提前截住。
function nextMaterializationTarget(rule) {
  const horizonEnd = getDateKey(addDays(new Date(), ROLLING_HORIZON_DAYS));
  if (rule.end.type === 'until' && rule.end.until) {
    return rule.end.until < horizonEnd ? rule.end.until : horizonEnd;
  }
  return horizonEnd;
}

// 把一条规则续期到"这一次应该到的地方"，返回新生成的 {dateKey, block}
// 列表 + 更新后的规则对象。纯函数，不直接碰 store，创建新系列和批量
// 续期共用这一套逻辑（见下方 createRecurringEvent/extendAllRecurringSeries）。
// 已经生成到头、或者已经追上这一次目标的规则，直接原样返回、不生成
// 任何新 block（空操作，调用方据此判断要不要写 state）。
function materializeUpTo(rule) {
  if (isFullyMaterialized(rule)) return { blocks: [], rule };
  const target = nextMaterializationTarget(rule);
  if (rule.materializedUntil >= target) return { blocks: [], rule };

  const fromDate = addDays(parseDateKey(rule.materializedUntil), 1);
  const toDate = parseDateKey(target);
  const dates = occurrencesInRange(rule, fromDate, toDate, rule.materializedCount);

  const blocks = dates.map((date) => ({
    dateKey: getDateKey(date),
    block: {
      id: createId('blk'),
      type: rule.type,
      start: rule.startHour,
      end: rule.endHour,
      source: 'manual',
      title: rule.title,
      recurringId: rule.id,
    },
  }));

  return {
    blocks,
    rule: { ...rule, materializedUntil: target, materializedCount: rule.materializedCount + dates.length },
  };
}

// 把一批 {dateKey, block} 合并进 dayTimelines，纯函数。
function mergeBlocksIntoTimelines(dayTimelines, blocksToAdd) {
  const next = { ...dayTimelines };
  for (const { dateKey, block } of blocksToAdd) {
    const existingBlocks = next[dateKey]?.blocks || [];
    next[dateKey] = { blocks: [...existingBlocks, block].sort((a, b) => a.start - b.start) };
  }
  return next;
}

// fields: {title, type, startHour, endHour, seriesStartDate, recurrence, end}
export function createRecurringEvent(store, fields) {
  const id = createId('rec');
  const bareRule = {
    id,
    title: fields.title,
    type: fields.type,
    startHour: fields.startHour,
    endHour: fields.endHour,
    seriesStartDate: fields.seriesStartDate,
    recurrence: fields.recurrence,
    end: fields.end,
    createdAt: new Date().toISOString(),
    // 起点设成"系列开始日前一天"，第一次 materializeUpTo() 就会从
    // seriesStartDate 本身开始生成——创建只是"从空白起点续期一次"的
    //特殊情况，和后续续期走的是同一套逻辑，不是另外一套代码。
    materializedUntil: getDateKey(addDays(parseDateKey(fields.seriesStartDate), -1)),
    materializedCount: 0,
  };

  const { blocks, rule } = materializeUpTo(bareRule);

  store.setState((s) => ({
    dayTimelines: mergeBlocksIntoTimelines(s.dayTimelines, blocks),
    recurringEvents: [...s.recurringEvents, rule],
  }));

  return rule;
}

// 应用每次启动时调用（App.vue 的 onMounted）：把所有还没"生成到头"的
// 周期事件规则续期到这一次该到的地方。不需要用户手动切换月份触发，
// 也不会每次都重新生成全部——只对 materializedUntil 落后于目标的规则
// 做增量续期，已经追上/已经到头的规则这里是空操作，不产生任何 state
// 写入（`changed` 为空数组时直接 return，不调用 `store.setState`）。
export function extendAllRecurringSeries(store) {
  const state = store.getState();
  const updates = state.recurringEvents.map(materializeUpTo);
  const changed = updates.filter((u) => u.blocks.length > 0);
  if (changed.length === 0) return;

  const allNewBlocks = changed.flatMap((u) => u.blocks);
  const updatedRuleById = new Map(changed.map((u) => [u.rule.id, u.rule]));

  store.setState((s) => ({
    dayTimelines: mergeBlocksIntoTimelines(s.dayTimelines, allNewBlocks),
    recurringEvents: s.recurringEvents.map((r) => updatedRuleById.get(r.id) || r),
  }));
}

export function deleteRecurringSeries(store, recurringId) {
  store.setState((s) => {
    const dayTimelines = {};
    for (const [dateKey, timeline] of Object.entries(s.dayTimelines)) {
      dayTimelines[dateKey] = { blocks: timeline.blocks.filter((b) => b.recurringId !== recurringId) };
    }
    return {
      dayTimelines,
      recurringEvents: s.recurringEvents.filter((r) => r.id !== recurringId),
    };
  });
}
