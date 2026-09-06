// REQ-058：奖励是"用户可以随时新建自由文本"的动态列表，`title` 字段
// 本身就是要展示的文本，没有走 i18n（用户输入的奖励名不存在另外两种
// 语言的翻译）。但应用曾经内置的种子数据是固定内容，理应跟着界面语言
// 切换——`state/persistence.js` 给这些种子条目额外打了一个稳定的
// `seedKey`（不随用户改名/新增而变化，用户自己新建的条目没有这个
// 字段），这个函数就是"有 seedKey 就走 i18n 查表，没有就用原始文本"
// 这条判断逻辑的唯一实现。REQ-067 起新装用户的奖励不会再带 `seedKey`，
// 带 `seedKey` 的奖励只会出现在 REQ-067 之前就已经建过库的老数据里，
// 这个分支逻辑因此继续保留，供这类老数据使用。
// 不直接 import vue-i18n——`t` 由调用方（组件里的 `useI18n().t`）传入，
// 保持这个文件本身和 `utils/` 下其它模块一样不依赖任何具体框架 API。
// （这个文件原来还有一个同样模式的 `categoryLabel()`，服务兴趣活动的
// 动态类别功能；REQ-082 应用户要求把分类功能整个去掉后一并删除，见
// `domain/activityPool.js` 顶部注释。）
export function rewardLabel(t, reward) {
  if (!reward) return '';
  return reward.seedKey ? t('domain.reward.' + reward.seedKey) : reward.title;
}
