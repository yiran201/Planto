// 长期目标（REQ-016）：用户设定"打算花多少周去实现一个目标"，各阶段
// （探索/筛选/进阶/记忆）的时长由该阶段下所有目标的周数预算累加得出，
// 替代之前在设置页里直接手填的固定阶段周数（`settings.phaseWeeks`）。
// 目标本身存在顶层 state.goals（不属于 settings），因为它更像"计划数据"
// 而不是"配置项"，和 activityPool/dayTimelines 是同一类东西。
import { createId } from '../utils/id.js';
import { PHASES } from './yearPhases.js';

// 某个阶段暂时没有任何目标时的兜底周数，避免该阶段长度变成 0——
// domain/yearPhases.js 的 getPhaseSchedule() 按周数累加计算阶段起止
// 日期，长度为 0 的阶段会导致后续阶段全部错位，是必须避免的情况。
export const DEFAULT_PHASE_WEEKS_FALLBACK = 13;

export function createGoal(store, { title, phase, weekBudget }) {
  const goal = {
    id: createId('goal'),
    title,
    phase,
    weekBudget: Math.max(1, Math.round(weekBudget) || 1),
    createdAt: new Date().toISOString(),
  };
  store.setState((s) => ({ goals: [...s.goals, goal] }));
  return goal;
}

export function updateGoal(store, id, patch) {
  store.setState((s) => ({
    goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  }));
}

export function deleteGoal(store, id) {
  store.setState((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
}

// 把目标列表汇总成 domain/yearPhases.js 的 getPhaseForDate/getPhaseSchedule
// 需要的 phaseWeeks 结构：{explore, filter, advance, memory} → 周数。
// 阶段长度 = 该阶段下所有目标 weekBudget 之和；没有目标（或目标周数都是 0）
// 时用 DEFAULT_PHASE_WEEKS_FALLBACK 兜底。
export function computePhaseWeeksFromGoals(goals) {
  const sums = Object.fromEntries(PHASES.map((p) => [p, 0]));
  for (const goal of goals) {
    if (sums[goal.phase] !== undefined) sums[goal.phase] += goal.weekBudget;
  }
  for (const phase of PHASES) {
    if (sums[phase] <= 0) sums[phase] = DEFAULT_PHASE_WEEKS_FALLBACK;
  }
  return sums;
}
