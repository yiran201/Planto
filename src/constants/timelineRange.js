// 日/周时间轴（DayTimeline.vue、WeekBoard.vue）UI 层的显示与可编辑范围：
// 全天 0-24 点。这是"用户能看到/能手动放事件"的范围，和
// domain/dayPlanner.js 的 DAY_RANGE（自动生成周计划时默认只把活动排在
// 7-23 点这种清醒时段，避免自动排到凌晨）是两个不同的概念，故意不共用
// 同一个常量——REQ-009 之前两者共用 DAY_RANGE，导致手动创建/拖拽事件也被
// 限制在 7-22 点，用户反馈需要全时间段，因此拆开。块的存储/拖拽范围钳制
// （moveBlock/resizeBlock）用的就是这个真实小时边界，不受下面的显示
// 起点影响——块本身仍然是"某一天 0 点到 24 点"，没有跨天概念。
export const TIMELINE_RANGE = { start: 0, end: 24 };

// 时间轴视觉上从几点开始画（REQ-010）：网格最上面一行是 6:00，往下数到
// 23:00 之后接着显示 0:00-5:59（同一天里最早的几个小时，通常是睡眠时段，
// 排在最后而不是最前面，更符合"一天从早上开始"的直觉）。这纯粹是展示
// 层面的选择，不改变块本身的存储范围（依然是 TIMELINE_RANGE 的 0-24）。
// 如果某个块的真实起止时间跨过这个 6 点分界线（比如 4:00-8:00），单个
// 绝对定位的 DOM 元素没法在视觉上"从底部绕回顶部"——REQ-010~012 时期
// 的处理方式是让它在网格底部被裁掉超出的部分，看起来偏短、显示很奇怪；
// REQ-045 改成把这类块在渲染层面拆成两段（`needsDisplaySplit`/
// `splitDisplaySegments`，见下方），前半段（[block.start, 6)）画在网格
// 底部、后半段（[6, block.end)）画在网格顶部，两段共用同一个 block 对象，
// 不引入任何新的数据字段——跳过/删除/编辑这些操作本来就作用在这一个
// block 上，天然"标注的是同一件事、操作一次两段一起生效"，不需要额外
// 关联逻辑。
export const DISPLAY_START_HOUR = 6;

// 判断一个块是否跨过 DISPLAY_START_HOUR 这条旋转分界线，需要拆成两段
// 渲染（REQ-045）。只有真实起止时间"骑在"分界线两侧的块才需要（比如
// 4:00-8:00）；完全落在 [6,24) 或 [0,6) 内的块（绝大多数情况）不受影响，
// 仍然按原来的方式整段渲染。
export function needsDisplaySplit(block) {
  return block.start < DISPLAY_START_HOUR && block.end > DISPLAY_START_HOUR;
}

// 把一个跨界的块拆成两个真实小时区间：前半段渲染在网格底部（对应展示
// 顺序里 23 点之后紧跟的 0~6 点这一段的末尾），后半段渲染在网格顶部
// （展示顺序的起点就是 6 点）。两段拼起来正好是这个块完整的真实时长，
// 只是拆成了两个 DOM 元素，不影响 block.start/end 本身。
export function splitDisplaySegments(block) {
  return [
    { start: block.start, end: DISPLAY_START_HOUR },
    { start: DISPLAY_START_HOUR, end: block.end },
  ];
}

// 把"某一天里的真实小时数"（0-24）换算成"时间轴从上往下数第几份"
// （0-24，用于百分比定位），按 DISPLAY_START_HOUR 旋转。
export function toDisplayOffset(hour) {
  return (((hour - DISPLAY_START_HOUR) % 24) + 24) % 24;
}

// toDisplayOffset 的反函数：时间轴上"从上往下的比例"（0-1）换算回真实
// 小时数，供点击网格/拖拽事件到某个像素位置时，反推出对应的真实小时用。
export function fromDisplayRatio(ratio, totalHours) {
  return (DISPLAY_START_HOUR + ratio * totalHours) % 24;
}

// 纯展示层面的"起点留白"（REQ-011，REQ-012 收窄为只影响块的渲染位置）：
// 块的渲染起点（像素/百分比位置）比实际存储的 start 往后错开一点点，
// 让块看起来不是死死贴在整点格线上，视觉上更松弛。**只用来算 top/height
// 这类位置样式**，不要再拿它去生成时间文字标签——REQ-011 时一度让文字
// 标签也跟着错开显示（比如写成"16:05"），用户反馈这样看着奇怪、容易
// 让人误以为存的时间真的是 16:05，所以时间标注一律显示 block.start/end
// 的真实值（见 DayTimeline.vue 的 displayTimeLabel），只有这里的位置
// 计算继续用这个留白值。拖拽/排序/冲突判断等所有业务逻辑同样一律用
// 真实的 block.start，不读这个值。时长很短的事件（小于两倍留白）按
// 一半时长错开，避免视觉起点越过结束点。
export const DISPLAY_START_NUDGE_HOURS = 5 / 60;

export function displayStartHour(block) {
  const nudge = Math.min(DISPLAY_START_NUDGE_HOURS, (block.end - block.start) / 2);
  return block.start + nudge;
}
