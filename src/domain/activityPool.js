// 兴趣活动库 CRUD（REQ-048，原"活动库"/"体验库"改名重做）。所有函数
// 操作传入的 store，不隐式依赖单例，便于测试；`src/main.js` 中会绑定到
// 全局 store 使用。
//
// 用户明确要求把这个页面从"服务自动排程的活动池"（旧版 category 是
// novel/interest/variety/routine 这种"新鲜度"维度，配合
// blockType/durationMinutes/energyLevel/rating/weightMultiplier/
// timesScheduled/lastScheduledAt 这些字段，专门喂给
// domain/scheduler.js、domain/noveltyEngine.js 用于自动挑活动排进
// 时间轴）重做成一个纯粹的个人兴趣活动参考库，每条记录只有标题/封面图/
// 内容（一段 Markdown 笔记），供浏览/检索，不再喂给任何自动排程逻辑。
//
// 排查确认 REQ-015 已经删除了"生成本周计划"/"清空本周安排"这两个唯一
// 会调用 `domain/scheduler.generateWeeklyPlan`/`domain/dayPlanner.
// planWeekDays` 的 UI 入口，这两个函数当时在应用里已经没有任何调用方
// （纯 domain 层死代码，和 REQ-015 处理"删按钮不删函数"是同一个道理，
// REQ-048 这次没有连带删除它们本身，直到 REQ-052 才应用户要求把
// `scheduler.js`/`noveltyEngine.js` 整个删除、`dayPlanner.js` 删掉
// `planWeekDays`，见对应条目）。这意味着旧的 category/blockType/
// durationMinutes/energyLevel/rating/weightMultiplier/timesScheduled/
// lastScheduledAt 这些字段在 REQ-048 当时的应用里就已经没有任何代码
// 路径会读到，字段变成 `undefined` 不会导致报错，只是这次改动的一个
// 已知附带影响，不是新引入的风险。`rateActivity`（连同它依赖的
// `domain/feedbackAdjuster.js`）是唯一一个还有真实 UI 调用方
// （`ActivityCard.vue`/`DayTimeline.vue` 的评价按钮）的旧函数，这次
// 一并删除，配套调用方也在同一次改动里改掉（不能只删这一个函数、
// 留着两处调用方报错），详见 `docs/CHANGELOG.md` REQ-048 条目。
//
// REQ-053/058 期间这里曾经有一套完整的"用户可动态新建的类别"体系
// （`addCategory()`/`touchCategoryUsage()`、`activity.category` 引用
// `state.activityCategories` 里某一项的 id、内置 8 个默认类别带
// `seedKey` 走 i18n）。REQ-082 应用户要求把分类筛选/分类字段整个去掉
// ——"分类搜索的功能去除掉，搜索时的根据标题匹配搜索就行，图文里面的
// 分类也去掉"，这一整套连同 `state.activityCategories`/
// `constants/colors.categoryColor()`/`categoryEmoji()`/
// `utils/i18nLabels.categoryLabel()` 一起整个删除，见
// `state/persistence.js`/`ActivityModal.vue`/`ActivityCard.vue`/
// `ActivityLibraryPanel.vue` 各自的条目。
import { createId } from '../utils/id.js';

export function addActivity(store, fields) {
  const activity = {
    id: createId('act'),
    title: fields.title,
    // imageUrl（REQ-035 沿用，REQ-081 补充本地文件上传入口）：封面图，
    // 可以是用户粘贴的外部 URL，也可以是 ActivityModal.vue 里浏览本地
    // 文件读出来的 data URI，字段本身不区分来源，和
    // settings.appearance.backgroundImage 同一个模式。
    // content（REQ-048 新增，REQ-081 去掉了同批加入的 link 字段——用户
    // 反馈图文链接用不上）：正文笔记（Markdown 源文本，见
    // utils/markdown.js 的 renderMarkdown()）。
    imageUrl: fields.imageUrl || '',
    content: fields.content || '',
    createdAt: new Date().toISOString(),
  };
  store.setState((s) => ({ activityPool: [...s.activityPool, activity] }));
  return activity;
}

export function updateActivity(store, id, patch) {
  store.setState((s) => ({
    activityPool: s.activityPool.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  }));
}

export function removeActivity(store, id) {
  store.setState((s) => ({
    activityPool: s.activityPool.filter((a) => a.id !== id),
  }));
}
