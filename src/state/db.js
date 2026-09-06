// 文件型数据库封装（REQ-024）：用官方 @sqlite.org/sqlite-wasm 包在浏览器
// 里跑一份真正的 SQLite，靠 OPFS（Origin Private File System，浏览器给
// 每个站点分配的私有文件系统）把数据库文件持久化到本地磁盘——这是一个
// 真实存在的 lifespark.sqlite3 文件，不是 localStorage 那种键值存储，
// 符合"文件型数据库"的字面意思，同时完全不需要额外起一个后端进程（用户
// 明确要求过这一点：只要文件型 SQLite，不加后端，也不需要兼容 MySQL）。
//
// OPFS 的同步文件访问 API（SQLite 要用它才能做真正的事务写入）只在
// Worker 线程里可用，不能在主线程直接跑；官方包提供的
// `sqlite3Worker1Promiser` 把"启动一个内置 worker + 通过 postMessage
// 转发 SQL 请求"这层全部封装好了，对外暴露一个基于 Promise 的
// `promiser(command, args)` 接口，这个文件不需要自己写 worker 脚本。
// 浏览器支持前提：需要跨源隔离环境（COOP/COEP 响应头，见
// vite.config.js 顶部注释）才能使用 OPFS，这也是为什么 Vite 的开发/
// 预览服务器和最终部署都要带上这两个响应头。
//
// 整个应用的状态目前是一个大的 JSON 对象（见 persistence.js 的
// createDefaultState()/fillMissingDefaults()），这里不做关系型拆分——
// 只建一张单行表，把整个状态序列化成一个 JSON 字符串存进一列。这是刻意
// 的简化：domain/*.js 里几十个函数全都是照着"读写同一个内存里的响应式
// state 对象"这个模型写的，拆成真正的关系型多表结构需要重写这些函数，
// 超出了"把持久化后端从 localStorage 换成文件数据库"这个任务的范围；
// 现在只是换了存储介质，应用其余部分的读写模型完全不变。
//
// 已知局限：OPFS 的同步访问句柄是独占的，同一个数据库文件同一时间只能
// 被一个标签页持有写权限——如果用户同时开着这个应用的两个标签页，后
// 打开的那个在尝试写入时可能会报错或者排队等待，没有做跨标签页的协调/
// 广播机制（比如 BroadcastChannel 同步状态）。这是个人单机规划工具的
// 合理取舍，不是遗漏。
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

const DB_FILENAME = 'file:lifespark.sqlite3?vfs=opfs';
const TABLE_SQL = `CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL
)`;

let promiserPromise = null;
let openDbPromise = null;

function getPromiser() {
  if (!promiserPromise) {
    promiserPromise = new Promise((resolve, reject) => {
      const p = sqlite3Worker1Promiser({
        onready: () => resolve(p),
        onerror: (err) => reject(err instanceof Error ? err : new Error(String(err))),
      });
    });
  }
  return promiserPromise;
}

// 打开（或首次创建）数据库文件 + 确保表存在。多处并发调用（比如挂载时
// 和第一次 setState 触发的防抖写入几乎同时发生）会复用同一个 Promise，
// 不会重复打开连接。
function openDb() {
  if (!openDbPromise) {
    openDbPromise = (async () => {
      const promiser = await getPromiser();
      const openResponse = await promiser('open', { filename: DB_FILENAME });
      const dbId = openResponse.dbId;
      await promiser('exec', { dbId, sql: TABLE_SQL });
      return dbId;
    })();
  }
  return openDbPromise;
}

// 读出整份状态的 JSON 字符串；数据库刚创建、还没写过任何数据时返回
// null（调用方——persistence.js 的 loadState()——按"全新安装"处理）。
export async function readStateJson() {
  const dbId = await openDb();
  const promiser = await getPromiser();
  const { result } = await promiser('exec', {
    dbId,
    sql: 'SELECT data FROM app_state WHERE id = 1',
    returnValue: 'resultRows',
    rowMode: 'array',
  });
  return result.resultRows.length ? result.resultRows[0][0] : null;
}

// 用 upsert（SQLite 3.24+ 支持的 ON CONFLICT ... DO UPDATE 语法）写入
// 整份状态，永远只有 id=1 这一行——不是关系型建模，是"一整份 JSON 快照"
// 的持久化方式，见文件顶部注释。
export async function writeStateJson(json) {
  const dbId = await openDb();
  const promiser = await getPromiser();
  await promiser('exec', {
    dbId,
    sql: 'INSERT INTO app_state (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data',
    bind: [json],
  });
}
