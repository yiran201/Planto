# KNOWLEDGE.md

开发过程中积累的业务规则、UI 设计参考、技术原理、第三方库用法、行业惯例。
每条固定格式：来源 / 日期 / 内容 / 适用范围。

### Google Identity Services（GIS）OAuth2 token client 用法

- 来源：网络调研-行业惯例参考
- 日期：2026-07-20
- 内容：Google 已弃用旧版 `gapi.auth2`，新项目应使用 Google Identity
  Services（`<script src="https://accounts.google.com/gsi/client">`）。
  客户端 OAuth 流程用 `google.accounts.oauth2.initTokenClient({client_id,
  scope, callback})` 创建 token client，再调用
  `tokenClient.requestAccessToken({prompt})` 触发登录弹窗；`prompt:'consent'`
  强制展示同意页，`prompt:''` 尝试静默续期。返回的 access token 通过
  `callback` 回调拿到，只建议保存在内存里，不建议持久化到 localStorage（
  token 有效期短且属于敏感凭据）。退出登录用
  `google.accounts.oauth2.revoke(token, callback)`。
- 适用范围：本项目 `src/calendar/googleAuthClient.js`。

### Google Calendar API v3（gapi.client）常用调用

- 来源：网络调研-行业惯例参考
- 日期：2026-07-20
- 内容：通过 `<script src="https://apis.google.com/js/api.js">` 引入
  `gapi`，用 `gapi.load('client', cb)` 加载 client 模块，再
  `gapi.client.init({})` + `gapi.client.load(discoveryDocUrl)` 加载
  Calendar v3 的 discovery doc 后即可调用
  `gapi.client.calendar.events.list({calendarId, timeMin, timeMax,
  singleEvents, orderBy})` 读取事件、`events.insert({calendarId, resource})`
  写入事件。发起请求前需要 `gapi.client.setToken({access_token})` 把
  GIS 拿到的 token 交给 gapi 使用。写入事件时可以在
  `extendedProperties.private` 里塞入自定义标记字段，用于后续判断"这个
  事件是不是本工具创建的"，避免重复同步。
- 适用范围：本项目 `src/calendar/googleCalendarService.js`。

### 原生 HTML5 Drag and Drop API

- 来源：网络调研-通用知识
- 日期：2026-07-20
- 内容：给元素设置 `draggable = true`，监听 `dragstart` 用
  `event.dataTransfer.setData(type, data)` 存数据；容器上监听 `dragover`
  必须 `preventDefault()` 才能允许 drop；`drop` 事件里
  `event.dataTransfer.getData(type)` 取回数据。这套 API 不提供"拉伸大小"
  的原生支持，拉伸类交互通常改用 `mousedown/mousemove/mouseup` 手动实现，
  拖动过程中直接改 DOM 的 style 做即时视觉反馈、松手时再提交到应用状态，
  避免频繁触发状态驱动的整树重渲染。
- 适用范围：本项目 `src/ui/dragDrop.js`，用于周视图跨天拖拽卡片和日
  时间轴拖拽移动/拉伸时间块。

### Notion / Google Calendar 风格深色 UI 参考

- 来源：网络调研-行业惯例参考
- 日期：2026-07-20
- 内容：Notion 风格的特征是大量留白、卡片用细边框/轻阴影而非强投影、
  信息密度低、强调分类色块（badge）而不是大面积色彩；Google Calendar
  风格的特征是左侧栏 + 主区时间轴布局、小时网格线、事件块用左侧色条
  区分类别。深色模式下背景通常分 2-3 级灰度层次（页面背景 < 卡片背景 <
  悬浮/输入控件背景），文字也分主/次/弱三级灰度，避免纯黑纯白。
- 适用范围：本项目整体视觉设计（`css/*`），为通用行业惯例参考，非本
  项目专属决策的唯一依据——具体色值、布局细节由本次实现自主选定。

### 无构建工具的原生 ES Modules 项目在浏览器中的运行限制

- 来源：现有代码梳理
- 日期：2026-07-20
- 内容：浏览器出于安全策略，对 `file://` 源下用 `<script type="module">`
  加载的 ES Modules 会触发 CORS 报错，`import` 无法工作；必须通过
  `http://` 或 `https://` 源加载才能正常使用原生 ES Modules。这也是
  Google OAuth（GIS）的硬性要求——授权来源必须是 http(s) 源。因此本项目
  即使不用任何构建工具，仍需要一个最简单的本地静态文件服务器（见
  `server.js`，仅用 Node 内置模块，不需要 `npm install`）。
- 适用范围：本项目专属技术决策依据（已与用户确认：ES Modules + 本地
  静态服务器，而非零构建 script 标签方案，也不引入 Vite 等打包工具）。
  **REQ-003 更新**：用户后续反馈手写 DOM 全量重渲染不够流畅，明确同意
  引入前端框架，已改为 Vue 3 + Vite，此条"不引入 Vite"的结论已被
  REQ-003 的决策取代，保留在这里只作为 REQ-001/REQ-002 时期决策背景。

### Vue 3 Composition API 响应式模型

- 来源：网络调研-行业惯例参考
- 日期：2026-07-21
- 内容：`reactive(obj)` 返回一个 Proxy，读取属性时会在当前"响应式作用域"
  （组件渲染函数、`computed`、`watchEffect` 等）里建立依赖追踪，写入属性
  时只通知真正依赖了该属性的地方更新，不需要手动订阅/取消订阅。
  `Object.assign(reactiveObj, patch)` 对已存在的顶层属性重新赋值（包括
  整体替换成新的数组/对象）是被完整追踪的，替换后的新对象/数组访问时会
  自动变成新的响应式代理。多个同步发生的属性写入，Vue 内部会在同一个
  微任务（`nextTick`）里合并成一次组件更新，不会每次写入都触发一次
  渲染。`<script setup>` 里的顶层绑定（`const`/`import`/`defineProps`
  声明的 props）会自动暴露给同文件的 `<template>`，不需要 `return` 或
  `this.` 前缀。
- 适用范围：本项目 `src/state/store.js`（REQ-003 用 `reactive()` 包一层
  薄壳替代原来手写的订阅/全量重渲染模型）及全部 `src/components/*.vue`、
  `src/App.vue`。

### Naive UI 的主题定制（ConfigProvider）

- 来源：网络调研-行业惯例参考
- 日期：2026-07-21
- 内容：Naive UI 的深浅色主题通过给根组件 `<n-config-provider :theme>`
  传入内置的 `darkTheme` 对象（浅色则传 `null`，即库默认浅色主题）来
  切换；`theme-overrides` 接受一份按"分组名 → token 名 → 颜色值"结构的
  对象（如 `{common:{primaryColor:'#38bdf8'}}`）覆盖设计 token，两种
  主题各自都会应用这份 override，不需要为明暗各写一份完整覆盖表。
  组件库用 `app.use(naive)` 全局批量注册（`import naive from
  'naive-ui'`）时，所有 `<n-xxx>` 标签在任意 `.vue` 文件的 `<template>`
  里都可以直接使用，不需要逐个 `import`；但非组件的 JS 导出（如
  `darkTheme` 本身、`useMessage()` 这类组合式函数）仍需要各自
  `import { xxx } from 'naive-ui'`。
- 适用范围：本项目 `src/App.vue`（主题切换）与所有用到
  `useMessage()`/表单控件的 `src/components/*.vue`。

### Naive UI 的多语言 locale 对象 + vue-i18n 的搭配

- 来源：网络调研-行业惯例参考（`jaJP`/`dateJaJP` 具名导出已用 WebFetch
  直接核对 naive-ui GitHub 源码 `src/locales/index.ts` + `src/index.ts`
  确认存在，不是纯推测）
- 日期：2026-07-21
- 内容：Naive UI 组件内部自带的文案（日期/时间选择器的按钮、空状态提示
  等）和应用自己的业务文案是两套独立的多语言机制，分别要处理：
  1. 应用自己的文案用 `vue-i18n` 的 `createI18n({legacy:false, ...})`，
     组件里 `useI18n()` 拿 `t()`/`tm()`/`d()`。
  2. Naive UI 自己的文案通过给根组件 `<n-config-provider :locale
     :date-locale>` 传入它自带的 locale 对象（从 `naive-ui` 包本身按名
     导入，如 `zhCN`/`enUS`/`jaJP` 和对应的 `dateZhCN`/`dateEnUS`/
     `dateJaJP`）来切换，`locale` 管非日期类组件的文案，`date-locale`
     管日期/时间选择器。naive-ui 目前（2.x）覆盖的 locale 相当多（含
     `jaJP`），但不是每种语言都有，接入新语言前建议先确认对应 locale
     对象是否存在，避免 import 一个不存在的具名导出直接导致整个应用
     无法启动（这个失败模式比普通文案缺失严重得多）。
  3. `vue-i18n` 的 `datetimeFormats` 需要显式配置每个 locale 的具名
     格式（如 `long`），否则 `d(value, 'long')` 拿不到预期格式。
- 适用范围：本项目 `src/App.vue`（`n-config-provider` 的 locale 切换）、
  `src/i18n/index.js`（vue-i18n 配置）、`src/components/
  GoogleSyncPanel.vue`（`d()` 格式化同步时间）。

### 引入第三方包的具名导出前先核实存在，别凭记忆猜

- 来源：现有代码梳理（本项目 REQ-005/REQ-007 两次踩过同一类坑的教训）
- 日期：2026-07-21
- 内容：像 `import { jaJP } from 'naive-ui'` 或
  `import { SettingsRound } from '@vicons/material'` 这种从 npm 包按
  名字导入的写法，如果这个名字实际不存在，现代打包工具（Vite/Rollup）
  在 ESM 严格语义下通常会直接报错甚至让整个应用起不来，而不是"这一个
  图标缺失、其他正常"那种优雅降级。这种失败模式的影响面是"全灭"，比
  普通的文案/样式错误严重得多。当没有可执行环境验证（比如无法
  `npm install` 之后实际跑一遍）时，写这类 import 之前应该先用
  WebFetch/WebSearch 类工具核实：查包的官方文档、GitHub 源码里的
  index 文件、或者直接请求 `unpkg.com/<pkg>@<version>/<path>` 确认
  目标文件/导出确实存在，而不是凭训练记忆里的印象"应该是这个名字"。
  单纯凭记忆判断的失败率不低（比如很多图标包同一个图形在不同风格
  变体下命名规则并不完全统一）。
- 适用范围：本项目所有引入新的第三方 npm 依赖并使用具名导出的场景，
  尤其是在 AGENTS.md P2-2 约束下不能自己跑 `npm install`/`npm run dev`
  验证的情况下（当前项目的常态）。

### CSS `min()`/`max()` 函数可以和 `calc()` 混用、嵌套

- 来源：网络调研-通用知识
- 日期：2026-07-21
- 内容：CSS 的 `min()`/`max()` 是取值函数，参数可以是不同单位（如
  `min(max(calc(30% - 5px), 20px), calc(80% - 5px))`），浏览器在实际
  渲染时用元素当前的真实像素尺寸计算每个参数的值再比较，不需要 JS 提前
  知道容器的实际像素高度/宽度。这比 CSS 原生的 `min-height`/`max-height`
  属性灵活——`min-height` 和 `max-height` 同时设置且冲突时，规范规定
  `min-height` 优先生效（会覆盖更小的 `max-height`），无法用它们互相
  钳制出"两个上限里取更小的那个"这种效果；而 `min()`/`max()` 函数是在
  算 `height` 这一个属性的值时就完成比较，天然没有这个优先级冲突问题。
  这两个函数在现代浏览器（Chrome/Firefox/Safari 近几年版本）里都有很
  成熟的支持，Vite 面向的是 evergreen 浏览器，不需要额外的兼容性兜底。
- 适用范围：本项目 `src/components/DayTimeline.vue`/`WeekBoard.vue` 的
  `blockStyle()`（REQ-017）——原来用固定的 CSS `min-height` 保证短时长
  事件块至少能露出一行文字，但这个固定值会在块后面紧跟着另一个不重叠
  的块时把撑高的部分啃到下一个块的起点、吃掉两者间该有的视觉间隔；改成
  `min(max(自然高度, 最小可读高度), 到下一个块为止的可用空间)` 这种嵌套
  写法后，同时满足"尽量保证可读性"和"绝不侵占相邻块的间隔"两个约束，
  不需要用 JS 现算容器的实际像素高度。

### @sqlite.org/sqlite-wasm + OPFS：浏览器内跑真正的文件型 SQLite

- 来源：网络调研-行业惯例参考（WebSearch + WebFetch 核对了官方 GitHub
  仓库 `sqlite/sqlite-wasm` 的 README 和一篇 Vue 3 集成教程的具体代码）
- 日期：2026-07-22
- 内容：`@sqlite.org/sqlite-wasm` 是 SQLite 官方维护、打包成 ES Module
  的 WebAssembly 构建，可以在浏览器里跑一份完整的 SQLite 引擎。要让
  数据真正持久化（而不是标签页一关就没了），需要用 OPFS（Origin
  Private File System，浏览器给每个站点分配的私有文件系统）作为存储
  后端——但 OPFS 的**同步**文件访问 API（SQLite 的事务写入需要用到）
  只能在 Worker 线程里调用，不能在主线程直接跑。官方包提供
  `sqlite3Worker1Promiser` 这个封装，自动起一个内置 Worker、把
  `open`/`exec`/`close` 这些命令通过 `postMessage` 转发过去，主线程
  拿到的是一个基于 Promise 的函数，不需要自己写 Worker 脚本：

  ```js
  import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';
  const promiser = await new Promise((resolve) => {
    const p = sqlite3Worker1Promiser({ onready: () => resolve(p) });
  });
  const { dbId } = await promiser('open', { filename: 'file:mydb.sqlite3?vfs=opfs' });
  await promiser('exec', { dbId, sql: 'CREATE TABLE IF NOT EXISTS t (...)' });
  const { result } = await promiser('exec', {
    dbId, sql: 'SELECT * FROM t WHERE id = ?', bind: [1],
    returnValue: 'resultRows', rowMode: 'array',
  });
  ```

  用 OPFS 有一个硬性前提：页面必须处于"跨源隔离"（cross-origin
  isolated）状态，需要服务器给页面响应加上
  `Cross-Origin-Opener-Policy: same-origin` 和
  `Cross-Origin-Embedder-Policy: require-corp` 这两个响应头，否则
  `vfs=opfs` 这个连接方式会直接失败。用 Vite 集成时，还需要把这个包
  排除在 `optimizeDeps`（esbuild 预构建）之外，因为它内部动态加载自己
  的 `.wasm`/Worker 文件，预构建会打乱这些文件的相对路径引用。OPFS 的
  同步访问句柄是独占的，不支持多个标签页同时对同一个数据库文件写入。
- 适用范围：本项目 `src/state/db.js`（REQ-024，数据持久化后端从
  localStorage 换成文件型数据库）、`vite.config.js`（COOP/COEP 响应头 +
  `optimizeDeps.exclude`）。

### File System Access API：把数据镜像写到用户选的真实文件夹

- 来源：网络调研-通用知识（决定要不要做这个功能本身，来源是用户在本轮
  对话里通过 AskUserQuestion 明确选择的方向，见 docs/CHANGELOG.md
  REQ-041）
- 日期：2026-07-28
- 内容：`window.showDirectoryPicker({mode:'readwrite'})`（目前只有
  Chromium 系浏览器实现，MDN 标注为非标准/实验性，Firefox/Safari 不
  支持）让用户挑一个真实的本地文件夹，返回一个
  `FileSystemDirectoryHandle`。这个 handle 对象本身是可结构化克隆的，可以
  直接存进 IndexedDB（`indexedDB.open` + 一个普通 object store）跨浏览器
  会话保留"选的是哪个文件夹"，但**读写权限不会跨会话永久保留**——重新
  打开浏览器后 `handle.queryPermission({mode:'readwrite'})` 通常会回到
  `'prompt'`，只有 `handle.requestPermission({mode:'readwrite'})` 能重新
  申请到 `'granted'`，而这个方法必须在用户点击事件的调用栈内直接触发
  （user activation），不能在一段 `await` 之后再调用，否则会被浏览器拒绝。
  拿到目录 handle 后，`handle.getFileHandle(name, {create:true})` 拿到
  文件 handle，`fileHandle.createWritable()` 拿到一个可写流，`write()` +
  `close()` 即完成整个文件覆盖写入——这一路都是普通异步 API，不需要在
  Worker 里跑（`createSyncAccessHandle()` 才需要 Worker，但那个方法只对
  OPFS 里的文件生效，MDN 明确写了它"目前仅在 OPFS 内的文件上可用"，普通
  `showDirectoryPicker()` 选出来的真实目录句柄不支持这个同步方法）。
  这意味着**不能反过来把这类真实目录句柄当成 sqlite-wasm 的存储后端**，
  只能保留 OPFS 作为权威数据源，另外单向导出一份镜像。
- 适用范围：本项目 `src/state/fileMirror.js`。

### sqlite-wasm worker1 协议的 `export` 命令

- 来源：网络调研-官方文档（`sqlite.org/wasm` `api-worker1.md`）
- 日期：2026-07-28
- 内容：`sqlite3Worker1Promiser` 除了 `open`/`exec`/`close`，还支持
  `export` 命令——`promiser('export', {dbId})`，是
  `sqlite3_js_db_export()` 的封装，返回
  `{result: {byteArray, filename, mimetype}}`，`byteArray` 是一个
  `Uint8Array`，装着当前数据库完整的、可以直接另存为 `.sqlite3` 文件的
  原始字节。这个命令特意不提供反向的 `import`（官方文档原话）。用它可以
  在不知道底层 VFS 细节的情况下拿到"当前数据库现在长什么样"的完整快照，
  不需要自己拼 SQL 或者关心 OPFS 内部结构。
  另外需要注意：OPFS 的同步访问句柄（sqlite-wasm 的 `vfs=opfs` 连接
  会一直持有）是独占锁，只要这个连接还开着，就不能再用普通的
  `FileSystemFileHandle.getFile()` 从主线程直接读同一个 OPFS 文件的字节
  （会因为文件被锁而失败）——只有已经握着这把锁的 worker 自己通过
  `export` 命令导出，才能拿到数据。
- 适用范围：本项目 `src/state/db.js` 的 `exportDbBytes()`、
  `src/state/fileMirror.js` 的 `mirrorNow()`。

### 反向：把外部字节导入 sqlite-wasm——为什么走"覆盖 OPFS 文件"而不是"deserialize 进内存"

- 来源：网络调研-通用知识（SQLite 官方论坛帖子、npm 包页、技术博客）
- 日期：2026-07-28
- 内容：用户问"为什么不能读文件启动、改了就写回文件"，这需要一条反向
  路径——把用户选的真实文件夹里已有的字节"喂"给 sqlite-wasm。调研确认
  `sqlite3Worker1Promiser` 这套简化协议**不支持**用一段已有的
  `ArrayBuffer`/字节数组直接 `open` 出一个数据库（worker1 文档只列了
  `open`/`close`/`exec`/`export` 几个命令，没有对应的 `import`）。真正
  能做"反序列化"的是更底层的 `sqlite3.capi.sqlite3_deserialize()`，但
  那个 API 只在自己写的 worker 脚本里直接用 `sqlite3InitModule()` 拿到
  的模块对象上才能调，绕开了 `sqlite3Worker1Promiser` 这层简化封装，
  等于要重新写一遍这个项目一直在用的"worker + promiser"这套基础设施。
  对这个应用来说这是不必要的复杂度——整份数据本来就是一个小 JSON 对象，
  换一个思路："让 OPFS 文件的字节等于文件夹文件的字节"，不需要
  sqlite-wasm 理解"外部导入"这件事：先 `close` 掉当前连接释放 OPFS
  独占锁，再用普通的 `FileSystemFileHandle` API 把 OPFS 里那个文件的
  内容整个覆盖成文件夹文件的字节，之后任何人重新 `open` 这个 OPFS
  文件，SQLite 看到的就是"已经换好的新内容"——对 SQLite 来说这和"用户
  在两次启动之间手动替换了这个文件"没有任何区别，不需要专门的导入
  接口。
- 适用范围：本项目 `src/state/fileMirror.js` 的 `hydrateFromDirectory()`、
  `src/state/db.js` 的 `closeDb()`。

### File System Access API：IndexedDB 存的 handle 权限状态

- 来源：网络调研-通用知识（GitHub `WICG/file-system-access` 仓库
  issue #289、Chrome for Developers 官方博客"Persistent permissions for
  the File System Access API"）
- 日期：2026-07-28
- 内容：补充上面"File System Access API"那条知识里"权限不跨会话永久
  保留"的具体依据——从 IndexedDB 取出的 `FileSystemDirectoryHandle`
  调用 `queryPermission()` 大概率仍然返回 `'prompt'`，哪怕这个 handle
  之前已经被 `requestPermission()` 授权过。Chrome 从 122 版起给"已安装
  为 PWA"的场景提供了一个可选的"长期持久权限"机制，绕开每次都要重新
  确认，但普通网页标签页（这个项目目前的运行形态）不享受这个待遇。
  这意味着：应用启动时想"静默"从文件夹读取数据，只有在同一个浏览器
  会话内（比如刷新页面、SPA 内部导航）大概率有效，完整关闭重开浏览器
  之后大概率会拿到 `'prompt'`，需要用户先手动点一次「重新授权」
  （`requestPermission()`，必须由用户点击事件直接触发）才能继续读写。
- 适用范围：本项目 `src/state/fileMirror.js` 的
  `getSavedDirectoryStatus()`/`requestPermissionForSavedDirectory()`，
  `src/state/store.js` `initStore()` 里"启动时尝试静默 hydrate"这一步
  为什么大概率不会在浏览器冷启动时生效。

### 中文 Windows 上 .bat 脚本必须避开 UTF-8（不带 BOM）编码

- 来源：现有代码梳理
- 日期：2026-08-27
- 内容：`start-lifespark.bat` 用户双击运行报"'xxx' 不是内部或外部命令"，
  排查发现脚本文件本身保存成了 UTF-8（无 BOM）。中文 Windows 的
  `cmd.exe` 默认按系统 ANSI 代码页（简体中文是 GBK/936，一种双字节
  变长编码）逐字节扫描 `.bat` 文件找命令分隔符（空格、`&`、`|`、`^`
  等）；UTF-8 编码的中文字符是 3 字节序列，用 GBK 的双字节配对规则去
  解析这些字节，配对边界会错位，错位后的字节偶然拼出 ASCII 范围内的
  分隔符，导致脚本在中文注释或中文提示语句"内部"就被截断执行，报错
  信息里出现的"命令"往往是一句中文注释/提示语被腰斩后的后半截。这不是
  个别现象，是所有含中文且保存为 UTF-8 的 `.bat` 文件在中文 Windows 上
  的通病。曾尝试在脚本第一行加 `chcp 65001 >nul` 补救，实测无效——
  `cmd.exe` 对批处理文件的解析不是严格按"改完代码页立刻对后续行生效"
  执行的，紧跟在 `chcp 65001` 后面的中文行依然按原代码页解析出错。真正
  有效的修复是把整个 `.bat` 文件另存为 ANSI（即 GBK）编码，这样文件
  字节本身就和 `cmd.exe` 的默认代码页一致，不需要任何运行时代码页切换。
- 适用范围：任何要在中文 Windows 上用 `cmd.exe` 直接执行、又包含中文
  字符的批处理脚本都适用这条知识。**REQ-085 更新**：本项目
  `start-lifespark.bat`（改名后是 `start-planto.bat`）在改成 GBK 编码
  修复过一次之后（REQ-055），后来又复现过一次同样的错误（很可能是
  文件被某个编辑器以 UTF-8 重新保存覆盖掉了 GBK 编码，GBK 这个选择
  本身没有一劳永逸的办法防止未来被意外改回 UTF-8）。用户因此决定换一
  个更彻底的解法：**把脚本里的中文注释/提示语全部改成英文**——纯
  ASCII 字节在任何代码页下都是同一个字节序列，不管这个文件之后被什么
  工具用什么编码重新保存、不管运行它的机器系统代码页是什么，都不会
  再触发这类错位。这个知识条目本身描述的技术原理（GBK 双字节配对
  错位）仍然是普适事实，但"必须用 GBK"这个具体应对方式已经不是本项目
  现在的做法，只在真的需要在批处理脚本里保留中文文案时才需要考虑。

### Google Cloud Console 的固定深链接路由

- 来源：网络调研-通用知识
- 日期：2026-08-27
- 内容：Google Cloud Console 的部分页面有不依赖具体项目 ID 的固定路由，
  打开后由控制台按当前登录账号最近使用/选中的项目自动渲染内容，可以
  直接做成应用内的引导链接：控制台首页/项目选择
  `https://console.cloud.google.com/`；某个具体 API 的启用页固定形如
  `https://console.cloud.google.com/apis/library/<api 的 service
  name>`（Calendar API 是 `calendar-json.googleapis.com`）；OAuth
  凭据管理页固定是 `https://console.cloud.google.com/apis/credentials`。
  用户没登录或没选中项目时，控制台会自己引导先登录/选项目，不会因为
  链接里没带 `project=` 参数而报错或打开空白页。
- 适用范围：通用知识，本项目用在 `GoogleSyncPanel.vue` 的 Step 1
  引导链接（`GOOGLE_CONSOLE_URL`/`GOOGLE_CALENDAR_API_URL`/
  `GOOGLE_CREDENTIALS_URL`），任何需要引导用户去 Google Cloud Console
  完成配置的场景都可以复用这个知识。

### 浏览器内置的 HTTP 不安全端口（unsafe port）黑名单

- 来源：网络调研-通用知识
- 日期：2026-08-29
- 内容：Chrome/Chromium 系和 Firefox 都内置了一份"不安全端口"黑名单，
  对黑名单里的端口直接拒绝发起 HTTP/HTTPS 连接，报 `ERR_UNSAFE_PORT`
  （Firefox 报法类似），这是浏览器层面的硬限制，服务器端怎么配置监听
  地址/响应头都绕不过去，唯一的解法是换一个不在黑名单里的端口。黑名单
  收录的大多是历史上有专门用途、容易被跨协议攻击滥用的端口，比如
  `6000`（X11 window server 保留端口）、`6667`（IRC）、`25`（SMTP）等，
  完整列表可以在 Chromium 源码的 `net/base/port_util.cc` 里查到，也有
  第三方整理版本，常见收录的端口包含（不完整举例）：
  1/7/9/11/13/15/17/19/20/21/22/23/25/37/42/43/53/69/77/79/87/95/101-104/
  109-111/113/115/117/119/123/135/137/139/143/161/179/389/427/465/
  512-515/526/530-532/540/548/554/556/563/587/601/636/989/990/993/995/
  1719/1720/1723/2049/3659/4045/5060/5061/**6000**/6566/6665-6669/6697/
  10080。3000/5000/8000/8080/8090/9000 这类常见开发端口不在黑名单里。
  Chrome 提供 `--explicitly-allowed-ports=<port1>,<port2>` 命令行参数
  可以显式解禁个别端口，但这要求每个访问者都用带这个参数的方式启动
  浏览器，对一个要给别人用的本地开发工具来说不现实，实际项目里应该
  直接避开这些端口，而不是指望用户改浏览器启动参数。
- 适用范围：通用知识，任何需要给本地开发服务器/自建服务固定端口号的
  场景都适用。本项目 REQ-063 一开始把 Vite 开发端口固定选成了 6000，
  上线后用户浏览器直接报 `ERR_UNSAFE_PORT`——这正是撞上了这份黑名单，
  详见 `docs/CHANGELOG.md` REQ-065 条目，最终改选了 `6060`。

### Cross-Origin-Opener-Policy: same-origin 会切断本页面和它打开的弹窗之间的通信

- 来源：网络调研-通用知识（多个独立来源交叉核对：MDN、
  [Chromium issue tracker](https://issues.chromium.org/issues/40186710)、
  [Chrome for Developers 博客](https://developer.chrome.com/blog/coop-restrict-properties)、
  [bluesky-social/atproto 的真实 issue](https://github.com/bluesky-social/atproto/issues/3638)、
  [andrewlock.net 的 COOP 系列文章](https://andrewlock.net/understanding-security-headers-part-1-cross-origin-opener-policy-preventing-attacks-from-popups/)）
- 日期：2026-08-30
- 内容：`Cross-Origin-Opener-Policy: same-origin`（跨源隔离状态的硬性
  前提之一，`SharedArrayBuffer`/OPFS 同步文件访问都依赖它）会把这个
  页面自己打开的弹窗的 `window.opener` 置空，导致弹窗没法通过
  `window.opener.postMessage(...)` 把结果传回主页面——这类"弹窗完成后
  要把结果传回开着它的那个页面"的交互（最典型的是 OAuth 登录弹窗、
  第三方支付弹窗）会**静默失败**：弹窗那边流程走完了、用户也确实完成了
  操作，但主页面永远收不到通知，且不会有任何报错，只是"看起来什么都
  没发生"。
  三种 COOP 取值的权衡：`same-origin`（跨源隔离，弹窗通信失败）；
  `same-origin-allow-popups`（保住弹窗通信，但**不满足**跨源隔离条件，
  `crossOriginIsolated` 会是 `false`，`SharedArrayBuffer`/OPFS 同步
  访问用不了）；`restrict-properties`（设计目标是两者兼得，但 Chrome
  已经在 2025-04 把这个提案暂停，目前没有任何浏览器真正支持，写文档时
  查到"仍在用"的说法已经过期）。这三者互斥，同一个页面不可能"既要
  OPFS 又要弹窗式第三方登录"，只能二选一或者换一种不依赖弹窗通信的
  交互方式（比如把第三方登录从"弹窗 + postMessage"换成"整页跳转 +
  URL 参数/片段传回结果"，跳转流程完全不依赖 `window.opener`，天然
  不受 COOP 影响）。
- 适用范围：项目专属决策依据（已与用户确认）。本项目 `vite.config.js`
  为了 OPFS 本地数据库设置了 `Cross-Origin-Opener-Policy: same-origin`
  （REQ-024），这导致 REQ-072 之前用 Google Identity Services 弹窗式
  登录时"用户完成 Google 授权后应用不显示已登录状态"（静默失败，见
  `docs/CHANGELOG.md` REQ-072 条目）。最终选择保留 OPFS 需要的严格
  COOP，把 Google 登录从弹窗流程改写成整页跳转的手写 OAuth2 隐式授权
  流程（`src/calendar/googleAuthClient.js`），从根上不依赖
  `window.opener`，绕开了这个冲突。更通用地：任何同时"需要跨源隔离
  （OPFS/SharedArrayBuffer/WASM 线程）"又"需要弹窗式第三方登录/支付"
  的纯前端项目都会撞上同一个限制，解法思路是一致的——换成整页跳转，
  不要用弹窗。
