// 时间块类型的配色表（纯数据，供多个组件复用）。
// （REQ-053/058 期间这里还有一套按类别 id 哈希取色/取 emoji 的
// `categoryColor()`/`categoryEmoji()`，服务兴趣活动的动态类别功能；
// REQ-082 应用户要求把分类功能整个去掉，这两个函数连同调色板/emoji 表
// 一起删除，不留死代码，见 `domain/activityPool.js` 顶部注释。）

export const BLOCK_TYPE_COLORS = {
  work: '#64748b',
  exercise: '#34d399',
  experience: '#f472b6',
  relax: '#60a5fa',
  free: '#a3a3a3',
  busy: '#f87171',
};
