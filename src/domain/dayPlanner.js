// 时间块类型常量（REQ-052：`planWeekDays`——把一周选中的活动自动编排成
// 每日小时级时间块——连同它专用的私有辅助函数/`DAY_RANGE` 常量已经整个
// 删除。排查确认 `generateWeeklyPlan`/`planWeekDays`/`scoreActivity`/
// `isInCooldown` 这套"随机生成本周计划"的自动排程子系统，从 REQ-015
// 删掉唯一的 UI 触发按钮起就已经没有任何调用方；REQ-048 把
// `domain/activityPool.js` 的活动数据模型从"服务自动排程"改成"兴趣
// 参考库"之后，这套逻辑读的 `activity.category`/`blockType`/
// `durationMinutes`/`weightMultiplier`/`lastScheduledAt`/
// `timesScheduled` 这些字段在新数据模型里已经不存在，就算保留下来也
// 早就不可能正确运行了。用户明确要求删除，见 docs/CHANGELOG.md
// REQ-052 条目——`domain/scheduler.js`/`domain/noveltyEngine.js` 两个
// 文件整个删除。
//
// 这个文件本身没有整个删除：`BLOCK_TYPES` 还在被 `EventModal.vue`
// 用来渲染"新建/编辑事件"表单里的类型选择器（手动创建事件用），
// `IMPORTED_BLOCK_TYPE`（`'busy'`）是 Google 导入事件的类型标识符，
// 虽然目前没有代码按名字导入这个常量，但 `'busy'` 这个字符串字面量在
// `DayTimeline.vue`/`WeekBoard.vue`/`GoogleSyncPanel.vue`/
// `constants/colors.BLOCK_TYPE_COLORS` 里仍然多处直接用到，保留这个
// 导出做语义说明成本很低。这两个常量和已删除的自动排程逻辑是两回事——
// 一个是"有哪些类型"这个稳定的数据字典，一个是"怎么自动挑活动填满
// 时间块"这个已经死掉的算法，删除时能明确切开。
export const BLOCK_TYPES = ['work', 'exercise', 'experience', 'relax', 'free'];
export const IMPORTED_BLOCK_TYPE = 'busy'; // 来自 Google 日历的只读块，不计入 5 大类别

// 类型显示文本走 i18n（domain.blockType.*），这里只保留标识符。
