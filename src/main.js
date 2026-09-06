// 入口：挂载 Vue 应用，全局注册 Naive UI + vue-i18n，引入样式表。
// REQ-024：数据从 OPFS 文件型数据库异步读取（见 state/db.js、
// state/store.js 的 initStore()），挂载前必须先 await 它一次，不然
// App.vue 及其子组件在 setup() 里同步读取 store.getState() 时会拿到
// 还没填充真实数据的占位默认状态。这里用一个自执行的 async 函数包一层
// （模块顶层 top-level await 在部分打包目标下兼容性不如显式包一层
// 稳妥），失败时在控制台报错但仍然继续挂载——`initStore()` 内部已经把
// 数据库读取失败的情况兜底成"使用默认状态"（见 persistence.js 的
// loadState()），不会导致这里再抛出异常。
import { createApp } from 'vue';
import naive from 'naive-ui';
import { i18n } from './i18n/index.js';
import { initStore } from './state/store.js';
import App from './App.vue';
import '../css/variables.css';
import '../css/base.css';
import '../css/layout.css';
import '../css/components.css';
import '../css/timeline.css';

// 启动加载动效退场（REQ-030）：不是应用内容"啪"一下顶掉黑屏占位——先
// 让 Vue 应用在底下渲染完成，再给顶层的 `#app-loading` 遮罩加一个淡出
// class（配合 index.html 里它自己的 CSS transition），等过渡结束（用
// `setTimeout` 卡一个比 transition 时长稍长的时间，比监听 `transitionend`
// 简单可靠，不用处理"这个元素同时有好几个属性在过渡、事件触发多次"这类
// 边界情况）再把这个元素整个移除。视觉上是黑屏平滑淡出、露出下面已经
// 渲染好的界面，不是黑屏瞬间消失、界面瞬间蹦出来。
function fadeOutLoadingScreen() {
  const loading = document.getElementById('app-loading');
  if (!loading) return;
  loading.classList.add('app-loading--out');
  // REQ-045：index.html 里 #app-loading 的淡出 transition 从 0.35s 加长到
  // 0.5s（配合新的"清新治愈"呼吸动效，更慢的淡出显得更柔和），这里的
  // 等待时长跟着同步加长，避免元素在 CSS 过渡还没走完时就被摘掉。
  setTimeout(() => loading.remove(), 550);
}

async function bootstrap() {
  await initStore();
  createApp(App).use(naive).use(i18n).mount('#app');
  fadeOutLoadingScreen();
}

bootstrap();
