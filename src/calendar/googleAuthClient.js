// Google OAuth2 授权（REQ-072 改写为整页跳转，取代 Google Identity
// Services 的弹窗 token client）。
//
// 原因：`vite.config.js` 给页面加了 `Cross-Origin-Opener-Policy:
// same-origin`（OPFS 本地数据库的硬性前提），但这个响应头会切断"页面"
// 和"它打开的弹窗"之间的通信——弹窗里 `window.opener` 会被置空，Google
// 登录弹窗完成授权后没法把结果传回主页面，导致"弹窗流程看起来走完了，
// 但主页面死活不显示已登录"，而且是静默失败、不报错。查证过这是
// COOP:same-origin + OAuth 弹窗的已知通病，两个更宽松的 COOP 选项都不能
// 两全：`same-origin-allow-popups` 能保住弹窗通信但会让页面失去"跨源
// 隔离"状态、本地数据库打不开；理论上两全的 `restrict-properties`
// 方案 Chrome 已经在 2025-04 暂停、没有浏览器真正支持。见
// docs/KNOWLEDGE.md 相关记录。
//
// 改成标准的 OAuth2 隐式授权流程（implicit grant，`response_type=token`）
// + 整页跳转：`startLogin()` 把整个页面导航到 Google 的授权页；用户同意
// 后 Google 把带着 `access_token` 的 URL 片段重定向回本应用（跳转到
// `redirect_uri`，必须在 Google Cloud Console 的"已获授权的重定向 URI"
// 里登记）；应用重新加载后 `consumeRedirectToken()`（App.vue 挂载时
// 调用一次）从 URL 片段里把 token 解析出来。全程不需要弹窗，天然不受
// COOP 影响。access token 依然只存在这个模块的内存变量里，不写入任何
// 存储——沿用一直以来的安全决定：token 有效期短、属于敏感凭据，刷新
// 页面后需要重新走一次授权。
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

const OAUTH_STATE_KEY = 'lifespark:google-oauth-state';

let accessToken = null;

// 跳转回来时用的地址，必须和发起授权时用的 redirect_uri 完全一致，也
// 必须是 Google Cloud Console 里登记过的"已获授权的重定向 URI"——用
// origin+pathname（不含查询串/片段），对这个单页应用来说就是应用本身
// 的根地址。GoogleSyncPanel.vue 的引导步骤展示的就是这个值，供用户
// 直接复制粘贴去登记。
export function getRedirectUri() {
  return window.location.origin + window.location.pathname;
}

// 生成一个随机 state 串存进 sessionStorage，跳转回来后用于校验这次
// 回调确实是刚才这次跳转发起的、不是伪造的（CSRF 防护的标准做法）。
// 用 sessionStorage 而不是内存变量，是因为整页跳转会让当前这个 JS
// 执行环境整个销毁重建，内存状态跳转前后不连续，只有 sessionStorage/
// localStorage 这类跨导航持久的存储能带着这个值"活过"跳转。
function generateState() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function startLogin(clientId) {
  const state = generateState();
  sessionStorage.setItem(OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'token',
    scope: SCOPES,
    include_granted_scopes: 'true',
    state,
    prompt: 'consent',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// 应用启动时调用一次（App.vue 的 onMounted）：检查 URL 片段里有没有刚
// 从 Google 跳转回来带的 access_token。有就解析出来存进内存、校验
// state、然后用 history.replaceState 把片段从地址栏清掉（不留痕迹，
// 避免这个短期有效的 token 被浏览器历史记录/书签存下来）。没有就是
// 空操作，返回 false。校验失败（state 对不上，可能是伪造的回调或者
// 一次过期的跳转）只在控制台警告、不抛异常，同样清掉地址栏并返回
// false，不影响应用正常启动。
export function consumeRedirectToken() {
  if (!window.location.hash) return false;

  const params = new URLSearchParams(window.location.hash.slice(1));

  // 用户在 Google 的同意页点了"取消"/拒绝授权时，Google 会带
  // `#error=access_denied&state=...` 跳回来，而不是 access_token。
  // 这不是一次异常，是用户主动的选择——清掉地址栏，打个日志方便排查，
  // 静默按"没有登录成功"处理，不弹出错误提示打扰用户。
  const error = params.get('error');
  if (error) {
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    console.info(`[Planto] Google 登录未完成：${error}`);
    return false;
  }

  const token = params.get('access_token');
  if (!token) return false;

  const returnedState = params.get('state');
  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  history.replaceState(null, '', window.location.pathname + window.location.search);

  if (!expectedState || returnedState !== expectedState) {
    console.warn('[Planto] Google 登录跳转的 state 校验未通过，忽略这次回调（可能是过期的跳转或伪造的回调）');
    return false;
  }

  accessToken = token;
  return true;
}

export function isLoggedIn() {
  return !!accessToken;
}

export function getAccessToken() {
  return accessToken;
}

export function signOut() {
  const token = accessToken;
  accessToken = null;
  if (token) {
    // 尽力而为地通知 Google 吊销这个 token；不 await、不管成不成功都
    // 让本地登出立即生效——用户点"退出登录"要的是"这个应用这边马上
    // 不再能用这个 token 了"，Google 那边的吊销请求失败也不应该阻塞
    // 这个体验，失败了顶多是 token 自己到有效期后自然过期。
    fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: 'POST' }).catch(() => {});
  }
}
