// 外观设置里的字体选项（REQ-011）——全部用系统自带字体拼栈，不引入新的
// Web Font 依赖：'default' 沿用 REQ-007 时通过 Google Fonts 引入的
// Roboto，其余几个选项都是各操作系统内置字体，没有网络也能正常显示，
// 不会因为没联网就整个不生效。
export const FONT_STACKS = {
  default: "'Roboto', 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
  rounded: "'Comic Sans MS', 'Segoe UI Rounded', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  serif: "Georgia, 'Songti SC', STSong, 'Noto Serif SC', serif",
  mono: "'JetBrains Mono', Consolas, 'Courier New', ui-monospace, monospace",
};

export const DEFAULT_FONT_FAMILY = 'default';
