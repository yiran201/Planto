// 日期 / ISO 周 / 小时相关的纯函数工具。无外部依赖，无副作用。

function assertDate(date, fnName) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError(`${fnName}: expected a valid Date`);
  }
}

export function startOfDay(date) {
  assertDate(date, 'startOfDay');
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  assertDate(date, 'addDays');
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addWeeks(date, n) {
  return addDays(date, n * 7);
}

// 周一为一周的第一天。
export function getWeekStart(date) {
  assertDate(date, 'getWeekStart');
  const d = startOfDay(date);
  const dow = d.getDay(); // 0=周日
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  return addDays(d, diffToMonday);
}

export function getWeekDates(weekStart) {
  assertDate(weekStart, 'getWeekDates');
  const start = getWeekStart(weekStart);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

export function getISOWeekKey(date) {
  assertDate(date, 'getISOWeekKey');
  const { year, week } = getISOWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getDateKey(date) {
  assertDate(date, 'getDateKey');
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function diffInWeeks(a, b) {
  assertDate(a, 'diffInWeeks');
  assertDate(b, 'diffInWeeks');
  const ms = getWeekStart(b).getTime() - getWeekStart(a).getTime();
  return Math.round(ms / (7 * 86400000));
}

export function diffInDays(a, b) {
  assertDate(a, 'diffInDays');
  assertDate(b, 'diffInDays');
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86400000);
}

export function getMonthStart(date) {
  assertDate(date, 'getMonthStart');
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date, n) {
  assertDate(date, 'addMonths');
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// 返回 `YYYY-MM` 格式的月标识（REQ-068 新增，供 YearBoard.vue 的
// `monthLabels` 用作 map key），和 `getDateKey` 是同一种写法，只是不带
// "日"这一段。
export function getMonthKey(date) {
  assertDate(date, 'getMonthKey');
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// 返回 42 个 Date（6 周 × 7 天，周一起始），补齐月首/月末不满一周的部分，
// 供月历网格渲染使用。
export function getMonthGridDates(date) {
  assertDate(date, 'getMonthGridDates');
  const gridStart = getWeekStart(getMonthStart(date));
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

// 年视图（REQ-060）：和 getMonthStart/addMonths 是同一套写法。
export function getYearStart(date) {
  assertDate(date, 'getYearStart');
  return new Date(date.getFullYear(), 0, 1);
}

export function addYears(date, n) {
  assertDate(date, 'addYears');
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + n);
  return d;
}

export function hourToLabel(hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 星期几的显示文本走 i18n（domain.weekdayShort / domain.weekdayFull，
// 用 useI18n().tm() 按周一起始的顺序取，见 src/i18n/locales/*.js）。
export function weekdayIndex(date) {
  return (date.getDay() + 6) % 7;
}
