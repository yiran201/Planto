// 应用运行期单一状态源：Vue reactive() + 自动持久化。
// 对外接口 {getState, setState} 与 REQ-001/REQ-002 时期完全一致，
// domain/*.js 和 calendar/*.js 里所有 `store.setState((s) => ({...}))`
// 的调用方式不需要改——Object.assign 对 reactive() 代理对象重新赋值
// 嵌套字段是完全支持的（整体替换的数组/对象会被自动追踪）。
// Vue 组件读取 store.getState() 里的字段时会被自动收集为响应式依赖，
// 只有真正用到的那部分数据变化时才会触发对应组件重渲染，不再是旧版
// "任何 setState 都整树重建"的模式。
//
// REQ-024：`persistence.js` 的 `loadState`/`saveState` 从同步（读写
// localStorage）改成了异步（读写 state/db.js 封装的 OPFS SQLite 文件）。
// 这个模块用一个"先同步给一份默认状态占位、再异步把真实数据覆盖进去"的
// 策略来吸收这个变化，不需要改 `getState()`/`setState()` 这两个对外
// 接口的调用约定：`state` 这个 reactive 对象在模块加载的那一刻就已经
// 存在（用 `createDefaultState()` 占位），`App.vue` 里 `store.getState()`
// 拿到的是同一个对象引用，只是里面的字段还没被真实数据填满；`initStore()`
// 异步 resolve 之后用 `Object.assign` 把真实数据整个覆盖进这个已经在用
// 的 reactive 对象——Vue 的响应式系统会正常追踪到这次整体覆盖，界面会
// 自动刷新成真实数据，不需要重新挂载组件树。`main.js` 会在挂载应用前
// `await store.initStore()`，所以正常使用流程里用户根本看不到这个"先
// 占位、再覆盖"的过程，只有开发者需要知道这个实现细节。
import { reactive, watch } from 'vue';
import { createDefaultState, loadState, saveState } from './persistence.js';

const state = reactive(createDefaultState());

let saveTimer = null;
let watching = false;

function startWatching() {
  if (watching) return;
  watching = true;
  watch(
    state,
    () => {
      clearTimeout(saveTimer);
      // 短时间内的多次连续写入（例如一次生成周计划里循环调用
      // markScheduled）合并成一次数据库写入。`saveState` 是异步的，这里
      // 不 await 它（防抖回调本身不需要等待写入完成才能继续），失败已经
      // 在 persistence.js 内部 catch 住并打印警告，不会变成未处理的
      // Promise 异常。
      saveTimer = setTimeout(() => {
        saveState(state);
      }, 150);
    },
    { deep: true }
  );
}

// 应用挂载前必须 await 这个函数一次（见 main.js）：先从数据库异步读出
// 真实状态，再整体覆盖进已经存在的 reactive 对象；成功读回真实数据后才
// 开始监听变更自动保存——避免"占位默认状态" 触发的任何变化（理论上不
// 应该发生，因为挂载前没有交互）被误当成真实数据存回数据库，覆盖掉
// 用户已有的记录。
export async function initStore() {
  const loaded = await loadState();
  Object.assign(state, loaded);
  startWatching();
}

export const store = {
  getState() {
    return state;
  },
  setState(patch) {
    const partial = typeof patch === 'function' ? patch(state) : patch;
    Object.assign(state, partial);
  },
};
