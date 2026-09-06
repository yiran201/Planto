// 四阶段（探索/筛选/进阶/记忆）日期计算。
import { addWeeks, diffInWeeks, getWeekStart } from '../utils/dateUtils.js';

export const PHASES = ['explore', 'filter', 'advance', 'memory'];

// 阶段的显示文本走 i18n（见 src/i18n/locales/*.js 的 domain.phase.*），
// 这里只保留稳定的英文标识符和配色。

export const PHASE_COLORS = {
  explore: '#6ee7b7',
  filter: '#7dd3fc',
  advance: '#c4b5fd',
  memory: '#fdba74',
};

// 返回每个阶段的起止周（Date），按 phaseWeeks 顺序累加。
export function getPhaseSchedule(yearStart, phaseWeeks) {
  const start = getWeekStart(new Date(yearStart));
  let cursor = start;
  const schedule = [];
  for (const phase of PHASES) {
    const weeks = phaseWeeks[phase] ?? 13;
    const phaseStart = cursor;
    const phaseEnd = addWeeks(cursor, weeks);
    schedule.push({ phase, start: phaseStart, end: phaseEnd, weeks });
    cursor = phaseEnd;
  }
  return schedule;
}

// 给定日期，返回所属阶段及在整年中的进度。超出年度范围时钳制到最近边界，
// 不抛异常，方便 UI 直接渲染。
export function getPhaseForDate(date, yearStart, phaseWeeks) {
  const schedule = getPhaseSchedule(yearStart, phaseWeeks);
  const totalWeeks = schedule.reduce((sum, s) => sum + s.weeks, 0);
  const weekStart = getWeekStart(date);
  const yearStartWeek = getWeekStart(new Date(yearStart));

  let weekOffset = diffInWeeks(yearStartWeek, weekStart);
  if (weekOffset < 0) weekOffset = 0;
  if (weekOffset >= totalWeeks) weekOffset = totalWeeks - 1;

  let acc = 0;
  for (let i = 0; i < schedule.length; i++) {
    const entry = schedule[i];
    if (weekOffset < acc + entry.weeks) {
      const weekInPhase = weekOffset - acc;
      return {
        phase: entry.phase,
        index: i,
        weekInPhase,
        totalWeeksInPhase: entry.weeks,
        progress: totalWeeks > 0 ? (weekOffset + 1) / totalWeeks : 0,
        phaseStart: entry.start,
        phaseEnd: entry.end,
      };
    }
    acc += entry.weeks;
  }

  const last = schedule[schedule.length - 1];
  return {
    phase: last.phase,
    index: schedule.length - 1,
    weekInPhase: last.weeks - 1,
    totalWeeksInPhase: last.weeks,
    progress: 1,
    phaseStart: last.start,
    phaseEnd: last.end,
  };
}
