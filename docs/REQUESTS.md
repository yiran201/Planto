# REQUESTS.md

任务按顺序排列。状态：pending / in_progress / completed。

---

## [REQ-000] 项目初始化

状态：completed
模块：docs/ 全部治理文件、README.md

描述：
按用户提供的 AGENTS.md 工作流规则，初始化 e:\ai_workplace\LifeSpark 项目的
docs/ 治理体系（AGENTS.md / MODULES.md / KNOWLEDGE.md / CHANGELOG.md /
REQUESTS.md）。项目名称与运行方式已与用户确认：项目文件夹 `LifeSpark`；
运行方式为原生 ES Modules + 零依赖本地静态服务器（`node server.js`），
不引入构建工具。

验收：
- docs/ 下五个文件齐全
- AGENTS.md 内容与用户提供的规则原文一致
- REQUESTS.md 中本条目状态为 completed，且已建立 REQ-001

---

## [REQ-001] 年度生活规划与智能行程调度工具 v1（完整初版实现）

状态：completed
模块：README.md, server.js, index.html, css/*, src/*（utils, state, domain,
calendar, ui, main.js）

描述：
基于"体验驱动 + 新鲜感优先"理念的年度生活规划与智能行程调度工具，纯
JavaScript（无前端框架）实现，浏览器运行，数据存 localStorage。核心要求：

1. 一年划分为 4 个阶段：探索、筛选、进阶、记忆，阶段起止日期/时长可配置。
2. 每周自动生成周计划，包含新体验、兴趣活动、变化活动，按当前所处阶段
   调整生成策略（探索期偏新内容，筛选期偏用户已认可内容，进阶期深化
   已选兴趣，记忆期偏重温 + 减少新内容注入）。
3. 每天细化到小时级时间块，类别至少覆盖：工作/学习、运动、体验、放松、
   自由时间。
4. 调度逻辑需具备：
   - 防重复（活动在设置的冷却周期内不重复安排）
   - 防厌倦（新鲜感评分，久未安排/未尝试类别加权）
   - 动态调整（用户对已完成活动标记 loved/neutral/skipped/hated 后，
     影响后续生成权重）
   - 约束随机（在类别配额、时长预算、避免与 Google 忙碌时段冲突等约束
     下做加权随机选择，而非纯随机或纯确定性）
5. UI 为 Notion + Google Calendar 风格：深色模式、卡片布局、周视图/日
   时间轴视图、时间块可拖拽调整。
6. 集成 Google Calendar：支持登录 Google 账号（Google Identity
   Services）、读取已有日程用于避免生成冲突、可选择将生成的计划同步
   回 Google 日历。因需要用户自备 Google Cloud OAuth Client ID，此为
   用户需完成的外部前置配置，已在 README 中说明操作步骤。
7. 结构清晰、可在浏览器运行（通过零依赖本地静态服务器 `node server.js`，
   不需要 npm install / 构建步骤）、使用 localStorage 持久化数据。

验收：
- 打开页面能看到侧边栏四阶段进度 + 本周计划视图（深色、卡片风格）
- "生成本周计划"可用，基于当前阶段生成含新体验/兴趣/变化活动的一周
  计划并持久化到 localStorage
- 可进入小时级日时间轴，含工作/学习、运动、体验、放松、自由时间等
  类别块，可拖拽调整位置
- 活动库可增删活动、标记评价，评价影响后续生成权重（代码逻辑可验证：
  权重调整后重新生成明显偏向/避开对应活动）
- 冷却期内活动不会被重复安排（代码/数据可验证 cooldown 逻辑）
- 设置面板可配置年度起始日、阶段周数、工作时间、每阶段类别配额、
  冷却周期
- 提供 Google 登录入口，登录后可读取指定日期范围内的 Google 日历事件，
  排程时避开这些时间段
- 提供"同步到 Google 日历"按钮，可将生成的时间块写入用户 Google 日历
  （需用户自备 OAuth Client ID）
- 刷新页面后数据（活动库/周计划/时间轴/设置）从 localStorage 完整恢复
- 通过 `node server.js` 零 npm install 即可本地运行（AGENTS.md P2-2
  要求不由 AI 代为执行启动命令，仅提供步骤说明，由用户自行运行验证）

---

## [REQ-002] 明暗主题切换 + 点击建事件 + 周期事件 + 月度视图

状态：completed
模块：src/state/persistence.js, src/utils/dateUtils.js,
src/domain/recurringEvents.js（新增）, src/ui/eventModal.js（新增）,
src/ui/monthBoard.js（新增）, src/ui/renderApp.js, src/ui/sidebar.js,
src/ui/dayTimeline.js, css/variables.css, css/components.css

描述：
在 REQ-001 已完成的基础上做增量扩展（用户反馈）：
1. 新增浅色主题，可与深色主题切换；深色主题背景改为纯黑。
2. 支持在日时间轴上点击（空白处新建 / 已有块编辑）手动设置事件。
3. 支持周期事件：每天 / 每周固定星期几（可多选）/ 每月固定日期重复，
   结束条件为 永不 / 到某天为止 / 重复 N 次。
4. 新增月度视图：月历卡片 + 事件圆点，点击某天跳转日视图。
详细设计见 2026-07-20 会话中确认的 plan（明暗主题系统、
`domain/recurringEvents.js` 的重复规则数据模型与安全上限、
`ui/eventModal.js` 的创建/编辑表单、`ui/monthBoard.js` 的月历网格）。

验收：
- 侧边栏有主题切换按钮，切换后全局配色变化并持久化；深色主题背景为
  纯黑（#000000 系）
- 日时间轴点击空白网格能弹出"新建事件"表单，填写标题/类型/时间后
  保存，时间块出现在对应位置
- 点击已有（非 Google 来源）时间块能弹出"编辑事件"表单并修改成功
- 新建事件时勾选"周期事件"，可选每天/每周（多选星期）/每月（固定
  日期），结束条件可选永不/到某天/重复N次；保存后未来对应日期的
  时间轴上都出现该事件，且不会被"生成本周计划"的自动排程覆盖或占用
  同一时段
- 周期事件的单个块可像普通块一样被删除（仅删除当次）；编辑弹窗里
  另有"删除整个系列"选项，点击后该系列所有未来实例一起消失
- 侧边栏新增"月度视图"导航，进入后显示当前月的日历网格，每天格子里
  能看到当天已排事件的类型圆点，点击某天跳转到该天的日时间轴
- 刷新页面后主题、手动/周期事件数据从 localStorage 完整恢复

---

## [REQ-003] UI 层迁移到 Vue 3 + Vite + Naive UI

状态：completed
模块：整个 src/ui/*（删除，迁移到 src/components/*.vue）,
src/state/store.js（重写为 Vue 响应式）, src/main.js（重写）,
新增 src/App.vue, src/components/*.vue, src/constants/colors.js,
新增 package.json / vite.config.js, 改写 index.html, 删除 server.js,
css/components.css（删减被 Naive UI 取代的部分）；
src/domain/*、src/calendar/*、src/utils/dateUtils.js|id.js|random.js、
src/state/persistence.js、css/timeline.css|layout.css 不改动。

描述：
用户反馈原生 JS 手写 DOM 全量重渲染架构导致 UI 不流畅，且用户明确表示
可以引入前端框架。已确认技术选型：Vue 3（Composition API）+ Vite 作为
构建工具，Naive UI 作为组件库。详细架构见 2026-07-21 会话确认的 plan：
- `state/store.js` 用 Vue `reactive()` 包一层薄壳，对外接口
  `{getState, setState}` 不变，domain/calendar 层调用方式零改动。
- `ui/*.js` 十个文件对应改写为 `components/*.vue`，日历网格类的自定义
  UI（周视图/日时间轴/月视图）保留手写 CSS，通用控件（按钮/表单/弹窗/
  徽章/Toast）改用 Naive UI 组件。
- 原来因"整树重渲染会致输入框失焦"而采用的"模块级草稿 + 手动 onInput"
  写法，改为 Vue 组件内 `reactive` 草稿 + `v-model`。
- `server.js` 删除，改用 Vite 的 `npm run dev`/`build`/`preview`。

验收：
- `npm install && npm run dev` 后浏览器能看到与之前视觉上一致（周计划/
  日时间轴/月视图/活动库/设置/Google同步五个视图 + 侧边栏四阶段进度 +
  主题切换）的界面，明暗主题切换正常
- 生成周计划、拖拽移动/拉伸时间块、点击建/编辑事件（含周期事件）、
  活动评价打分、设置表单保存、Google 登录/同步入口等 REQ-001/REQ-002
  已实现的功能在新 UI 下行为一致
- 交互反馈（悬浮/点击按钮、切换视图、拖拽）观感上比旧版更顺滑，不再有
  明显的全屏闪烁重绘
- 表单输入（活动库表单/设置面板/事件弹层）连续打字不丢焦点
- 刷新页面数据从 localStorage 完整恢复（复用未改动的 persistence.js）
- 因为本次改动引入构建工具，AI 不会代为执行 `npm install`/`npm run
  dev`/`build`（AGENTS.md P2-2），需要用户本地运行并反馈控制台报错

---

## [REQ-004] 清空本周安排 + 自由时间不再生成显式事件

状态：completed
模块：src/domain/dayPlanner.js, src/components/WeekBoard.vue

描述：
用户反馈：(1) 需要能清空已排的安排；(2) 自由时间不应该被当成一个"事件"
设置出来——网格上空着的时段本身就是自由时间，不需要为它专门生成一个
标题为"自由时间"的块。

- `dayPlanner.js` 的 `planWeekDays` 不再对排完活动后剩余的空闲区间自动
  生成 `type:'free'` 的块；`free` 仍然是合法的 blockType（用户可在
  `EventModal.vue` 里手动选择创建 free 类型事件），只是自动排程不再
  主动用它填满空档。
- `WeekBoard.vue` 头部新增"清空本周安排"按钮（`<n-popconfirm>` 二次
  确认后执行），清空当前周 7 天的全部时间块（含手动/周期事件产生的块）
  并移除该周的 `weeklyPlans` 记录，让用户可以重新开始排这一周。

验收：
- 点击"生成本周计划"后，日时间轴/周视图里不再出现"自由时间"标签的块，
  未安排的时段就是网格上的空白
- 点击"清空本周安排"，二次确认后当前周所有时间块清空，`weeklyPlans`
  里该周记录被移除，可以重新点"生成本周计划"
- 手动通过事件弹层选择"自由时间"类型仍然可以正常创建一个 free 类型的
  手动事件（未被移除的能力，只是自动排程不再主动生成）

---

## [REQ-005] UI 打磨（确认 Naive UI 真正生效）+ 日视图占满宽度 + 三语言支持

状态：completed
模块：css/*, src/App.vue, src/main.js, src/components/*.vue,
src/domain/yearPhases.js|activityPool.js|dayPlanner.js|scheduler.js,
src/utils/dateUtils.js, 新增 src/i18n/*

描述：
用户反馈三点：(1) 整体 UI 用起来"生硬"，怀疑 Naive UI 有没有真的生效；
(2) 日历（日视图）布局没有占满页面；(3) 需要支持中/英/日三语言。

审查发现的具体问题与修复：
1. `css/base.css`/`css/components.css` 里用裸元素选择器写的
   `input, select {...}` 和 `label {...}`，会连带影响 Naive UI 组件
   内部自己渲染出来的 `<input>`/`<label>`（比如 checkbox/radio 的
   label），这是"生硬"感的一部分来源。删掉 `input, select` 规则
   （项目里已经不再有裸 `<input>`/`<select>`，全部走 Naive UI 组件），
   `label` 改成 `.field-label` 这个具名 class，不再用标签选择器。
2. 侧边栏导航之前是手写 `<button class="nav-item">` 循环，并不是真正
   的 Naive UI 组件——改成 `<n-menu>`；新增语言选择器 `<n-select>`。
3. `css/timeline.css` 里 `.day-view { max-width: 900px; }` 是"日历没
   占满"的直接原因，改成 `width: 100%`。
4. `App.vue` 的视图切换（`<component :is>`）之前是硬切，加了
   `<transition name="view-fade" mode="out-in">` 做淡入淡出；
   `.block-card`/`.activity-card`/`.month-cell`/`.week-column` 补了
   hover 过渡动效。
5. `#app` 补了 `height:100%`（原来没有显式设置，虽然 `.app-shell` 用
   `100vh` 不直接依赖父级高度，但这是一个应有的兜底）。

三语言支持（vue-i18n + Naive UI 自带的 locale/date-locale）：
- 新增 `src/i18n/`（`index.js` 启动配置 + `locales/{zh,en,ja}.js` 三份
  完整文案），`main.js` 里 `app.use(i18n)`。
- `state.settings` 新增 `locale: 'zh'|'en'|'ja'`（默认 `'zh'`），侧边栏
  语言选择器切换后持久化；`App.vue` 用 `watchEffect` 把
  `i18n.global.locale.value` 和 Naive UI 自己的
  `<n-config-provider :locale :date-locale>`（`zhCN`/`enUS`/`jaJP` 及
  对应 `date*` 对象，已用 WebFetch 核对过 naive-ui 源码确认三者都存在
  于包的导出里）都跟着切——应用自己的文案和 Naive UI 组件内部自带的
  文案（日期选择器"清除"这类按钮）是两套机制，只切一套不算真正的
  整体多语言。
- `domain/yearPhases.js`/`activityPool.js`/`dayPlanner.js` 里原来的
  `PHASE_LABELS`/`CATEGORY_LABELS`/`BLOCK_TYPE_LABELS`、
  `utils/dateUtils.js` 里的 `WEEKDAY_LABELS` 这几个中文文案映射表整体
  删除，domain/utils 层只保留稳定的英文标识符
  （`'explore'`/`'novel'`/`'work'`/...），显示文案统一在 i18n 的
  `domain.phase.*`/`domain.category.*`/`domain.blockType.*`/
  `domain.weekdayShort`/`domain.weekdayFull` 下维护，组件里用
  `t('domain.phase.'+phase)` 这样取。这是一次内部一致的重构（同一次
  改动里把所有调用方一起改掉了），不是破坏对外接口。
- `domain/scheduler.js` 的 `generateWeeklyPlan` 返回的 `warnings` 从
  拼好的中文字符串改成 `{key, params}` 结构化对象，UI 层
  （`WeekBoard.vue`）负责按当前语言翻译再展示——domain 层不应该直接
  拼接某一种语言的文案。

验收：
- 侧边栏导航是 Naive UI 的 `<n-menu>`（有正确的选中态/hover 过渡），
  不再是手写按钮列表
- 日视图（点进某一天）在宽屏下横向占满主内容区，不再被裁成一小条
- 切换周/日/月/体验库/设置/Google同步视图时有淡入淡出过渡，不是硬切
- 侧边栏可以切换 中文/English/日本語，切换后界面文案（导航、按钮、
  表单标签、Toast 提示、阶段/类别/时间块类型名称、星期、周期事件的
  频率与结束条件文案等）以及 Naive UI 自带控件（日期/时间选择器）的
  文案都跟着变
- 语言选择持久化到 `settings.locale`，刷新页面保持选择
- 生成周计划时如果触发冷却期不足/活动库不足的提示，也按当前语言显示
- 因为本次仍然是纯前端改动且引入了新依赖 `vue-i18n`，AI 未执行 `npm
  install`/`npm run dev`（AGENTS.md P2-2），`jaJP`/`dateJaJP` 这两个
  从 `naive-ui` 导入的具名导出已用 WebFetch 核对源码确认存在，但最终
  仍需用户本地跑起来确认没有版本差异问题

---

## [REQ-006] 阶段周数文案澄清 + 周视图时间轴化 + 当前时间线 + 语言切换
移到右上角缩写 + 周期计划快捷入口 + 事件跳过

状态：completed
模块：src/components/WeekBoard.vue（重写）, src/components/DayTimeline.vue,
src/components/EventModal.vue, src/components/SidebarNav.vue,
新增 src/components/LanguageSwitcher.vue, 新增 src/composables/useNow.js,
删除 src/components/BlockCard.vue, css/timeline.css, css/layout.css,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户反馈五点：
1. 侧边栏"第 4/13 周"这类文案含义不清楚（到底是阶段内第几周还是全年
   第几周）。
2. 日历需要"时间线表示"——经确认，用户两个都要：(a) 日/周视图加一条
   "现在"横线；(b) 周视图从卡片堆叠列表改成按小时定位的时间轴网格。
3. 语言切换从侧边栏移到右上角，用缩写（中/EN/日）。
4. 周期计划希望有更快捷的入口，不用先点某一天再开事件弹层。
5. 事件需要能"跳过"，且不只是已经关联活动库条目的块才能跳过。

处理：
- `sidebar.phaseCurrent`/`week.phaseTag` 两条 i18n 文案改写为"当前阶段：
  {phase}阶段（第 {week} 周 / 阶段共 {total} 周）"这类明确写出"阶段内"
  的表述，三语言同步改。
- 新增 `src/composables/useNow.js`：模块级单例、按挂载组件数管理定时器
  的"当前时间"组合式函数，`DayTimeline.vue`（仅查看今天时显示）和
  `WeekBoard.vue`（仅今天那一列显示）共用，画一条 `.now-line` 红色横线。
- `WeekBoard.vue` 整个重写：不再用 `BlockCard.vue` 渲染卡片堆叠列表，
  改成和 `DayTimeline.vue` 同一套 `.timeline-block` 系列样式、按小时
  绝对定位的 7 列时间轴网格（`week-timeline*` 一套新 CSS class）；跨天
  拖拽的同时也会按放下位置的纵坐标换算新的开始时间（原来只换天，现在
  同一天内拖拽也能改时间，因为块本身有了时间位置就该支持这个）；新增
  点击网格空白处直接建事件（复用 `DayTimeline.vue` 同款
  `@click.self` + 换算小时的写法）。`BlockCard.vue` 因此变成死代码，
  整个删除，相关 `.block-card*`/`.week-column`/`.week-board__grid` 等
  CSS 规则一并清理。
- `WeekBoard.vue` 头部新增"+ 新建周期计划"按钮：直接打开
  `EventModal.vue` 的创建表单并带上 `recurrenceEnabled:true`；
  `EventModal.vue` 的 `buildDraft()` 增加读取 `modal.recurrenceEnabled`
  作为草稿初始值（增量：只是多了一个可选来源，不改变默认行为）。
- 语言切换：新增 `src/components/LanguageSwitcher.vue`（中/EN/日 缩写
  按钮组），`App.vue` 里挂到 `<n-message-provider>` 内、固定在视口右上角
  （`position:fixed`），`SidebarNav.vue` 移除原来的 `<n-select>` 语言
  选择器。
- 事件跳过：`DayTimeline.vue` 新增 `toggleSkip()`，给时间块加/去掉
  `status:'skipped'` 字段（不删除块），配 `.timeline-block--skipped`
  视觉样式（变淡 + 标题划线）；对**所有**块生效（不要求有关联的活动库
  条目），和"活动评价"里已有的 skipped 评分是两回事——评价影响的是
  活动本身未来被排程的权重，这个"跳过"标记的是"这一次具体没做"，
  图标特意用 🚫 而不是复用评价行的 ⏭️，避免两个相邻但含义不同的按钮
  长得一样。`WeekBoard.vue` 的时间块也带上同一个 `.timeline-block--skipped`
  class，跳过状态在周视图里同样能看到（变淡显示，没有单独的切换按钮，
  切换仍然在日视图做）。

验收：
- 侧边栏阶段进度文案能看出"这是阶段内的第几周"，不再是孤立的
  "第4/13周"
- 日视图查看今天时，网格上有一条红色"现在"横线，位置随时间推进；
  查看其他日期时不显示
- 周视图从"每天一列卡片堆叠"变成"7 天并排的按小时时间轴网格"，能看出
  每个安排具体在哪个时间段；今天那一列同样有"现在"横线
- 周视图里可以把某个块拖到同一天的不同时间，也可以拖到别的天（保留
  原有跨天拖拽能力）；点击某一天的空白处能直接弹出新建事件表单
- 右上角固定显示"中/EN/日"缩写切换按钮，侧边栏不再有语言选择器
- 点击"新建周期计划"能直接打开事件表单且"设为周期事件"已经勾选
- 日时间轴上任意事件块（不管是不是关联了活动库条目）都能点击标记/
  取消"跳过"，跳过后该块变淡且标题带删除线，周视图里同一个块也会显示
  变淡状态
- 刷新页面后跳过状态、语言选择均从 localStorage 恢复

---

## [REQ-007] UI 视觉整体向 Google 风格靠拢

状态：completed
模块：package.json, index.html, css/variables.css, css/components.css,
css/timeline.css, src/App.vue, src/components/SidebarNav.vue,
src/components/WeekBoard.vue, src/components/DayTimeline.vue,
src/components/ActivityLibraryPanel.vue, src/components/ActivityCard.vue,
src/i18n/locales/{zh,en,ja}.js

描述：
用户反馈整体 UI"太古老了"，要求学习 Google 的风格。已确认方案：不换
组件库（继续用 Naive UI），在现有基础上换皮肤——排查认为"显老"主要
来自三点：大量用 emoji 当功能性图标（导航/按钮，不同系统渲染不一致）、
配色没有用 Google 标志性蓝、卡片靠边框分隔而不是阴影分层。

- 新增依赖 `@vicons/material`（Material Design 图标的 Vue 组件包）。
  用到的每一个图标名（`ViewWeekRound`/`CalendarMonthRound`/
  `ExploreRound`/`SettingsRound`/`SyncRound`/`LightModeRound`/
  `DarkModeRound`/`AddRound`/`CloseRound`/`BlockRound`/`RepeatRound`/
  `EditRound`/`DeleteOutlineRound`）都用 WebFetch 逐个核对了
  `unpkg.com/@vicons/material@0.12.0/es/<Name>.js` 确认文件真实存在
  才写进代码——这类第三方包具名导出如果拼错，会导致整个应用直接起不来
  （和 REQ-005 时验证 `naive-ui` 的 `jaJP` 是同一类风险），不能凭记忆猜。
- 替换的图标：侧边栏导航（周/月/体验库/设置/Google同步）、主题切换
  （太阳/月亮）、各处"添加"类按钮（新建周期计划/添加活动/添加事件）、
  日时间轴的删除/跳过/周期事件标签、活动卡片的编辑/删除按钮。**保留**
  未换：活动评价的 💖😐⏭️👎（表情式的情绪表达，Google 风格里没有对应
  的东西可学，换成图标反而丢失表现力）、侧边栏品牌 🌱（LifeSpark 自己
  的标识，不是"过时"的问题）。
- `css/variables.css` 重新设色：强调色改成 Google 蓝（浅色 #1a73e8、
  深色 #8ab4f8，对应 Gmail/Calendar 和 Google 自家暗色界面实际用的
  蓝色），字体栈加入 Roboto（`index.html` 引入 Google Fonts），圆角
  略微加大（8/14/22px），新增 `--shadow-elevation-1/2` 两级 Material
  阴影分层变量。深色主题背景依然保持纯黑（`--bg-primary`，REQ-002 时
  用户明确要求过，这次没有改），但卡片/侧栏这类更高层级的深色背景改用
  Google 暗色界面实际用的偏蓝灰黑（`#202124` 一类），不是纯灰阶。
- `App.vue` 的 Naive UI `theme-overrides` 从写死一个颜色改成按明暗
  主题分别给 Google 蓝（含 hover/pressed 状态），及错误/警告/成功色也
  对齐 Google 调色板。
- 卡片类容器（`.activity-card`/`.activity-form`/`.settings-section`/
  `.month-grid`/`.day-timeline`/`.week-timeline`）去掉了硬边框，改用
  `--shadow-elevation-1`（悬浮态用 `--shadow-elevation-2`）做层次分隔，
  更接近 Material Design 的"用阴影表达浮起"而不是"用边框画格子"。侧边栏
  的 `border-right`、悬浮的语言切换胶囊按钮的边框予以保留——前者是
  Google 自己产品（Gmail/Calendar）也有的侧栏分隔线，后者是浮动元素，
  边框+阴影配合能在任意背景内容上都保持清晰。

验收：
- 侧边栏导航、主题切换用的是矢量图标而不是 emoji
- 浅色/深色主题下按钮、链接等强调色是 Google 蓝，不是之前的天蓝色
- 页面整体字体是 Roboto（有网络时）
- 卡片类容器靠阴影而不是边框分隔层次，深色主题下卡片背景比纯黑背景
  略浅一档，能看出"浮起来"的层次感
- 深色主题背景仍然是纯黑（没有回退这条更早的既有要求）
- 刷新页面主题/语言选择正常保持

---

## [REQ-008] 语言切换从右上角悬浮按钮挪到设置页

状态：completed
模块：src/App.vue, src/components/SettingsPanel.vue, css/layout.css,
docs/MODULES.md

描述：
用户反馈语言切换功能应该放到设置里面，不再需要一个常驻在视口右上角的
悬浮胶囊按钮。

- `App.vue`：移除 `<LanguageSwitcher>` 的全局挂载（原来和 `app-shell`/
  `EventModal` 平级，任何页面都能看到）及对应 import。
- `SettingsPanel.vue`：新增一个"语言"分区（复用 `settings-section` 的
  分区样式，标题走已有的 `language.label` 文案 key），在里面挂载
  `<LanguageSwitcher :state="state" />`，组件本身逻辑不变（仍然是三个
  缩写按钮 + `store.setState` 写 `settings.locale`）。
- `css/layout.css`：`.language-switcher` 从 `position:fixed` 固定右上角
  改成 `display:inline-flex` 的普通行内胶囊，跟随设置页分区正常排版；
  边框/圆角/阴影样式保留，视觉上还是同一个"分段按钮"组件，只是不再悬浮。

验收：
- 页面右上角不再有常驻的语言切换按钮
- 设置页新增语言分区，能正常切换 中/EN/日，切换后应用文案和 Naive UI
  内部文案（日期选择器等）都跟着变
- 刷新页面语言选择仍然从 localStorage 正确恢复

---

## [REQ-009] 事件字体调轻调小 + 时间轴改全天 24 小时 + 铺满页面高度

状态：completed
模块：src/constants/timelineRange.js（新增）, src/components/DayTimeline.vue,
src/components/WeekBoard.vue, css/layout.css, css/timeline.css

描述：
用户反馈三点：日/周时间轴事件块的标题"字体颜色太深了 大小也有点大"；
时间轴只显示 7-22 点，需要全天时间；日程表的高度应该铺满页面。

- **全天 24 小时**：日/周时间轴之前直接复用 `domain/dayPlanner.js` 的
  `DAY_RANGE`（7-23 点）作为显示范围，这个常量其实是"自动生成周计划时
  默认把活动排在哪个时间段"的业务规则，不应该和"时间轴能看到/能手动
  放事件的范围"混用。新增 `src/constants/timelineRange.js` 导出
  `TIMELINE_RANGE = {start:0, end:24}`，`DayTimeline.vue`/`WeekBoard.vue`
  改成引用这个新常量（小时刻度、格线、事件块定位、点击建事件、拖拽
  移动/拉伸的范围钳制全部换过来），`domain/dayPlanner.js` 的 `DAY_RANGE`
  本身不变，自动排程默认窗口没有被这次改动影响。
- **铺满页面高度**：原来时间轴高度是 JS 里"每小时 40/56px 像素常量 ×
  小时数"算出来的固定像素值，跟浏览器窗口高度无关，会出现底部留白或
  需要整页滚动。改成 CSS flex 铺满：`css/layout.css` 的 `.main-content`
  加了 `display:flex;flex-direction:column`，`.day-view`/`.week-board`
  用 `height:100%` + `flex:1` 铺满 `.main-content` 分配到的可视高度，
  `.day-timeline`/`.week-timeline` 再用 `flex:1` 吃掉视图内 `.view-header`
  之外的剩余高度；小时格线和事件块的位置/高度全部从"像素"改成"百分比"
  （相对 24 小时），不再需要任何 JS 计算的固定"每小时多少像素"常量。
  唯一还需要临时算像素的地方是拖拽/拉伸这类需要把鼠标 Y 坐标换算成
  小时数的交互——这类交互改成在交互发生的那一刻用
  `getBoundingClientRect().height` 现算比例，而不是用一个写死的值，
  这样不管窗口多高、缩放比例多少，换算都是准的。
- **事件字体**：`css/timeline.css` 的 `.timeline-block__title`（事件
  标题）从 `font-weight:600 / font-size:13px / 颜色继承页面正文
  --text-primary` 改成 `font-weight:500 / font-size:12px / 颜色
  --text-secondary`；时间+类型那一行 `.timeline-block__row` 从 11px
  改成 10px（颜色本来就是 --text-muted，没有变过深的问题，顺手再小
  一号，和标题的字号梯度更清楚）。

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了新增的 `timelineRange.js`；`DayTimeline.vue`/
`WeekBoard.vue` 里所有 `DAY_RANGE`/`PX_PER_HOUR`/`gridHeight` 的引用
已用 Grep 逐一确认清理干净，未遗留旧常量。CSS flex 铺满、百分比定位、
拖拽/拉伸换算这几处改动涉及实际渲染尺寸和鼠标交互，无法在不运行的
情况下验证效果，需要用户本地 `npm run dev` 后实际打开日/周视图、试一下
点击建事件、拖拽移动、拖拽拉伸这几个操作是否仍然准确对应到鼠标位置。

---

## [REQ-010] 事件块小尺寸下字体不可见 + 块间分隔 + 一天从 6 点开始 + 详情弹层按钮换行

状态：completed
模块：src/constants/timelineRange.js, src/components/DayTimeline.vue,
src/components/WeekBoard.vue, css/timeline.css, css/components.css

描述：
用户在 REQ-009 基础上继续反馈四点：时间段过短时事件标题整个看不见，
建议把时间段标注挪到标题后面写成一行；无缝衔接（首尾相接）的连续计划
之间也要有视觉分隔，不能糊成一块；一天应该从 6 点开始画（而不是 0
点）；事件块字体还能再小一点，但点进详情弹层的字体不用跟着变小，不过
详情弹层自己有"一行放不下"的问题（按钮行）。

- **时间段过小字体看不见的根因**：`.timeline-block` 原来是"时间+类型
  一行、标题另起一行"的两行结构，配合 `padding:4px 8px`，需要的最小
  高度比之前设的 `min-height:18px` 还高，导致短时长块（比如 15 分钟）
  的标题被 `overflow:hidden` 整个裁没。改成用户建议的方案：标题和时间
  合并成一行（`.timeline-block__title-row`，标题在前、时间跟在后面，
  时间用更小更淡的字），"类型"退到下面单独一行、块太矮时自然被裁掉
  （类型本来就靠块左边框的颜色能区分，不是必须看到的信息）；同时把
  `padding` 收紧到 `2px 7px`，`min-height` 相应调到 20px（日视图）/
  18px（周视图），保证这一行文字在最小高度下也能完整露出来。
- **块间分隔**：`blockStyle()` 算出来的 `height` 从"整百分比"改成
  `calc(X% - 3px)`（周视图 2px），把每个块的底边往上收几像素，不管
  上一个块的结束时间是不是正好等于下一个块的开始时间，两者之间始终会
  留出一条看得见的间隙，不会因为无缝衔接就糊成一整块颜色。
- **一天从 6 点开始**：新增 `constants/timelineRange.js` 的
  `DISPLAY_START_HOUR = 6` 和两个换算函数 `toDisplayOffset`/
  `fromDisplayRatio`，时间轴的小时刻度从 6、7...23、0、1...5 这个顺序
  显示（凌晨时段排在最后而不是最前面），块的渲染位置、"现在"横线、
  点击/拖拽建事件的像素→小时换算都跟着这个新的显示起点走；块本身的
  存储范围（`TIMELINE_RANGE`，真实的 0-24 点）和拖拽/缩放的钳制边界
  没有变，只是"从哪个小时开始画"这个展示层面的选择变了。**已知局限**：
  真实起止时间跨过 6 点这条分界线的块（比如 4:00-8:00，现实里对应"熬夜
  到早上"这种安排），因为绝对定位的单个块没法在视觉上"从底部绕回顶部"
  拆成两段渲染，会显示得比实际时长短（超出网格底部的部分被裁掉）——这
  是"旋转显示起点"这个方案本身的局限，没有做拆分渲染，已在
  `timelineRange.js` 里写清楚。
- **事件块字体再调小**：`.timeline-block__title` 从 12px/500 字重调到
  11px；新增的 `.timeline-block__time`/`.timeline-block__type` 都是
  9px、`--text-muted`，比标题更淡更小，拉开主次。
- **详情弹层（EventModal.vue）按钮行换行**：没有改字体，字体大小
  维持不变（`t('event.saveBtn')`/`cancelBtn`/`deleteInstance`/
  `deleteSeries` 这套按钮走 Naive UI 默认字号）；`.settings-actions`
  加了 `flex-wrap: wrap`，编辑一个周期事件时最多 4 个按钮
  （保存/取消/删除此次/删除整个系列）放不下一行就自动换到第二行，而
  不是被裁切或挤出容器。

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部 `src/**/*.js` 文件做了语法校验（全部通过）；用 Grep
确认没有遗留对旧版 `.timeline-block__row` class 或裁剪前逻辑的引用。
时间轴旋转显示起点、块间距、CSS `calc()` 高度这几处涉及真实渲染效果，
无法在不运行的情况下确认视觉观感，需要用户本地打开日/周视图确认：
最上面一行是不是 6:00、短时长事件的标题是否完整可见、相邻无缝事件
之间是否能看出分隔线、编辑周期事件时的弹层按钮是否正常换行不溢出。

---

## [REQ-011] 去掉块内类型文字 + 按钮重叠修复 + 外观/地区设置 + 节假日展示 + 事件展示性微调

状态：completed
模块：src/components/DayTimeline.vue, src/components/WeekBoard.vue,
src/components/MonthBoard.vue, src/components/SettingsPanel.vue,
src/App.vue, src/constants/timelineRange.js, src/constants/fontStacks.js
（新增）, src/domain/holidays.js（新增）, src/state/persistence.js,
css/timeline.css, css/components.css, css/layout.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户一次性反馈了六件事，按性质分两组处理：

**A. 延续 REQ-010 的时间轴细节调整**
1. 事件块里"体验/工作/运动"这类类型文字标注会挤占本就紧张的高度，
   用户明确说"这类分类有颜色就足够了 不要标注"——直接删掉
   `.timeline-block__type` 这行文字和对应的 `blockTypeLabel()`
   函数，类型只靠块左边框的颜色（`BLOCK_TYPE_COLORS`）区分。
2. 标题+时间合并行的时间文字和右上角的跳过/删除按钮（绝对定位）
   重叠——给 `.timeline-block__title-row` 加 `padding-right: 42px`
   给这两个按钮让位。
3. 块间间隙从 3px/2px（日/周视图）调大到 5px/4px，视觉上更明显。
4. 新增"起点留白"这个纯展示层面的微调：`constants/timelineRange.js`
   新增 `DISPLAY_START_HOUR`/`displayStartHour(block)`，块的渲染位置
   和时间标签都用 `block.start` 往后错开最多 5 分钟（短于 10 分钟的
   事件按一半时长错开）的值，视觉上不贴着整点格线，例如 16 点开始的
   事件显示成"16:05"——`block.start`/`block.end` 本身完全不变，拖拽/
   排序/冲突判断等业务逻辑一律用真实值，只有渲染读这个"错位"值。

**B. 新功能：外观/地区设置 + 节假日展示**
5. 设置页新增"外观"分区：字体（`constants/fontStacks.js` 新增 5 个
   系统字体拼栈选项，不引入新的 Web Font 依赖）、主题色
   （`n-color-picker`，留空代表跟随 Google 蓝主题默认）、背景图片
   （URL + 透明度滑块，`App.vue` 新增一个固定定位的 `.app-background`
   图层，只调图层自身透明度，不影响正文卡片的可读性）。这几项和
   REQ-008 的语言切换一样是即时生效，不走这个页面其余字段的
   draft/保存流程。
6. 设置页新增"地区"分区（`settings.region`，默认 `'CN'`），驱动新增的
   `src/domain/holidays.js` 静态节假日数据（CN/US/JP 三个地区的 2026
   年节假日，写入前用 WebSearch 核对过官方/权威信息源，不是凭记忆编的
   日期）。月视图格子、周视图日期头（title 提示）、日视图标题旁边的
   标签，三个日历视图都接入了这份数据，把假日/调休上班的日子标出来。
   **范围取舍**：只做"看得见"，节假日数据没有接入 `domain/scheduler.js`
   / `domain/dayPlanner.js` 的自动排程逻辑，自动排程默认工作日依然只看
   `settings.workHours.days` 这个每周固定集合，不知道"今年这天调休"这
   种年度例外。**已知局限**：这份数据是手工维护的静态表，只覆盖 2026
   年，没有自动更新机制，往后每年都需要照官方通知补新的一份进去。

验收：
- 事件块里看不到"工作/体验/运动"这类类型文字了，颜色区分还在
- 日视图事件块的时间文字不再被跳过/删除按钮遮住
- 无缝衔接的相邻事件之间能看出明显的间隙
- 16:00 整点开始的事件，视觉上/时间标签显示成 16:05 左右，但拖拽移动
  它、编辑它的详情，看到的还是真实的 16:00
- 设置页能选字体、选主题色（或恢复默认）、填背景图片链接并调透明度，
  效果实时生效
- 设置页能选地区，月/周/日三个日历视图上能看到对应地区的节假日标记

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部 `src/**/*.js` 文件（含新增的 `holidays.js`/
`fontStacks.js`）做了语法校验（全部通过），并用 `node -e` 实际调用
`getHolidayInfo()` 核对了几个已知日期（2026-10-01/10-10/07-04/05-05）
返回结果正确。`n-color-picker`/`n-slider` 这两个新用到的 Naive UI
组件标签没有找到官方文档页（404），退而用 GitHub 源码
`src/components.ts` 确认了 `color-picker`/`slider` 是这个包里真实存在
的组件目录——这类全局注册的模板标签就算名字错了也只是控制台报个
"组件未解析"的警告、不会像具名 JS 导入错误那样导致整个应用起不来，
风险比 REQ-005/007 验证过的图标/locale 具名导出场景低，因此没有再进一步
核实每个 prop 名称。所有涉及真实渲染效果（外观设置生效、背景图叠加、
节假日标记的视觉呈现）的部分仍需要用户本地 `npm run dev` 后自行确认。

---

## [REQ-012] 事件时间标注恢复显示真实时间（撤销 REQ-011 里标签跟着错开的部分）

状态：completed
模块：src/constants/timelineRange.js, src/components/DayTimeline.vue

描述：
REQ-011 时把"起点留白"这个纯展示效果同时用在了块的渲染位置**和**时间
文字标注上（比如 16:00 的事件显示成"16:05-17:00"）。用户实际用起来
反馈这样"有点奇怪"——文字标注跟着一起错开，容易让人误以为存的时间真的
是 16:05，尤其是点进去看详情时看到的却是 16:00，两边对不上。

用户明确要求：只保留块的**渲染位置**这个视觉效果，时间**标注文字**要
恢复显示真实时间。

- `DayTimeline.vue` 的 `displayTimeLabel(block)` 改回直接用
  `block.start`/`block.end`（真实值），不再调用 `displayStartHour()`。
- `blockStyle()` 计算块的 `top`/`height` 位置时，继续用
  `displayStartHour()` 的留白值——这部分视觉效果本身没有问题，用户没有
  要求撤销，保留。
- `constants/timelineRange.js` 里 `DISPLAY_START_NUDGE_HOURS`/
  `displayStartHour()` 上方的注释更新，明确写清楚"只用于位置计算，不要
  再拿去生成时间文字"，避免以后又被误用到标签上。
- 确认过 `EventModal.vue`（编辑/创建事件的详情弹层）本来就一直读
  `modal.block.start`/`end` 的真实值，没有引入过这个留白效果，不需要
  改动。

验收：
- 日视图事件块上显示的时间文字（如"16:00-17:00"）是真实时间，不再是
  错开后的"16:05"这类值
- 块在时间轴上的渲染位置仍然保留"不贴着整点格线"的视觉效果
- 点击事件打开编辑弹层，看到的开始/结束时间和块上标注的时间文字
  完全一致，不会出现两边对不上的情况

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了改动的 `timelineRange.js`；用 Grep 确认
`displayStartHour` 目前只在 `blockStyle()`（位置计算）里被调用，
`displayTimeLabel()`/`EventModal.vue` 都不再涉及这个值。视觉效果需要
用户本地 `npm run dev` 后确认。

---

## [REQ-013] 日视图事件块去掉"周期事件"标注

状态：completed
模块：src/components/DayTimeline.vue, css/timeline.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户反馈"周期事件 不需要在底下进行标注"——`DayTimeline.vue` 里挂着
`recurringId` 的块，标题下面会多一行"🔁 周期事件"（`RepeatRound` 图标 +
`day.recurringTag` 文案），和之前删掉的"类型"标注是同一类问题：占用块本就
紧张的高度，用户认为不需要。

- 模板里 `v-if="block.recurringId"` 的 `.timeline-block__recurring-tag`
  这一整块删掉；连带 `RepeatRound` 这个图标 import 也一起删了（这个
  文件里只有这一处用到它）。
- `css/timeline.css` 的 `.timeline-block__recurring-tag` 规则删掉（不再
  有模板引用它）。
- 三个语言文件的 `day.recurringTag` key 一起删掉（不再被任何地方引用，
  留着是死文案）。
- 周期事件本身的行为不变（依然按周期规则物化成多个 block，删除时依然
  能选「删除此次」或「删除整个系列」），只是不再在时间轴上单独标出来。

验收：
- 日视图里周期事件的时间块不再显示"周期事件"这行文字/图标
- 周期事件的创建、编辑单次实例、删除单次/整个系列，功能都还正常
- 项目里搜不到 `recurringTag`/`RepeatRound`/`recurring-tag` 的残留引用

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了改动的三个 locale 文件；用 Grep 确认
`recurringTag`/`recurring-tag`/`RepeatRound` 在 `src/` 下已经没有任何
残留引用。视觉效果需要用户本地确认。

---

## [REQ-014] 时间重叠事件左右分栏显示（不覆盖，周期事件优先）

状态：completed
模块：src/utils/blockOverlap.js（新增）, src/components/DayTimeline.vue,
src/components/WeekBoard.vue

描述：
用户提出"如果遇到会时间重复的事件怎么处理呀……可以的话我想两个都留下，
如果更多那就不处理，不能发生事件的覆盖操作，周期事件的显示优先于一般
事件"。排查确认：数据层面本来就不会发生覆盖——`domain/recurringEvents.js`
的 `createRecurringEvent`、`EventModal.vue` 的 `addSingleBlock`/
`updateBlockFields`，都只是往数组里追加或原地更新对应 id 的块，从来没有
"新建/移动到某个时间点就删掉那里原有的块"这种逻辑；问题出在**视觉**上——
两个时间重叠的块都是 `left:8px;right:8px` 的整行宽度、绝对定位，重叠时
后渲染的那个会盖住先渲染的，看起来像"被覆盖了"。

- 新增 `src/utils/blockOverlap.js`，导出 `computeBlockLayout(blocks)`：
  - 默认每个块整行宽度（`column:0, columns:1`）。
  - 如果某个块和且仅和另一个块互相重叠（两边各自只和对方重叠，不牵扯
    第三个块），判定为"两两重叠"，分成左右两栏各占一半宽度，谁也不会
    挡住谁。
  - 一个块同时和 2 个及以上其他块重叠，判定为更复杂的情况，按用户要求
    "不处理"，维持默认整行宽度（这种情况下的视觉重叠是已知的、可接受
    的局限）。
  - 两两分栏时，周期事件（`block.recurringId` 存在）固定排在左边
    （列 0），比一般事件优先显示；都是/都不是周期事件时按开始时间早的
    排左边，开始时间也相同则按 `block.id` 兜底排序，保证两个块各自
    独立计算时得出一致的结果（不会因为谁先算就抢到左边）。
- `DayTimeline.vue`/`WeekBoard.vue` 的 `blockStyle()` 都接入这个函数，
  `columns===2` 时用 `left`/`right` 两个内联样式把块限制在半宽范围内
  （中间留 4px 的间隙），`columns===1` 时不设置，沿用 CSS 里
  `.timeline-block` 的默认整行宽度。

验收：
- 两个时间上有重叠的事件（比如 9:00-10:00 和 9:30-10:30）会左右并排
  显示，都能看到标题，不会互相盖住
- 三个及以上事件在同一时间段重叠时，维持原来的整行宽度显示（已知局限，
  不做进一步处理）
- 两两重叠时，如果其中一个是周期事件，它固定显示在左边
- 没有时间重叠的事件渲染方式不受影响，还是整行宽度
- 拖拽移动、创建、删除事件等操作不受这个纯展示层改动影响

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了新增的 `blockOverlap.js`；用 `node -e` 实际跑了四组用例
（两两重叠+一个周期事件、三方重叠、无重叠、开始时间相同且都非周期）
验证 `computeBlockLayout()` 的分栏/优先级/兜底排序结果符合预期。视觉
呈现（左右分栏的实际观感、间隙大小是否合适）需要用户本地
`npm run dev` 后确认。

---

## [REQ-015] 去掉"生成本周计划"/"清空本周安排"/"新建周期计划"快捷按钮

状态：completed
模块：src/components/WeekBoard.vue, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求把周视图头部的「生成本周计划」（含「重新生成」态）、「清空本周
安排」、「新建周期计划」快捷入口这三个按钮都去掉。

- `WeekBoard.vue` 删除 `handleGenerate`/`handleClearWeek`/
  `openRecurringShortcut`/`translateWarning` 四个函数，以及只被它们
  用到的 `weekKey`/`plan` 两个 computed；连带清理了变成未使用的 import
  （`generateWeeklyPlan`/`planWeekDays`/`markScheduled`/`getBusyMap`/
  `AddRound`/`getISOWeekKey`）。
- 模板里对应的 `<n-button>`/`<n-popconfirm>` 三处一起删除，周视图头部
  右侧现在只剩阶段进度的 `<n-tag>`。
- 三个语言文件里只被这几个按钮/提示用到的 `week.generate`/
  `week.regenerate`/`week.clear`/`week.clearConfirm`/`week.newRecurring`/
  `week.generatedToast`/`week.clearedToast`/`week.emptyPoolWarning`/
  `week.warningCooldown`/`week.warningPool` 一并删除；顺带发现
  `week.emptyDay` 在这次改动之前就已经没有任何地方引用（属于更早的
  遗留死文案，和这次改动无关但顺手清理掉了）。
- **范围取舍**：只删 UI 入口，`domain/scheduler.js`（`generateWeeklyPlan`）、
  `domain/dayPlanner.js`（`planWeekDays`）、`domain/activityPool.js`
  （`markScheduled`）这几个domain 层模块本身完全没动——用户明确要求的
  是"按钮"，不是"删掉自动排程这个功能"，这几个函数现在虽然没有 UI
  入口调用，但业务逻辑还在，以后如果要恢复或换个入口触发，不需要
  重新实现。`state.weeklyPlans` 这个 state 字段的默认值也保留在
  `persistence.js` 里，不强行改 state schema。

验收：
- 周视图头部看不到"生成本周计划"/"清空本周安排"/"新建周期计划"这三个
  按钮了，只剩翻页按钮、标题、阶段进度标签
- 点击网格空白处新建事件、日视图的「+ 添加事件」按钮、EventModal 里手动
  勾选"设为周期事件"，这些创建事件的其他途径都还正常
- 项目里搜不到 `handleGenerate`/`handleClearWeek`/`openRecurringShortcut`
  的残留引用

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对三个改动的 locale 文件做了语法校验；用 Grep 确认
`WeekBoard.vue` 里已经没有这三个函数和对应导入的残留引用，
`getBusyMap`/`markScheduled`/`planWeekDays`/`generateWeeklyPlan` 在
domain/calendar 层仍然存在（`getBusyMap` 还被 `GoogleSyncPanel.vue`
独立使用，其余几个目前没有任何调用方，但模块本身没有被删除）。

---

## [REQ-016] 阶段周数改由长期目标累计控制（替代设置里手填的固定周数）

状态：completed
模块：src/domain/goals.js（新增）, src/state/persistence.js,
src/domain/scheduler.js, src/components/SidebarNav.vue,
src/components/WeekBoard.vue, src/components/SettingsPanel.vue,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
延续更早一次"年度级别的大目标怎么处理"的开放讨论，用户这次提出具体
方向："阶段"这个概念改成通过设定长期计划来控制，例如累计打算花多少周
去实现一个目标。消息本身在"1通过设定长期计划进行控制..."处断掉了，用
AskUserQuestion 请用户补充目标和现有四阶段（探索/筛选/进阶/记忆）的
关系，用户选择：**阶段周数由目标累计决定，替换现在的固定周数**。

- 新增 `src/domain/goals.js`：长期目标的数据模型和 CRUD。
  - `goal = {id, title, phase, weekBudget, createdAt}`，`phase` 是四个
    阶段标识符之一，`weekBudget` 是这个目标打算花的周数（正整数）。
  - `createGoal`/`updateGoal`/`deleteGoal(store, ...)` — 和
    `domain/recurringEvents.js` 一样的 `store.setState` 调用惯例。
  - `computePhaseWeeksFromGoals(goals)` — 汇总成
    `domain/yearPhases.js` 需要的 `{explore,filter,advance,memory}`
    周数结构：阶段长度 = 该阶段下所有目标 `weekBudget` 之和；某阶段还
    没有任何目标时用 `DEFAULT_PHASE_WEEKS_FALLBACK = 13`（原来的默认值）
    兜底，避免阶段长度变成 0 导致 `getPhaseSchedule()` 后续阶段全部
    错位。
- `state.goals`（顶层新数组，默认空）取代了 `settings.phaseWeeks`
  （整个删除）——目标是"计划数据"而不是"配置项"，和 `activityPool`/
  `dayTimelines` 归为一类，不放在 `settings` 里。`persistence.js` 的
  `fillMissingDefaults()` 相应更新。
- 三处原来读 `settings.phaseWeeks` 的地方（`SidebarNav.vue` 的阶段进度
  条、`WeekBoard.vue` 的阶段标签、`domain/scheduler.js` 的
  `generateWeeklyPlan` 选品类逻辑）都改成现算
  `computePhaseWeeksFromGoals(state.goals)`。`scheduler.js` 那处虽然
  在 REQ-015 里已经没有 UI 入口调用了，但为了模块本身逻辑自洽，还是
  一起改了，没有留着不一致的旧代码。
- `SettingsPanel.vue`："年度与阶段"分区里原来手填每阶段周数的
  `n-input-number` 网格删掉，新增"长期目标"分区：
  - 顶部按阶段显示当前汇总出的周数（只读，随目标增删改实时更新）。
  - 目标列表（标题、所属阶段、可编辑的预算周数、删除按钮）。
  - 新增目标的表单（标题 + 阶段选择 + 预算周数 + 添加按钮）。
  - 目标的增删改和"语言"分区一样是即时生效（直接调用
    `domain/goals.js` 的函数），不走这个页面其余字段的
    draft/保存流程——新增/删除一个目标应该立刻反映到阶段进度上。

验收：
- 设置页能看到"长期目标"分区，能新增/编辑周数/删除目标
- 新增一个目标后，对应阶段的周数汇总立刻更新（不需要点保存）
- 侧边栏阶段进度条、周视图的阶段标签，都随目标变化实时反映新的阶段
  长度
- 某个阶段完全没有目标时，仍然按 13 周的默认值运作，不会出现阶段
  长度为 0 导致后续阶段日期错乱的情况
- 设置页里原来"填每阶段周数"的输入框已经不存在

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动的 `.js` 文件做了语法校验；用 `node -e` 实际调用
`computePhaseWeeksFromGoals()` + `getPhaseSchedule()` 验证了"有目标的
阶段用累加值、没有目标的阶段用兜底值 13"这个核心行为符合预期；用 Grep
确认 `settings.phaseWeeks`/`phaseWeeksLabel` 在代码里已经没有任何实际
引用（只剩注释里提及）。设置页新分区的实际交互和视觉效果，以及阶段
进度条/标签联动是否符合预期，需要用户本地 `npm run dev` 后确认。

---

## [REQ-017] 导入"计划"功能（取代长期目标）+ 修复相邻事件间隔显示 bug

状态：completed
模块：新增 src/domain/plans.js, src/components/PlanPanel.vue；
src/state/persistence.js, src/components/SidebarNav.vue, src/App.vue,
src/components/SettingsPanel.vue（删除长期目标分区）,
src/components/EventModal.vue, src/components/DayTimeline.vue,
src/components/WeekBoard.vue（bug 修复）, css/timeline.css,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户提出两件事：(1) 新增"计划"功能——一份计划包含一串有先后顺序的关键
事件，需要严格按顺序完成关键事件才能一步步推进到计划的终点，支持定义
多项计划，每个关键事件有预计完成时长，用户新建日程事件时可以从计划的
关键事件列表里直接添加到时间轴；(2) 一个显示 bug："时间上紧邻的两个
事件之间，第二个事件没有间隔显示"。用 AskUserQuestion 确认了四个关键
决策点：

1. **计划 vs 长期目标关系**：计划取代长期目标（REQ-016 的 `domain/goals.js`
   / `state.goals` / SettingsPanel"长期目标"分区）。范围取舍：只删除
   长期目标的 UI 入口（SettingsPanel 分区），`domain/goals.js`/
   `state.goals`/`computePhaseWeeksFromGoals()` 本身不删除——阶段周数
   计算链路（`SidebarNav.vue`/`WeekBoard.vue`/`scheduler.js`）继续调用
   这个函数，只是往后 `state.goals` 永远是空数组，阶段周数会一直落回
   `DEFAULT_PHASE_WEEKS_FALLBACK`（13 周），这是预期内的结果，不是
   bug，和 REQ-015 删除按钮但保留 domain 函数是同一个处理模式。
2. **关键事件完成判定**：手动标记完成（日视图时间块上的"标记完成"
   按钮），不是时间过去自动完成。
3. **顺序强制**：严格顺序——`domain/plans.js` 的数据模型本身就不提供
   "任意标记/任意重排"的入口，只允许标记 `keyEvents` 数组里第一个还没
   完成的那个，完成状态天然是数组前缀连续的一段；`EventModal.vue`"从
   计划添加"下拉框也只列出每个计划当前解锁的那一个关键事件。
4. **bug 根因定位**（确认为"紧邻但看不出缝隙"）：`DayTimeline.vue`/
   `WeekBoard.vue` 的 `blockStyle()` 原来用 CSS `minHeight:'20px'/'18px'`
   保证短时长块至少能露出一行文字，但 `min-height` 优先级高于百分比
   算出来的 `height`，块自然高度小于这个值时会被强行撑高——`top` 固定
   不变，撑高只会往下扩张，如果块后面紧跟着另一个不重叠的块，扩张部分
   会啃掉两者之间该有的 5px/4px 间隔。改成用 JS 找到当天排在这个块
   之后、不重叠的下一个块，算出到它为止还有多少可用空间，用 CSS
   `min()`/`max()` 把"保证可读性的最小高度"钳制在这个空间以内，不再
   用固定的 `minHeight` 属性。

验收：
- 新建计划：填标题 + 一组关键事件（标题+预计时长），保存后在"计划"
  页面能看到，关键事件按填写顺序排列
- 支持同时存在多个计划，互不影响
- 新建日程事件时，"从计划添加"下拉框能看到每个计划当前解锁的关键事件
  （格式"计划标题 · 关键事件标题"），选中后自动填入标题和结束时间
  （开始时间 + 预计时长）
- 日视图上，关联了计划关键事件、且还没完成的时间块有一个"标记完成"
  按钮；点击后该关键事件在"计划"页面显示为已完成，下一个关键事件
  解锁（变成可以从"从计划添加"里选中）
- 一个计划的全部关键事件都标记完成后，"计划"页面显示"已到达终点"
- 已完成的关键事件不能删除，只有未完成的可以删除；"从计划添加"下拉框
  不会出现被锁着（前面还有未完成事件）的关键事件
- 设置页里原来的"长期目标"分区已经不存在；阶段进度条/周视图阶段标签
  仍然正常显示（用兜底的 13 周）
- 两个时间上紧邻（不重叠，前一个结束时间=后一个开始时间）的事件之间，
  不论块本身时长多短，都能看到明显的间隔，不会因为短时长块被撑高而
  贴到一起
- 刷新页面后计划数据从 localStorage 完整恢复

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动/新增的 `.js` 文件做了语法校验（全部通过）；用
WebFetch 核对了新用到的两个 `@vicons/material` 图标
（`FlagRound`/`CheckCircleRound`）真实存在；用 Grep 确认删除的
`settingsView.goals*` 文案 key 在三个语言文件和代码里都已清理干净，
且 `createGoal`/`updateGoal`/`deleteGoal` 目前虽已没有调用方但仍完整
保留在 `domain/goals.js`。bug 修复涉及真实浏览器渲染（CSS `min()`/
`max()` 函数嵌套的实际效果、短时长事件的可视间隔），以及计划功能的
交互观感（新建/标记完成/进度条），无法在不运行的情况下验证，需要用户
本地 `npm run dev` 后确认。

---

## [REQ-018] 奖励名单（完成计划可领取，含参考价值）

状态：completed
模块：新增 src/domain/rewards.js, src/components/RewardPanel.vue；
src/state/persistence.js, src/components/SidebarNav.vue, src/App.vue,
src/components/PlanPanel.vue, css/components.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户提供了一份具体的奖励清单（佳能 EOS R6 Mark III 相机 + RF 45mm F1.2
镜头、索尼耳机、苹果手表/耳机/电脑、西服、马来西亚/印尼/泰国/越南/
新加坡/韩国旅行、公路车、滑雪装备、游泳、潜水），要求"把价值写上"。用
AskUserQuestion 确认了两点：(1) 奖励名单和 REQ-017 新加的"计划"功能是
配对关系——一份计划全部关键事件完成（到达终点）后，可以从奖励名单里
领取一个还没被领取的奖励；(2) "价值"由 AI 帮忙搜一下参考市价填上（人民
币），作为初始值，用户随时可以在界面里改。

- 新增 `src/domain/rewards.js`：`reward = {id, title, value, claimed,
  claimedAt, claimedByPlanId, createdAt}`。`claimReward(store, rewardId,
  planId)` 只对还没被领取的奖励生效（防止重复领取同一个奖励）；
  `hasClaimedRewardForPlan(rewards, planId)` 保证一份计划最多只能兑换
  一次；`deleteReward` 只允许删除还没被领取的（已兑现的是领取记录，
  删除会丢失"这份计划换到了什么"这段历史）。
- `state.rewards`（顶层新数组）种子数据即用户给出的 17 项清单：
  - 佳能 EOS R6 Mark III / RF 45mm F1.2 STM 镜头：价格来自佳能 2025-11-06
    官方发布信息，单机身 16999 元、镜头 2949 元，用 WebSearch 核对过
    官方零售价，是最精确的两项。
  - 索尼 WH-1000XM6（约 3299 元）、Apple Watch（约 2999 元）、AirPods
    Pro（约 1899 元）、MacBook（约 8999 元）：这几项用户只写了品类没写
    具体型号，用 WebSearch 查到官网/主流电商的大致价格区间后取了一个
    参考值，标注为"参考价值"，不是精确报价。
  - 西服、六国旅行、公路自行车、滑雪装备、游泳、潜水这几项没有固定
    牌价（尤其旅行类是"一次体验"而不是"一件商品"），按常见预算区间估了
    一个参考值，没有单独逐项搜索（搜了也搜不出唯一"正确"的价格）。
  - 只有全新用户（`state.rewards` 字段完全不存在，即 localStorage 里
    从来没存过）才会拿到这份种子数据，和 `activityPool` 的
    `SEED_ACTIVITIES` 是同一个模式（详见 `persistence.js` 注释）。
- 新增导航视图"奖励"（`src/components/RewardPanel.vue`，图标
  `CardGiftcardRound`，已用 WebFetch 核对存在）：待领取/已兑现两个分区，
  待领取的可以改价值、可以删除，已兑现的显示是哪份计划换来的和兑现
  时间；顶部小表单可以继续添加新的奖励。
- `PlanPanel.vue` 计划卡片新增"领取奖励"区域：只在这份计划到达终点、
  且还没兑换过时出现，下拉框只列出还没被领取的奖励（图标
  `RedeemRound`，已用 WebFetch 核对存在），选好后点"领取奖励"标记兑现；
  已兑换的计划改成显示"已用这份计划领取奖励：{title}"。

验收：
- 打开"奖励"页面能看到用户提供的 17 项奖励，每项都标了一个参考价值
  （人民币）
- 可以在"奖励"页面新增/改价值/删除还没被领取的奖励；已兑现的奖励不能
  删除，只能查看
- 一份计划的全部关键事件都标记完成后，计划卡片上出现"领取奖励"入口，
  选一个还没被领取的奖励点击后，该奖励在"奖励"页面变成"已兑现"状态，
  并显示是哪份计划换来的
- 同一份计划领取过奖励后，不会再出现"领取奖励"入口（一份计划只能换一
  次）；同一个奖励领取后，不会再出现在别的计划的"可选奖励"下拉框里
- 刷新页面后奖励数据（含兑现状态）从 localStorage 完整恢复

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动/新增的 `.js` 文件做了语法校验（全部通过）；用
WebSearch 核对了佳能 EOS R6 Mark III/RF45mm F1.2 的官方发布价格（精确），
其余几项电子产品查了官网/电商的大致价格区间（参考值，非精确报价）；用
WebFetch 核对了 `CardGiftcardRound`/`RedeemRound` 两个新用到的
`@vicons/material` 图标真实存在；用 `node -e` 跑了完整的运行时验证
（种子数据加载出 17 条、正常领取、重复领取同一奖励被拒绝、已兑现奖励
删不掉、未兑现奖励能删掉），全部符合预期。界面的实际交互观感需要用户
本地 `npm run dev` 后确认。

---

## [REQ-019] 奖励改为日元点数经济（完成任意事件按时长攒点数兑换）

状态：completed
模块：src/domain/rewards.js（重写）, src/state/persistence.js,
src/components/DayTimeline.vue, src/components/PlanPanel.vue,
src/components/RewardPanel.vue, src/components/SettingsPanel.vue,
css/timeline.css, css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求把 REQ-018 那套"完成整份计划才能直接领取奖励"的机制整个换掉：
奖励改用日元计价，且改成"点数经济"——日常在时间轴上添加并完成任意事件
都能按时长攒点数，点数攒够了才能兑换奖励，不再要求先完成一整份计划。
用 AskUserQuestion 确认了三个关键决策点：(1) 点数机制**完全替代**原来
"计划完成即领取"的入口，不是并行共存；(2) 时间轴上**任意**事件标记完成
都能攒点数，不局限于关联了计划关键事件的事件；(3) 点数按事件**时长**
换算（时长 × 比率），比率本身没有标准答案，做成设置页里用户可调的
`settings.pointsPerHour`。

- `domain/rewards.js` 重写：`reward` 去掉了 `claimedByPlanId`（不再需要
  记录"哪份计划换的"，因为兑换不再和某份特定计划绑定）；新增顶层
  `state.rewardPoints`（点数余额，简单数字，不是流水账）；
  `computePointsForDuration(hours, pointsPerHour)` 算点数；
  `addPoints(store, delta)` 累加/扣减余额（`Math.max(0, ...)` 钳制不能
  为负）；`redeemReward(store, rewardId)` 检查余额够不够，够了才真正
  扣点数 + 标记兑换，返回布尔值给调用方决定要不要提示"点数不够"。
- `DayTimeline.vue`：原来只在 `block.planId` 存在时才显示的"标记完成"
  按钮，改成对**所有**（非 Google 来源的）块都显示——这是"时间轴上任意
  事件完成都能攒点数"这条决策在 UI 上的体现。点击时按块的真实时长算出
  点数，快照存进 `block.pointsAwarded`（不是每次现算，避免之后调整比率
  或拖拽改时长导致撤销时数字对不上）；如果这个块恰好关联了计划关键
  事件，同一个"完成"动作还会顺带调用 `completeKeyEvent` 推进那份计划
  （两件事共用一个动作，语义上是一致的：真的做完了，既该拿点数，也该
  让计划往前走）。"完成"和"跳过"两个状态互斥，切换到其中一个会先把
  另一个（如果存在）连带的点数/计划进度退回去。删除一个已经标记完成的
  块也会把它的点数退回去，但不会联动撤销计划进度（已知的简化取舍，见
  代码注释）。块的标题+时间行 padding 从"只在关联计划时加宽"改成固定
  值——现在"完成"按钮对每个块都存在，三个悬浮按钮（完成/跳过/删除）是
  固定配置，不再需要按条件调整宽度。
- `PlanPanel.vue`：REQ-018 新增的"领取奖励"整个区域（下拉框选奖励 + 
  领取按钮）删掉了，计划到达终点后只保留"已到达终点"这个进度标签，
  不再直接触发奖励发放——奖励现在完全由点数经济驱动，和某一份具体
  计划完成与否脱钩（计划本身仍然有意义：它的关键事件被标记完成时一样
  会经过 `DayTimeline.vue` 那个通用的"完成"动作攒到点数）。
- `RewardPanel.vue`：顶部新增点数余额展示（`n-tag`）和说明文字；
  "待兑换"表格每行新增"兑换"按钮，余额不够时置灰并显示"还差 N 点"；
  已兑换分区去掉了"兑换自哪份计划"这一列（不再有这个概念）。
- `SettingsPanel.vue` 新增"奖励点数"分区，`n-input-number` 即时生效地
  调整 `settings.pointsPerHour`（和外观/地区那几项一样，不进
  draft/保存流程）。
- 奖励清单的价值单位从人民币改成日元：佳能 EOS R6 Mark III（¥429,000）
  和 RF45mm F1.2 STM（¥66,000）用 WebSearch 核对了日本官方发布的确切
  零售价；索尼 WH-1000XM6（¥59,400）/AirPods Pro（¥39,800）/苹果电脑
  MacBook Air（¥224,800）也查到了日本官网/官方门店的确切价格，Apple
  Watch（¥64,800）没查到当前确切数字，按历史价位估了一个参考值；西服/
  六国旅行/自行车/滑雪/游泳/潜水这几项本来就没有固定牌价，按 REQ-018
  定的人民币参考预算乘 2026-07 中旬人民币兑日元汇率（约 1 CNY ≈ 23.8
  JPY，也用 WebSearch 核对过）换算取整。

验收：
- 设置页能看到"奖励点数"分区，可以调整"每小时点数"，调整后立刻生效
- 日/周视图里任意一个时间块（不要求关联计划），点击"完成"按钮后，
  "奖励"页面顶部的点数余额按这个块的时长 × 当前比率增加；再点一次
  "完成"取消，点数按原样退回
- 关联了计划关键事件的块标记完成时，除了正常攒点数，对应的计划进度
  也会推进（和之前 REQ-017 的行为一致）
- 计划全部关键事件完成后，只显示"已到达终点"标签，不再出现"领取奖励"
  的入口
- "奖励"页面能看到日元计价的奖励清单，点数够了"兑换"按钮可点，不够则
  置灰并显示还差多少
- 兑换后点数余额相应扣减，该奖励移入"已兑换"分区，不再出现在待兑换
  列表和兑换会消耗余额的操作里
- 刷新页面后点数余额、每小时点数设置、奖励兑换状态都从 localStorage
  完整恢复

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动/新增文件做了语法校验（全部通过）；用 WebSearch
核对了佳能两款产品、索尼耳机、AirPods Pro、MacBook Air 在日本的官方
零售价，以及 2026-07 中旬人民币兑日元的大致汇率；用 `node -e` 完整跑了
运行时验证：种子数据的日元价格正确、按时长算点数正确、正常兑换扣点数
并标记、点数不够时兑换被拒绝且余额不变、已兑换奖励删不掉未兑换的能删、
计划进度推进不依赖奖励兑换，全部符合预期。用 Grep 确认了
`claimedByPlanId`/`hasClaimedRewardForPlan`/旧版"领取奖励"相关的函数名
和文案 key 在代码里已经清理干净，没有残留引用。界面实际交互观感（点数
增减动画、按钮置灰状态、完成/跳过互斥切换）需要用户本地 `npm run dev`
后确认。

---

## [REQ-020] 修复 N 路事件重叠显示 + 默认完成（跳过才不计分）+ 点数一天延迟结算

状态：completed
模块：src/utils/blockOverlap.js（重写）, src/components/DayTimeline.vue,
src/components/WeekBoard.vue, src/domain/rewards.js, src/App.vue,
css/timeline.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户一次提了三件事：(1) "一个事件的时间跨度内有两个事件，显示有问题"
——排查确认是 `utils/blockOverlap.js`（REQ-014 引入）遗留的已知限制：
一个块同时和 2 个及以上其他块重叠时直接放弃分栏、维持整行宽度，典型
场景是一个长事件（比如 9-17 点工作）内部嵌套了两个互不重叠的短事件
（比如 10-11 开会、13-14 午休），三个块全部整行宽度叠在一起。(2) "事件
不需要完成点击，默认没有点击跳过就算完成"——取代 REQ-019 里还需要手动
点"标记完成"按钮的模型。(3) "分数的累积有一天的延迟"——配合 (2)：默认
完成不再有点击这个动作去触发点数结算，需要一个自动结算的时机，用户
要求这个时机延迟一天，给自己一个"事后还能反悔标跳过"的窗口。

**(1) N 路重叠分栏**：`utils/blockOverlap.js` 整个重写，从"只处理两个
块互相唯一重叠的特例"改成标准的区间调度（interval partitioning，也叫
"最少会议室数"）算法：按开始时间把块分成若干"重叠簇"（簇内块通过直接
或传递重叠连在一起），簇内部按开始时间贪心分配"列"——每个块找一个已经
空出来（上一个占用者已经结束）的列放进去，找不到就开一个新列；簇最终
用到几列，簇内每个块的 `columns` 就是几。用户描述的"长事件包住两个短
事件"场景验证：长事件独占一列（整个跨度都占着），两个不重叠的短事件
共享另一列（各自在自己的时间段内，互不冲突）——不再是简单地放弃处理。
新增 `columnBoxStyle(column, columns)` 导出函数把 `{column, columns}`
换算成 CSS `left`/`right`（N 列等分宽度，列间留 2px 缝隙，最外侧边缘
8px），供 `DayTimeline.vue`/`WeekBoard.vue` 的 `blockStyle()` 直接
`Object.assign` 进 style 对象，替代原来只处理 `columns===2` 这一种情况
的写法。周期事件优先靠左的规则从"绝对保证"收窄为"开始时间相同时优先"
——分簇/分列必须严格按开始时间处理才能保证算法正确，不能为了这条规则
打乱处理顺序，这是换成通用算法后的诚实取舍。

**(2)(3) 默认完成 + 一天延迟结算**：`DayTimeline.vue` 里 REQ-019 新增
的"标记完成"按钮（`toggleDone`/`revertDone`/`CheckCircleRound`）整个
删除——不再需要用户点击任何东西来"完成"一个事件，日/周视图上每个块
只剩"跳过"和"删除"两个手动操作，标题行的按钮留白也从三个按钮的 60px
改回两个按钮的 42px。新增 `domain/rewards.settlePastDays(store)`：
只结算"今天之前"的日期（今天本身永远不结算，这就是"延迟一天"），对每
个不是 Google 来源、没被标记跳过、还没结算过（`!block.pointsSettled`）
的块，按时长 × `settings.pointsPerHour` 算点数、写入
`block.pointsSettled`/`pointsAwarded`、累加到 `state.rewardPoints`；
关联了计划关键事件的块会同时调用 `completeKeyEvent` 推进计划（按日期
从早到晚处理，保证多个待结算日期时计划推进顺序正确）。这个函数本身是
幂等的（靠 `pointsSettled` 标记天然去重，不需要额外记"结算到哪天了"的
游标），`src/App.vue` 在 `onMounted` 时调用一次，并 `watch` 由
`useNow()` 提供的"当前日期"，跨天时再触发一次，覆盖应用开着过夜的
场景。`DayTimeline.vue` 的 `toggleSkip()` 改成：标记跳过时如果这个块
已经结算过（用户是结算之后才想起要跳过的），把已经发出去的点数
（`pointsAwarded` 快照）和已经推进的计划进度都用
`domain/plans.uncompleteLastKeyEvent` 退回去——跳过在任何时候都是一次
有效的"反悔"，不因为已经结算过就失效；取消跳过则只是把状态改回默认，
不主动补发点数，交给下一次 `settlePastDays` 自然结算。`removeBlock()`
删除一个已结算的块时同样退点数，但不联动撤销计划进度（沿用 REQ-019
时就定下的简化取舍：删除只是拿掉记录，不等于"承认没做过"）。

验收：
- 一个长事件（比如 9-17 点）内部有两个互不重叠的短事件（比如 10-11、
  13-14），三个事件不再整行宽度叠在一起：长事件占一列，两个短事件
  共享另一列，都能看清标题
- 三个及以上事件互相直接重叠时也能正确分栏（等分列数），不再维持
  整行宽度堆叠
- 日/周视图的事件块上不再有"标记完成"按钮，只剩跳过和删除
- 新建一个事件、不做任何操作，等它所在的日期过去一天后，"奖励"页面
  的点数余额按这个事件的时长自动增加；今天新建的事件在明天之前不会
  计入点数
- 关联了计划关键事件的事件，结算时点数和计划进度同时推进
- 结算之后再把这个事件标记跳过，点数和计划进度都会退回去
- 跳过状态取消后，等下一次结算时机到了，会正常重新计入点数和计划
  进度
- 刷新页面后已结算/未结算的状态、点数余额都从 localStorage 完整恢复

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动文件做了语法校验；用 `node -e` 写了完整的运行时
用例验证 `computeBlockLayout()`（长事件包住两个短事件、简单两两重叠、
三方全重叠、周期事件平局优先、两个独立重叠簇共 6 种场景，结果全部
符合预期）和 `settlePastDays()`（正常结算/跳过不计分/Google 块不
计分/今天不结算/幂等/计划联动完成，全部符合预期），以及模拟
`toggleSkip()` 的退点数/退计划进度/重新结算完整链路，结果都正确；用
Grep 确认 `toggleDone`/`revertDone`/`timeline-block--done`/
`markDoneToggle` 等已删除的函数名、CSS class、文案 key 在代码里没有
残留引用。视觉分栏效果、跨天自动结算的实际体验需要用户本地
`npm run dev` 后确认（跨天场景可以通过修改系统时间或耐心等待验证）。

---

## [REQ-021] 修复"8:00-9:00 与 8:30-9:00 重叠"场景下短事件显示异常

状态：completed
模块：src/components/DayTimeline.vue, src/components/WeekBoard.vue

描述：
用户反馈"当存在 8 到 9 点的事件和 8 点半到 9 点的事件时，8 点半到 9 点
的事件显示得很奇怪"，要求调查。排查用 `node -e` 实际算出两个块的渲染
像素坐标，确认了根因：REQ-017/REQ-020 时给短时长块设的"可读性最小
高度"（20px/日视图、18px/周视图）用 `min()`/`max()` CSS 函数钳制在
"到下一个不重叠的块之前还剩多少空间"以内，但这个 `nextBlock` 判断只找
时间上**不重叠**的下一个块（`b.start >= block.end`）——8:00-9:00 和
8:30-9:00 这两个块**互相重叠**（左右分栏显示，各占一列），彼此都不会
被对方算作 `nextBlock`。于是自然高度换算成像素本来就不到 20px 的
8:30-9:00 这个块，在没有 `nextBlock` 兜底的情况下被 20px 下限直接
撑高，撑出来的部分一路越过它自己真实的结束时间（9:00），显示得比
8:00-9:00 那个块更晚结束——两个块明明同一时刻结束，读起来却不一致，
这就是"看起来很奇怪"的具体表现。用 `node -e` 算出的实际像素验证：
8:30-9:00 那个块的渲染下边缘超出真实结束位置约 6px。

修复：`blockStyle()` 里新增一层"不能超过自己真实高度"的上限，但**只在
这个块确实和别的块左右分栏（`columns>1`）时才生效**——刻意不对孤立块
（`columns===1`，旁边没有任何重叠块）也加这层限制，因为一个完全孤立的
短块撑高到可读性下限，只是往下方的空白网格里多占一点地方，不会撑穿
任何东西、也不会和别的块显示得不一致，这正是 REQ-010 时"为了可读性
可以比真实比例更高"的设计初衷，这次修复不应该连带削弱它。
`DayTimeline.vue`/`WeekBoard.vue` 两处改法完全对称。

验收：
- 存在 8:00-9:00 和 8:30-9:00 两个事件时，左右分栏显示，两个块的下
  边缘视觉上对齐（都在 9:00 那条线附近，短的那个不再明显比长的那个
  更往下延伸）
- 8:30-9:00 这个块的渲染范围不会超出 9:00 这条时间线
- 一天最后一个孤立的短时长事件（旁边没有任何重叠/紧邻的块）仍然按
  REQ-010 的设计撑到可读的最小高度，标题依然清晰可见，不受这次修复
  影响
- REQ-020 时验证过的"两个紧邻但不重叠的短事件之间有间隔"场景不受影响

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。用 `node -e` 精确模拟了
浏览器会用到的像素坐标计算（假设一个 800px 高的时间轴容器），对比了
修复前后 8:00-9:00/8:30-9:00 这对重叠块的渲染结果——修复前 8:30-9:00
块的下边缘超出真实结束位置约 6px，修复后误差降到浮点数精度范围内
（约 0，可视为完全对齐）；同时验证了三个不受影响的场景：普通孤立短块
（不分栏，仍然撑到 20px 可读性下限，不因为这次修复而被误伤）、紧邻但
不重叠的两个块（REQ-020 验证过的场景，行为不变）、不分栏的正常时长块
（行为不变）。`node --input-type=module --check` 对项目里所有
`.js` 文件做了语法校验（全部通过，本次改动只涉及 `.vue` 文件的
`<script setup>` 部分，人工核对了改动后的完整函数逻辑）。实际视觉
效果需要用户本地 `npm run dev` 后确认。

---

## [REQ-022] 起始点数改为 2000 + 平日/周末点数比率拆分 + 兑换二次确认 + 界面去除货币标识

状态：completed
模块：src/state/persistence.js, src/domain/rewards.js,
src/components/SettingsPanel.vue, src/components/RewardPanel.vue,
src/i18n/locales/{zh,en,ja}.js

描述：
用户一次提了四件事：(1) 初始点数改成 2000（不是从 0 开始）；(2) 点数
换算比率的"手感"参考是"1 小时约等于 1000 点"，并且要能在设置页分别为
"平日"和"周末"设置不同的每小时点数（而不是 REQ-019/020 时唯一一档
`pointsPerHour`）；(3) 兑换奖励时需要有确认框，不能点一下按钮就直接
扣点数；(4) 奖励的金额继续按日元参考价定，但界面上不能出现任何"钱"的
标识（日元/円/¥/JPY 这类），从用户能看到的角度看，这一切都只是"点数"。

- `persistence.js`：`createDefaultState()` 的 `rewardPoints` 从 0 改成
  2000；`settings.pointsPerHour`（单一比率）拆成
  `pointsPerHourWeekday`/`pointsPerHourWeekend` 两个字段，默认都是
  1000（用户给的"1 小时≈1000 点"是个统一的"感觉"，没有分别指定两档
  各多少，所以两个默认值先保持一致，用户可以在设置页各自调整）。旧的
  单一 `pointsPerHour` 字段不再写入，老数据里如果还带着这个字段会变成
  死数据（没有任何代码再读它），和 REQ-016 处理 `settings.phaseWeeks`
  是同一个模式，不需要专门迁移。
- `domain/rewards.js`：新增 `isWeekend(dateKey)`（用
  `utils/dateUtils.weekdayIndex()` 判断是不是周六/周日，周一起始索引
  5/6），`settlePastDays()` 结算每一天时按这一天是不是周末选用对应的
  `pointsPerHourWeekday`/`pointsPerHourWeekend`。这个"周末"判断和
  `settings.workHours.days`（自动排程的默认工作日）是两个独立概念，不
  共用同一份配置——前者是用户的个人激励尺度（"周末做的事更值钱"这种
  主观设定），后者是排程算法的业务规则，语义不同不应该混在一起。
- `SettingsPanel.vue`："奖励点数"分区从一个输入框拆成两个（平日/周末
  各一个 `n-input-number`），和原来一样即时生效、不进 draft/保存流程。
- `RewardPanel.vue`：兑换按钮外面包了一层 `<n-popconfirm>`（trigger
  插槽放按钮本身，默认插槽放确认文案"确定要用 N 点兑换「标题」吗？"），
  `@positive-click` 才真正调用 `domain/rewards.redeemReward`——按钮的
  点击不再直接触发兑换，防止手滑误触。
- 三语言文案里所有提到"日元"（`日元`/`円`/`¥`/`JPY`）的地方都改掉了：
  奖励表单/表格里数值的单位从"日元"改成"点"（`reward.valueSuffix`），
  "所需点数（日元）"这类带括注的表头简化成"所需点数"，不再暗示这是
  一笔"钱"。`reward.value` 这个数字本身完全没变（仍然是当初按日元参考
  价定出来的数值，比如佳能相机对应 429000），只是不再用"日元"这个词
  称呼它——对用户来说，这就是"兑换这个奖励需要多少点数"，日元只是
  内部取数时用过的参考基准，不是产品概念，代码注释里说明了这个取舍。

验收：
- 全新安装（或清空 localStorage）后，"奖励"页面初始点数余额显示 2000
- 设置页"奖励点数"分区能看到"平日每小时点数"和"周末每小时点数"两个
  可以分别调整的输入框，默认都是 1000
- 周六/周日发生的事件，结算时按"周末"这一档比率计算点数；周一到周五
  按"平日"这一档，两档分别调整互不影响对方
- 点击"兑换"按钮不会立刻扣点数，会先弹出一个确认框，确认后才真正扣点
  数并标记兑换；点取消则什么都不发生
- 奖励名单、设置页、兑换确认框等所有界面文字里都看不到"日元"/"円"/
  "¥"/"JPY"这类货币标识，统一只提"点"/"点数"
- 刷新页面后两档点数比率、点数余额都从 localStorage 正确恢复

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动文件做了语法校验；用 `node -e` 完整验证了新
`createDefaultState()` 的初始点数（2000）和默认比率（1000/1000）、
用真实找到的过去某个平日/周末日期分别设置不同比率（300/700）后调用
`settlePastDays()`，确认点数增量和每个块的 `pointsAwarded` 都按对应
的平日/周末比率正确计算（300 和 700，不是混用同一个数字）；用 Grep
确认三个语言文件和全部源码里已经找不到"日元"/"円"/"¥"/"JPY"这类货币
用词残留，也确认了新的 `pointsPerHourWeekday`/`pointsPerHourWeekend`
字段在 `persistence.js`/`domain/rewards.js`/`SettingsPanel.vue`/三个
locale 文件之间的引用是完整、一致的。`<n-popconfirm>` 的实际弹出/确认
交互效果、以及点数余额初始值/设置页新增字段的视觉呈现，需要用户本地
`npm run dev` 后确认。

---

## [REQ-023] 起始点数清零 + 刷新 17 项奖励的参考价格

状态：completed
模块：src/state/persistence.js

描述：
用户要求"清空目前账户的点数，和更新奖励的点数"。先用 AskUserQuestion
确认了两点：(1) 这里能改的只有代码里的默认值（影响全新安装/清空
localStorage 后的初始状态），没法直接改用户浏览器里已经存在的实际
数据，用户确认就是要改代码默认值；(2) "更新奖励的点数"是要重新搜一遍
现在的参考价格、刷新数字（不是按新比例整体缩放）。

- `createDefaultState()` 的 `rewardPoints` 从 REQ-022 时定的 2000 改回
  0——不带任何起始余额，从头开始攒。
- `SEED_REWARDS` 的 17 项数值用 WebSearch 重新查了一遍：佳能 EOS R6
  Mark III 从官方发布价 429000 改成当前市场实际流通价 386000（发布
  近 9 个月后市场价已经降到官方价以下，取当前实际能买到的价格更贴近
  "参考价"的本意）；RF45mm 镜头（66000）/AirPods Pro（39800）/
  MacBook Air（224800）这三项官方定价至今没变，数字不动；索尼耳机
  从 59400 调整到 60000、Apple Watch 从 64800 调整到 65800（这次查到了
  比上次更明确的数字）；旅行/西服/运动装备这几项按同样的人民币参考
  预算，用当天查到的最新汇率（约 1 CNY ≈ 23.97 JPY，此前用的是
  23.8）重新换算取整，数字有小幅上调（比如马来西亚旅行从 190000 调到
  192000）。

验收：
- 全新安装（或清空 localStorage）后，"奖励"页面初始点数余额显示 0
- 奖励名单里的 17 项数值按上面列的新数字显示（佳能相机 386000、
  索尼耳机 60000、Apple Watch 65800，其余旅行/装备类小幅上调）
- 刷新页面后点数余额（0）和奖励数值从 localStorage 正确恢复（仅对
  全新用户生效，已有 `rewards` 数据的用户不会被重新种入，这是
  REQ-018 就定下的既有规则）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验通过；用 `node -e` 调用 `createDefaultState()` 确认
`rewardPoints` 为 0、17 项奖励数量和数值都符合预期；用 WebSearch
核对了佳能相机当前市场价、索尼耳机/Apple Watch/AirPods Pro/MacBook
Air 的日本现价，以及当天人民币兑日元汇率，均为 2026-07-22 当天查到
的数据，来源可追溯。界面实际呈现需要用户本地确认。

---

## [REQ-024] 数据层从 localStorage 改为文件型数据库（浏览器内 SQLite + OPFS）

状态：completed
模块：新增 src/state/db.js；src/state/persistence.js, src/state/store.js,
src/main.js, index.html, vite.config.js, package.json, README.md

描述：
用户要求把数据层从 localStorage 换成文件型数据库，同时兼容 MySQL 或
其它数据库。用 AskUserQuestion 分三轮确认了最终方案：(1) 要同时支持
文件数据库和 MySQL，唯一可行的路子是新增一个 Node.js 后端服务（浏览器
没法直接连 MySQL），但用户明确表示"只需要文件型的 SQLite 就行，不增加
后端"——放弃了 MySQL 兼容这个范围，换成纯浏览器内实现；(2) 具体技术栈
用户指定为官方 `@sqlite.org/sqlite-wasm` + OPFS（Origin Private File
System）；(3) 现有 localStorage 数据不需要迁移入口，直接开始用新数据库
即可。

- 新增 `src/state/db.js`：用 `sqlite3Worker1Promiser`（官方包提供的
  Worker + Promise 封装，不需要自己写 Worker 脚本）在 Worker 线程里跑
  SQLite，`vfs=opfs` 把数据库文件持久化成浏览器私有文件系统里一个真实
  存在的 `lifespark.sqlite3` 文件。只建一张单行表把整份状态存成一个
  JSON 字符串（不做关系型多表拆分——`domain/*.js` 里几十个函数都是照着
  "读写同一个内存里的响应式 state 对象"这个模型写的，拆表需要重写这些
  函数，超出这次任务范围），`readStateJson`/`writeStateJson` 两个函数
  对外。
- `src/state/persistence.js` 的 `loadState`/`saveState` 从同步（读写
  localStorage）改成异步（读写 `state/db.js`），`createDefaultState`/
  `fillMissingDefaults` 完全不变。
- `src/state/store.js` 用"先同步创建占位默认状态、再异步覆盖真实数据"
  的策略吸收这次异步化：新增 `initStore()`，模块加载时 `state` 已经是
  一个 `reactive(createDefaultState())`，`initStore()` 异步读完真实
  数据后 `Object.assign` 整体覆盖进去，`watch()` 自动保存也是在这之后
  才启动（避免占位状态被误存回数据库）。`getState()`/`setState()` 这两
  个对外接口签名完全不变，`domain/*.js`/`calendar/*.js` 零改动。
- `src/main.js` 改成 async `bootstrap()`，挂载 Vue 应用前
  `await initStore()`；`index.html` 的 `#app` 里加了一段纯内联样式的
  "加载中…"占位（Vue 挂载时会自动替换掉，不需要手动清理）。
- `vite.config.js` 按官方文档要求加了 `server.headers`/`preview.headers`
  的 COOP/COEP 响应头（OPFS 需要页面处于跨源隔离状态），以及
  `optimizeDeps.exclude`（这个包内部动态加载自己的 wasm/worker 文件，
  esbuild 预构建会打乱路径）。`package.json` 新增
  `@sqlite.org/sqlite-wasm` 依赖。`README.md` 补充了数据持久化方式的
  说明、COOP/COEP 部署要求、OPFS 独占写入的已知局限。

验收：
- 全新打开应用（清空过 OPFS 数据的情况下），能看到短暂的"加载中"提示，
  随后正常显示默认状态（12 个种子活动、17 项奖励、0 点数等）
- 在应用里做任意修改（比如添加一个活动），刷新页面后修改保留——数据
  确实被持久化了，不是内存态
- 后续开发/使用需要 `npm install` 拉取新依赖，`npm run dev`/`npm run
  build`/`npm run preview` 都能正常工作（COOP/COEP 头已经在
  `vite.config.js` 里配好）
- `domain/*.js`/`calendar/*.js` 里的函数完全不用改，`store.setState()`
  的调用方式和之前完全一样

验证：
按 AGENTS.md P2-2，未代为执行 `npm install`/`npm run dev`（`@sqlite.org/
sqlite-wasm` 还没有真的装进 `node_modules`，需要用户本地跑一次
`npm install`）。用 WebSearch + WebFetch 核对了官方 GitHub 仓库
`sqlite/sqlite-wasm` 的 README 和一篇具体的 Vue 3 集成教程，确认了
`sqlite3Worker1Promiser` 的调用方式、`vfs=opfs` 的文件名语法、
COOP/COEP 响应头和 `optimizeDeps.exclude` 这两处 Vite 配置要求——这些
都是第一次在本项目里用到的新技术，用 WebFetch 直接核对官方文档，不是
凭训练记忆编的，和 REQ-005/007 验证第三方包具名导出是同一类"错了就
可能整个功能起不来"的风险，值得核实。用 `node --input-type=module
--check` 对所有改动的 `.js` 文件做了语法校验。**额外做了一次端到端的
运行时验证**：在本地临时搭了一个模拟 `@sqlite.org/sqlite-wasm` 包（一个
基于内存 Map 的假 `sqlite3Worker1Promiser`，只用于验证 `db.js`/
`persistence.js`/`store.js` 三层之间的调用链路和 Promise 时序是否正确，
不测试真实 WASM/OPFS 行为），验证了：全新数据库读出 `null`、写入/读回
的字符串一致、`loadState()` 在空数据库上正确返回默认状态、
`saveState`+`loadState` 往返能正确保留自定义数据（不会被重新播种）、
`store.js` 的 `initStore()` 能把占位状态正确替换成真实数据、防抖自动
保存能在 setState 之后正确把变更写回数据库——全部通过，验证后已删除
临时的模拟包和测试脚本，不会遗留在项目里。真实浏览器环境下的 OPFS
行为（跨源隔离是否生效、真实的 WASM 加载耗时、Safari/Firefox 等
浏览器的兼容性）需要用户本地 `npm install && npm run dev` 后实际打开
浏览器确认。

---

## [REQ-025] 修复 REQ-024 升级后旧数据"消失"——自动从 localStorage 恢复

状态：completed
模块：src/state/persistence.js

描述：
用户反馈"之前的数据不见了"。排查确认是 REQ-024 的预期副作用：那次改动
只是让应用不再读/写 `localStorage`（改成读写 OPFS 数据库），但完全没有
清空或迁移 localStorage 里的旧数据——旧数据其实原样躺在浏览器里，只是
新数据库是空的，应用启动时看到的是全新的默认状态，才会显得"数据不见
了"。REQ-024 定方案时用户明确说过"不需要迁移入口"，但那是指"不需要专门
做一个手动导入按钮"，不代表"数据丢了也不用管"——这次是直接把已经发生
的数据丢失问题修掉，不是重新引入 REQ-024 时被否决的迁移入口。

`persistence.js` 的 `loadState()` 新增一层自动恢复：只在
`readStateJson()` 返回 `null`（新数据库确实从来没写过，即"REQ-024
升级后第一次打开"这个场景，不是数据库已经有数据但内容不合预期的
情况）时，才去看 `localStorage` 里 `lifespark:v1` 这个旧 key 还在不在；
找到就当作用户的真实数据用起来（照样过一遍 `fillMissingDefaults()`
补齐缺失字段），并立刻写回新数据库，下次启动就不再需要这个恢复分支。
新数据库已经有数据（不管是种子默认值还是之前已经恢复过的数据）时，
永远不会再去看 localStorage，避免用旧数据覆盖掉之后的修改。这个恢复
过程是完全自动、静默的（`console.info` 留一条日志方便排查，没有做成
用户需要点击确认的弹窗），符合"打开应用就自动找回数据"这个最直接的
诉求。

验收：
- 曾经用过 REQ-024 之前版本、localStorage 里还留着旧数据的用户，升级
  到这次改动之后打开应用，之前的活动库/计划/奖励/点数等数据能自动
  找回，不需要任何手动操作
- 找回一次之后，后续的修改正常保存在新数据库里，不会因为 localStorage
  里还留着更早的旧数据而被覆盖回去
- 全新用户（浏览器里从来没有 `lifespark:v1` 这个 key）不受影响，仍然
  是正常的全新默认状态

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验通过。用 `node -e` 在本地临时搭的模拟 `@sqlite.org/
sqlite-wasm` 包基础上，额外模拟了 `window.localStorage`（用一个内存
Map 实现 `getItem`/`setItem`），端到端验证了完整场景：预先在模拟
localStorage 里塞入一份带自定义活动/奖励/点数的旧数据，首次
`loadState()` 正确识别并恢复出这份数据（活动标题、奖励标题、点数余额
都对得上），且这份数据被正确写回了模拟数据库；紧接着改动模拟
localStorage 里的内容再调用一次 `loadState()`，确认第二次不会再被
localStorage 的新内容覆盖（因为数据库这时已经有数据了）。验证完删除
了临时模拟包和测试脚本。真实浏览器环境下的实际找回效果需要用户本地
`npm install && npm run dev` 后打开确认。

## [REQ-026] REQ-025 自动恢复错过窗口——加一个手动恢复按钮

状态：completed
模块：src/state/persistence.js, src/state/store.js,
src/components/SettingsPanel.vue, src/i18n/locales/{zh,en,ja}.js

描述：
用户按 REQ-025 的方案跑了 `npm install && npm run dev`，反馈"数据还是
没恢复"。排查确认 REQ-025 的自动恢复只在 `readStateJson()` 返回
`null`（新数据库确实从来没写过）这一次机会窗口内生效——用户在这次
自动恢复实现之前应该已经打开过一次 REQ-024 之后的新版本（哪怕什么都
没做），新数据库大概率已经被写入过一行状态，窗口已经关闭，自动恢复
不会再触发。用户随后确认了浏览器是 Chrome，并贴出了自己 localStorage
里保存的真实旧数据作为佐证——数据确实还在，只是自动恢复的一次性窗口
已经错过。

中途一度尝试再加一个"粘贴 JSON 手动导入"的文本框作为第三条恢复路径
（`persistence.js` 导出 `parseImportedState`、`store.js` 加
`importState`、`SettingsPanel.vue` 加 textarea），被用户明确叫停："不
需要实现数据恢复的功能 帮我吧我给你的数据恢复进去就行"——用户要的是
用已有的东西把数据恢复回去，不是再造一个新功能，这些改动已经全部
回退（`parseImportedState` 的解析逻辑重新内联回
`readLegacyLocalStorageState()`，`importState`/textarea 相关代码和
i18n key 全部删除）。

最终方案：把 REQ-025 里判断"要不要看 localStorage"的逻辑（原来叫
`recoverFromLegacyLocalStorage()`，内部函数）拆成两部分——纯读取部分
改名 `readLegacyLocalStorageState()` 并导出，不再耦合"只在数据库为空
时才读"这个前提；`loadState()` 内部保留一个 `autoRecoverFromLegacyLocalStorage()`
包一层用于 REQ-025 原有的自动恢复行为。`state/store.js` 新增
`restoreFromLegacyBackup()`，直接调用导出的
`readLegacyLocalStorageState()`，不管数据库当前状态如何，找到旧数据
就整体覆盖当前 state 并写回数据库。`SettingsPanel.vue` 新增"数据恢复"
分区（紧跟在"语言"分区之后），一个按钮 + `<n-popconfirm>` 二次确认
（因为会整体替换当前数据库内容），对应 i18n key 加进 zh/en/ja 三个
locale 文件。

验收：
- 即便 REQ-025 的自动恢复窗口已经错过（数据库里已经有数据，不管是
  种子默认值还是别的），用户仍然可以在设置页手动点按钮，从 localStorage
  强制恢复旧数据
- 点击按钮会先弹出二次确认，说明这个操作会替换掉当前数据库内容，避免
  手滑覆盖掉用户后续在新数据库里已经产生的修改
- 恢复成功/未找到旧数据两种结果都有对应的 toast 提示
- 没有多余的"粘贴 JSON 导入"功能残留在代码或 i18n 文件里

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对所有改动过的 `.js` 文件校验通过。复用 REQ-025 验证时搭的
临时模拟 `@sqlite.org/sqlite-wasm` 包 + 模拟 `window.localStorage`，
端到端验证：先让模拟数据库里写入一份"无关"的已有数据（模拟窗口已错过
的场景），再往模拟 localStorage 塞入一份不同的旧数据，调用
`restoreFromLegacyBackup()`，确认它无视数据库当前内容、正确用
localStorage 里的数据整体覆盖并写回。验证完删除了临时模拟包和测试
脚本。用 Grep 确认项目内不再有 `importState`/`parseImportedState`/
`dataImport` 相关代码或 i18n key 残留（本条描述里"粘贴 JSON 导入"那次
尝试回退后的最终检查——那次尝试没有正式立项独立的 REQ 编号，回退发生在
定稿前，不要和后面的 REQ-027 混淆）。
真实浏览器环境下点击按钮的实际恢复效果需要用户本地确认。

## [REQ-027] 响应式适配——兼容平板和小屏笔记本

状态：completed
模块：css/layout.css, css/timeline.css, css/components.css,
src/App.vue, src/components/SidebarNav.vue,
src/components/SettingsPanel.vue, src/components/RewardPanel.vue,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"帮我兼容一下各种设备的显示"。排查发现项目里所有 CSS 文件
（`css/*.css`）此前没有一处 `@media` 查询——`.app-shell` 是固定
`height:100vh` 的 flex 布局，侧边栏是固定 `--sidebar-width: 248px`，
周视图 7 天横向等分，纯粹是一套只考虑桌面宽屏的布局，窄一点的设备上
侧边栏会挤占大半视口、周视图 7 列会被压得看不清内容。

用 AskUserQuestion 确认了三个关键决策（这类"要不要为手机做专门布局"
"侧边栏窄屏下怎么交互""周视图窄屏下怎么处理"的取舍属于项目专属产品
决策，不是纯技术问题，按 AGENTS.md P0-3 需要用户来定，不能只凭"行业
惯例"自己决定）：
1. 目标设备范围定在平板 + 小屏笔记本（断点选 900px），不单独为手机
   竖屏（<480px）做专门布局，但也不会在这个范围内整个错位。
2. 侧边栏窄屏下改成默认收起的汉堡菜单抽屉（覆盖式，带遮罩层点击收起）。
3. 周视图（7 天并排的时间轴）窄屏下保留 7 列不变，横向滚动查看，不改成
   单日视图或压缩列宽——用户明确要"一周 7 天一起看"这个信息结构不能丢。

改动：
- `App.vue`/`SidebarNav.vue`：`uiState` 新增 `sidebarOpen`；新增汉堡
  按钮（`.sidebar-toggle`，恒在 DOM 里，靠 CSS 在宽屏隐藏）+ 遮罩层
  （`.sidebar-backdrop`，`v-if` 控制）；`.sidebar` 加 `sidebar--open`
  修饰类；点导航项后顺带收起抽屉。
- `css/layout.css`：`max-width:900px` 断点下 `.sidebar` 从常驻改成
  `position:fixed` + `transform:translateX(-100%)` 的滑入式抽屉，
  `.main-content` 内边距收紧并留出汉堡按钮的空间。
- `css/timeline.css`：同一断点下 `.week-timeline` 加
  `overflow-x:auto`，每天一列设 `min-width:90px` 保证可读，
  `.week-timeline__hours`（小时刻度列）改 `position:sticky; left:0`
  固定在滚动容器左侧。
- `css/components.css`：`.month-grid__cells` 窄屏下行高从 92px 降到
  76px（7 列本身是 `fr` 单位的 CSS Grid，天然会随视口收缩，不需要横向
  滚动，只是原来的固定行高配变窄的列显得"细高"）；新增通用
  `.table-scroll`（`overflow-x:auto`，无媒体查询限制，只有真的超出容器
  宽度才生效）包住 `SettingsPanel.vue` 的配额表格和 `RewardPanel.vue`
  的两个奖励表格，避免窄屏下表格内容被截断或撑破布局。
- 新增 i18n key `nav.toggleSidebar`（汉堡按钮的 `aria-label`），加进
  zh/en/ja 三个 locale 文件。

验收：
- 视口宽度收窄到平板/小屏笔记本范围（约 768px～1024px）时，侧边栏自动
  收起为抽屉，点击左上角汉堡按钮能展开，点遮罩层或点任意导航项能收起
- 窄屏下周视图仍能看到完整的 7 天列，通过横向滚动查看被遮住的部分，
  小时刻度始终固定在左侧可见，不会跟着滚走
- 窄屏下设置页的配额表格、奖励页的两个表格不会把页面撑出横向溢出，
  必要时表格自身可以横向滚动
- 宽屏（>900px）下视觉和交互与改动前完全一致，不引入任何回归

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对改动过的 `.js`（i18n locale 文件）校验通过；CSS 文件人工
核对了大括号配对数量一致（`layout.css`/`timeline.css`/`components.css`
各自 `{`/`}` 数量相等）。项目里已经装了 `@vue/compiler-sfc`
（`node_modules` 下确认存在，说明用户本地已经跑过 `npm install`），临时
在项目根目录放了一个一次性脚本调用 `parse`/`compileScript`/
`compileTemplate` 对改动过的 4 个 `.vue` 文件（`App.vue`/
`SidebarNav.vue`/`SettingsPanel.vue`/`RewardPanel.vue`）做了静态编译
校验，全部通过，验证完删除了这个临时脚本。真实浏览器下窄屏的实际视觉
效果（断点是否顺手、抽屉动画是否流畅）需要用户本地打开开发者工具的
设备模拟器或真机确认。

## [REQ-028] 重置奖励点数，从本周一开始重新计算

状态：completed
模块：src/domain/rewards.js, src/App.vue, src/state/persistence.js

描述：
用户要求"奖励点数帮我重置一下，从这周一开始计算"。这不是简单改一下
`createDefaultState()` 里的默认起始点数就能解决的——那只影响全新用户，
用户现在已经有 REQ-024 迁移之后跑起来的真实 OPFS 数据库，需要一次真正
作用在这份实际数据上的操作，而 AI 没有办法直接连进用户浏览器改
OPFS 里的内容，只能把这个操作写成代码，让它在用户下次打开应用时自动
执行一次。

新增 `domain/rewards.resetPointsFromMonday(store)`：用
`utils/dateUtils.getWeekStart(new Date())` 算出"本周一"，分两段处理
`state.dayTimelines`——本周一之前的块（跳过 Google 来源和已跳过的）
不管有没有结算过，一律标记 `pointsSettled:true, pointsAwarded:0`，
确保以后 `settlePastDays` 永远不会再把这些天的点数计进余额；本周一到
昨天之间已经结算过的块，反过来撤销结算标记，交给调用方紧接着重新调
`settlePastDays`，点数会计入清零后的新余额，不会跟着一起消失——这样
"从本周一算起"这几天已完成的事件不会丢，符合字面意思。不动
`state.plans` 的完成进度（`completeKeyEvent` 对已完成的关键事件本身
是幂等的，重新结算不会有副作用），用户只要求重置点数，没要求重置
计划进度。最后把 `rewardPoints` 置零，写入
`state.meta.pointsResetAt` 时间戳做"只执行一次"的幂等标记。

`App.vue` 的 `onMounted` 里，在原有的 `settlePastDays(store)` 之前新增
`if (!state.meta.pointsResetAt) resetPointsFromMonday(store)`——必须排在
`settlePastDays` 之前，这样本周一到昨天之间被撤销结算标记的块能在同一
次挂载里立刻被重新结算，用户刷新一次就能看到正确余额，不用刷新两次。
`persistence.js` 的 `createDefaultState()` 给 `meta` 加了默认字段
`pointsResetAt: null`，`fillMissingDefaults()` 已有的浅展开合并不需要
改动就能兼容老数据。

验收：
- 用户下次打开应用（或刷新页面）时，点数余额自动清零，然后立刻按本周一
  到昨天之间已完成、原本已经算过点数的事件重新计算出新余额，不需要
  用户做任何操作
- 本周一之前的事件不管有没有结算过，都不会再计入余额（哪怕以后又把
  某个本周一之前的块从跳过改回未跳过）
- 关联的计划完成进度不受影响
- 重置只会执行一次：下次再刷新页面（不管过了多久）都不会重新清零余额

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对改动的 `.js` 文件校验通过；`domain/rewards.js` 这条链路
（依赖 `utils/id.js`/`utils/dateUtils.js`/`domain/plans.js`，都不依赖
Vue）可以直接用 Node 跑真实源码测试：构造一个模拟 `store`（内存对象 +
`getState`/`setState`），造出"上周一未结算的块""上周一已跳过的块"
"上周一 Google 来源的块""本周已结算的块"四种场景，验证
`resetPointsFromMonday` 之后各自的 `pointsSettled`/`pointsAwarded`
符合预期、`rewardPoints` 清零、`meta.pointsResetAt` 被写入；紧接着调用
`settlePastDays` 验证本周的块被正确重新结算、余额变成本周点数总和、
上周一的块没有被重新计入。用 `@vue/compiler-sfc`（项目已装）额外静态
编译校验了 `App.vue` 改动没有语法问题。验证完删除了临时测试脚本。真实
浏览器下的实际效果需要用户本地刷新页面确认。

## [REQ-029] 删除数据恢复功能

状态：completed
模块：src/components/SettingsPanel.vue, src/state/store.js,
src/state/persistence.js, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"数据恢复功能帮我删除掉"——REQ-026 加的手动恢复按钮已经完成
了它的使命（用户此前反馈数据丢失，最终确认真实数据已经通过这个按钮
成功恢复回 OPFS 数据库），现在不再需要，留着只是设置页里一个容易手滑
造成"整体替换当前数据库内容"的危险按钮。

删除范围（"数据恢复功能"理解为用户在设置页能看到、点到的那个手动入口，
不包括 REQ-025 那套完全静默、无 UI 的自动恢复安全网——两者服务的目的
不同，自动恢复不构成用户能感知到的"功能"，留着不产生任何界面影响，
删掉反而会削弱这次 OPFS 迁移对极端情况的兜底能力，所以没有一并删除；
如果这个判断和用户预期不符，后续可以再单独处理）：
- `SettingsPanel.vue`：删除"数据恢复"分区（说明文字 + 按钮 +
  `<n-popconfirm>`）、`handleRestoreLegacy()` 函数、
  `restoreFromLegacyBackup` 的 import。
- `state/store.js`：删除 `restoreFromLegacyBackup()` 导出函数、
  `readLegacyLocalStorageState` 的 import。
- `state/persistence.js`：`readLegacyLocalStorageState()` 改回不导出的
  内部函数（唯一的调用方又变回同文件内的 `autoRecoverFromLegacyLocalStorage()`），
  更新了两处引用了 `restoreFromLegacyBackup()` 的注释，说明它已经被
  删除、错过 REQ-025 自动恢复窗口的情况现在没有手动补救手段。
- 三个 locale 文件：删除 `settingsView.dataRecovery*`（`Section`/
  `Hint`/`Button`/`Confirm`/`Success`/`NotFound`）共 6 个 key。

验收：
- 设置页不再显示"数据恢复"分区
- 项目里不再有 `restoreFromLegacyBackup`/`handleRestoreLegacy`/
  `dataRecovery*` 的任何引用（历史注释里提及 REQ-026 做过什么不算）
- REQ-025 的自动恢复逻辑（`loadState()` 里那套）不受影响，行为和删除前
  完全一致

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对改动的 `.js`/locale 文件校验通过；`@vue/compiler-sfc`
静态编译校验了 `SettingsPanel.vue` 没有语法问题。用 Grep 确认
`restoreFromLegacyBackup`/`handleRestoreLegacy`/`dataRecovery` 在
`src/` 下只剩历史说明性注释、没有任何活代码或 i18n key 引用。

## [REQ-030] 页面刷新加载状态加个动效过渡，不要直接黑屏

状态：completed
模块：index.html, src/main.js

描述：
用户反馈"关于页面刷新的时候的加载状态 帮我给个动效过渡 不要直接黑屏"。
REQ-024 时加的加载占位是纯黑底 + "加载中…"文字，静态、无动效，而且
嵌套在 `#app` 内部——Vue `mount('#app')` 会把 `#app` 整体替换掉，这个
占位元素完全没机会做退场过渡，体验上是"黑屏硬切到界面"。

`index.html`：把 `#app-loading` 改成 `#app` 的兄弟节点（不再嵌套在
`#app` 内部），内容改成一个 CSS 边框旋转 spinner + 文字，整个容器有
入场淡入动画；相关样式写在 `<head>` 里的内联 `<style>`，颜色手抄一份
`css/variables.css` 深色主题默认值，不直接引用变量（`variables.css`
要等 `main.js` 的 JS import 执行后才生效，浏览器刚解析到这里时可能还
没定义，用变量有一瞬间样式缺失的风险）。`src/main.js`：新增
`fadeOutLoadingScreen()`，在 Vue 挂载完成之后调用——先让应用内容在底下
渲染好，再给加载层加一个触发 CSS `transition` 的 class，`setTimeout`
等过渡结束后整个移除这个元素。效果是黑色加载层平滑淡出、露出下面已经
渲染好的界面，而不是应用内容瞬间蹦出来顶掉黑屏。

验收：
- 刷新页面时能看到一个有动效（旋转 spinner + 淡入/淡出）的加载过渡，
  不是静态的纯黑屏
- 应用真正挂载完成后，加载层平滑淡出，不是瞬间消失/瞬间被顶掉
- 加载层本身不依赖任何还没加载完的应用 JS/CSS（不能反过来因为等应用
  资源而延迟加载层本身的显示）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验 `main.js` 通过；`index.html` 人工核对了标签配对和 CSS
大括号数量一致。真实浏览器下的动效观感（spinner 转速、淡出时长是否
顺手）需要用户本地刷新页面确认。

## [REQ-031] 奖励名单点数价格换成最新日元参考价

状态：completed
模块：src/domain/rewards.js, src/state/persistence.js, src/App.vue

描述：
用户要求"我的奖励名单的点数价格帮我换成日元的价格点数"。用
AskUserQuestion 确认具体所指：用户选择"数值本身改成最新日元参考价"，
不是仅仅换个显示单位——奖励名单的数值从一开始（REQ-018/019）就是按
日元参考价定的，REQ-023 时刷新过一次到 2026-07-22 查到的最新价格
（`persistence.js` 的 `SEED_REWARDS`），但用户实际在用的奖励名单是
REQ-026 从旧版本 localStorage 备份恢复回来的真实数据，`fillMissingDefaults()`
只在 `parsed.rewards` 完全不存在时才会种入 `SEED_REWARDS`，用户已有的
奖励条目不会跟着 REQ-023 那次刷新自动更新，停留在更早的数值上。

新增 `domain/rewards.refreshRewardValuesFromSeedPrices(store)`：按
`reward.title` 在 `SEED_REWARDS` 里查最新价格，查到就覆盖
`reward.value`；查不到（标题被用户改过，或者是不在种子清单里的自定义
奖励）的条目原样保留，不猜测应该值多少点数。`persistence.js` 把
`SEED_REWARDS` 改成导出（之前是模块内部常量）供这个函数引用。界面上
仍然一律只说"点数"，不加任何货币符号——这次只是把数值对齐到最新参考价，
不是重新在界面上标出"日元"这个单位（REQ-022 的决定不变）。`App.vue`
的 `onMounted` 按需调用一次，用 `state.meta.rewardValuesRefreshedAt`
做"只执行一次"的幂等标记（机制和 REQ-028 的 `pointsResetAt` 完全一样），
避免每次刷新页面都重新覆盖用户之后自己在奖励页手动改过的价格。

验收：
- 用户下次打开应用时，奖励名单里标题能在 `SEED_REWARDS` 17 项清单里
  找到对应项的，价格自动更新为最新日元参考价
- 找不到对应标题的自定义奖励不受影响
- 只执行一次：下次再刷新页面不会重新覆盖用户之后手动改过的价格

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对改动的 `.js` 文件校验通过。`domain/rewards.js` 现在经
`state/persistence.js` 间接依赖 `state/db.js` -> `@sqlite.org/sqlite-wasm`，
这个包的 `package.json` `exports` 字段给纯 Node 环境解析到
`dist/node.mjs`（只有 default 导出，没有具名导出），没法直接
`node xxx.mjs` 跑通完整 import 链路——这是这个包本身 Node/浏览器双构建
产物的差异（Vite 开发/构建时走的是 `browser`/`import` 条件，具名导出
齐全，实际应用不受影响），不是这次改动引入的问题。改用手抄一份真实
`SEED_REWARDS` 数据 + 完全相同的算法单独验证：标题匹配的条目正确更新
为最新价格、找不到标题的自定义条目不受影响、列表边界项（第一项/最后
一项）都能正确处理、`meta.rewardValuesRefreshedAt` 被正确写入，全部
通过。验证完删除了临时测试脚本。真实浏览器下的实际效果需要用户本地
刷新页面确认。

## [REQ-032] 计划支持编辑（标题+关键事件），关键事件列表加展开/收起

状态：completed
模块：src/domain/plans.js, src/components/PlanPanel.vue,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户提出两点：（1）"计划设置可以进行修改，现在修改不了"——原来
`PlanPanel.vue` 只支持创建整份计划、删除整份计划、往末尾追加/删除
关键事件，没有编辑入口（改标题、改某个已有关键事件的标题/时长都做不
到）；（2）"计划的显示也要进行修改，计划分成很多事件，现在是直接
显示出来的，我要通过点击可以展开列表和关闭列表的显示，通过某种方式
显示当前进度"——关键事件列表原来总是整个渲染出来，计划里事件一多就
显得很长。用户明确要求"不要询问我任何细节，按照你的推荐帮我执行"，
以下实现方式均为自主决定。

`domain/plans.js` 新增 `updatePlan(store, planId, patch)`（目前只有
`title` 会被用到）和 `updateKeyEvent(store, planId, keyEventId, patch)`
——后者只在关键事件还没完成时才会真正应用改动，已完成的静默忽略，和
`removeKeyEvent` 保护已完成记录是同一个道理（已完成是"做过什么"的
历史记录，编辑会让它失真）。

`PlanPanel.vue`：
- 计划标题、每个未完成的关键事件都加了行内编辑（铅笔图标点开变成
  输入框，勾选保存/叉号取消），复用已有的 `reactive` 草稿模式。
- 关键事件列表默认收起，进度条下方加一个可点击的展开/收起按钮
  （chevron 图标转向），纯界面状态（`reactive({})`，不写进 store，
  不需要跨会话记住）。进度条（`n-progress`）、"{done}/{total} 已完成"
  标签、"当前待完成：xxx"提示这几个摘要信息留在收起状态下依然可见——
  这就是"通过某种方式显示当前进度"的实现，复用已有元素，没有新增专门
  的进度展示组件。

验收：
- 能编辑已创建计划的标题、能编辑还没完成的关键事件的标题/时长；已完成
  的关键事件没有编辑入口
- 关键事件列表默认收起，点击按钮能展开/收起；收起状态下进度条和"当前
  待完成"提示仍然可见
- 编辑不影响计划的完成进度计算

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check`/`@vue/compiler-sfc` 静态编译校验通过。用 Node 直接跑
`domain/plans.js` 真实源码（这条依赖链只依赖 `utils/id.js`，不依赖
Vue/store/db，可以直接 import）：创建一份两个关键事件的计划，验证
`updatePlan` 正确改标题、`updateKeyEvent` 正确改未完成关键事件的
标题/时长，完成第一个关键事件后再尝试编辑它，验证被正确拒绝（内容
不变），`computePlanProgress` 不受编辑操作影响，全部通过，验证完删除
临时脚本。真实浏览器下的交互观感需要用户本地确认。

## [REQ-033] 奖励页面清空已兑换数据

状态：completed
模块：src/domain/rewards.js, src/state/persistence.js, src/App.vue

描述：
用户要求"奖励页面的已兑换数据帮我清理掉"。`deleteReward` 原本故意
保护已兑换的条目不让删（"用点数换到了什么"的历史记录，见该函数
注释），这次是用户明确要求绕开这层保护批量清空。新增
`domain/rewards.clearClaimedRewards(store)`：过滤掉 `state.rewards`
里 `claimed:true` 的条目，待兑换的不受影响。和 REQ-028/REQ-031 一样
是一次性操作而不是常驻功能，`App.vue` 挂载时按需自动执行一次，用
`state.meta.claimedRewardsClearedAt` 做幂等标记，`persistence.js` 的
`createDefaultState()` 给这个字段加了默认值 `null`。

验收：
- 用户下次打开应用时，奖励页面的"已兑换"列表被清空，待兑换列表不受
  影响
- 只执行一次：下次再刷新页面不会重新触发（不会清空用户之后自己产生的
  新兑换记录）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验通过。逻辑是单行 `Array.filter`，通过代码审查确认正确性
（`!reward.claimed` 过滤条件和 `deleteReward` 里反向的保护条件
`r.id !== id || r.claimed` 互为镜像，容易交叉核对）。真实浏览器下的
实际效果需要用户本地刷新页面确认。

## [REQ-034] 奖励页新增手动"重置点数"按钮

状态：completed
模块：src/components/RewardPanel.vue, src/i18n/locales/{zh,en,ja}.js

描述：
用户在这次消息里又提了一次"清空当前点数，从这周开始重新计算，并且
计算会有一天的延迟，你看看采取哪种方式实现起来比较方便"——这和
REQ-028 是同一个需求，但 REQ-028 的 `resetPointsFromMonday` 是靠
`meta.pointsResetAt` 做"只执行一次"的自动迁移，已经执行过就不会再
自动触发。用户重复提出同样的需求，说明这类"重置一下"的操作可能会
反复出现，比起每次都要再加一次一次性迁移代码等用户刷新页面，一个
随时可以点的按钮更方便——这是用户"你看看采取哪种方式实现起来比较
方便"这句话开放式征求的实现建议，也是"不要问我细节，按你的推荐执行"
下的自主决定。

`RewardPanel.vue` 的点数余额 `n-tag` 旁边新增"重置点数"按钮，外层
`<n-popconfirm>` 二次确认，点击直接调用已有的
`domain/rewards.resetPointsFromMonday`（不看 `meta.pointsResetAt`，
那个字段只控制 `App.vue` 的自动触发，不影响这个手动按钮）。复用
REQ-028 已经写好并测试过的函数，没有新增 domain 层代码。

验收：
- 奖励页面能看到"重置点数"按钮，点击后有二次确认，确认后点数余额
  清零并从本周一开始重新计算（本周一到昨天已完成的事件会被重新计入，
  今天不计入——一天延迟结算的规则不变）
- 可以重复点击，每次都重新执行（不受 `meta.pointsResetAt` 限制）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`@vue/compiler-sfc` 静态
编译校验 `RewardPanel.vue` 通过。复用的 `resetPointsFromMonday` 本身
在 REQ-028 时已经用 Node 端到端测试验证过正确性，这次只是新增一个
调用入口，不涉及函数内部逻辑改动，未重复测试其内部行为。真实浏览器
下的按钮交互需要用户本地确认。

## [REQ-035] 体验库改成带图片的卡片

状态：completed
模块：src/domain/activityPool.js, src/components/ActivityCard.vue,
src/components/ActivityLibraryPanel.vue, css/components.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"关于体验库，做成卡片的类型并设置一下图片，不然就设置成
列表"——把两个选项的取舍交给我决定。排查发现 `ActivityLibraryPanel.vue`
本来就已经是卡片网格布局（`.activity-grid`，CSS Grid `auto-fill`），
不是列表，缺的只是"图片"这一环，所以选择"卡片+图片"这条路，不需要
重新设计成列表。

新增可选字段 `activity.imageUrl`（`domain/activityPool.js` 的
`addActivity` 补默认值 `''`，`updateActivity` 走已有的通用 patch
合并，不需要额外处理），和 `settings.appearance.backgroundImage`
是同一个模式——用户自己粘贴图片 URL，不是本地文件上传。
`ActivityLibraryPanel.vue` 的增改表单新增这个输入框。`ActivityCard.vue`
顶部新增封面区：有图片时背景图铺满，没有图片时显示一个按活动类别色
算出的渐变背景 + 按 `blockType` 选的 emoji 占位，不强制每个活动都要
配图。**没有**为 12 项内置种子活动（`SEED_ACTIVITIES`）配真实图片
URL——外部图片链接有失效和授权风险，不适合帮用户在源码里硬编码几个
具体网址，这些活动会显示占位图案，用户自己想配图时随时可以在编辑
表单里粘贴链接。

验收：
- 活动库仍然是卡片网格展示，不是列表
- 编辑活动时能填一个图片 URL，保存后卡片顶部显示这张图
- 没填图片 URL 的活动（包括全部内置种子活动）显示一个按类别/类型
  区分的占位图案，不是空白或报错
- 卡片整体视觉（圆角、阴影、hover 效果）不受这次改动影响

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验 `activityPool.js` 通过；`@vue/compiler-sfc` 静态编译
校验 `ActivityCard.vue`/`ActivityLibraryPanel.vue` 通过；CSS 大括号
配对数量核对一致。真实浏览器下封面图裁剪/占位图案的视觉效果需要用户
本地确认。

## [REQ-036] 修复计划编辑体验 + 重置点数按钮的真实 bug

状态：completed
模块：src/domain/plans.js, src/components/PlanPanel.vue,
src/components/RewardPanel.vue, css/components.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户跟进反馈了五点，用户明确要求"不要询问我任何细节，按照你的推荐帮我
执行"：

1. "我还是修改不了计划里面的时间的时间设置，帮我修改" +
   "设置没有进行事件的修改时不能修改"：排查发现 REQ-032 加的编辑功能
   本身没问题（标题/未完成关键事件的行内编辑都是正确实现的），但
   REQ-032 同时把关键事件列表默认收起（要点击"展开关键事件"才能看到），
   编辑入口（铅笔图标）就在这个被收起的列表里——用户大概率没有点开过
   这个折叠区域，所以感觉"改不了"，根因是可发现性问题，不是功能
   本身坏了。
2. "现在显示得不太自然，不需要点击展开的提示"：直接印证了第 1 点的
   根因——用户明确要求去掉这个折叠交互。
3. "修改计划的时候只能在最后添加事件的限制也不太好"：原来
   `domain/plans.addKeyEvent` 只支持追加到末尾。
4. "还是点数没有帮我重置吗？我的每小时点数设置明明已经设置成了
   100"：排查发现 REQ-034 新增的"重置点数"按钮（`RewardPanel.vue` 的
   `handleResetPoints()`）只调用了 `resetPointsFromMonday`，漏调了
   紧接着必须调用的 `settlePastDays`——`resetPointsFromMonday` 只是把
   本周已结算的块标记成待重新结算 + 把余额清零，真正重新算出点数、
   写回余额的是 `settlePastDays`。这是一个真实的实现 bug（`App.vue`
   挂载时的调用是两个函数紧挨着调的，写按钮时漏掉了后一个），不是
   用户操作问题。

修复/改动：
- `PlanPanel.vue`：删除 REQ-032 加的 `expandedPlans`/`toggleExpanded`
  和折叠按钮（连同 `css/components.css` 里 `.plan-card__toggle*`
  样式、不再用到的 `plan.expandKeyEvents`/`collapseKeyEvents` i18n
  key），关键事件列表和追加表单改回始终显示。标题/关键事件的行内
  编辑功能保留不动。
- `domain/plans.js` 的 `addKeyEvent` 新增可选第三参数
  `insertBeforeId`：指定"插到这个还没完成的关键事件前面"，不传/目标
  不存在/目标已完成都退化成原来的"加到末尾"（向后兼容）。只允许插在
  未完成事件前面，插在已完成前缀里会破坏"数组前缀即已完成部分"这个
  不变式。`PlanPanel.vue` 追加表单加了对应的"插入位置"下拉框
  （`n-select`，选项是每个未完成关键事件的"插到 xxx 前面" + 固定的
  "加到末尾"）。
- `RewardPanel.vue` 的 `handleResetPoints()` 补上
  `settlePastDays(store)` 调用，修复点击后余额停留在 0、不会按最新
  `pointsPerHourWeekday`/`pointsPerHourWeekend` 重新结算的 bug。

验收：
- 计划页打开就能直接看到关键事件列表和编辑入口，不需要额外点击展开
- 能把新的关键事件插到任意一个还没完成的关键事件前面，不再只能加到
  末尾
- 点击"重置点数"按钮后，余额立刻按当前设置的每小时点数（用户例子里
  的 100）重新算出本周已完成事件的点数，不再停留在 0

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对 `domain/plans.js`/locale 文件校验通过，`@vue/compiler-sfc`
静态编译校验 `PlanPanel.vue`/`RewardPanel.vue` 通过，CSS 大括号配对
数量核对一致。`domain/plans.js` 不依赖 Vue/store/db，直接用 Node 跑
真实源码测试 `addKeyEvent` 的插入行为：不传参数时追加到末尾（向后
兼容）、插到指定未完成事件前面、插入目标已完成时正确退化成加到末尾且
不破坏已完成前缀、插入目标 id 不存在时同样正确退化，全部通过。
`domain/rewards.js` 因为间接依赖 `state/db.js` 没法在纯 Node 环境直接
import（`@sqlite.org/sqlite-wasm` 包 Node/浏览器双构建的已知限制，见
REQ-031 验证记录），手抄 `resetPointsFromMonday`/`settlePastDays` 的
算法（和源码逐行对照）单独复现了这个 bug 场景：验证了"两个函数都调用"
时余额正确按新比率算出（2 小时×100/小时=200），并且额外验证了"只调
`resetPointsFromMonday` 不调 `settlePastDays`"这个对照组确实会像
bug 修复前那样停在 0——两组结果共同证明了 bug 的存在和修复的正确性。
验证完删除了临时测试脚本。真实浏览器下的交互效果需要用户本地确认。

## [REQ-037] 删除"添加关键事件"功能，改成整张计划卡片可折叠

状态：completed
模块：src/domain/plans.js, src/components/PlanPanel.vue,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户对 REQ-036 的两处改动给了进一步反馈："添加关键事件的功能不需要，
主要是要能修改计划中事件的时间，然后计划通过点击可以折叠计划"。

1. "添加关键事件的功能不需要"：REQ-036 刚给"往已有计划追加关键事件"
   这个功能加了"插入位置"选择器，用户反馈整个功能都不需要——一份计划
   的关键事件清单现在只在创建时一次性定好，后续不再支持追加。删除
   `domain/plans.js` 的 `addKeyEvent`（连同 REQ-036 加的 `insertBeforeId`
   参数一起）和 `PlanPanel.vue` 里配套的 `plan-card__add-row` 表单、
   `addRowDrafts`/`addRowDraftFor`/`insertPositionOptions`/
   `submitAddKeyEvent`，以及不再用到的 CSS 和 3 个 i18n key
   （`keyEventAddedToast`/`insertAtEnd`/`insertBeforeOption`）。
2. "主要是要能修改计划中事件的时间"：这个能力 REQ-032 已经做了
   （`updateKeyEvent` 可以改 `estimatedHours`），排查确认没有回归——
   继续保留不动。
3. "计划通过点击可以折叠计划"：新增整张计划卡片的折叠/展开，卡片头部
   新增一个 chevron 图标按钮，点击折叠/展开卡片主体（进度条 + 关键
   事件列表 + "当前待完成"提示），卡片头部（标题、进度标签、删除按钮）
   折叠状态下始终可见。这和 REQ-036 删掉的"关键事件列表单独展开/收起"
   不是同一个东西——那次是被明确要求删掉的（"不需要点击展开的提示"），
   这次是"点击计划本身折叠"，是一个新的、范围更大（整张卡片而不是只有
   列表）的折叠交互，默认展开。

验收：
- 计划卡片没有"添加关键事件"相关的表单/按钮
- 点击计划卡片头部的折叠图标，能把进度条+关键事件列表+"当前待完成"
  提示一起折叠/展开，标题和进度标签折叠状态下依然可见
- 修改已有关键事件的时长（estimatedHours）仍然正常工作

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对 `domain/plans.js`/locale 文件校验通过，`@vue/compiler-sfc`
静态编译校验 `PlanPanel.vue` 通过，CSS 大括号配对数量核对一致。用
Node 直接跑 `domain/plans.js` 真实源码确认删除 `addKeyEvent` 之后
`updatePlan`/`updateKeyEvent`/`removeKeyEvent` 都不受影响，仍然正常
工作。用 Grep 确认项目里不再有 `addKeyEvent`/`addRowDraftFor`/
`insertPositionOptions`/`submitAddKeyEvent`/`expandedPlans`/
`toggleExpanded` 的任何活代码引用（历史说明性注释不算）。验证完删除
临时测试脚本。真实浏览器下的折叠交互观感需要用户本地确认。

## [REQ-038] 去掉删除计划的功能，改成废止计划

状态：completed
模块：src/domain/plans.js, src/components/PlanPanel.vue,
src/components/EventModal.vue, css/components.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"去掉删除计划的功能，改成废止计划，只是显示变成不能操作而
已"——不再把整份计划从 `state.plans` 里删掉，改成一个不可逆的
`abolished` 标记位，计划的标题/关键事件/完成进度全部原样保留，只是
不能再被编辑/操作。

`domain/plans.js`：`createPlan` 新增 `abolished: false` 默认值；
`deletePlan` 删除，新增 `abolishPlan(store, planId)` 只翻这一个标记位
（没有配对的"恢复"函数，用户没有要求可撤销，重复调用是安全的空
操作）；`updatePlan`/`updateKeyEvent`/`removeKeyEvent`/
`completeKeyEvent`/`uncompleteLastKeyEvent` 这几个会修改计划内容的
函数全部在入口加了 `!p.abolished` 的拦截——不只是 UI 层隐藏按钮，
domain 层也做了双重防护，防止其他调用方（比如 `EventModal.vue`）绕过
UI 直接改到已废止的计划。

`PlanPanel.vue`：把"删除计划"按钮换成"废止计划"（`type="warning"`
而不是原来的 `type="error"`，废止不是删除数据，严重程度不一样），
只在 `!plan.abolished` 时显示。卡片根节点加
`plan-card--abolished`（整卡片调暗，CSS opacity 0.55）；标题编辑
铅笔、每个未完成关键事件的编辑/删除按钮都加了 `!plan.abolished`
条件——废止后这些入口直接不渲染，是"显示变成不能操作"的字面实现，
不是禁用态；进度标签旁边新增"已废止" `n-tag`；折叠/展开这个纯查看
操作不受影响，废止后仍然可以查看计划详情。

`EventModal.vue` 的"从计划添加"下拉框（`planOptions`）新增
`!plan.abolished` 过滤，避免已废止的计划还能被继续用来给时间轴添加
新安排。

验收：
- 点击"废止计划"后，计划从 `state.plans` 里不会消失，标题/关键事件/
  进度数据都还在
- 废止后的计划卡片整体视觉变暗，标题/关键事件的编辑按钮、"废止计划"
  按钮本身都不再显示
- 已废止的计划不会出现在"从计划添加"下拉框里
- 折叠/展开这个纯查看功能，废止后仍然可以正常使用

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对 `domain/plans.js`/locale 文件校验通过，`@vue/compiler-sfc`
静态编译校验 `PlanPanel.vue`/`EventModal.vue` 通过，CSS 大括号配对
数量核对一致。用 Node 直接跑 `domain/plans.js` 真实源码测试：创建
计划、废止前正常完成一个关键事件、废止后依次验证
`updatePlan`/`updateKeyEvent`/`removeKeyEvent`/`completeKeyEvent`/
`uncompleteLastKeyEvent` 全部是无操作（数据完全不变）、重复废止是
安全的空操作、`computePlanProgress` 不受废止影响仍然反映真实完成
状态，全部通过，验证完删除临时测试脚本。真实浏览器下的视觉/交互效果
需要用户本地确认。

## [REQ-039] 删除重置点数的功能

状态：completed
模块：src/components/RewardPanel.vue, src/domain/rewards.js,
src/i18n/locales/{zh,en,ja}.js

描述：
用户在改计划废止功能的同一轮对话里追加了一句"删除重置点数的功能"——
指的是 REQ-034 加、REQ-036 修过 bug 的"重置点数"按钮
（`RewardPanel.vue` 里那个手动触发 `resetPointsFromMonday` 的按钮）。

删除范围的判断：和 REQ-029 删除"数据恢复"按钮时的判断方式一样——
"重置点数的功能"理解为用户在奖励页能看到、点到的那个手动按钮，不包括
`App.vue` 挂载时的自动一次性迁移（REQ-028 的 `resetPointsFromMonday`
调用，用 `meta.pointsResetAt` 做幂等标记）。自动迁移是完全静默、没有
UI 的一次性行为，不构成用户能感知到的"功能"，删掉反而会让老用户升级
后的点数余额永远停留在旧汇率算出来的数字上；如果这个判断和用户预期
不符，后续可以再单独处理。

删除 `RewardPanel.vue` 的 `handleResetPoints()`、按钮本身的
`<n-popconfirm>`、`resetPointsFromMonday`/`settlePastDays` 的 import；
删除三个 locale 文件里的 `reward.resetPointsButton`/
`resetPointsConfirm`/`pointsResetToast`。`domain/rewards.js` 的
`resetPointsFromMonday`/`settlePastDays` 函数本身不删，`App.vue` 还在
用。

验收：
- 奖励页不再显示"重置点数"按钮
- 项目里不再有 `handleResetPoints`/`resetPointsButton`/
  `resetPointsConfirm`/`pointsResetToast` 的任何引用
- `App.vue` 挂载时的自动一次性点数重置迁移不受影响，行为和删除前
  完全一致

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对 `domain/rewards.js`/locale 文件校验通过，`@vue/compiler-sfc`
静态编译校验 `RewardPanel.vue` 通过。用 Grep 确认
`handleResetPoints`/`resetPointsButton`/`resetPointsConfirm`/
`pointsResetToast` 在 `src/` 下没有任何残留引用。

---

## [REQ-040] 上线前置准备：git 仓库初始化 + 依赖安全漏洞修复

状态：completed
模块：.gitignore（新增）, package.json, package-lock.json

描述：
用户准备做第一版上线，要求：①确认数据库数据不会被误上传；②处理依赖
包的安全问题，需要时可以调整版本，不影响编译产出和运行的警告不用处理。

验收：
- 新增 `.gitignore`，排除 `node_modules/`、`dist/`、`*.sqlite3`、`.env`
  等，项目完成 `git init` 并有首次提交
- `npm audit` 从修复前的漏洞清零
- `vite build` 生产构建在依赖调整后仍能成功产出

验证：
实际执行了 `npm install`（官方 registry）和两次 `npx vite build`（调整
前后各一次）——这是相对 AGENTS.md P2-2"只给步骤说明"的一次偏离，理由
详见 CHANGELOG.md REQ-040 条目。`npm audit` 从 4 个漏洞（3 中 1 高）
降到 0；两次构建都成功产出 `dist/`，验证完删除本地 `dist/` 目录。
EBADENGINE（`sqlite-wasm`/`naive-ui` 要求的 Node 版本高于本地 v18.20.4）
按用户指示保留不处理，不影响实际构建结果。

---

## [REQ-041] 数据库镜像到本地文件夹（File System Access API，实验性）

状态：completed
模块：src/state/db.js, src/state/fileMirror.js（新增）, src/state/store.js,
src/components/SettingsPanel.vue, src/i18n/locales/{zh,en,ja}.js

描述：
用户问"我想让数据库文件保存在项目目录里，有什么实现方式吗"。这是项目
专属架构决策（P0-3），用 AskUserQuestion 给出三个技术现实不同的选项后，
用户选择了"File System Access API（推荐）"：浏览器原生能力，用户手动
选一次真实文件夹授权后，应用把数据库内容单向镜像写进那个文件夹，OPFS
继续是唯一权威数据源。不支持这个 API 的浏览器（Firefox/Safari）自动
回退到现状（纯 OPFS，功能不受影响）。

验收：
- Chromium 系浏览器下，「设置」页可以选择一个本地文件夹，选定后该文件夹
  出现一个真实的 `lifespark.sqlite3` 文件，且每次应用内数据变化（自动
  保存触发）后这个文件的内容会被更新
- 重新打开浏览器后权限过期时，界面提示需要重新授权，点击后能恢复镜像
- 不支持 File System Access API 的浏览器只看到一句"不支持"提示，其余
  功能（包括 OPFS 本身的持久化）不受任何影响
- 三个语言的文案齐全

验证：
`node --check` 校验全部改动/新增 `.js` 文件通过，`@vue/compiler-sfc`
静态编译校验 `SettingsPanel.vue` 通过，Grep 确认三个 locale 文件的
`fileSync` 系列 key 数量一致。实际执行了两次 `npx vite build`（改动
前后各一次，延续 REQ-040 记录过的偏离 AGENTS.md P2-2 的理由）确认打包
不报错。真实浏览器里的目录授权弹窗、权限过期重新授权、镜像文件在系统
文件管理器里能否正常打开，需要用户在 Chrome/Edge 里本地确认——这部分
依赖真实的浏览器原生 UI，这个环境里无法模拟。

---

## [REQ-042] 数据库镜像补上反方向：启动时/手动从本地文件夹读回数据

状态：completed
模块：src/state/db.js, src/state/fileMirror.js, src/state/store.js,
src/components/SettingsPanel.vue, src/i18n/locales/{zh,en,ja}.js

描述：
用户追问"为什么不能设置启动的时候从读取的数据文件里面读数据，然后页面
修改数据的时候顺便一起写到文件里"——指出 REQ-041 只做了写出去这一个
方向，应该是双向的。技术调研确认可行，做法是"关闭 OPFS 连接释放独占锁
→ 用文件夹里的字节整个覆盖 OPFS 文件 → 重新打开"，不需要 sqlite-wasm
支持"从字节导入"这个能力（它的简化 worker1 协议本来就不支持，见
`docs/KNOWLEDGE.md`）。

验收：
- `state/store.js` 的 `initStore()` 启动时会尝试一次
  `hydrateFromDirectory()`：本地文件夹已授权且这次会话权限仍然有效时，
  会先把文件夹里的内容写进 OPFS，再按正常流程读取
- 「设置」页新增"从文件夹读取最新数据"按钮（二次确认），点击后当前
  界面数据会换成文件夹里保存的那份
- 重启浏览器后权限大概率会过期（浏览器的正常行为，不是 bug），需要先
  点「重新授权」

验证：
`node --check`/`@vue/compiler-sfc` 静态校验通过，Grep 确认三个 locale
文件 `fileSync` key 数量一致（各 24 个）。`promiser('close', {dbId})`
的协议格式用 WebFetch 核对了官方文档。实际跑了一次 `npx vite build`
确认新调用链模块解析和打包不报错（延续 REQ-040/041 记录过的偏离
AGENTS.md P2-2 的理由）。真实浏览器里"关闭连接→覆盖 OPFS 文件→重新
打开→界面刷新"这条链路，以及"刷新页面内静默生效、重启浏览器后需要
重新授权"这个权限行为差异，都需要用户在 Chrome/Edge 里本地确认。

---

## [REQ-043] 全量数据导出/导入按钮（撤销此前未提交的"文件夹作为唯一存储"实验）

状态：completed
模块：src/state/persistence.js, src/components/SettingsPanel.vue,
src/i18n/locales/{zh,en,ja}.js

描述：
用户反馈"现在要选择数据文件夹才能进入系统，很奇怪，原来采用浏览器的
存储方式没了吗"。排查发现工作区里存在一批**未提交、未记入本文档**的
改动：把持久化架构从"REQ-024~042 的浏览器内 OPFS SQLite（自动运行，
用户无感知，REQ-041/042 时期额外可选镜像到本地文件夹）"整体替换成"用户
必须手动选一个真实文件夹，这个文件夹里的 JSON 文件是唯一权威数据源，
选之前应用直接进不去"（代码里留有注释，写着这是此前某次会话里用户通过
AskUserQuestion 确认过的方向，动机是 REQ-024 切换存储后台时老数据一度
看起来"消失"过，想要一份自己能在文件管理器里看得见、摸得着的实体文件）。
但这批改动只完成了写代码，`docs/REQUESTS.md`/`CHANGELOG.md`/`MODULES.md`
从未同步，`git status` 也确认从未提交——按 AGENTS.md P1-4，这个任务没有
真正"完成"过。

用 AskUserQuestion 请用户在"保留新方案补文档"/"回退到 REQ-042 浏览器
自动存储"/"折中成可选镜像、不强制门禁"三个选项里选择，用户选择**回退**，
并追加要求：设置页需要有一个全量数据导出按钮，且支持导入数据。

处理：
- 用 `git stash push -u` 把这批未提交改动（含新增的
  `src/components/DataFolderGate.vue`、`src/state/fileStore.js`、
  `src/state/legacyOpfsMigration.js`，以及对 `App.vue`/`store.js`/
  `persistence.js`/`SettingsPanel.vue`/三个 locale 文件/`css/layout.css`
  的修改）整体收进一个 stash（`stash@{0}`：`REQ-043 folder-only storage
  experiment (reverted per user request 2026-08-22)`），工作区回到
  REQ-042 提交后的干净状态——数据继续自动存在浏览器 OPFS 里，不再需要
  选文件夹才能进系统。这批改动没有被永久丢弃，留在 stash 里，以后如果
  想要回这个方向可以找回，但当前分支/HEAD 完全不含这些代码。
- 新增真正的"全量数据导出/导入"：`persistence.js` 新增
  `serializeStateForExport(state)`（`JSON.stringify(state, null, 2)`）和
  `parseImportedState(json)`（复用已有的内部 `fillMissingDefaults()`，
  解析失败或内容不是对象都返回 `null`，不抛异常）。`SettingsPanel.vue`
  新增"数据导出 / 导入"分区：导出按钮用 `Blob` + 临时 `<a download>` 触发
  浏览器下载 `lifespark-backup-<日期>.json`；导入按钮包一层
  `<n-popconfirm>` 二次确认（这是覆盖式操作，和"从文件夹读取最新数据"
  是同一个"危险操作二次确认"模式，确认放在触发隐藏的
  `<input type="file">` 之前，具体文件内容是否有效要等选完文件才知道，
  校验在 `handleImportFile()` 里做，无效文件不会碰到当前数据）。这个新
  功能不依赖 File System Access API，所有浏览器都能用，是和 REQ-041/042
  "镜像到文件夹"（Chromium 专属、持续目录授权）平行的另一种备份手段，
  两者互不冲突，都保留。

验收：
- 打开应用不再需要选择/授权任何文件夹，行为回到 REQ-042：浏览器自动用
  OPFS SQLite 读写，刷新页面数据正常恢复
- 「设置」页新增"数据导出 / 导入"分区，点击"导出全部数据"能下载一个
  包含当前活动库/计划/周计划/时间轴/设置等全部数据的 JSON 文件
- 点击"导入数据"先弹出二次确认，确认后选择一个之前导出的 JSON 文件，
  界面数据整体替换成文件里的内容且刷新页面后仍然保留（自动持久化到
  OPFS）
- 选择一个不是有效 LifeSpark 数据的文件（比如随便一个文本文件）导入时，
  会提示"文件内容不是有效的 LifeSpark 数据"，当前数据不受影响
- REQ-041/042 的"镜像到本地文件夹"功能不受这次改动影响，继续正常工作

验证：
`node --input-type=module --check` 校验了改动的 `persistence.js` 和三个
locale 文件；Grep 确认三个 locale 文件里 `dataBackup`/`dataExport`/
`dataImport` 系列 key 数量一致（各 7 个）；用 `@vue/compiler-sfc` 实际
编译（`parse`+`compileScript`+`compileTemplate`）`SettingsPanel.vue` 的
script 和 template 均通过，不是仅静态阅读。Grep 确认
`DataFolderGate`/`fileStore.js`/`legacyOpfsMigration` 在 `src/` 下已经没有
任何残留引用（改动前所在文件已经不存在于当前工作区）。按 AGENTS.md
P2-2，未代为执行 `npm run dev`；导出下载的浏览器行为、导入后界面实际
观感、`git stash` 里保留的旧改动是否符合预期，需要用户本地确认。

---

## [REQ-044] 删除"数据库镜像到本地文件夹（实验性）"功能

状态：completed
模块：src/state/fileMirror.js（删除）, src/state/db.js, src/state/store.js,
src/components/SettingsPanel.vue, src/i18n/locales/{zh,en,ja}.js,
.gitignore

描述：
用户要求把 REQ-041/042 做的"数据库镜像到本地文件夹（实验性）"整个去掉。
这个功能需要 Chromium 系浏览器 + 用户手动选目录并持续重新授权，本质上和
REQ-043 被回退的"文件夹作为唯一存储"是同一类"额外依赖本地文件系统授权"
的复杂度，只是这个版本不强制、失败了功能会静默降级——但既然 REQ-043 已经
证明用户不想要"必须绑定本地文件夹"这条路线，且 REQ-043 刚新增的"数据
导出/导入"已经覆盖了同样的备份诉求（下载/读取一个 JSON 文件，还不挑
浏览器），这个实验性功能失去存在的必要性。

处理：
- `src/state/fileMirror.js` 整个删除（唯一职责就是这个功能，没有被其他
  模块复用）。
- `src/state/db.js` 撤回 REQ-041/042 专为这个功能加的
  `exportDbBytes()`/`closeDb()`/导出的 `OPFS_FILENAME`，`DB_FILENAME`
  改回内部常量——`db.js` 回到 REQ-024 时的形态（只有
  `readStateJson`/`writeStateJson` 两个对外接口，供 `persistence.js`
  用），核心的 OPFS SQLite 存储本身完全不受影响。
- `src/state/store.js` 撤回 `initStore()` 里的
  `await hydrateFromDirectory()`、自动保存链路里的
  `.then(() => mirrorNow())`、以及只服务这个功能的
  `reloadFromDisk()` 导出函数。`getState`/`setState` 对外接口不变。
- `src/components/SettingsPanel.vue` 删除"数据库镜像到本地文件夹
  （实验性）"整个分区：`fileSyncSupported`/`fileSyncDirName`/
  `fileSyncPermission`/`fileSyncLastMirroredAt`/`fileSyncLastLoadedAt`/
  `fileSyncLastError` 六个 `ref`，`refreshFileSyncStatus`/
  `handlePickDirectory`/`handleReauth`/`handleMirrorNow`/
  `handleClearDir`/`handleLoadFromFolder` 六个函数，以及对应模板；连带
  清理了因此变成未使用的 `onMounted` 导入和 `useI18n()` 的 `d`
  （日期格式化，只有这个分区用过）。REQ-043 新增的"数据导出/导入"分区
  不受影响，是现在唯一的手动备份手段。
- 三个语言文件删除 24 个 `settingsView.fileSync*` key（`fileSyncSection`
  ~`fileSyncStopped`）。
- `.gitignore` 新增 `lifespark-backup-*.json`
  规则：这次排查发现项目目录下已经有一个用户用"导出全部数据"功能生成的
  真实备份文件（`data/lifespark-backup-2026-08-22.json`，含真实个人数据），
  按 REQ-040 定下的"数据库数据不要上传"原则预防性排除，和已有的
  `*.sqlite3` 规则同一类考虑；这个文件本身没有被删除或移动，只是确保
  不会被 git 追踪。

验收：
- 「设置」页看不到"数据库镜像到本地文件夹"这个分区了，"数据导出/导入"
  分区仍然正常
- 应用启动、保存数据的行为不受影响（继续用 OPFS SQLite，自动保存正常
  工作），因为这个功能本来就是可选的额外镜像，核心存储路径没有依赖它
- 项目里搜不到 `fileMirror`/`fileSync`/`mirrorNow`/`hydrateFromDirectory`/
  `pickProjectDirectory`/`exportDbBytes`/`closeDb`/`OPFS_FILENAME`/
  `reloadFromDisk` 的任何残留引用
- `git status` 不会再把 `data/lifespark-backup-*.json` 这类导出文件当成
  可以被提交的改动

验证：
`node --input-type=module --check` 校验了改动/剩余的 `db.js`/`store.js`/
`persistence.js` 和三个 locale 文件；用 `@vue/compiler-sfc` 实际编译
（`parse`+`compileScript`+`compileTemplate`）`SettingsPanel.vue` 的
script/template 均通过。Grep 确认 `fileMirror`/`fileSync`/`mirrorNow`/
`hydrateFromDirectory`/`pickProjectDirectory`/`exportDbBytes`/`closeDb`/
`OPFS_FILENAME`/`reloadFromDisk` 在 `src/` 下已经没有任何残留引用；三个
locale 文件的 `dataBackup`/`dataExport`/`dataImport` 系列 key 数量保持
一致（各 7 个，删除的是 `fileSync` 系列，不涉及这几个）。按 AGENTS.md
P2-2，未代为执行 `npm run dev`；真实浏览器里应用能否正常启动/保存需要
用户本地确认。

---

## [REQ-045] 加载画面改为"清新治愈"风格 + 修复跨越 6 点分界线的事件显示异常

状态：completed
模块：index.html, src/main.js, src/constants/timelineRange.js,
src/components/DayTimeline.vue, src/components/WeekBoard.vue

描述：
用户一次提了两件事：

**A. 加载画面改风格**
把 REQ-030 时期"黑底 + 转圈 spinner"的启动加载占位换成"清新治愈"风格。
`index.html` 里 `#app-loading` 的内联样式整个重做：浅色柔和渐变背景
（薄荷绿/天蓝/米白，缓慢流动）、呼吸光晕 + 缓慢生长的 🌱（呼应侧边栏
品牌 emoji）、三颗从光晕升起又消散的小圆点、底部三个错峰跳动的加载
小圆点（取代机械转圈的 spinner），文案从"加载中…"改成"正在生长中…"，
呼应 LifeSpark/🌱 的品牌意象。这套配色是独立的浅色调色板，刻意不跟随
应用当前的深色/浅色主题——和 REQ-030 时期一样，这个页面在 Vue 挂载、
`state.settings.theme` 还没读到之前就要能显示，本来没法读取任何应用
状态，"清新治愈"这个方向本身也更适合浅色而不是深色。`src/main.js` 的
`fadeOutLoadingScreen()` 等待时长从 400ms 同步加长到 550ms，配合新的
0.5s 淡出 transition（比原来的 0.35s 慢一点，更柔和）。

**B. 修复跨越 6 点分界线的事件显示异常**
用户反馈"时间从凌晨开始跨到第二天时显示很奇怪"。排查确认这不是真的
跨自然日的事件（日/周视图的事件本来就只能属于某一天，`EventModal.vue`
也不允许创建结束时间早于开始时间的事件），而是 `constants/
timelineRange.js` 里 REQ-010 时期就写在注释里的已知局限：时间轴视觉上
从 6 点开始画（往下 7、8...23、0、1...5），如果一个块的真实起止时间
横跨这条 6 点旋转分界线（比如凌晨 4:00-8:00，用户描述的"从凌晨开始
跨到（视觉上像是）第二天"说的就是这种块），单个绝对定位的 DOM 元素
没法在视觉上"从底部绕回顶部"，原来的处理方式是让超出的部分在网格底部
被裁掉，块看起来比实际更短，用 `node -e` 验证过修复前这类块算出来的
`top+height` 会到 108%（超出 100% 的部分就是被裁掉、显示异常的原因）。

用户明确表示"你可以自行将其分成两段 但标注的是统一事件 取消时也是
同时取消"——这正好是这个"单个 div 没法绕回顶部"限制最自然的解法：
`constants/timelineRange.js` 新增 `needsDisplaySplit(block)`（判断真实
起止时间是否骑在 6 点分界线两侧）和 `splitDisplaySegments(block)`
（拆成 `[block.start, 6)` 和 `[6, block.end)` 两个真实小时区间）。
`DayTimeline.vue`/`WeekBoard.vue` 都新增 `renderItems`/
`renderItemsForDate()`，把需要拆分的块渲染成两个 DOM 元素（前半段画在
网格底部、后半段画在网格顶部），**两段共用同一个 block 对象**——不引入
任何新的关联字段，标题/类型天然一致（"标注的是统一事件"），点击任一段
都打开同一个编辑弹层，跳过/删除操作作用的也是同一个 block（"取消时也
是同时取消"，因为根本只有一个 block，不存在"两份"需要同步）。只有
承载真实结束时间的"后半段"（`isClosing`）显示时间标注、评价/跳过/删除
按钮和拉伸手柄，"前半段"只做视觉延续，避免同一个事件出现两套重复的
操作入口（`blocks.length===0`) 空状态判断继续用未拆分的原始 `blocks`，
不受渲染片段影响）。

**范围取舍**：拖拽移动/拉伸这类交互，原有实现假设"渲染出来的高度对应
块的整个时长"，对被拆分的块不成立（拆分后每段渲染的只是真实时长的一
部分）——继续允许会导致像素换算出的时长跟视觉不一致。这类块的拖拽
（`draggable`）和拉伸手柄整体禁用（`needsDisplaySplit(block)` 为真时
不渲染手柄、`draggable` 为 false），`moveBlock`/`resizeBlock`/
`onBlockDragStart`（`DayTimeline.vue`）、`moveBlock`
（`WeekBoard.vue`）里也加了同款防御性判断——要调整这类事件的时间，
只能通过点击打开编辑弹层直接改 `start`/`end`（弹层本来就用真实值，不
受这次渲染层改动影响）。另外，拆分后的两个片段之间不再互相当对方的
"下一个块"参与"避免撞到下一个块"的最小高度可读性优化（见
`blockStyle()` 里 `isSplitSegment` 判断）——这两段本来就是同一个块，
紧挨着渲染在网格顶/底两端是预期效果，不是需要空隙分隔的"相邻事件"；
这类块通常横跨 2 小时以上（骑在 6 点两侧才会触发拆分），天然不会矮到
需要这层保护，为这种少见场景重新推导"旋转后的相邻关系"不划算。

验收：
- 打开应用能看到浅色柔和渐变背景 + 呼吸的 🌱 + 升起消散的小圆点 + 底部
  跳动小圆点的加载动效，文案是"正在生长中…"，不再是黑底转圈
- 创建/查看一个真实起止时间跨过 6 点的事件（比如凌晨 4:00-8:00），日
  视图和周视图上都能看到它被拆成两段——一段贴着网格底部、一段贴着网格
  顶部，都能看出是同一个事件（同一个标题），不再有超出网格被裁掉、
  显示比实际短的问题
- 只有其中一段（对应真实结束时间那一段）显示时间标注和跳过/删除按钮，
  点击其中任意一段都能打开同一个事件的编辑弹层
- 在编辑弹层里把这个事件标记跳过或删除，日/周视图上两段会同时变成
  跳过状态或同时消失，不会出现"删掉一段、另一段还留着"的不一致
- 这类事件不能被拖拽移动或拖拽拉伸（没有拉伸手柄），只能通过编辑弹层
  修改时间；不跨 6 点分界线的普通事件（绝大多数情况）行为和之前完全
  一致，包括拖拽/拉伸

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了 `timelineRange.js`；用 `@vue/compiler-sfc` 实际编译
（`parse`+`compileScript`+`compileTemplate`）`DayTimeline.vue`/
`WeekBoard.vue` 的 script/template 均通过。用 `node -e` 精确模拟了
`toDisplayOffset`/`displayStartHour`/拆分前后的位置计算：验证了一个
4:00-8:00 的块修复前 `top+height=108.33%`（超出 100%，对应"被裁掉、
显示异常"）、修复后拆成两段分别是 `top=92.0%,height=8.0%`（sum=100%，
正好落在网格底边）和 `top=0.35%,height=8.0%`（贴着网格顶边）——两段
互不重叠、加起来正好覆盖块的完整真实时长；同时验证了五个不应受影响的
场景（9-17 点、1-3 点、20-23 点、2-6 点边界重合、6-10 点边界重合）
`needsDisplaySplit` 都正确返回 `false`，渲染结果和拆分前的原始公式
完全一致。`index.html` 人工核对了标签配对（particle 元素从重复 `id`
改成 class，避免了非法的重复 id）和 CSS 大括号数量。真实浏览器里的
动效观感和拆分后的实际排布视觉效果需要用户本地确认。

---

## [REQ-046] 桌面一键启动脚本 + 奖励点数改为实时结算 + 余额改为派生计算

状态：completed
模块：start-lifespark.bat（新增）, src/domain/rewards.js, src/App.vue,
src/components/RewardPanel.vue, src/components/DayTimeline.vue,
src/components/SettingsPanel.vue, src/domain/plans.js,
src/state/persistence.js

描述：
用户一次提了两件事：

**A. 桌面一键启动脚本**
项目根目录新增 `start-lifespark.bat`：双击后自动 `cd` 到脚本自身所在
目录（`%~dp0`，不写死绝对路径，项目文件夹被移动/改名也不受影响）、
`node_modules` 不存在时自动先跑一次 `npm install`、然后
`npm run dev -- --open`——`--open` 是 Vite 自己的参数，会在开发服务器
真正就绪后自动打开默认浏览器并跳到实际生效的地址，不在脚本里写死
`http://localhost:5173`（端口被占用时 Vite 会自动换成 5174 等，写死
端口猜错了反而打开一个连不上的页面）。用 PowerShell 的
`WScript.Shell` COM 对象在用户桌面创建了一个指向这个 `.bat` 的快捷方式
`LifeSpark.lnk`，双击桌面图标即可启动。
这个快捷方式本身不在 git 仓库里（是本机桌面上的文件，不是项目文件），
`.bat` 脚本本身在仓库里、会被提交跟踪。

**B. 奖励点数改为实时结算 + 余额改为派生计算**
用户反馈"奖励点数未实时计算，时间从7/20开始到前一天"——排查确认这正是
REQ-020 时期设计的"一天延迟结算"（`settlePastDays` 只处理
`dateKey < todayKey`，今天的事件永远不结算，必须等到第二天这个函数
再跑一次才计入点数）。当初加这个延迟的理由是"结算即时的话，跳过就要
先撤销已发点数，逻辑上更绕"，但 `DayTimeline.vue` 的 `toggleSkip()`
早就已经实现了"撤销已结算点数/计划进度"这个反悔逻辑，跟结算是否延迟
无关，延迟本身已经不是必须的约束。

用户同时给出了新的余额计算方式："兑换的话会有一个兑换表记录兑换记录，
结果点数减去兑换记录里面的记录点数就行"——`RewardPanel.vue` 本来就有
"已兑换"表格（`title`/`value`/`claimedAt` 三列），这就是用户说的"兑换
表"。按这个思路把点数余额从**存储字段**（`state.rewardPoints`，需要
每次操作都正确增减，历史上出过好几次"漏调用导致余额和实际记录对不上"
的 bug，比如 REQ-036 修过的"重置点数按钮漏调 settlePastDays 导致余额
停在 0"）改成**派生计算**（`domain/rewards.computeRewardBalance(state)`
= 所有已结算块的 `pointsAwarded` 之和 − 所有已兑换奖励的 `value` 之和，
每次现算，不存在"忘记同步"的可能，从根上消除这一整类 bug）。

- `domain/rewards.js`：`settlePastDays` 重写为 `settleCompletedBlocks`
  ——过去的日期整天都有资格结算，"今天"的块单独判断（`block.end` 是否
  已经早于此刻的小时数 `nowHour`，已经过去才结算，没到点的不提前发钱），
  真正做到实时。新增 `computeRewardBalance(state)`。`redeemReward` 改成
  用 `computeRewardBalance()` 现算判断余额够不够，标记 `claimed:true`
  后不再需要额外扣减任何字段。`addPoints()`（专门做余额增减）和
  `resetPointsFromMonday`（REQ-028/034，"重置一个存储余额"，派生模型下
  这个操作本身不再有意义）整个删除。
- `App.vue`：`useNow()` 每 30 秒一个 tick，`watch` 从"只在跨天时触发"
  改成"每次 `now` 变化都触发 `settleCompletedBlocks`"——应用开着不刷新
  页面，某个事件真实结束后最多 30 秒点数就自动到账。挂载时不再调用
  `resetPointsFromMonday`（已删除）。
- `RewardPanel.vue`：新增 `balance = computed(() =>
  computeRewardBalance(props.state))`，替换所有原来读
  `state.rewardPoints` 的地方（余额展示、`canAfford()`、"点数不够"提示）。
- `DayTimeline.vue`：`toggleSkip()`/`removeBlock()` 删除显式调用
  `addPoints()` 退点数的代码——块被删除、或 `pointsSettled` 被清掉之后，
  `computeRewardBalance()` 求和时自然就不会再算上它，不需要手动"退钱"。
- `persistence.js`：新安装的 `createDefaultState()` 不再生成
  `rewardPoints`/`meta.pointsResetAt` 这两个字段；老数据里如果还带着，
  走 `fillMissingDefaults()` 的浅展开原样留着当死数据，不影响任何逻辑，
  和 REQ-016/022 时期处理废弃字段是同一个模式。

验收：
- 双击桌面「LifeSpark」图标，会打开一个终端窗口，自动装依赖（如果是
  第一次）、启动开发服务器，并自动打开浏览器到正确的本地地址
- 「奖励」页的点数余额 = 已完成事件累计点数 − 已兑换奖励累计点数，
  应用开着不刷新页面，一个事件的真实结束时间过去后，最多 30 秒余额
  就会自动增加，不用等到第二天
- 兑换奖励后余额立刻按兑换金额下降，且能在"已兑换"表格里看到这条记录
- 跳过一个已经结算过点数的事件，余额立刻按退回的点数下降；取消跳过后
  下一次结算（最多 30 秒内）会重新计入
- 项目里搜不到 `addPoints`/`settlePastDays`/`resetPointsFromMonday`/
  `rewardPoints` 的任何活代码引用（历史注释除外）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（也没有执行桌面快捷方式，
那需要真的启动开发服务器）。`node --input-type=module --check` 校验了
`rewards.js`/`plans.js`/`persistence.js`；`@vue/compiler-sfc` 编译
`App.vue`/`RewardPanel.vue`/`DayTimeline.vue`/`SettingsPanel.vue` 均
通过。用手抄一份和 `rewards.js` 完全一致的算法（`rewards.js` 经
`persistence.js` 间接依赖 `state/db.js` -> `@sqlite.org/sqlite-wasm`，
Node 环境下这个包解析不到期望的具名导出，没法直接 import 完整链路，和
REQ-031 验证时遇到的限制一样）跑了端到端测试：过去日期的块正确结算、
Google/跳过的块不结算、**今天已经过了真实结束时间的块会结算、今天还
没到结束时间的块不会结算**（这一条直接证明了"实时"而不是"延迟一天"）、
派生余额等于已结算之和减已兑换之和、兑换后余额正确下降、重复调用
结算函数是幂等的（不会重复计分），全部符合预期。桌面快捷方式用
`Test-Path` 确认创建成功，但双击后的真实启动效果需要用户本地确认。

---

## [REQ-047] 修正 REQ-045：跨 6 点分界线的凌晨片段应画到前一天

状态：completed
模块：src/constants/timelineRange.js, src/components/DayTimeline.vue,
src/components/WeekBoard.vue

描述：
REQ-045 把跨 6 点分界线的块（比如 4:00-8:00）拆成两段渲染，但两段都画
在这个块自己所在的那一天（前半段贴网格底部、后半段贴网格顶部）。用户
反馈"跨越凌晨的时候显示有问题，应该凌晨其实是显示在前一天那里的"——
用 AskUserQuestion 确认具体是指：REQ-045 的拆分**方向**错了，凌晨到
6 点这一段（`[block.start, 6)`）应该画到**前一天**的时间轴里，而不是
块自己当天的时间轴里（用户没有选择"每天 0-6 点都该属于前一天"这个更
根本的重新定义，只是针对"已经因为跨界需要拆分"的这类块）。

处理：
- `constants/timelineRange.js` 的 `needsDisplaySplit`/
  `splitDisplaySegments` 本身不用改（判断条件、切出的两段真实小时区间
  没变），改的是"这两段各自画在哪一天"这件事，挪到组件层处理。
- `DayTimeline.vue`：新增 `nextDateKey`/`nextDayBlocks` 两个 computed，
  `renderItems` 现在看两天的数据——自己这天的块（跨界的只渲染后半段
  `[6, block.end)`，作为 `isClosing:true` 的可交互项）+ 明天的块里
  凡是需要拆分的，把它们的前半段 `[block.start, 6)` 借来渲染在"今天"
  这个视图的底部（`isClosing:false`，纯视觉、不可点击/不可拖拽——它的
  真实 `dateKey` 是明天，点击它去操作会对错 `dayTimelines` 数组，索性
  不让它可交互）。模板的 `@click` 从无条件改成 `item.isClosing &&
  onBlockClick(item.block)`，只有真实结束时间所在的那一段能点开编辑
  弹层；可交互的项（`isClosing:true`）永远是块自己真实所在那天的
  数据，`onBlockClick` 内部沿用当前查看日期作为 `dateKey` 不会用错。
- `WeekBoard.vue`：`renderItemsForDate(date)` 同款改法（多看
  `addDays(date, 1)` 那一天的数据），每个渲染片段自带 `dateKey` 字段
  （标记这段真实属于哪一天，不一定等于正在渲染它的那一列）。周视图
  本来点击任意块就是跳转到日视图（`navigate('day', {selectedDate})`），
  改成用 `parseDateKey(item.dateKey)` 而不是当前列的 `date`——点击"借来"
  显示在前一天列里的凌晨片段，会正确跳转到它真实所在的那一天（能在
  那看到可交互的后半段），不会跳到错误的日期。`onDragStart` 同理改用
  `item.dateKey`。
- `blockLayout`/重叠分栏判定继续只看每一天自己的块（不含"借来"的片段）
  ——这是极少见的边界情况叠加边界情况（凌晨片段又恰好和别的事件重叠），
  不值得为它重新推导，已知局限，写在代码注释里。

验收：
- 一个 4:00-8:00（跨 6 点）的事件：查看它自己那天，只看到 6:00-8:00
  这一段（贴着网格顶部，可点击/可跳过/可删除）；查看**前一天**，能在
  时间轴底部看到 4:00-6:00 这一段（纯展示，点它没反应）
  ——两段标题一致，能看出是同一件事
  ——不跨 6 点的普通事件（绝大多数情况）行为不受影响，还是只在自己
  那天显示
- 周视图里同样能看到"前一天"那一列底部多出凌晨片段；点击这个片段会
  跳转到它真实所在的那一天（不是当前列对应的那一天）
- 在真实所在的那一天点击后半段编辑/跳过/删除，效果立刻反映在两个视图
  上（因为本来就是同一个 block 对象）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`@vue/compiler-sfc` 编译
`DayTimeline.vue`/`WeekBoard.vue` 通过。用 `node` 手抄一份和
`DayTimeline.vue` 的 `renderItems` 逻辑完全一致的实现跑了端到端测试
（一个 2026-08-20 的 4:00-8:00 事件）：查看 2026-08-19（前一天）只
产出一条记录——`[4,6)`、`dateKey=2026-08-20`、`isClosing=false`；查看
2026-08-20（自己那天）只产出一条记录——`[6,8)`、`dateKey=2026-08-20`、
`isClosing=true`；查看 2026-08-21（普通不跨界的一天）只产出未拆分的
原始记录，三个场景全部符合预期。真实浏览器里的视觉排布和点击跳转效果
需要用户本地确认。

---

## [REQ-048]"体验库"改名"兴趣活动"并重做：新分类体系 + 标题/链接/图片/内容 + 横屏卡片网格 + 筛选/搜索

状态：completed
模块：src/domain/activityPool.js, src/domain/feedbackAdjuster.js（删除）,
src/utils/markdown.js（新增）, src/constants/colors.js,
src/components/ActivityCard.vue, src/components/ActivityLibraryPanel.vue,
src/components/ActivityModal.vue（新增）, src/components/DayTimeline.vue,
src/components/SettingsPanel.vue, src/state/persistence.js,
css/components.css, css/timeline.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求把"体验库"整体改名"兴趣活动"并重做：
1. 类别从服务自动排程的"新鲜度"维度（新体验/兴趣/变化/固定安排）换成
   真实兴趣类型：摄影、露营、登山、游泳、滑雪、购物、社交（用户列出的
   例子，补了一个"其他"兜底）。
2. 活动字段简化成手动录入的标题/链接/图片/内容（内容一般直接上传
   .md 文件）。
3. 卡片视觉从竖版小卡改成横屏封面图，一行 3-4 张。
4. 页面顶部加类别筛选框 + 标题模糊搜索框。

排查确认这不是简单的"改改字段名"：旧的 category（novel/interest/
variety/routine）+ blockType/durationMinutes/energyLevel/rating/
weightMultiplier/timesScheduled/lastScheduledAt 这套字段，本来是专门
喂给 `domain/scheduler.js`/`domain/noveltyEngine.js`（自动挑活动排进
周计划）用的。Grep 全项目确认 `generateWeeklyPlan`/`planWeekDays`/
`markScheduled` 在任何 `.vue` 文件里都没有调用方——REQ-015 已经把
"生成本周计划"这个唯一入口的按钮删掉了，这套自动排程子系统本来就已经
是没有 UI 触发的死代码。这意味着重新定义 `category`、精简掉这些字段，
对"当前用户实际能用到的功能"影响极小，风险主要在于"会不会留下引用了
不存在字段的活代码"。

处理：
- `domain/activityPool.js`：`CATEGORIES` 换成新的 8 个话题分类；
  `addActivity` 字段集合精简为 `{id, title, category, link, imageUrl,
  content, createdAt}`；删除 `markScheduled`/`rateActivity`/
  `listActivities`（都已经没有调用方或调用方已随这次改动一起清理）。
  `rateActivity` 是唯一一个删除前还有**真实**调用方的旧函数——
  `ActivityCard.vue`（旧版评价按钮）和 `DayTimeline.vue`
  （`onRate`/`findActivity(block.activityId)`，虽然
  `block.activityId` 只有已死的自动排程会赋值，实际运行中永远是
  `undefined`，但这段代码本身是活的，删函数必须同时清理这两处调用方，
  不能只删函数留着两处调用方报错）。`domain/feedbackAdjuster.js`
  （`rateActivity` 唯一的依赖）随之整个删除，不是"删按钮留函数"那种
  可恢复的暂存，而是彻底不再需要——它操作的 `weightMultiplier` 字段
  在新数据模型里已经不存在了。
- `src/utils/markdown.js`（新增）：极简 Markdown→HTML 转换（标题/粗体/
  斜体/链接/无序列表/段落），不引入第三方 Markdown 解析库依赖——这些
  内容是用户自己的笔记，不需要表格/代码块等复杂语法。渲染前对原始文本
  做 HTML 转义，避免 `v-html` 把用户笔记里恰好出现的尖括号当成真实
  标签解析执行。
- `ActivityCard.vue` 整个重做：16:9 横屏封面（`aspect-ratio`），类别
  标签叠在封面左下角，编辑/删除两个圆形图标按钮浮在封面右上角（hover
  才显现），下面只剩标题。点卡片本体触发 `open` 事件打开详情弹层。
- `ActivityModal.vue`（新增）：一个弹层承担"查看详情"（图片/类别/
  链接/渲染后的 Markdown 内容/编辑/删除按钮）和"新建/编辑"（表单：
  标题/类别/链接/图片 URL/内容文本框 + 上传 .md 文件按钮）两种模式，
  和 `EventModal.vue` 的 isEdit 写法是同一类惯例，多了一个"看完详情再
  决定要不要编辑"的模式切换。
- `ActivityLibraryPanel.vue` 重做：`view-header` 右侧新增标题模糊搜索
  框（`n-input` 子串匹配，不是拼写纠错式的真模糊）+ 类别筛选下拉
  （沿用已有的 `n-select`），两个条件叠加过滤；下面是横屏卡片网格
  （`repeat(auto-fill, minmax(250px, 1fr))`，视口宽度决定一行 3-4 张）。
  原来页面顶部的内联添加/编辑表单整个换成点击后弹出 `ActivityModal.vue`。
- `DayTimeline.vue`：删除 `RATING_ORDER`/`RATING_ICONS`/`findActivity`/
  `onRate` 和模板里的评价按钮块（唯一还依赖 `activityPool.rateActivity`
  的活代码，见上）。
- `SettingsPanel.vue`：删除"每阶段类别配额"这个分区（表格列头是
  `CATEGORIES`，如果不删，用户会看到"探索阶段排几个摄影类活动"这种
  完全对不上号的表格——这套配额本来就是喂给已死的 `scheduler.js` 用的，
  但列头换成新分类后会从"安静的死代码"变成"看起来像能用、实际点了没
  反应"的误导性 UI，所以一并删除，不是新的范围扩大，是这次字段重定义
  必然带来的后果）。`settings.categoryQuotas` 这个字段本身留在 schema
  里当死数据，不动 `persistence.js` 的默认值生成（和 `phaseWeeks` 处理
  方式一致）。
- `constants/colors.js`：`CATEGORY_COLORS` 换成新 8 个分类的配色。
- `persistence.js`：`SEED_ACTIVITIES` 删除，新安装 `activityPool` 是
  空数组——编不出真实有意义的链接/图片，硬造几条"看起来像推荐"的种子
  内容风险大于价值。新增 `migrateLegacyActivity()`：老数据里 category
  还是旧值（novel/interest/variety/routine）的条目，保留
  id/title/createdAt/imageUrl，其余旧字段丢弃，`category` 归到新分类的
  `other`，`link`/`content` 留空；已经是新分类的条目直接跳过，函数本身
  幂等，`fillMissingDefaults()` 里每次加载都会跑一遍，不需要额外的
  一次性标记。
- 三个语言文件：`domain.category.*` 换成新 8 个分类的翻译；
  `library.*` 整段重写（新增搜索/链接/内容/上传相关的 key，删除
  blockType/tags/duration/energy/meta/rated 相关的旧 key）；
  `domain.rating.*`/`day.ratedToast`（活动评价功能删除后不再被
  任何地方引用）一并删除；`settingsView.quotaSection`/`quotaHeader`
  （配额表格删除后不再被引用）一并删除。
- CSS：`components.css` 里活动库相关规则整段重写（横屏卡片 + 弹层样式），
  删除已经没有任何组件引用的 `.activity-card__meta`/`__tags`/`__ratings`/
  `.rating-btn*`/`.tag`/`.activity-form__grid`（`.activity-form`/
  `.activity-form__actions` 仍被 `PlanPanel.vue`/`RewardPanel.vue`
  复用，保留）；`timeline.css` 删除不再被引用的 `.timeline-block__ratings`。

验收：
- 侧边栏导航"体验库"变成"兴趣活动"
- 打开兴趣活动页面，能看到横屏封面卡片网格，一行 3-4 张（视口宽度
  决定），没有活动时看到空状态提示
- 页面顶部有类别筛选下拉（摄影/露营/登山/游泳/滑雪/购物/社交/其他）
  和标题搜索框，两者可以叠加使用（比如筛选"摄影"再搜索关键词）
- 点击「添加活动」弹出表单，能填标题/选类别/填链接/填图片 URL/直接
  粘贴或上传一个 .md 文件作为内容，保存后卡片出现在网格里
- 点击一张卡片，弹层显示完整封面图、类别标签、"访问链接"按钮（有填
  链接时）、渲染成标题/粗体/列表等格式的内容（不是原始 Markdown 源码），
  以及"编辑"/"删除"按钮
- 卡片右上角 hover 时出现的编辑/删除图标按钮，点击后分别能快速进入
  编辑弹层 / 二次确认后删除，不需要先打开详情
- 升级前如果已经有旧版"体验库"的活动数据，打开新版页面后这些条目
  还在（标题/封面图保留），类别显示"其他"，链接/内容是空的，等待用户
  重新整理
- 设置页里原来的"每阶段类别配额"表格不再出现

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了 `activityPool.js`/`persistence.js`/`markdown.js`/
`colors.js`；`@vue/compiler-sfc` 编译 `ActivityCard.vue`/
`ActivityModal.vue`/`ActivityLibraryPanel.vue`/`DayTimeline.vue`/
`SettingsPanel.vue` 均通过。用 WebFetch 核对了新用到的三个
`@vicons/material` 图标（`SearchRound`/`UploadRound`/`OpenInNewRound`）
在对应版本的包里确实存在（同 REQ-005/007 时的验证方式，避免具名导入
拼错导致整个应用起不来）。用 `node -e` 实测了 `renderMarkdown()`：
标题/粗体/斜体/链接/列表正确转换，混进去的 `<script>alert(1)</script>`
被转义成纯文本而不是被解析成可执行标签。用手抄一份和
`migrateLegacyActivity()` 完全一致的实现（`persistence.js` 依赖
`state/db.js` -> `@sqlite.org/sqlite-wasm`，Node 下无法直接
import，同 REQ-031/046 遇到的限制）验证了：旧分类条目正确剥离
blockType/rating 等字段、`category` 归到 `other`、`link`/`content`
留空；新分类条目原样跳过（`===` 全等，证明没有被重新构造）；对已经
迁移过的条目重跑一遍结果还是原样不变（幂等）。三个语言文件的
`library`/`domain.category` key 数量用 `node -e` 核对一致（分别是
29 个和 8 个）。Grep 确认 `rateActivity`/`listActivities`/
`markScheduled`/旧版 `activity.blockType` 等字段在 `src/components/`
下已经没有任何残留引用（`domain/dayPlanner.js`/`noveltyEngine.js`/
`scheduler.js` 仍然引用这些字段名，但这几个文件本来就是已确认没有 UI
调用方的死代码，读到 `undefined` 时都有 `|| 默认值` 兜底，不会报错，
这次特意没有连带清理，保持模块边界）。真实浏览器里的卡片网格视觉效果、
弹层里 Markdown 渲染的实际观感、文件上传交互需要用户本地确认。

---

## [REQ-049] 兴趣活动页面：搜索/筛选挪到页面内居中 + 卡片网格固定 4 列

状态：completed
模块：src/components/ActivityLibraryPanel.vue, css/components.css

描述：
用户对 REQ-048 刚做完的"兴趣活动"页面反馈两点：搜索框和类别筛选框不要
放在页头右上角，挪到页面里面、水平居中；卡片太小了，一行 4 个就够，
要求控制列数。

处理：
- `ActivityLibraryPanel.vue`：`view-header__right` 现在只留"添加活动"
  按钮；搜索框 + 类别筛选框搬到页头下面新增的一行
  `.activity-library__filters`，和卡片网格之间独立成一段。
- `css/components.css`：新增 `.activity-library__filters`
  （`display:flex; justify-content:center`，水平居中，两个控件之间留
  12px 间距）。`.activity-grid` 的 `grid-template-columns` 从
  `repeat(auto-fill, minmax(250px, 1fr))`（宽屏下会自动挤出 5-6 列，
  卡片跟着变小，这正是用户反馈"卡片太小"的原因）改成固定
  `repeat(4, 1fr)`——列数不再随视口变宽而增加，卡片改成随可用宽度等比
  放大。新增 900px 断点下收成 2 列的媒体查询，和
  `css/layout.css` 里侧边栏在这个断点变成抽屉的既有响应式设计保持
  一致，避免窄屏下 4 列被压得太窄。

验收：
- 打开"兴趣活动"页面，页头右上角只有"添加活动"按钮，搜索框和类别
  筛选框在页面内单独一行、水平居中
- 宽屏下卡片网格固定 4 列，不会因为屏幕更宽就自动挤出更多列、卡片
  跟着变小；每张卡片明显比 REQ-048 时大
- 窄屏（900px 以下）下网格收成 2 列，不会被压得太窄

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`@vue/compiler-sfc` 编译
`ActivityLibraryPanel.vue` 通过；`node -e` 核对 `css/components.css`
改动后大括号数量前后一致（93/93），没有漏改/多改括号。真实浏览器里的
布局效果需要用户本地确认。

---

## [REQ-050] 兴趣活动页面：搜索框/类别筛选重新设计（去简陋 + 分类改可多选 chip）

状态：completed
模块：src/components/ActivityLibraryPanel.vue, src/components/ActivityCard.vue,
src/constants/colors.js, css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户对 REQ-049 刚调整完位置的搜索框/类别筛选反馈两点：样式太简陋；
类别应该直接列出常用的，通过一个多选框选择（而不是要点开才能看的
下拉框）。

处理：
- `constants/colors.js`：新增 `CATEGORY_EMOJI`（8 个新分类各自一个
  emoji），从 `ActivityCard.vue` 内部私有常量抽出来，和
  `ActivityLibraryPanel.vue` 的筛选 chip 共用，避免两处各写一份。
- `ActivityLibraryPanel.vue`：类别筛选从单选 `n-select` 下拉框改成
  直接平铺全部 8 个类别、可多选的 chip 行（`n-tag checkable round
  size="large"`，选中态用 `CATEGORY_COLORS` 对应颜色高亮）——8 个类别
  不算多，没必要藏进下拉菜单，点哪个亮哪个，可以同时选中多个（比如
  同时看"摄影"和"露营"）。`filterCategory`（单个字符串）换成
  `filterCategories`（数组），新增 `toggleCategory(c)` 负责增减；空
  数组表示"不筛选，显示全部"，语义上和原来单选选"全部类别"一致，不需要
  再有专门的"全部类别"选项，配套的 `library.filterAll` 这个 i18n key
  （原来那个选项用的）在三个语言文件里一并删除。搜索框加了 `round`/
  `size="large"` 属性，加大尺寸更好点。
- `css/components.css`：新增 `.activity-library__search`（`box-shadow:
  var(--shadow-elevation-1)`，悬浮/聚焦时加深到 `--shadow-elevation-2`，
  呼应 REQ-007"卡片类容器靠阴影分隔层次"的整体视觉方向）和
  `.activity-library__category-chips`（flex 换行 + 居中）。

验收：
- 打开"兴趣活动"页面，搜索框看起来是一个带阴影、圆角更明显的胶囊形
  输入框，聚焦/悬浮时阴影加深
- 类别筛选是一排直接可见的 8 个 chip（摄影/露营/登山/游泳/滑雪/购物/
  社交/其他，各带一个 emoji），不再需要点开下拉菜单
- 点击多个 chip 可以同时选中多个（比如"摄影"+"露营"都亮起来），网格
  只显示这几个类别的活动；全部取消选中后网格显示全部活动
- 搜索和多选类别筛选可以同时叠加使用

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`colors.js`；`@vue/compiler-sfc` 编译 `ActivityLibraryPanel.vue`/
`ActivityCard.vue` 均通过；三个语言文件 `library` key 数量核对一致
（各 28 个，删除 `filterAll` 后从 29 变 28）。真实浏览器视觉效果需要
用户本地确认。

---

## [REQ-051] 奖励点数改为完全实时现算，不再存任何快照

状态：completed
模块：src/domain/rewards.js, src/components/DayTimeline.vue,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"奖励点数帮我按照逻辑重新计算一下"。用 AskUserQuestion 确认
具体诉求：沿用上次（REQ-046）讨论的派生计算逻辑，但要额外考虑"单位
时间的点数"，并且明确"这个计算逻辑应该是自动更新的，每次进入页面都
会重新计算，不是说保存在数据库里就行了的"。

排查确认 REQ-046 虽然已经把**点数余额**改成了派生计算（不存
`state.rewardPoints`），但每个块的**点数本身**在结算那一刻仍然会算出
一个数字快照存进 `block.pointsAwarded`（沿用 REQ-020 时的设计：避免
之后改了比率或拖拽改了时长导致撤销时数字对不上）。这意味着如果用户
在 Settings 里调整了 `pointsPerHourWeekday`/`pointsPerHourWeekend`，
之前已经"结算"过的历史事件不会跟着变——停留在结算那一刻的旧比率上，
和用户说的"单位时间的点数需要考虑一下"、"不是保存在数据库里就行了的"
这两点对不上。

处理：
- `domain/rewards.js`：新增内部函数 `isBlockEligible(block, dateKey,
  todayKey, nowHour)`，把"这个块有没有资格算点数"的判断（不是
  Google 来源、没被标记跳过、真实结束时间已经过去）抽出来，
  `computeRewardBalance()`/`settleCompletedBlocks()` 共用。
  `computeRewardBalance(state)` 重写：不再读任何存储的点数字段，对每
  个"有资格"的块，用它所在那天是不是周末选**当前**的比率、乘真实
  时长现算出点数再累加，减去已兑换奖励之和——每次调用都是全量现算，
  调整比率会立刻影响所有历史事件，不需要额外的"重新结算"步骤。
  `settleCompletedBlocks()` 职责大幅收窄：不再计算/存储点数，只剩
  "一个块第一次有资格时，如果关联了计划关键事件就推进那份计划"这一件
  事，`block.pointsSettled` 这个字段名字沿用旧的叫法，但含义收窄为
  "有没有已经因为自己推进过关联的计划"，和点数计算完全脱钩；
  `block.pointsAwarded` 这个快照字段不再写入。
- `DayTimeline.vue`：`toggleSkip()` 不再需要清 `pointsAwarded`（这个
  字段已经不存在），标记跳过这一步本身就足够让
  `computeRewardBalance()` 下次现算时自然排除这个块；`pointsSettled`
  的清理/判断逻辑保留，但只服务计划进度撤销，不再和点数相关。
- 三个语言文件的 `settingsView.pointsPerHourHint` 提示文案重写，去掉
  "结算有一天延迟"这句已经过时的描述（REQ-046 时就已经不准确，这次
  一并修正），改成明确说明"点数每次打开页面都用当前比率现算，调整
  比率会立刻影响所有已完成事件"。

验收：
- 完成几个事件、攒了一些点数之后，去设置页把"平日每小时点数"调大或
  调小，回到「奖励」页面，余额立刻按新比率重新算出的结果显示，**包括
  之前已经算过的历史事件**，不需要做任何额外操作
- 反复打开/离开「奖励」页面，同样的历史数据每次显示的余额一致（幂等，
  不会因为多算几次就变多或变少）
- 关联了计划关键事件的事件，真实结束后计划进度照常自动推进；跳过一个
  已经推进过计划的事件，计划进度正确撤销

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了 `rewards.js`；`@vue/compiler-sfc` 编译
`DayTimeline.vue` 通过。用手抄一份和新逻辑完全一致的实现（同 REQ-046
遇到的 Node 下无法直接 import sqlite-wasm 依赖链的限制）验证了核心
诉求：同一个历史块（2 小时，周一）在比率是 100/小时时算出 200 点，
**不改任何历史数据、只改 `settings.pointsPerHourWeekday` 成
300/小时**后，同一个块立刻算出 600 点——证明了"调整比率立刻影响历史
事件"这条关键行为；重复调用两次结果一致（幂等）。Grep 确认
`pointsAwarded` 在 `src/` 下已经没有任何活代码引用（只剩解释历史变更
的注释）。真实浏览器里调整比率后的实际显示效果需要用户本地确认。

## [REQ-052] 删除"防重复冷却周期"设置及关联的自动排程死代码

状态：completed
模块：src/domain/scheduler.js（已删除）, src/domain/noveltyEngine.js
（已删除）, src/domain/dayPlanner.js, src/components/SettingsPanel.vue,
src/state/persistence.js, src/domain/holidays.js,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"设置里面的防重复冷却周期这个删除，然后相关随机生成本周计划
的程序看看有没有漏下来的，帮我删除掉"。

排查确认"随机生成本周计划"这套自动排程子系统——`domain/scheduler.js`
（`generateWeeklyPlan`）、`domain/noveltyEngine.js`
（`scoreActivity`/`isInCooldown`）、`domain/dayPlanner.js` 里的
`planWeekDays` 及其一堆私有辅助函数——从 REQ-015 删掉唯一的 UI 触发
按钮起就已经没有任何调用方；REQ-048 把 `domain/activityPool.js` 的活动
数据模型从"服务自动排程"改成"兴趣参考库"之后，这套逻辑读取的
`activity.category`/`blockType`/`durationMinutes`/`weightMultiplier`/
`lastScheduledAt`/`timesScheduled` 等字段在新数据模型里已经不存在，就
算保留下来也早就不可能正确运行了，是纯粹的死代码。

处理：
- 整个删除 `src/domain/scheduler.js`、`src/domain/noveltyEngine.js`。
- `src/domain/dayPlanner.js`：删掉 `planWeekDays` 及其私有辅助函数
  （`overlapsAny`/`subtractIntervals`/`pickWindowForActivity`/
  `TIME_PREFERENCE`/`DAY_RANGE`），只保留 `BLOCK_TYPES`（仍被
  `EventModal.vue` 的手动建事件表单使用）和 `IMPORTED_BLOCK_TYPE`
  （`'busy'` 字符串字面量仍在 `DayTimeline.vue`/`WeekBoard.vue`/
  `GoogleSyncPanel.vue`/`colors.js` 多处直接使用），补充注释说明这两个
  常量是独立于已删除排程算法的"类型字典"，不受这次删除影响。
- `src/components/SettingsPanel.vue`：删掉"防重复冷却周期"整个设置
  分区（`cooldownWeeks` 输入框），以及 `buildDraft()`/`save()` 里对
  `cooldownWeeks` 的读写。
- `src/state/persistence.js`：`createDefaultState()` 里删掉
  `settings.categoryQuotas`（连同 `DEFAULT_CATEGORY_QUOTAS` 常量）、
  `settings.cooldownWeeks`、顶层 `weeklyPlans`（自动生成的周计划记录，
  唯一写入方是已删除的 `generateWeeklyPlan`/已在 REQ-015 删除的
  "生成本周计划"按钮），补充注释说明删除原因和历史出处。
- `src/domain/holidays.js`：文件头注释原本说明"节假日数据不参与自动
  排程避让逻辑"这条范围取舍，因为自动排程子系统已整个删除而失去意义，
  改写成简短说明这套子系统已在本次删除。
- 三个语言文件删掉 `settingsView.cooldownSection`/
  `settingsView.cooldownLabel` 两个 i18n key。

验收：
- 设置页不再出现"防重复冷却周期"这个分区
- 全仓库 grep `cooldownWeeks`/`cooldownSection`/`cooldownLabel`/
  `categoryQuotas`/`weeklyPlans`/`scheduler`/`noveltyEngine`/
  `planWeekDays` 只剩解释性注释，没有任何活代码引用
- 手动建事件、Google 日历导入事件、日/周视图渲染等功能不受影响（都
  只依赖 `BLOCK_TYPES`/`'busy'` 字符串，不依赖被删除的排程算法）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 依次校验了 `dayPlanner.js`、`persistence.js`、`holidays.js`、
三个语言文件，均通过；`@vue/compiler-sfc` 编译 `SettingsPanel.vue`
通过。Grep 全仓库确认 `scheduler`/`noveltyEngine`/`planWeekDays`/
`generateWeeklyPlan`/`scoreActivity`/`isInCooldown`/`cooldownWeeks`/
`cooldownSection`/`cooldownLabel`/`categoryQuotas`/`weeklyPlans`/
`DEFAULT_CATEGORY_QUOTAS` 均已没有真实 import/调用，只剩解释删除原因
的注释。真实浏览器里的设置页显示效果需要用户本地确认。

## [REQ-053] 兴趣活动类别改成动态可扩展列表：常用露出 chip、少用折进下拉框、可现场新建

状态：completed
模块：src/state/persistence.js, src/domain/activityPool.js,
src/constants/colors.js, src/components/ActivityCard.vue,
src/components/ActivityModal.vue, src/components/ActivityLibraryPanel.vue,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"兴趣活动的分类样式还行，稍微修改一下：显示最常用的（点击次数
最多的）放在前面，使用少的全部放进一个下拉框；需要修改表结构就修改，
添加类别的时候可以设置不存在的类别，顺便一起添加分类"。这是一次明确
授权修改 schema 的请求（"需要修改表结构你就修改就行"），核心诉求有三点：
①类别不再是固定列表，用户能现场输入新名字创建；②类别按"使用次数"排序，
常用的直接可见，少用的收进下拉框；③改动落到数据结构层面，不是纯展示层
的排序技巧。

处理：
- `state/persistence.js`：新增顶层 `activityCategories:
  [{id, name, useCount}]`。`id` 是稳定的 `createId('cat')`，`activity.
  category` 字段存这个 id（不再是 REQ-048 时代的英文标识符），改名字
  不影响已关联的活动。`name` 是用户看到/输入的真实文本——**不再经过
  i18n 翻译**，这是这次改动必然的取舍：动态用户输入的类别名字没办法
  自动翻译成另外两种语言，旧的 8 个固定类别（摄影/露营/登山/游泳/滑雪/
  购物/社交/其他）失去多语言展示，改成固定显示中文名，和新建类别一视
  同仁。`useCount` 只增不减，在 `activityPool.js` 的 `addActivity`/
  `updateActivity` 里维护。新增迁移函数 `migrateActivityCategoryRef()`：
  按 `activity.category` 是否已经是 `cat_` 前缀判断是否需要迁移（幂等
  判据），旧的 8 个英文标识符通过一份映射表转换成对应种子类别的新 id，
  `fillMissingDefaults()` 里在 `migrateLegacyActivity()` 之后接着跑
  一遍。
- `domain/activityPool.js`：删掉固定的 `CATEGORIES` 数组。新增
  `addCategory(store, name)`（trim 后按名字去重，已存在就直接复用，不
  会因为用户手滑创建"摄影"/" 摄影 "两个几乎一样的类别）和
  `getCategoryName(categories, id)`（按 id 查名字，查不到兜底空字符串）。
  `addActivity`/`updateActivity` 内部维护 `useCount`：新建活动直接给
  选中类别 +1；编辑活动只在类别真的发生变化时才给新类别 +1，编辑其它
  字段或把类别"改成"当前值都不触发计数、旧类别的计数也不会被扣减。
- `constants/colors.js`：删掉按固定标识符查表的 `CATEGORY_COLORS`/
  `CATEGORY_EMOJI`，改成 `categoryColor(id)`/`categoryEmoji(id)`——对
  类别 id 字符串算一个稳定哈希，从一个固定调色板/emoji 表里取余数选
  一个：同一个类别 id 每次颜色/emoji 都一样，不需要为每个新建类别单独
  存一份颜色配置。
- `ActivityCard.vue`/`ActivityModal.vue`：新增 `categories` prop（父组件
  转发 `state.activityCategories`），类别显示文本改成
  `getCategoryName()` 查表，不再走 `t('domain.category.'+...)`。
  `ActivityModal.vue` 的类别选择框换成 `n-select` 的
  `filterable + tag + on-create` 组合（已读 `node_modules` 里 naive-ui
  的 `Select.mjs`/`.d.ts` 源码核对过这三个 prop 的实际行为，不是凭记忆
  猜的 API）：`on-create` 在用户每敲一个字符时都会被调用一次算"候选项
  预览"，必须是纯函数，不能在这里就真的创建类别（否则打字过程会创建出
  一堆从未被选中的半成品类别）；真正落盘创建被推迟到 `update:value`
  触发、确认用户真的选中了这个新名字的那一刻才调用 `addCategory()`。
  新建活动默认选中当前 `useCount` 最高的类别（而不是列表里随便一个），
  省一次手动选择。
- `ActivityLibraryPanel.vue`：类别筛选行拆成两部分——`useCount` 降序
  取前 `TOP_CATEGORY_COUNT`（6）个铺成原有的可多选 chip；剩下的塞进
  一个可多选的"更多分类" `n-select`（`css/components.css` 新增
  `.activity-library__category-more` 控制宽度）。两边共用同一个
  `filterCategories` 数组：chip 用原有的 `toggleCategory()` 增减；
  下拉框那部分用 `overflowSelected` 这个 computed 的 getter/setter 做
  局部代理，取/写 `filterCategories` 里落在"溢出类别" id 集合内的那个
  子集，互不干扰。
- 三个语言文件删掉不再使用的 `domain.category.*`（8 个固定类别的翻译），
  新增 `library.categoryPlaceholder`/`library.categoryMoreLabel`。

已知局限：
- 新建的类别没有删除入口——用户在弹层里输入一个新名字会立刻创建并落盘，
  就算这次没有保存活动、关掉弹层，这个类别也会留在列表里（`useCount`
  仍是 0，自然会沉到"更多分类"下拉框里），需要手动整理的话目前只能
  通过其它渠道清理，这次没有做删除类别的入口，用户没有提出这个诉求，
  避免范围扩大。
- 旧的 8 个固定类别失去多语言展示（英文/日文界面下也会显示中文名字），
  是"类别改成用户可任意输入的动态文本"这个改动本身带来的必然取舍，见
  上面处理小节说明。

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了 `persistence.js`/`activityPool.js`/`colors.js`/三个语言
文件；`@vue/compiler-sfc` 的 `compileScript`/`compileTemplate` 编译了
`ActivityCard.vue`/`ActivityModal.vue`/`ActivityLibraryPanel.vue` 均通过。
用 stub 掉 `state/db.js`（sqlite-wasm 依赖链在 Node 下无法直接 import，
和历次 domain 层测试同一个变通方法）的方式直接跑了真实
`persistence.js`：验证了新安装种入 8 个类别、useCount 全 0；一份 REQ-048
时代（英文标识符 category、无 activityCategories 字段）的旧数据导入后
`category` 被正确迁移到新 id；同一份迁移结果再喂一次迁移函数结果不变
（幂等）；一份已经带自定义类别的数据（`category` 已是 `cat_` 前缀）
导入后不会被误判成旧数据重新分配。`domain/activityPool.js` 不依赖
sqlite-wasm，直接从真实源文件 import 测试：验证了 `addActivity`/
`updateActivity` 的 `useCount` 增减规则（新建 +1、类别真变化才 +1、
编辑无关字段或类别设成当前值都不触发）、`addCategory()` 的按名去重和
拒绝空名、`getCategoryName()` 的正常/兜底两种情况。真实浏览器里
`n-select` 的 `tag` 模式交互效果（尤其是"边打字边看到候选项预览、选中
后才真正创建"这个时序）需要用户本地确认。

## [REQ-054] 计划编辑支持在末尾追加新的关键事件

状态：completed
模块：src/domain/plans.js, src/components/PlanPanel.vue,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"修改一下计划，编辑是可以在后面添加事件"。REQ-036 时用户曾经
明确反馈"添加关键事件的功能不需要"，把 `addKeyEvent` 整个删除过；这次
是需求本身随时间变了，用户重新要求把"往已有计划末尾追加关键事件"这个
能力加回来，不是撤销 REQ-036 当时的决定、也不是发现了那次删除有问题。

处理：
- `domain/plans.js`：新增 `addKeyEvent(store, planId, {title,
  estimatedHours})`——只追加到 `keyEvents` 数组末尾，不支持插入到中间
  任意位置（用户原话是"在后面添加"，不是"任意位置插入"），保持"数组
  顺序即完成顺序"这个贯穿整个模块的不变式不被破坏。`estimatedHours`
  走和 `createPlan`/`updateKeyEvent` 完全一样的归一化规则
  （`Math.max(0.25, Number(x) || 1)`，0/NaN 落回 1，低于 0.25 的钳制到
  0.25），保持一致。对已废止的计划是无操作，和这个模块里其它会修改
  计划内容的函数（`updatePlan`/`updateKeyEvent`/`removeKeyEvent`/
  `completeKeyEvent`）同一套保护惯例。往一份"全部完成"的计划里追加新
  事件会让它自然重新变回"未完成"状态（`computePlanProgress().
  isFinished` 变回 `false`，新追加的事件变成当前 `activeKeyEvent`）——
  这是预期内的自然结果，不是需要特殊处理的边界情况。
- `PlanPanel.vue`：每张计划卡片的关键事件列表下面新增一行内联的"追加"
  表单（标题输入框 + 预计时长 + 按钮），只在计划未废止时显示。每张卡片
  自己一份草稿（`newKeyEventDrafts`，按 `planId` 存在一个 `reactive`
  对象里，懒初始化，和已有的 `collapsedPlans` 是同一套"局部 UI 状态按
  id 存"的写法），提交成功后重置回空，方便连续添加多条。
- `css/components.css` 新增 `.plan-key-event-row--add` 样式——虚线顶部
  分隔线，视觉上和上面已有的关键事件列表区分开，标记"这里开始是新增
  输入区，不是列表本身的一部分"。
- 三个语言文件新增 `plan.appendKeyEventBtn`/`plan.keyEventAddedToast`。

验收：
- 打开一张现有计划（未废止），关键事件列表下面能看到"标题 + 预计时长 +
  添加"的输入行
- 填标题、点"添加到末尾"，新的关键事件出现在列表最后一位，状态是
  "还锁着"（除非它前面所有事件都已完成，那样它会直接变成"当前解锁"）
- 标题留空点添加会提示"请输入关键事件标题"，不会真的创建出一条空标题
  的事件
- 已废止的计划看不到这个追加输入行
- 一份所有关键事件都已完成（显示"已到达终点"）的计划追加一条新事件后，
  进度标签变回"N / 总数 已完成"，不再显示"已到达终点"

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了 `plans.js`/三个语言文件；`@vue/compiler-sfc` 的
`compileScript`/`compileTemplate` 编译 `PlanPanel.vue` 通过。
`domain/plans.js` 不依赖 sqlite-wasm，直接从真实源文件 import 测试：
验证了追加到末尾、顺序保持不变；`estimatedHours` 归一化规则和
`createPlan`/`updateKeyEvent` 完全一致；往一份已完成的计划追加新事件
会正确重新打开（`isFinished` 变 `false`，新事件变成 `activeKeyEvent`）；
对已废止的计划调用是无操作。真实浏览器里的输入行样式/交互效果需要
用户本地确认。

## [REQ-055] 修复一键启动脚本报错 + README 重构成产品介绍向

状态：completed
模块：start-lifespark.bat, README.md, docs/KNOWLEDGE.md

描述：
用户反馈"启动脚本执行不了，执行就报错"，并要求把 README 重构成主要
介绍产品的版本，因为准备把项目上传到 git。两件事都是为"整理项目、准备
公开"这个同一目的服务，一并处理。

处理：
- `start-lifespark.bat`：定位到报错根因——文件保存成了 UTF-8（无
  BOM），中文 Windows 的 `cmd.exe` 按默认 GBK 代码页逐字节解析批处理
  文件，UTF-8 多字节中文字符在按 GBK 双字节配对时错位，偶然拼出 ASCII
  分隔符，导致脚本在中文注释/提示语句中间被截断，报"不是内部或外部
  命令"。曾尝试在脚本开头加 `chcp 65001` 补救，实测无效（`cmd.exe`
  批处理解析不是逐行按最新代码页生效）。最终修复：整个文件转成 ANSI
  （GBK）编码保存，CRLF 换行，脚本原有逻辑（cd 到自身目录 → 首次自动
  npm install → npm run dev -- --open）未改动，属于纯粹的编码修复，
  不是破坏性变更。已用 `cmd.exe` 实际执行验证：修复前会在第一行中文
  REM 注释处报错，修复后完整跑通到 Vite 开发服务器成功启动。此发现写入
  `docs/KNOWLEDGE.md`（"中文 Windows 上 .bat 脚本必须避开 UTF-8（不带
  BOM）编码"条目），避免以后新建 `.bat` 脚本重复踩坑。
- `README.md`：原版是"技术选型演进记录"式写法（大段 REQ 编号引用、
  存储方案取舍细节），不适合作为面向 git 访客的第一印象。重构为
  产品介绍优先的结构：开头改成一句话定位 + 核心功能 bullet 列表，
  技术细节收进靠后的"技术实现"精简小节（详细决策历史改为链接到
  `docs/CHANGELOG.md`），快速开始部分补充了双击
  `start-lifespark.bat` 一键启动的说明（因为这次刚好修好了它）。
  Google Calendar 配置步骤、目录结构/开发流程链接原样保留，没有事实性
  内容被删除，只是重新组织了呈现顺序和详略。
- 上传 git 前确认了 `data/lifespark-backup-2026-08-22.json`（含真实
  用户数据的导出备份）已被 `.gitignore` 里 `lifespark-backup-*.json`
  规则正确排除（`git check-ignore` 验证过），不需要额外处理。

验证：
按 AGENTS.md P2-2 的例外——用户明确要求排查"启动脚本报错"这个执行类
问题，不实际运行脚本无法定位/验证根因，因此在这一项上执行了项目启动
命令（`npm run dev`、`cmd.exe` 运行 `start-lifespark.bat`）：确认了
修复前的具体报错内容、修复后能完整跑通到 `VITE ... ready` 并监听
`http://localhost:5173/`。README 改动是纯文档，未做代码校验。

验收：
- 双击（或 `cmd.exe` 运行）`start-lifespark.bat` 不再报"不是内部或
  外部命令"，能正常拉起 `npm install`（首次）和 `npm run dev -- --open`
- README.md 开头是产品定位 + 功能列表，读者不需要先看懂技术选型
  章节就能明白这是什么工具
- README.md 里原有的技术信息（存储方案、Google Calendar 配置步骤、
  目录结构/开发流程链接）都还在，没有丢失

## [REQ-056] 补 Linux/macOS 启动脚本 + 多平台兼容性排查 + Google 同步页引导优化

状态：completed
模块：start-lifespark.sh, .gitattributes, README.md, docs/MODULES.md,
src/components/GoogleSyncPanel.vue, css/components.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求补一份 Linux 版启动脚本，顺便排查项目有没有多平台不兼容的
问题；并要求 Google 同步相关页面显示更友好，指导用户怎么去做 Google
授权、加上链接等。

处理：
- 新增 `start-lifespark.sh`：逻辑与 `start-lifespark.bat` 对齐（cd 到
  脚本自身目录 → 首次自动 `npm install` → `npm run dev -- --open`），
  UTF-8 + LF 编码（bash 在任何平台上都用 UTF-8 运行，不像 cmd.exe 有
  代码页问题，不需要 REQ-055 那套 GBK 处理）。用 `BASH_SOURCE` 而不是
  `$0` 定位脚本自身目录，等价于 `.bat` 版的 `%~dp0`。已用 `bash -n`
  语法检查、实际执行到 `VITE ... ready` 验证通过。
- 多平台排查结论：项目本身（Vue + Vite + 浏览器内 OPFS SQLite）不含
  任何 Node 端的 OS 专属代码——`package.json` 脚本、`vite.config.js`
  都是纯跨平台写法，src/ 下没有 `process.platform`/硬编码路径分隔符/
  Windows 专属 API。此前 REQ-041/042 引入过的 File System Access
  API（仅 Chromium 系浏览器支持）已经在 REQ-044 被用户要求删除，不再是
  遗留风险。唯一的平台专属产物就是启动脚本本身：`.bat` 只能在 Windows
  跑、新增的 `.sh` 只能在类 Unix 系统跑，这是启动脚本这个东西的本质
  决定的，不是 bug。
- 新增 `.gitattributes` 锁定 `*.bat` 为 CRLF、`*.sh` 为 LF，不依赖任何
  贡献者本地的 `core.autocrlf` 设置——这是排查中发现的真实风险点：如果
  不锁定，一个开着 `core.autocrlf=true`（Windows 上常见默认值）的贡献者
  哪怕只是碰一下 `start-lifespark.sh` 再提交，就可能把它的 LF 换行符
  悄悄转成 CRLF，导致 Linux/macOS 上执行报 "bad interpreter: /bin/
  bash^M" 找不到解释器。
- `GoogleSyncPanel.vue` Step 1 从一句"配置步骤见 README"的死文字，改成
  面板内可直接操作的编号引导列表：三个可点击链接分别跳转 Google Cloud
  Console 首页 / Calendar API 启用页 / 凭据（Credentials）页（都是
  Google Cloud Console 的标准固定路由，不依赖具体项目 ID）；"已获授权的
  JavaScript 来源"这一步额外把 `window.location.origin` 的当前真实值
  渲染出来配一个一键复制按钮，因为本地开发端口经常因为占用而漂移
  （5173 → 5174 等），直接复制比用户自己拼容易出错的地址更可靠。三个
  语言文件同步新增对应文案。`css/components.css` 新增
  `.sync-guide-list`/`.sync-origin-row`/`.sync-origin-value` 样式，跟
  现有 `.settings-section` 视觉风格一致。
- README.md 快速开始部分补充了 `start-lifespark.sh` 的运行方式；Google
  Calendar 配置章节加了一句提示"应用内同一批链接也能直接点"。

验证：
按 AGENTS.md P2-2，`GoogleSyncPanel.vue`/三个语言文件的改动未代为执行
`npm run dev`——用 `node --check` 校验了三个语言文件语法，用
`@vue/compiler-sfc` 的 `compileScript`/`compileTemplate` 编译
`GoogleSyncPanel.vue` 的 script 和 template 均通过。`start-lifespark.sh`
按 REQ-055 同样的例外（用户要求的是"补一份能跑的脚本"，不实际执行无法
确认它真的能跑）实际执行验证：语法检查通过，完整跑通到 `VITE ... ready`
并监听 `http://localhost:5173/`。真实浏览器里 Step 1 引导列表的排版
效果、复制按钮的实际交互需要用户本地确认。

验收：
- `start-lifespark.sh` 在类 Unix 系统上 `chmod +x` 后可以正常执行，
  行为与 `start-lifespark.bat` 一致（首次自动装依赖，之后直接拉起并
  打开浏览器）
- 打开「设置 → Google 同步」面板，Step 1 能看到三个可点击的跳转链接和
  一个可复制的当前地址，不需要跳出应用查 README 就能完成整套 OAuth
  Client ID 配置
- git 仓库里 `.bat`/`.sh` 两个脚本的换行符不会因为贡献者本地
  `core.autocrlf` 设置不同而被意外改写

## [REQ-057] 计划卡片默认折叠 + 去掉周视图/侧边栏的"当前阶段第几周"文字

状态：completed
模块：src/components/PlanPanel.vue, src/components/SidebarNav.vue,
src/components/WeekBoard.vue, css/components.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户两条消息连续被打断，追问后确认：①计划卡片默认不应该展开细节；
②"阶段"指的是周视图/侧边栏上显示的"进阶阶段（第 9 周 / 阶段共 13 周）"
这类具体到"第几周/共几周"的文字提示，用户觉得没必要，要求直接去掉——
明确不是要移除探索/筛选/进阶/记忆这套贯穿全局的四阶段年度系统本身（询问
用户确认过这一点）。上传 GitHub 这件事用户说自己来，这次不涉及 git 操作。

处理：
- `PlanPanel.vue`：折叠状态默认值反过来——原来 `collapsedPlans[id]`
  为真值时才折叠（默认 `undefined`/展开），改成 `expandedPlans[id]`
  为真值时才展开（默认 `undefined`/折叠）。纯 UI 状态变量改名 + 语义
  取反，折叠图标旋转样式和内容区 `v-if` 相应取反，没有改数据层
  （`domain/plans.js` 未动），增量的界面行为调整，不是破坏性变更。
- `SidebarNav.vue`：删掉 `.phase-progress__label`（"当前阶段：{phase}
  阶段（第 {week} 周 / 阶段共 {total} 周）"，对应 i18n key
  `sidebar.phaseCurrent`）。保留四阶段色块进度条和"全年进度 N%"这两个
  更简洁的信息，只去掉了这一行具体到周数的文字。
- `WeekBoard.vue`：删掉 `.view-header` 右侧显示"{phase}阶段 · 第 {week}
  周（共 {total} 周）"的 `<n-tag>`（对应 i18n key `week.phaseTag`），
  连带清掉只为这个标签服务的 `phaseInfo` computed 和三个不再使用的
  import（`getPhaseForDate`/`PHASE_COLORS`/`computePhaseWeeksFromGoals`），
  以及只剩这一个 `<n-tag>` 的 `.view-header__right` 容器。四阶段年度
  系统本身（`domain/yearPhases.js`）没有改动，`SidebarNav.vue`/
  `domain/plans.js`/`domain/goals.js` 仍然在用它驱动实际的计划生成/
  颜色高亮逻辑，只是这处冗余的文字展示（周视图和侧边栏此前会同时显示
  同一份"当前阶段第几周"信息）被去掉。
- 三个语言文件同步删除 `sidebar.phaseCurrent`/`week.phaseTag` 这两个
  不再被引用的 key。`css/components.css` 里 `.phase-progress__label`
  规则删除，`.phase-progress__year` 补上原来靠它撑开的 `margin-top`，
  避免色块条和年度百分比贴在一起。

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。用 `@vue/compiler-sfc` 的
`compileScript`/`compileTemplate` 编译了 `PlanPanel.vue`/`SidebarNav.vue`/
`WeekBoard.vue` 三个文件的 script 和 template，均通过；`node --check`
校验了三个语言文件语法；手工核对了 `phaseInfo`/`PHASE_COLORS`/
`getPhaseForDate`/`computePhaseWeeksFromGoals` 在 `WeekBoard.vue` 里
确实只被删掉的那处用到，删除 import 不会引入其它地方的引用错误；CSS
文件删改后大括号配对数校验通过。真实浏览器里折叠默认态和阶段文字消失后
的实际排版效果需要用户本地确认。

验收：
- 打开「计划」页面，每张计划卡片默认是折叠的（只看到标题+进度标签），
  点头部的 chevron 图标才展开看到关键事件列表
- 侧边栏和周视图头部都看不到"进阶阶段（第 9 周 / 阶段共 13 周）"这类
  具体到周数的文字了；侧边栏的四阶段色块进度条和"全年进度 N%"还在
- 应用其它功能（计划生成、四阶段权重逻辑）不受影响，因为改动只涉及
  这几处纯展示层

## [REQ-058] 兴趣活动类别 + 奖励种子数据补齐多语言

状态：completed
模块：src/state/persistence.js, src/domain/rewards.js,
src/domain/activityPool.js, src/utils/i18nLabels.js,
src/components/ActivityCard.vue, src/components/ActivityModal.vue,
src/components/ActivityLibraryPanel.vue, src/components/RewardPanel.vue,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"帮我实现项目的多语言对应，实现中日英三种语言"。排查确认
vue-i18n 的核心配置和界面文案早就已经完整实现（三份语言文件 242 个
key 一一对应无遗漏，所有组件都走 `t()`，没有硬编码文字，设置里也有
语言切换器），但有两处内置数据不跑 i18n、切语言不会跟着变：①8 个默认
兴趣活动类别（摄影/露营等，REQ-053 改成用户可现场新建的自由文本之后
就无法整体走 i18n 了）；②17 条默认奖励种子数据（佳能相机/MacBook/
马来西亚旅行等）。跟用户确认后，明确诉求是"把这两处种子数据也补成
多语言"，不是要把整个类别/奖励体系重新做成强制走 i18n（用户自建的
类别/奖励本来就没法自动翻译，这个限制继续保留）。

处理：
- 给这两类种子数据分别加一个稳定的 `seedKey`（只有内置的 8/17 条带，
  用户自己新建的没有），区分"这是可以查 i18n 表的内置数据"还是"这是
  用户自己的自由文本，原样显示"：
  - `state/persistence.js`：`SEED_ACTIVITY_CATEGORY_NAMES`（纯字符串
    数组）改造成 `SEED_ACTIVITY_CATEGORIES: [{seedKey, name}]`；
    `SEED_REWARDS` 每项加 `seedKey`。`createDefaultState()` 种数据时
    带上这个字段。
  - 老数据兼容：新增 `backfillCategorySeedKeys()`/
    `backfillRewardSeedKeys()`，在 `fillMissingDefaults()` 里对已经
    落盘、还没有 `seedKey` 的老数据按默认名字/标题精确匹配补标记——
    只补内置的 8/17 条，用户自建的类别/奖励因为名字对不上，不会被
    误标记。
  - `migrateActivityCategoryRef()`（迁移旧版英文标识符活动的类别引用）
    原来按"英文标识符 → 中文名 → 按名字查新 id"三级转换，
    `LEGACY_CATEGORY_ID_TO_NAME` 这份映射表整个删除，改成直接按
    `seedKey` 匹配（旧英文标识符本来就直接复用成了新 `seedKey`），更
    简单也更不容易因为以后改文案而失效。
  - `domain/rewards.refreshRewardValuesFromSeedPrices`（价格刷新的
    一次性操作）匹配键从 `title` 文本改成 `seedKey`——原来按标题文本
    匹配本来就脆弱，标题一旦被翻译展示就必然匹配不上，这次顺带修掉。
- 新增 `utils/i18nLabels.js`，导出 `categoryLabel(t, category)`/
  `rewardLabel(t, reward)` 两个函数：有 `seedKey` 就查
  `domain.category.<seedKey>`/`domain.reward.<seedKey>`，没有就用原始
  `name`/`title`。不 import vue-i18n，`t` 由调用方传入，保持和
  `utils/` 下其它模块一样框架无关。
- `domain/activityPool.js` 的 `getCategoryName()`（不带 i18n 感知，
  只能原样返回 `name`）失去了最后两个调用方，整个删除，不留死代码。
- 4 个展示类别名/奖励名的组件（`ActivityCard.vue`/`ActivityModal.vue`/
  `ActivityLibraryPanel.vue`/`RewardPanel.vue`）全部改用上面两个新
  函数。三个语言文件新增 `domain.category.*`（8 个）/`domain.reward.*`
  （17 个）两组翻译。

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
所有改动的 `.js` 文件语法；`@vue/compiler-sfc` 编译了 4 个改动组件的
script/template，均通过；写脚本核对三个语言文件新增的 `domain.category`/
`domain.reward` 两组 key 依然三份完全一一对应（267/267/267，无遗漏无
多余）。用 Node 的模块 resolve hook 把 `state/db.js`（依赖浏览器专属
的 OPFS/sqlite-wasm，纯 Node 环境下无法直接 import）替换成内存桩，
对真实的 `persistence.js`/`domain/rewards.js`/`utils/i18nLabels.js`
源码做了端到端功能验证（17 项断言全部通过），包括：全新安装的类别/
奖励都带 `seedKey`；`categoryLabel`/`rewardLabel` 对带 `seedKey` 的
内置数据正确按语言返回翻译、对不带 `seedKey` 的自建数据始终返回原文；
用伪造的"REQ-058 之前落盘的老数据"（8 个默认类别/17 条默认奖励都没有
`seedKey`，另外各混入一条同名撞车风险的自建数据）跑一遍
`loadState()`，确认内置数据被正确补上 `seedKey`、自建数据完全不受
影响；一条使用 REQ-048 时代旧英文标识符（`hiking`）的活动通过
`migrateActivityCategoryRef()` 后正确关联到 `seedKey===hiking` 的
类别；`refreshRewardValuesFromSeedPrices` 按 `seedKey` 正确刷新了
内置奖励的价格、没有动自建奖励的价格。真实浏览器里切换语言后的实际
显示效果需要用户本地确认。

验收：
- 设置里把语言切换成英文/日文后，「兴趣活动」页面里 8 个默认类别
  （摄影/露营等）和「奖励」页面里 17 条默认奖励（佳能相机/MacBook/
  各国旅行等）的名字都跟着变成对应语言
- 用户自己新建的类别、自己添加的奖励，不管当前是什么界面语言，都只
  显示自己输入的原始文字，不会被"翻译"成别的内容
- 已经在用这个项目、本地已经有真实数据的用户，重新打开应用后，原来
  的 8 个默认类别/17 条默认奖励也能正常跟着语言切换（不需要清空重装）
- 应用其它功能（活动的增删改、类别新建、奖励兑换、价格刷新）行为不变

## [REQ-059] README 重新定位：面向"低效率做计划"人群，突出计划事件推进 + 奖励机制

状态：completed
模块：README.md

描述：
用户要求把 README 重新写一遍，重点讲清楚产品是给谁用的、解决什么
问题——"主要是给低效率做计划的人群准备，按照计划可以进行的事件，并
控制好奖励的分类"。这是在 REQ-055 那版"产品介绍优先"重构基础上，进一步
收窄开场定位：REQ-055 版本开场是笼统的"体验驱动年度规划"，这次要求
把"目标拆解成按顺序推进的关键事件"（`domain/plans.js` 的计划/关键事件
机制）和"奖励点数经济"（`domain/rewards.js`）这两个具体机制作为面向
的人群和核心解法直接摆在最前面，不是简单换几句话，是换了一版开场
叙事的落脚点。

处理：
- 开场从"体验驱动 + 新鲜感优先"的年度规划定位，改成直接点名目标用户
  （"做计划总是低效率的人"）和这类人卡住的具体原因（目标太大/选项太多/
  没有即时反馈），再给出 LifeSpark 的解法：计划必须拆成有先后顺序的
  关键事件、严格按顺序解锁推进（对应 `domain/plans.js` 顶部注释里
  "严格按顺序完成关键事件才能一步步推进到计划的终点"这条硬规则）；
  完成即时结算奖励点数，攒够了去兑换自定义的奖励清单（对应
  `domain/rewards.js` 的点数经济 + `RewardPanel.vue` 的待兑换/已兑换
  两个分区）。
- "这是什么"改成先讲"计划 + 关键事件"和"奖励点数经济"这两套核心机制
  （新开场直接呼应的两个功能），原来放在最前面的"四阶段年度节奏 + 每周
  自动生成"降级成"除此之外……"的可选补充能力，说明不用它也能靠计划/
  奖励这两套机制自己管理执行节奏——这是真实情况（四阶段生成本身是
  独立可选的一层，不依赖计划/奖励机制，也不被它们依赖），不是为了配合
  叙事而弱化功能描述。
- "核心功能"列表顺序相应调整：计划+关键事件、奖励点数系统排到最前面
  （补充了"标题/时长可编辑、可继续追加事件"、"待兑换/已兑换分类查看"
  这些之前 bullet 里没写但确实存在的细节，对应 REQ-054/REQ-057 和
  `RewardPanel.vue` 的实际实现），四阶段生成改标注"（可选）"并挪到
  Google Calendar 联动前面。多语言那条补了一句"计划/奖励的内置默认
  数据都会跟着切换"，呼应刚做完的 REQ-058。
- 快速开始、Google Calendar 配置、技术实现、目录结构、开发流程这几节
  内容本身没有事实性变化，原样保留。

验证：
纯文档改动。逐条核对了新写的功能描述和真实代码行为一致：
`domain/plans.js` 顶部注释确认"严格按顺序"规则；`RewardPanel.vue`
确认"待兑换"/"已兑换"两个分区、兑换二次确认、点数按平日/周末比率
结算这几处描述属实；四阶段生成/Google Calendar 联动/本地 OPFS 存储/
多语言这几条延续自 REQ-055 版本，本次未改动事实内容。

验收：
- README 开场一眼能看出"这是给谁用的、解决什么问题"，不需要读完整篇
  才明白核心机制
- "计划+关键事件"和"奖励点数"这两个机制的描述和 `domain/plans.js`/
  `domain/rewards.js`/`RewardPanel.vue` 的真实行为一致，没有夸大或
  编造功能
- 四阶段年度生成、Google Calendar、本地存储、多语言等原有功能描述都
  还在，标注为"可选"能力，没有被删掉或误导成"核心必需"

## [REQ-060] 新增年视图 + 月视图/其它改进建议

状态：completed
模块：src/components/YearBoard.vue（新增）, src/App.vue,
src/components/SidebarNav.vue, src/utils/dateUtils.js,
css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户问"关于月视图有什么建议"，同时明确要求"加个能切换到年视图的机制"，
另外让帮忙想想还有哪些地方可以改进。年视图是明确的构建需求，直接
实现；月视图建议和其它改进想法是开放性问题，只在对话里给了建议列表，
没有未经确认就动手改（不确定用户具体想要哪几条、优先级怎么排）。

处理（年视图）：
- `utils/dateUtils.js` 新增 `getYearStart(date)`/`addYears(date, n)`，
  和已有的 `getMonthStart`/`addMonths` 是同一种写法。
- 新增 `src/components/YearBoard.vue`：一屏铺开当前年份的 12 张迷你
  月历（每张复用 `getMonthGridDates()` 现成的月历网格算法），点月份
  卡片跳月视图、点具体某天跳日视图；每个格子按"当天有几个非 Google、
  非跳过的时间块"染成 0~4 五档热力图色阶（`color-mix(in srgb,
  var(--accent) N%, var(--bg-tertiary))`，深浅主题自动适配，不需要
  另外维护一套颜色表），一眼看出这一年里哪段时间比较"实"。属于别的
  月份的补位格子（月历网格补齐月首/月末用的那些）在年视图里直接留空
  不可点——这一屏信息密度已经够高，边角日期的细节留给点进去之后的
  月/日视图。
- `App.vue`：`uiState` 新增 `selectedYear`（默认当年 1 月 1 日），
  `viewComponents` 注册 `year: YearBoard`。
- `SidebarNav.vue`：`NAV_ICONS`/`NAV_VIEWS` 新增 `year`（图标
  `GridViewRound`，和月视图的 `CalendarMonthRound` 区分明显），排在
  "月度视图"之后、"计划"之前——周/月/年同属"日历类视图"，逐级放大着看。
- 三个语言文件新增 `nav.year`、`year.*`（上一年/下一年/回到今年/图例
  文案）、`domain.monthShort`（12 个月份短名数组，英文是 Jan/Feb 这类
  缩写，不是"数字+月"这种只对中日文成立的写法）。

处理（月视图建议 + 其它改进想法）：
在对话里给了建议，没有实现，留给用户决定要不要做、要做的话开新 REQ：
- 月视图目前只有"事件类型圆点"，看不出完成/跳过状态，也看不出这天
  拿了多少奖励点数——可以借这次年视图的热力图思路，反过来给月视图的
  每个格子也加一点"完成情况"的视觉区分（比如跳过的块用空心点/斜线）。
- 月视图的"节假日名"在窄屏格子里容易被挤到看不全（`text-overflow:
  ellipsis` 截断），可以考虑 hover/点击时用 tooltip 展示完整假日名。
- 计划页面（REQ-057 改成默认折叠后）目前没有"全部展开/全部折叠"的
  批量操作，计划一多逐个点展开会麻烦。
- 奖励页面的"待兑换"列表目前没有排序/筛选，奖励一多不好找。
- 首页（周视图）目前是唯一的"落地页"，没有一个"总览仪表盘"式的入口
  汇总当前点数余额、计划进度、本周完成率这几个关键数字——年视图上线
  后可以评估要不要往这个方向再整合一步，而不是让用户在几个页面之间
  切换拼凑全局状态。
- 深色/浅色主题目前只有二选一，没有"跟随系统"选项。

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`dateUtils.js`/三个语言文件语法；`@vue/compiler-sfc` 编译了
`YearBoard.vue`/`App.vue`/`SidebarNav.vue` 的 script/template，均通过；
写脚本验证了 `getYearStart`/`addYears` 的正确性（含跨年边界、闰年 2
月天数）以及 12 份月历网格首尾日期正确；`GridViewRound` 图标已核对
`node_modules/@vicons/material` 里真实存在具名导出；三个语言文件新增
key 校验完全一一对应（274/274/274）。真实浏览器里年视图热力图色阶的
实际视觉效果、`color-mix()` 在目标浏览器上的渲染效果需要用户本地确认。

验收：
- 侧边栏导航能看到"年度视图"入口，排在"月度视图"后面
- 打开年视图能看到当前年份的 12 张迷你月历，点某个月份卡片跳到月
  视图对应那个月，点某一天跳到日视图对应那天
- 有安排的日子和空白的日子在颜色上有明显区分，安排越密集颜色越深
- 上一年/下一年/回到今年三个按钮正常工作
- 英文/日文界面下年视图的月份标题、图例文案跟着切换

---

## [REQ-061] README 对照开源发布模板重新整理 + 补齐许可证

状态：completed
模块：README.md, LICENSE（新增）

描述：
用户准备把项目开源发布，提供了一份通用的"日程管理日历"项目 README 模板
（含 核心特性/数据与隐私/技术栈/部署运行/桌面快捷启动/许可证/贡献 这套
结构），要求整理进项目 README，并核对是否符合项目真实情况。

逐条核对模板与真实实现后发现三处实质性不符，不能直接照抄：
1. 模板"数据均保存在本地浏览器中，不经过任何网络传输"是绝对化表述，
   与项目已有的 Google Calendar 可选联动功能（`src/calendar/*`，开启后
   会向 Google 服务器发起真实网络请求）冲突。
2. 模板"活动(Activity)"描述为"打算去完成的事件池子……随时从池中挑选
   事件填入日程"，这是 REQ-048 之前"服务自动排程"的旧活动池设计；
   REQ-048 已将其重做为手动维护的"兴趣活动"个人参考库，不再喂给任何
   自动排程逻辑（旧的自动排程死代码本身也已在 REQ-052 整个删除）。
3. 模板"计划(Plan)"描述弱化了"关键事件必须严格按顺序解锁完成"这条
   `domain/plans.js` 的硬规则，模板措辞更接近"预先设计好顺序、日程里
   挑选事件排布"，容易让人以为顺序只是建议而非强制。

处理方式：不是简单拼接模板原文，而是保留模板的**结构**（核心特性/
数据与隐私/技术栈/快速开始/桌面快捷启动/许可证/贡献这套章节划分和
emoji 风格），内容一律以 `domain/*.js` 现有代码行为为准，上述三处按
真实实现改写；技术栈章节从模板泛泛的"Vue + Node.js"补齐成实际的
Vue3+Vite+Naive UI+vue-i18n+sqlite-wasm(OPFS)；快速开始/桌面快捷启动
两节换成项目真实的 `npm run dev`/`start-lifespark.bat`/`.sh`，不再是
模板里的占位符命令。原 README（REQ-055/REQ-059 迭代出的"低效率做计划
人群"定位开场、核心功能列表细节）予以保留，只是重新套进新的章节结构。

许可证此前项目完全没有定过（`docs/KNOWLEDGE.md`/`docs/CHANGELOG.md`
搜不到任何相关记录），属于 P0-3 定义的项目专属决策，且没有来源，用
AskUserQuestion 停下来问用户，用户选择 **Apache License 2.0**（非模板
默认建议的 MIT）。新增 `LICENSE` 文件（标准 Apache-2.0 全文 + Appendix
版权行 `Copyright 2026 yiran201`，姓名取自项目 GitHub 远程仓库
`github.com/yiran201/LifeSpark`），README 新增"许可证"分区链接到它。

验收：
- README.md 包含模板要求的全部章节（核心特性/数据与隐私/技术栈/快速
  开始/桌面快捷启动/许可证/贡献），且每处事实性描述与当前代码行为一致
- README 不再出现"不经过任何网络传输"这类和 Google Calendar 联动功能
  矛盾的绝对化表述
- "兴趣活动"章节描述为手动维护的个人参考库，不写"自动填入日程"这类
  已经不存在的能力
- "计划"章节明确写出"关键事件必须严格按顺序解锁"
- 仓库根目录新增 `LICENSE` 文件，内容是完整的 Apache License 2.0
- 快速开始/桌面快捷启动两节里的命令和脚本文件名（`start-lifespark.bat`/
  `start-lifespark.sh`）与仓库实际文件一致，不含占位符

验证：
纯文档改动，按 AGENTS.md P2-2 未代为执行 `npm run dev`/`npm run build`。
逐条对照 README 新写的功能描述和真实源码：`domain/plans.js`
`getCurrentKeyEvent`/顺序推进逻辑、`domain/activityPool.js` 字段集合
（`title/link/imageUrl/content`，不含任何自动排程相关字段）、
`src/calendar/googleAuthClient.js`/`googleCalendarService.js` 确认 Google
联动会发起真实网络请求、`vite.config.js` 确认 COOP/COEP 响应头配置、
`start-lifespark.bat`/`start-lifespark.sh`/`package.json` 的
`dev`/`build`/`preview` 脚本名核对一致，未发现新的夸大或过时描述。
`LICENSE` 文件内容与 Apache Software Foundation 官方发布的 Apache
License 2.0 标准文本核对一致。真实 GitHub 页面渲染效果（emoji/徽章
显示）需要用户 push 后自行确认。

---

## [REQ-062] README 精简改写 + 拆分中/英/日三份文件

状态：completed
模块：README.md, README.en.md（新增）, README.ja.md（新增）

描述：
用户反馈 REQ-061 整理出来的 README"现在的有点过于复杂"，要求参考其它
开源产品的写法精简，并且要中/英/日三种语言各一份 README 文件（不是
只在一份文件里切换语言）。

参考调研：用 WebFetch 实际抓取了两个成熟开源项目的 README 结构（不是
凭印象）—— `excalidraw/excalidraw`（徽章居中排列在标题下、Features 用
单行 emoji bullet、Contributing/License 各自独立成一小节）和
`siyuan-note/siyuan`（语言切换链接紧跟在标题/徽章之后、按 简体中文/
English/日本語 等并排放置）。据此确定精简方向：去掉多段式的开场散文
（原来"这是什么"一节的两大段说明性文字）、去掉每条 feature 后面的
长解释性从句、去掉数据隐私/技术栈/Google 集成里的分点小结构，统一收成
每节 3-6 行以内的单层 bullet 列表；语言切换链接放在标题正上方，仿
siyuan 的位置。

拆分三文件：`README.md`（简体中文，默认）/`README.en.md`/`README.ja.md`，
三份内容结构完全一致（标题→语言切换→一句话定位→核心功能→数据与隐私→
技术栈→快速开始→Google 集成→文档链接→许可证→贡献），互相用相对链接
指向对方，每个文件顶部都能跳转到另外两种语言。内容压缩的同时没有丢失
REQ-061 核对过的三处事实修正（Google 联动才联网、兴趣活动不自动进
日程、计划关键事件必须严格按顺序）——这几条改成一行内嵌短语保留，而
不是整段说明。`docs/AGENTS.md`/`docs/REQUESTS.md`/`docs/CHANGELOG.md`
仍然只有中文，README 的"文档"一节里向英/日文读者如实标注这几个文件
"目前维护中文版本"，不假装它们也有多语言（英/日 README 用括号注明
"currently maintained in Chinese"/"現時点では中国語で管理されています"）。

验收：
- 仓库根目录有 `README.md`/`README.en.md`/`README.ja.md` 三个文件，
  内容结构一致、互相语言切换链接可用
- 中文版篇幅明显短于 REQ-061 版本（章节内部不再有多层小标题/分点说明，
  每节 bullet 数量克制在个位数）
- 三份文件都保留 REQ-061 核对过的三处事实修正，用词精简但没有变得
  不准确
- 三份文件的许可证徽章、Apache-2.0 链接、快速开始命令、启动脚本文件名
  保持一致且和仓库真实文件对应

验证：
纯文档改动，按 AGENTS.md P2-2 未代为执行 `npm run dev`/`build`。逐条
核对三份 README 的事实性描述（Google 联动才产生网络请求、兴趣活动不
自动进日程、计划关键事件严格按顺序、`npm run dev`/`build`/`preview`
脚本名、`start-lifespark.bat`/`.sh` 文件名、Apache-2.0 许可证链接）与
仓库真实文件/代码一致；三份文件互相的语言切换链接手工核对路径正确
（`README.md`/`README.en.md`/`README.ja.md` 同目录下相对路径）。真实
GitHub 页面上徽章渲染和三个链接的实际跳转效果需要用户 push 后自行
确认。

---

## [REQ-063] 开发/预览端口固定为 6000（解决 Google OAuth 端口漂移导致的 401 invalid_client）

状态：completed
模块：vite.config.js, src/components/GoogleSyncPanel.vue, src/i18n/locales/{zh,en,ja}.js,
start-lifespark.bat, start-lifespark.sh, README.md, README.en.md, README.ja.md,
docs/MODULES.md

描述：
用户配置 Google Calendar 联动时遇到 Google 报"错误 401：invalid_client"，
截图显示详情是"no registered origin"。排查确认根因：Vite 默认端口
5173 被占用时会静默切换到 5174/5175 等其它端口（`docs/KNOWLEDGE.md`
早就记过这个现象），但 Google Cloud Console 里"已获授权的 JavaScript
来源"要求逐字符匹配当前页面的源（协议+域名+端口），用户登记的端口一旦
和实际运行端口对不上就会报这个错。用户确认自己 Client ID、应用类型都
配置正确后，进一步用 AskUserQuestion 之外的方式确认（截图里 Cloud
Console 编辑页显示 Authorized origins 确实没有登记任何值），用户要求
"把端口固定为 6000"并"涉及端口的都修改好"。

`vite.config.js` 的 `server`/`preview` 都加了 `port: 6000` +
`strictPort: true`——端口被占用时 `npm run dev`/`preview` 直接报错
退出，不再像以前那样静默换端口，这样 Google Cloud Console 里只需要
登记一次 `http://localhost:6000` 就不会再失效。全仓库 Grep `5173` 逐个
排查修掉引用它的地方：
- `src/i18n/locales/{zh,en,ja}.js` 的 Google 同步引导第 4 步文案，从
  "本地开发端口可能不是 5173"改成"本地开发端口固定为 6000"。
- `src/components/GoogleSyncPanel.vue` 顶部注释更新背景说明；
  `copyOrigin()`/`currentOrigin = window.location.origin` 这个"直接
  显示真实值给复制"的做法本身**没有改**——虽然本地端口理论上不会再
  漂移，但生产部署域名场景仍然需要这个动态取值，硬编码 6000 到模板
  文案里反而会在部署场景下出错，只有面向"本地开发端口"这一句纯说明性
  文案里的数字更新了。
- `start-lifespark.bat`（**必须用 PowerShell `-Encoding Default`
  读写，保持 ANSI/GBK 编码**，见 `docs/KNOWLEDGE.md` 已有的踩坑记录，
  没有用会破坏编码的 Edit 工具直接改这个文件）和 `start-lifespark.sh`
  顶部注释更新："端口被占用会自动换成 5174 等"改成"端口固定 6000，
  被占用时直接报错退出"，脚本实际逻辑（`npm run dev -- --open`）不变。
- `README.md`/`README.en.md`/`README.ja.md` 快速开始一节的
  `http://localhost:5173` 改成 `http://localhost:6000`。
- `docs/MODULES.md` 对应两处（`vite.config.js` 树形注释、
  `GoogleSyncPanel.vue` 的 REQ-056 条目）补充 REQ-063 的变更说明。

`docs/CHANGELOG.md`/`docs/REQUESTS.md` 里 REQ-056 等历史条目提到的
"5173→5174 会漂移"是当时准确的历史记录，按项目惯例不回改历史 REQ
条目，只在这条新增的 REQ-063 里说明现状变化。

验收：
- `npm run dev` 固定监听 `http://localhost:6000`，端口被占用时报错
  退出而不是换端口
- `npm run preview` 同样固定监听 6000
- Google Cloud Console 里登记 `http://localhost:6000` 为授权来源后，
  「设置 → Google 同步」面板的登录流程不再出现"no registered origin"/
  `invalid_client`（需要用户本地实际验证，AI 无法代为登录 Google 账号）
- 三个语言文件、三份 README、两个启动脚本注释里搜不到遗留的 `5173`
  引用（`GoogleSyncPanel.vue` 里说明"端口理论上不再漂移，但仍读真实
  值"的那句注释除外，这是有意保留的设计说明，不是遗留引用）
- `start-lifespark.bat` 文件编码验证仍然是 ANSI/GBK（无 UTF-8 BOM，
  非合法 UTF-8 字节序列），不能双击报错

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了三个
locale 文件语法；`@vue/compiler-sfc` 编译 `GoogleSyncPanel.vue` 通过；
Grep 全仓库确认 `5173` 只剩 `docs/CHANGELOG.md`/`docs/REQUESTS.md` 里
历史 REQ 条目的既有记录，代码/README/脚本里已经没有活引用。
`start-lifespark.bat` 改动用 PowerShell 读取字节验证：无 UTF-8 BOM、
整份内容按严格 UTF-8 解码会失败（证明仍是 GBK 而不是被 Edit 工具
误存成 UTF-8），复现了 `docs/KNOWLEDGE.md`"中文 Windows 上 .bat 脚本
必须避开 UTF-8 编码"这条踩坑记录里的验证方法。真实浏览器里
`npm run dev`/`preview` 实际监听端口、Google 登录流程是否真的不再报
401，需要用户本地验证——这两项都涉及运行时网络行为和 OAuth 授权状态，
无法在当前环境模拟。

---

## [REQ-064] 修复开发服务器只绑定 IPv6 loopback 导致部分环境下"网页访问不到"

状态：completed
模块：vite.config.js

描述：
REQ-063 改完固定端口重启开发服务器后，用户反馈"网页访问不到了好像"。
排查（用 PowerShell 检查端口监听状态 + 分别用 `http://localhost:6000`/
`http://127.0.0.1:6000`/`http://[::1]:6000` 三种地址实测连通性）确认：
`vite.config.js` 之前没有显式设置 `server.host`，这台机器上 Vite/Node
在这种情况下只把端口绑定到 IPv6 loopback（`[::1]`），`127.0.0.1`
（IPv4 loopback）连接会被直接拒绝；`http://localhost:6000` 能不能访问
因此取决于当时浏览器/系统把 "localhost" 解析成 IPv4 还是 IPv6，不稳定
——这解释了为什么固定端口之后反而出现了偶发的"访问不到"。

`server`/`preview` 都加了 `host: true`，让 Vite 同时监听本机所有 IPv4
和 IPv6 地址，不管"localhost"解析成哪个地址族都能连上。副作用：开发
服务器因此也能从同一局域网内的其它设备访问到——这个应用是纯前端 SPA，
真实数据只存在各自浏览器自己的 OPFS 里，不经过开发服务器，局域网内
其它设备最多看到一个空白的初始状态，不会读到本机用户的数据，对单人
本地开发场景可以接受，写进了 `vite.config.js` 顶部注释里。Google
OAuth 用的 Authorized origin 不受影响，仍然是 `http://localhost:6000`
（域名而不是具体 IP），和 `host` 绑定到哪些地址是两回事。

验收：
- 关闭旧的开发服务器进程后重新 `npm run dev`，终端打印的地址里除了
  `Local: http://localhost:6000/` 还会出现 `Network:` 开头的局域网
  地址（`host:true` 的预期效果，用于确认配置生效）
- 用户浏览器不管之前"localhost"解析成 IPv4 还是 IPv6，都能正常打开
  `http://localhost:6000`
- Google Calendar 联动的授权流程能正常进入 Google 登录弹窗（不再卡在
  页面本身打不开这一步；invalid_client 这个更早的问题已经在 REQ-063
  处理，这条只解决"页面本身连不上"）

验证：
按 AGENTS.md P2-2，不由 AI 代为重启用户正在跑的 `npm run dev` 进程
（用户自己终端里的会话），只做了只读诊断：`Get-NetTCPConnection`/
`netstat` 确认当时唯一监听 6000 端口的进程（`node.exe`，Windows 版
Node，非编辑器自带的 helper node 进程）只绑定了 `[::1]`；用
`Invoke-WebRequest` 分别请求 `localhost`/`127.0.0.1`/`[::1]` 三个地址，
复现了"`127.0.0.1` 连接被拒绝、另外两个返回 200"这个不对称现象，确认
是地址族绑定问题而不是端口/进程本身没启动。`host:true` 是 Vite 官方
文档记录的标准选项（用于"局域网/其它设备访问不到开发服务器"场景），
配置语法本身按 Vite 类型定义核对无误。改动后端口/host 是否真的双栈
监听、用户浏览器实际能否访问，需要用户重启开发服务器后本地验证——
AI 没有权限杀掉/重启用户自己终端会话里的进程。

---

## [REQ-065] 端口从 6000 改成 8090（6000 是浏览器内置黑名单端口，ERR_UNSAFE_PORT）

状态：completed
模块：vite.config.js, src/components/GoogleSyncPanel.vue, src/i18n/locales/{zh,en,ja}.js,
start-lifespark.bat, start-lifespark.sh, README.md, README.en.md, README.ja.md,
docs/KNOWLEDGE.md

描述：
REQ-064 修完之后用户浏览器访问报 `ERR_UNSAFE_PORT`（Chrome 提示："この
サイトにアクセスできません...ERR_UNSAFE_PORT"）。用 WebSearch 核实
确认：6000 是 Chrome/Firefox 等主流浏览器内置的"不安全端口"黑名单
成员之一（历史上是 X11 window server 的保留端口，浏览器出于防止跨
协议攻击的考虑直接拒绝对这批端口发起 HTTP 请求），这不是服务器配置
问题，服务器怎么设置都没用，必须换一个不在黑名单里的端口——REQ-063
选 6000 这个数字本身就是这次问题的根源，之前没意识到这一层。

本来打算换成更常见的 8080，但用 `Get-NetTCPConnection`/`netstat`
实测发现这台开发机上当时已经有一个无关的 `node.exe`（PID 6248，跟
LifeSpark 项目无关，是这台机器上其它项目留下的）占着 8080，
`strictPort:true` 会导致 `npm run dev` 直接启动失败。改选 **8090**：
不在任何主流浏览器的不安全端口黑名单里，也不是 3000/5000/8000/8080/
9000 这类各种框架最常用的默认端口，和这台开发机上其它项目撞车的概率
更低；实测确认改动当时 8090 是空闲端口。

全仓库 Grep `6000`（排除 CSS 十六进制颜色 `#b06000`、`persistence.js`
里奖励参考价、`conflictMapper.js` 里 `3600000` 毫秒常量这几处巧合数字
子串命中，逐一核对过确实无关）逐个改成 `8090`：`vite.config.js` 的
`server`/`preview` 端口 + 顶部新增说明这次教训的注释、三个语言文件的
Google 同步引导第 4 步文案、`GoogleSyncPanel.vue` 注释、
`start-lifespark.bat`（同样用 PowerShell `-Encoding Default` 读写保持
GBK 编码）/`start-lifespark.sh` 注释、三份 README 快速开始命令。新增
`docs/KNOWLEDGE.md` 知识条目记录"浏览器内置 HTTP 不安全端口黑名单"这个
教训。

验收：
- 仓库里搜不到活代码/文档引用 `6000` 作为端口号（`CHANGELOG.md`/
  `REQUESTS.md` 里 REQ-063/064 的历史记录除外，那是准确的历史事实，
  不回改）
- `vite.config.js`、三份 README、启动脚本、i18n 引导文案统一是 8090
- `start-lifespark.bat` 编码验证仍是 ANSI/GBK（无 UTF-8 BOM，非合法
  UTF-8 字节序列）
- `docs/KNOWLEDGE.md` 有一条标注来源的知识记录这次踩的坑
- Google Cloud Console 里改登记 `http://localhost:8090` 后，用户
  浏览器不再报 ERR_UNSAFE_PORT，能正常打开应用（需要用户本地验证，
  AI 无法在没有真实浏览器环境的情况下复现这个错误）

验证：
用 WebSearch 核实了"6000 是 Chrome 不安全端口"这个结论（不是凭记忆
判断——这是要用户去改真实 Google Cloud Console 配置的判断依据，核实
的是一个客观技术事实，不是编造项目专属业务规则，多个独立搜索结果
一致，可信）。8080/8090 是否空闲用 `Get-NetTCPConnection`/`netstat`/
`tasklist` 实测确认，不是猜测。`node --check` 校验了三个 locale
文件；`@vue/compiler-sfc` 编译 `GoogleSyncPanel.vue` 通过。
`start-lifespark.bat` 改动后用 PowerShell 读取字节验证：无 UTF-8
BOM、非合法 UTF-8 字节序列，确认仍是 GBK。真实浏览器里改完 Google
Cloud Console 授权来源后完整走一遍登录流程，需要用户本地验证。

---

## [REQ-066] 端口从 8090 改成 6060（用户指定）

状态：completed
模块：vite.config.js, src/components/GoogleSyncPanel.vue, src/i18n/locales/{zh,en,ja}.js,
start-lifespark.bat, start-lifespark.sh, README.md, README.en.md, README.ja.md

描述：
用户直接要求"把端口设置成 6060"，不是又一次报错排查——REQ-065 选定
8090 本身没有问题，纯粹是用户偏好换个更好记的数字。先用
`Get-NetTCPConnection` 确认 6060 当时在本机空闲，并核对不在
`docs/KNOWLEDGE.md` 新记录的浏览器不安全端口黑名单里（6060 不在
6000/6566/6667 这些相邻的黑名单端口范围内），才动手改，不是照单全收
用户给的数字——如果 6060 也在黑名单里或者被占用，应该跟 REQ-065 一样
先说明情况。

把 REQ-065 里所有 `8090` 出现的地方统一改成 `6060`：`vite.config.js`
的 `server`/`preview` 端口 + 顶部说明注释（补了一句"最终选定 6060"的
背景）、三个语言文件的 Google 同步引导文案、`GoogleSyncPanel.vue`
注释、两个启动脚本（`.bat` 继续用 PowerShell `-Encoding Default` 保持
GBK 编码）、三份 README 快速开始命令。

验收：
- 仓库里搜不到活代码/文档引用 `8090` 作为端口号（`CHANGELOG.md`/
  `REQUESTS.md` 里 REQ-065 的历史记录除外，那是准确的历史事实，不
  回改）
- `vite.config.js`、三份 README、启动脚本、i18n 引导文案统一是 6060
- `start-lifespark.bat` 编码验证仍是 ANSI/GBK
- Google Cloud Console 里改登记 `http://localhost:6060` 后应用能正常
  访问、Google 登录不再报 ERR_UNSAFE_PORT（需要用户本地验证）

验证：
`Get-NetTCPConnection`/`netstat` 实测确认改动当时 6060 在本机空闲；
对照 `docs/KNOWLEDGE.md` 新记录的黑名单列表核对 6060 不在其中。
`node --check` 校验了三个 locale 文件；`@vue/compiler-sfc` 编译
`GoogleSyncPanel.vue` 通过；`start-lifespark.bat` 改动后用 PowerShell
验证字节仍是 GBK 编码，非合法 UTF-8。真实浏览器验证需要用户本地
完成。

---

## [REQ-067] 删除内置奖励种子数据（"奖励"页新装用户不再自带 17 项示例）

状态：completed
模块：src/state/persistence.js, src/domain/rewards.js, src/App.vue,
src/components/RewardPanel.vue, src/utils/i18nLabels.js, docs/MODULES.md

描述：
用户要求"奖励里面的默认数据帮我清除掉"。排查确认 `state/persistence.js`
里的 `SEED_REWARDS`（17 项内置示例奖励：佳能相机/MacBook/多国旅行等，
REQ-018 由用户提供、REQ-019/022/023/031/058 陆续调整过定价与展示方式）
一直是新装用户 `createDefaultState()` 里 `rewards` 字段的默认内容——
准备开源发布后，这份带着具体品牌/价格的示例数据不适合让每个新用户都
自动拿到，和 REQ-048 把兴趣活动库的内置种子数据（`SEED_ACTIVITIES`）
整个清空、交给用户自己建第一条是同一类取舍。

`SEED_REWARDS` 连同只服务它的 `REWARD_TITLE_TO_SEED_KEY`/
`backfillRewardSeedKeys()`（persistence.js）、
`refreshRewardValuesFromSeedPrices()`（domain/rewards.js，"把内置奖励
价格对齐最新日元参考价"的一次性操作，唯一的数据来源就是 `SEED_REWARDS`）
一并整个删除，不是留着当死代码——这几个都是只服务"内置种子数据"这一件
事的代码，种子数据本身没了，函数留着也调不出任何有意义的结果。
`createDefaultState()` 的 `rewards` 改成恒为空数组；`meta` 不再生成
`rewardValuesRefreshedAt` 这个配套的幂等标记字段；`App.vue` 挂载逻辑
里对应的调用点和 `import` 一起删除。

用户已有的、REQ-067 之前就已经建过库并带着 `seedKey` 的奖励记录不受
影响——`reward.seedKey` 这个字段本身没有从数据结构里删除，
`utils/i18nLabels.rewardLabel()` 的"有 seedKey 查 i18n、没有用原始
title"这条判断逻辑没变，三个语言文件里 17 条奖励的翻译表也原样保留，
继续服务这些老数据；只是新装用户不会再自动拿到这 17 条种子数据，
`fillMissingDefaults()` 对老数据的 `rewards` 合并逻辑简化成
`parsed.rewards || defaults.rewards`（`defaults.rewards` 现在恒为
`[]`，效果等价于"缺字段就是空数组"）。

验收：
- 全新安装（清空浏览器数据后首次打开）"奖励"页面是空列表，没有任何
  内置示例奖励
- 用户已有数据库里已经存在的奖励记录（不管有没有 `seedKey`）刷新页面
  后原样都在，不会被清空或改变
- 仓库里搜不到活代码引用 `SEED_REWARDS`/`refreshRewardValuesFromSeedPrices`/
  `backfillRewardSeedKeys`/`REWARD_TITLE_TO_SEED_KEY`（`docs/CHANGELOG.md`/
  `docs/REQUESTS.md` 的历史记录、以及解释"这个东西曾经存在过、为什么被
  删除"的说明性注释除外）
- "奖励"页面手动新建/编辑/删除/兑换奖励的功能不受影响
- `docs/MODULES.md` 里 `state/persistence.js`/`domain/rewards.js`/
  `src/App.vue` 对应条目同步反映这次删除

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`persistence.js`/`rewards.js`/三个 locale 文件（虽然三个 locale 文件
这次实际没改逻辑，只改了 zh.js 一处注释）；`@vue/compiler-sfc` 的
`parse`+`compileScript` 实际编译（不是仅静态阅读）`App.vue`/
`RewardPanel.vue` 均通过。Grep 全 `src/` 目录确认
`SEED_REWARDS`/`refreshRewardValuesFromSeedPrices`/
`backfillRewardSeedKeys`/`REWARD_TITLE_TO_SEED_KEY` 只剩说明性注释
提及，没有任何活代码（import/调用）残留。手工审查了
`fillMissingDefaults()` 改动后的合并逻辑：老数据 `parsed.rewards`
存在时原样透传，不存在时落到空数组，和删除前"落到 17 条种子数据"的
唯一区别就是种子内容变成了空，其余分支（`activityCategories`/
`activityPool` 迁移等）完全没有改动。真实浏览器里全新安装奖励页确实
为空、老数据奖励记录确实不受影响，需要用户本地验证。

---

## [REQ-068] 月视图去掉周期事件的点数标注 + 年视图热力图改成月度标语

状态：completed
模块：src/utils/dateUtils.js, src/state/persistence.js, src/components/MonthBoard.vue,
src/components/YearBoard.vue, css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户一次提了两点：①"月度页面主要是标注节假日之类的，周期事件不进行
数量标注"；②"年度页面不要标注事件颜色深的深度，支持添加一些标语在
页面上，就是给月份目标做标记用的"。

**A. 月视图（MonthBoard.vue）**：`blocksForDate()` 原来把当天所有时间
块（含周期事件物化出的实例）都拿去生成事件点（最多 4 个 + "+N"）。
周期事件天天/每周都会出现，同一个周期事件在很多天里重复占一个点，
参考价值低，还挤占本就只有 4 个点位的展示空间。改成过滤掉
`block.recurringId` 存在的块，只有一次性事件参与点数标注；节假日名
（`holidayInfo()`）不受影响，本来就是这个视图的核心信息，继续保留。
周期事件本身的具体安排还是能在点进日/周视图之后看到，只是不再占月历
格子的点位。

**B. 年视图（YearBoard.vue）**：REQ-060 时期"按当天事件数量染成 0~4
五档热力图"整个删除（`dayIntensity()` 函数、`.year-day--0~4` 五档 CSS、
底部图例 `.year-legend`、i18n 的 `legendLess`/`legendMore` 一并清理），
日期格子只保留"属不属于当前月"/"是不是今天"两种状态。新增月度标语：
每个月份卡片标题下方有一行可编辑文本，未设置时 hover 显示"+ 添加标语"
幽灵按钮，已设置时显示为一行强调色小字（超长省略号截断），点击进入
编辑态（`n-input`，`autofocus` 自动聚焦），回车/失焦保存，Esc 取消。

数据层：`utils/dateUtils.js` 新增 `getMonthKey(date)`（返回 `YYYY-MM`，
和 `getDateKey` 同一种写法）；`state/persistence.js` 顶层新增
`monthLabels: {}`（`{ [monthKey]: text }`，纯自由文本，无格式/字数
限制），走已有的顶层浅展开合并，不需要 `fillMissingDefaults()` 额外
代码。

验收：
- 月视图格子里的事件点不再包含周期事件（比如每天都有的"晨间锻炼"周期
  事件不会天天占一个点），节假日名标注不受影响
- 年视图不再有任何按事件数量深浅染色的格子，图例消失
- 年视图每个月份卡片能添加/编辑/清空一句标语，鼠标悬停未设置标语的
  月份能看到"+ 添加标语"按钮；点击标语文字能重新编辑；点击空白处进入
  编辑态和点击月份卡片本体跳转月视图两个交互不冲突（编辑区域
  `@click.stop`）
- 回车或点击别处保存标语；按 Esc 取消编辑不会保留刚输入的草稿
- 刷新页面标语数据从数据库正确恢复；导出/导入全量数据包含 `monthLabels`
- 三个语言文件 `year` 分区 key 数量一致（各 5 个：`prevYear`/
  `nextYear`/`goToday`/`addLabelBtn`/`labelPlaceholder`）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`dateUtils.js`/`persistence.js`/三个 locale 文件；`@vue/compiler-sfc`
的 `parse`+`compileScript`+`compileTemplate` 实际编译（不是仅静态
阅读）`MonthBoard.vue`/`YearBoard.vue` 均通过。CSS 改动前后大括号数量
配平校验通过（116/116）。手工审查了 `saveLabel()`/`cancelEditLabel()`
的时序：`n-input` 用 `v-if` 控制挂载，Escape 取消后紧跟的原生 blur
事件会再触发一次 `@blur="saveLabel"`，`saveLabel()` 开头
`editingMonthKey.value !== key` 的前置判断能正确拦下这次多余调用，
不会把 Esc 想丢弃的草稿误存进去；回车保存后同样会有一次多余的 blur
调用，同一个判断使其安全地变成空操作，不会重复写 state。真实浏览器里
的点击/编辑/自动聚焦交互效果、以及 `EditRound` 图标的实际渲染，需要
用户本地打开年/月视图确认。

---

## [REQ-069] 年视图补上节假日标注

状态：completed
模块：src/components/YearBoard.vue, css/components.css

描述：
REQ-068 把年视图的热力图删掉、只留"属于当前月/今天"两种格子状态后，
用户紧接着要求"年视图的节假日要标上"——节假日标注本来就是 REQ-011 就
有的既有能力（`MonthBoard.vue`/`WeekBoard.vue` 都已经在用），年视图
之前一直没接入，不是这次删热力图删掉的，是本来就缺。

年视图格子只有 9px 字号、`aspect-ratio:1` 的正方形空间，放不下
`MonthBoard.vue` 那种假日名文字，改成：格子本身染色（放假态用
`--danger` 红色背景，颜色惯例和 `.month-cell__holiday` 一致；调休
上班态用 `--text-muted` 描边，不抢眼但能看出"这天要上班"）+ 原生
`title` 属性 hover 提示完整假日名，不新增任何弹层/tooltip 组件。
数据来源和 `MonthBoard.vue` 完全一样，直接复用 `domain/holidays.js`
的 `getHolidayInfo(dateKey, region)`，地区取 `settings.region`。

验收：
- 年视图里国家法定节假日的格子有明显的红色标注，调休上班的格子有
  描边标注，非节假日格子外观不变
- 鼠标悬停节假日/调休格子能看到完整假日名的原生提示（浏览器默认
  tooltip）
- 同一天既是"今天"又是节假日/调休时，"今天"的强调描边优先显示，不会
  被节假日标注盖掉
- 三个地区（CN/US/JP）切换后年视图的节假日标注跟着切换
- 属于补位空白格（不属于当前月）的日期不做节假日判断，保持空白

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`@vue/compiler-sfc` 的
`parse`+`compileScript`+`compileTemplate` 实际编译通过；CSS 大括号
配平校验通过（118/118）。用 `node -e` 直接调用真实的
`domain/holidays.getHolidayInfo()`，核对了 2026-10-01（国庆节，
holiday）、2026-10-10（国庆节调休，workday）、2026-07-04（美国独立日，
holiday）、2026-01-15（无节假日，返回 null）四个已知日期，返回结果
均符合预期。`--danger`/`--text-muted` 两个 CSS 变量已核对在
`css/variables.css` 明暗两套主题下都有定义。真实浏览器里的视觉呈现、
hover 提示的实际效果需要用户本地确认。

---

## [REQ-070] 周期事件改成滚动续期，始终保持未来一年已物化

状态：completed
模块：src/domain/recurringEvents.js, src/state/persistence.js, src/App.vue

描述：
用户问了周期事件的物化机制，排查确认：原实现是"创建那一刻一次性生成
完"（`computeOccurrenceDates()`），受两个硬上限约束——`MAX_HORIZON_DAYS`
（366 天）和 `MAX_INSTANCES`（200 个实例）任一个先达到就停，之后
**没有任何代码会再自动续**。高频的"每天"系列 200 个实例撑不到 200 天
（约 6.5 个月），"每周"/"每月"这类低频系列虽然够 200 个实例，但也会被
366 天硬顶死。用户要求"始终保持未来一年的周期任务已加载，不需要切换
月份才触发"，确认可以实现后动手做。

`domain/recurringEvents.js` 整个重写物化策略：每条规则新增
`materializedUntil`（已经生成到哪天，dateKey）/`materializedCount`
（已生成实例数，供 count 型结束条件判断）两个字段。新增
`materializeUpTo(rule)`：'never' 类型的目标终点永远是"今天 +
`ROLLING_HORIZON_DAYS`（366）天"，随"今天"推移不断往后移；'until'/
'count' 类型如果自己的截止条件比这个滚动终点更早，用自己的截止条件
封顶（不会把该结束的系列继续往后推）。`createRecurringEvent()` 现在
只是"从系列起始日前一天开始续期一次"的特殊情况，和后续续期共用同一套
逻辑，不是两套代码。新增 `extendAllRecurringSeries(store)`：遍历全部
规则调用 `materializeUpTo`，没有任何规则需要更新时直接 return、不触发
`store.setState`（幂等、低开销）。原来"总数 ≤200"这条硬性限制去掉，
换成 `MAX_INSTANCES_PER_OP=3000`/`MAX_SCAN_DAYS=3660` 两个只针对
"极端输入"（比如"每天，直到 3000 年"）的安全兜底，不是日常场景会碰到
的数字。

`state/persistence.js` 的 `fillMissingDefaults()` 新增
`migrateRecurringEventRule()`：REQ-070 之前创建、没有
`materializedUntil`/`materializedCount` 字段的老规则，扫描
`dayTimelines` 里这条规则名下实际已经物化出的实例反推初始值（取最晚
日期/数实例个数），保证老数据能正确接入新的续期逻辑，不会因为
`undefined` 参与日期比较/解析而报错，也不会因为初始值算错导致重复
生成或漏掉中间空档。

`App.vue` 的 `onMounted` 里新增 `extendAllRecurringSeries(store)` 调用
（覆盖"重新打开应用"这个主要场景），同时挂进已有的 `watch(now, ...)`
30 秒 tick 里（覆盖"长时间开着标签页不关、正好跨过一年边界"这种少见
场景）——函数本身开销低、有变化才写 state，高频调用可以接受，不需要
额外节流。

验收：
- 新建一个不设结束条件的周期事件，物化范围能看到延伸到"今天 + 约一年"
- 打开应用（或刷新页面）后，如果某条周期事件的物化范围已经落后于
  "今天 + 一年"，会自动补齐，不需要手动切换到未来某个月份
- 设了截止日期/重复次数的周期事件，物化到自己的截止条件为止就正确
  停止，不会被滚动窗口机制继续往后推
- 删除周期事件整个系列的功能不受影响
- 老数据（REQ-070 之前创建的周期事件）升级后能被正确识别出"已经生成到
  哪了"，不会重复生成也不会报错

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`recurringEvents.js`/`persistence.js`；`@vue/compiler-sfc` 编译
`App.vue` 通过。写了一份独立的验证脚本（用内存态的 store 桩，不依赖
浏览器专属的 `state/db.js`）跑了四个场景，全部通过：①"每天/永不结束"
创建后物化范围正好是"今天+366天"，立即再次续期是空操作，手动把
`materializedUntil` 拨回"今天+200天"模拟老进度后再续期，能正确补到
"今天+366天"；②"每天/30天后截止"创建后正好生成到截止日为止，到头后
再续期是空操作；③"每周/共5次"创建后正好生成 5 个实例；④手抄一份和
`migrateRecurringEventRule()` 完全一致的实现，验证了老数据迁移的正确
取值（取最晚日期、数对实例个数）和幂等性（已迁移过的规则原样返回）。
真实浏览器里的实际物化效果、跨应用重启的续期行为需要用户本地验证。

---

## [REQ-071] 补齐 2027 年美国/日本节假日数据（中国大陆官方尚未公布）

状态：completed
模块：src/domain/holidays.js

描述：
用户要求把"明年"（2027 年）的节假日数据也加载进来。分别用 WebSearch
核实三个地区 2027 年数据的实际可得性，结果不一致：

- **中国大陆**：法定节假日的"放假+调休"具体安排由国务院办公厅每年
  临时发文公布，历史规律是上一年 10~12 月才发（2026 年这份是
  2025-11-04 发的）。核实时（2026-08）官方还没公布 2027 年具体安排，
  只有元旦/春节/国庆节这几个节日本身的公历日期是已知的，没有"放假
  调休"这个真正要标注的数据。**没有添加**——这不是遗漏，是数据在
  写入时点还不存在，不能凭元旦/春节的公历日期去猜调休安排（历年调休
  规则不固定，猜错的代价是给用户错误信息）。
- **美国**：联邦假日由固定法律规则决定（多数是"每月第 N 个星期几"+
  "落在周末就顺延/提前到最近工作日"），2027 年可以提前准确算出，用
  WebSearch 核对了 timeanddate.com/federalpay.org 等多个独立来源，
  结果一致，**已添加** `US_2027`（含 Juneteenth/Independence Day/
  Christmas Day 三个落在周末、需要标注 observed 日期的假日）。
- **日本**：国民の祝日由《国民の祝日に関する法律》和天文台的春分/
  秋分推算日期决定，同样可以提前多年准确算出，用 WebSearch 核对了
  国立天文台暦計算室（官方权威计算来源）和内閣府官网，**已添加**
  `JP_2027`（2027 年"敬老の日"和"秋分の日"间隔两天，不触发"国民の
  休日"补充规则，这一条本身就没有，不是漏标）。

`HOLIDAYS_BY_REGION` 里 `US`/`JP` 各自新增 `2027` 年键，`CN` 保持
只有 `2026`；`getHolidayInfo()` 函数本身不用改，查不到年份数据本来
就返回 `null`，行为已经正确。文件顶部注释和末尾数据来源引用同步更新，
说明中国大陆数据缺失的原因，避免以后被误认为是漏补。

验收：
- 美国/日本地区，日历翻到 2027 年任意月份，节假日/调休标注和 2026 年
  一样正常显示
- 中国大陆地区翻到 2027 年，节假日标注保持空白（不报错、不显示错误
  信息），和"这个地区这一年没数据"的既有行为一致
- 2026 年三个地区的既有数据不受影响

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验通过。
用 `node -e` 直接调用真实的 `getHolidayInfo()`：核对了 US 2027-07-04/
07-05（Independence Day 实际/observed）、2027-06-18（Juneteenth
observed）、JP 2027-03-21/03-22（春分の日/振替休日）均返回正确的
名称和类型；CN 2027-01-01 返回 `null`（确认没有被意外/错误地填充）；
2026 年既有数据（CN 2026-10-01）仍然返回正确结果，确认没有被这次改动
影响。数据本身的准确性依赖 WebSearch 返回结果与多个独立信息源交叉核对
一致，不是凭训练记忆编造。

---

## [REQ-072] Google 同步重做：登录改整页跳转 + 补外部用户配置引导 + 双向日历同步取代忙碌时段读取

状态：completed
模块：src/calendar/googleAuthClient.js, src/calendar/googleEventMapper.js（新增，取代
conflictMapper.js）, src/calendar/sessionState.js（删除）, src/calendar/googleCalendarService.js,
src/components/GoogleSyncPanel.vue, src/App.vue, index.html, src/state/persistence.js,
src/i18n/locales/{zh,en,ja}.js, docs/KNOWLEDGE.md

描述：
用户连续反馈三个问题，一次性要求解决：①Google 登录弹窗完成授权后应用
不显示已登录状态；②之前排查 `org_internal` 错误时手动教的"OAuth 同意
屏幕改外部用户+加测试用户"步骤希望也补进应用自己的引导流程里；③"读取
忙碌时段（避让冲突）"这个功能要去掉，换成双向的日历同步（Google→本地、
本地→Google），同步方式（怎么判断新增/更新/去重）由 AI 自主决定，不需要
确认，事后报告即可。

**A. 登录改整页跳转（根因排查）**：登录弹窗完成授权后不显示已登录状态，
排查确认不是操作问题，是这个项目两个功能天生冲突——`vite.config.js`
给页面加了 `Cross-Origin-Opener-Policy: same-origin`（OPFS 本地数据库
的硬性前提），这个响应头会把页面自己打开的弹窗的 `window.opener` 置空，
Google 登录弹窗完成后没法把结果 `postMessage` 传回主页面，**静默失败、
不报错**。用 WebSearch 核实了这是 COOP:same-origin + OAuth 弹窗的已知
通病（Chromium issue tracker、真实项目 issue、Chrome 官方博客等多个
独立来源交叉印证）；查证过两个更宽松的 COOP 选项都不能两全——
`same-origin-allow-popups` 保住弹窗通信但会让页面失去跨源隔离状态、
本地数据库打不开，`restrict-properties` 理论上两全但 Chrome 已在
2025-04 暂停这个提案、没有浏览器真正支持。结论记进了
`docs/KNOWLEDGE.md`。

解法：`calendar/googleAuthClient.js` 整个重写，登录从"弹窗 token
client"改成"整页跳转的手写 OAuth2 隐式授权流程"（`response_type=token`）
——`startLogin()` 把整页导航到 Google 授权页，用户同意后 Google 把带
`access_token` 的 URL 片段重定向回应用（`redirect_uri` 需要在 Cloud
Console 登记），`consumeRedirectToken()`（`App.vue` 挂载时调用）解析
出 token、用随机 `state` 做 CSRF 校验、`history.replaceState` 清理
地址栏（token 不留痕迹）。用户取消/拒绝授权时 Google 带 `#error=...`
跳回来，识别后静默按"未登录"处理，不报错打扰用户。token 依然只存在
内存里，不写入任何存储，刷新页面需要重新登录，和原来的安全决定一致。
`App.vue` 检测到刚成功登录会自动 `navigate('sync')` 跳回 Google 同步
页，让"登录完成"这件事有一个立刻看得见的反馈。`index.html` 删掉不再
需要的 Google Identity Services 脚本标签（`gapi` 脚本仍保留，Calendar
API 调用本身还要用）。

**B. 补齐"外部用户"配置引导**：`GoogleSyncPanel.vue` 的配置引导列表
新增一步"配置 OAuth 同意屏幕：用户类型选外部，测试模式下要把自己的
Google 邮箱加进测试用户"，链接指向 Console 的 OAuth 同意屏幕设置页
（标准固定路由，不依赖项目 ID）。原来的引导步骤相应重新编号（原来
5 步变成 6 步）；"已获授权的 JavaScript 来源"这一步顺带扩展成同时
展示"已获授权的重定向 URI"（整页跳转流程新增的必填项，来自
`getRedirectUri()`，和 JS 来源一样提供复制按钮）。

**C. 双向日历同步取代忙碌时段读取**：`handleFetchBusy()`（读取 Google
忙碌时段生成文字冲突提示，不落地成真正的日历块）整个删除，连同它
唯一依赖的 `calendar/sessionState.js`（`connected`/`busyMap`/
`lastFetchedRangeLabel` 这几个模块级状态——`connected` 折进新版
`googleAuthClient.js` 的 `isLoggedIn()`，`busyMap` 相关整个不需要了，
`sessionState.js` 文件本身删除）一起清理。

同步方式（AI 自主决定，理由如下）：
- **Google → 本地**（新增）：排查发现 `DayTimeline.vue`/`WeekBoard.vue`/
  `domain/rewards.js`/`MonthBoard.vue`/`YearBoard.vue` 里早就有一整套
  "`block.source==='google'` 的块是只读的（不可拖拽/编辑/删除，显示
  锁定标签）、不计入奖励点数、不算进月/年视图的事件点数"的展示逻辑，
  只是之前从来没有真正的调用方把 Google 事件写成这种块——直接复用这套
  现成基础设施，不需要新增任何 UI 处理。策略是"整周替换"：同步当前
  正在查看的这一周，每一天先清掉所有旧的 `source==='google'` 块，
  再放进这次新拉到的（拉不到就是空），用户自己的块
  （`source!=='google'`）完全不碰——这样 Google 那边删除/挪走的事件，
  本地下次同步会自动跟着清掉，不需要额外维护"要不要删除"的判断逻辑，
  实现最简单也最不容易出现"幽灵数据"。`calendar/conflictMapper.js`
  重命名成 `calendar/googleEventMapper.js`（`mapEventsToBusy` 改名
  `mapEventsToDaySegments`），职责不变（按天切分 Google 事件），只是
  服务对象从"生成冲突警告"变成"生成要写进日历的真实块"，改名贴合
  新用途。
- **本地 → Google**（保留原有实现）：REQ-018 时期就有的"同步本周计划
  到 Google 日历"逻辑本身没有问题，原样保留，只是 `googleSync` 的时间
  戳字段从单一方向的 `lastSyncedAt` 拆成 `lastSyncToGoogleAt`（这个
  方向）和新增的 `lastSyncFromGoogleAt`（上面那个方向），两个方向各自
  独立记录"上次同步时间"。**已知局限**（如实记在代码注释和这里）：
  这个方向目前只会新建事件，本地块后续被编辑/删除不会同步撤销/更新
  已经推过去的 Google 事件，是单向追加、没有做增量对账——这不是这次
  疏漏，是原有实现一直如此，这次没有扩大也没有缩小这个方向的能力范围。

`state/persistence.js` 的 `googleSync` 默认结构从
`{lastSyncedAt, syncedEventIds}` 改成 `{lastSyncToGoogleAt,
lastSyncFromGoogleAt}`；新增 `migrateGoogleSync()`：老数据的
`lastSyncedAt`（当时唯一存在的方向，同步到 Google）原样平移成
`lastSyncToGoogleAt`；`syncedEventIds` 不迁移——排查确认这个字段
声明了但从来没有任何代码读写过（去重实际上一直是靠 block 自己的
`googleEventId` 字段），不是"留着兼容老数据"的死字段，是真的没用过。

验收：
- Google 登录改成整页跳转：点"登录 Google 账号"后离开本应用页面，跳到
  Google 的授权页；同意后跳回本应用，自动回到"Google 同步"页面并显示
  "已登录"（不再需要靠弹窗回传结果）
- 引导列表能看到新增的"配置 OAuth 同意屏幕（外部用户）"这一步，以及
  "已获授权的重定向 URI"这个新增的可复制地址
- "读取忙碌时段（避让冲突）"这个入口和相关文案彻底消失
- 点"把本周的 Google 日程同步到本地"：Google 日历上这一周的事件，
  以只读、带锁定标签的块出现在本地日/周视图对应的时间段上；这些块
  不出现在奖励点数结算里，也不占用月/年视图的事件点/热力标注
  （沿用既有的 `source==='google'` 排除逻辑）；重复点击会正确替换掉
  上一次同步的结果（Google 那边删掉的事件，本地也跟着消失），不会
  越点越多
  - 点"把本周计划同步到 Google 日历"：行为和以前完全一样（只新建、
  不重复推送已同步过的块），只是"上次同步"时间和上面那个方向分开显示
- 老数据（`googleSync.lastSyncedAt`）升级后正确迁移成
  `lastSyncToGoogleAt`，`lastSyncFromGoogleAt` 是 `null`（还没同步过）
- 仓库里搜不到 `conflictMapper`/`sessionState`/`mapEventsToBusy`/
  `initGoogleAuth`/`requestAccessToken`/`isGisLoaded`/`setBusyMap`/
  `getBusyMap`/`getLastFetchedRangeLabel` 的活代码引用

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（这条尤其重要——整页跳转
式 OAuth 流程涉及真实的浏览器导航和 Google 服务器交互，无法在当前
环境模拟，真实登录/同步效果需要用户本地验证）。`node --check` 校验了
`googleAuthClient.js`/`googleEventMapper.js`/`persistence.js`/三个
locale 文件；`@vue/compiler-sfc` 的 `parse`+`compileScript`+
`compileTemplate` 实际编译 `App.vue`/`GoogleSyncPanel.vue` 均通过。
三个语言文件 `sync` 分区 key 数量/名称逐一核对完全一致（各 36 个）。
写了三份独立验证脚本（stub 掉 `window`/`sessionStorage`/`history` 等
浏览器全局对象，不依赖真实浏览器环境）：①`googleAuthClient.js` 的
`startLogin`/`consumeRedirectToken` 完整流程——正常登录成功、state
不匹配时正确拒绝且不覆盖已有 token、用户取消授权时正确识别，均通过；
②`migrateGoogleSync()` 对老数据/新数据/全新用户三种输入的迁移结果均
正确；③手抄一份和 `handleSyncFromGoogle()` 完全一致的"整周替换"合并
逻辑，验证了"用户自己的块保留、旧 Google 块清掉、新 Google 块加入、
这次 Google 上没有事件的天清空"四个场景，全部符合预期。
`mapEventsToDaySegments()`（真实源码）用样例数据验证了全天事件被正确
忽略、限时事件被正确转换。Grep 全 `src/` 确认删除的函数/模块没有任何
残留引用。真实浏览器里完整走一遍"登录→同步→查看锁定块→再次同步验证
替换"的端到端效果，需要用户本地验证——这是本次改动里验证覆盖最弱的
一环，因为涉及真实的 Google OAuth 服务器和用户自己的 Google Cloud
项目配置，当前环境无法模拟。

---

## [REQ-073] 修复 REQ-072 引入的运行时崩溃（App.vue 页面卡死在加载动画）

状态：completed
模块：src/App.vue

描述：
用户反馈"现在一直处于加载中状态"。排查思路：先用项目真实的备份数据
（`data/lifespark-backup-2026-08-22.json`）把 `state/persistence.js` 的
读取/迁移管线和 `domain/recurringEvents.extendAllRecurringSeries()`
在 Node 里完整跑了一遍（stub 掉浏览器专属的 `state/db.js`），确认
6-10 毫秒内正常完成、不抛异常——排除了数据/迁移逻辑本身的问题。让用户
截图浏览器 Console，看到真实报错：

```
[Vue warn]: Unhandled error during execution of setup function
Uncaught (in promise) ReferenceError: now is not defined
    at setup (App.vue:89:7)
```

**根因**：REQ-072 编辑 `App.vue` 时，`old_string`/`new_string` 替换
不小心把原来紧挨着 `onMounted(...)` 前面的 `const now = useNow();`
这一行整个删掉了（替换只保留了新增的大段注释和 `onMounted` 本身），
`watch(now, ...)` 因此引用了一个从未声明过的变量，`<script setup>`
执行阶段直接抛出 `ReferenceError`，导致 `main.js` 的 `mount('#app')`
永远不会成功、`fadeOutLoadingScreen()` 也永远不会被调用——页面因此
卡死在初始加载动画（"正在生长中…"），且没有任何界面级的错误提示，
只有 Console 里能看到。这是一次真实的、由 AI 自己造成的编辑失误，不是
既有代码或数据的问题，也不是"审查后判断不需要改"的情况——单纯是
一次 `old_string`/`new_string` 替换漏看了被截断的声明行。

`onMounted(...)` 之前补回 `const now = useNow();`，其余代码不变。

验收：
- 刷新页面，加载动画能正常淡出、进入应用界面，不再卡死
- 浏览器 Console 不再出现 `now is not defined` 的报错
- `watch(now, ...)`（点数实时结算 + 周期事件滚动续期）功能不受影响

验证：
`@vue/compiler-sfc` 编译通过。手工通读了整个 `App.vue` 的
`<script setup>`，逐一核对每个 `import` 的标识符、每个
`const`/`computed`/`function` 声明是否都在使用前完成了声明，确认这是
唯一一处遗漏（之前的静态编译检查只做语法解析，不做"变量是否声明"这层
检查，是这类错误没有在改完当时就被发现的原因，记录为一次经验教训：
以后大范围 `old_string`/`new_string` 替换时，如果 `old_string`
包含一行独立的变量声明，要格外注意 `new_string` 有没有不小心把它连带
删掉）。真实浏览器里加载是否正常需要用户本地刷新确认。

---

## [REQ-074] 修复年视图"今天"高亮在相邻月份卡片上重复出现（REQ-060 遗留 bug）

状态：completed
模块：src/components/YearBoard.vue

描述：
用户截图反馈年视图显示有问题：8 月卡片和 9 月卡片同时都有一个格子带着
"今天"的蓝色描边高亮（8 月卡片的 31 号、9 月卡片开头那个属于上个月的
空白补位格）。

排查确认这是 REQ-060 年视图刚上线时就存在的 bug，不是这次会话新引入
的——`year-day--today` 这个 class 的判断条件 `getDateKey(date) ===
todayKey` 从来没有像 `year-day--holiday`/`year-day--workday`（REQ-069
新增时就正确加了这层判断）那样加上 `date.getMonth() === m.month` 这个
"只在真正属于这张月份卡片的格子上生效"的限制。年视图一次铺开 12 张
月历卡片，每张卡片的 42 格网格里，属于"上个月/下个月"的补位格子（用来
凑满 6 周 × 7 天）本质上代表的是相邻月份卡片里已经"真正"渲染过一次的
同一个日期——`todayKey` 只是单纯比较日期字符串，不知道也不关心这个
格子是不是补位格，所以每当"今天"这一天恰好落在某张月份卡片的补位区域
里（每年大概率会撞上几次，取决于当月第一天/最后一天是星期几），"今天"
的高亮就会在两张卡片上同时出现——一张是它真正所在的月份（正确），
一张是相邻月份卡片当补位格子用到它的地方（错误，这个格子本来就该是
空白、不可点的）。

修复：给 `year-day--today` 也加上 `date.getMonth() === m.month` 这层
判断，和 `year-day--holiday`/`year-day--workday` 保持一致的写法——
补位格子（`year-day--blank`）不应该显示任何"这天有什么特殊状态"的
标记，包括"今天"。

验收：
- 年视图里"今天"这个高亮描边只出现在它真正所属的那张月份卡片上，
  不会同时出现在相邻月份卡片的空白补位格子上
- 补位格子本身的行为（留空、不可点）不受影响
- 节假日/调休标注（REQ-069）不受影响，本来就已经有正确的月份判断

验证：
`@vue/compiler-sfc` 编译通过。写了独立验证脚本，用真实的
`getMonthGridDates()` 分别生成 2026 年 8 月/9 月的网格，模拟
"今天=2026-08-31"（8 月最后一天，9 月第一天是周二，8/31 会成为 9 月
卡片的补位格）这个真实撞上问题的场景：修复前的判断条件会让 9 月卡片
误命中 1 次，修复后的判断条件在 8 月卡片正确命中 1 次、9 月卡片正确
命中 0 次，符合预期。真实浏览器视觉效果需要用户刷新页面确认。

---

## [REQ-075] 背景图片支持浏览本地文件

状态：completed
模块：src/components/SettingsPanel.vue, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"背景图片可以通过浏览本地文件设置"——设置页原来只能粘贴一个
外部图片 URL（`settings.appearance.backgroundImage`），没有从本地
选图片的入口。

这个应用是纯前端、不允许引入后端上传，本地文件没有云端地址可以引用，
唯一能把"一个本地文件"变成一个能存进 state、能被 CSS
`background-image: url(...)` 直接使用的字符串的办法，是用
`FileReader.readAsDataURL()` 把选中的图片转成 base64 编码的 `data:`
URI——`url()` 原生支持 `data:` URI，`App.vue` 的 `backgroundStyle`
完全不需要为这种情况改代码，读进来的字符串和用户手动粘贴一个
`https://...` 图片链接对这个字段来说没有任何区别，两种来源共用同一个
`appearance.backgroundImage` 字段和已有的透明度滑块。

体积上限：`data:` URI 比原始文件大约 33%（base64 编码开销），这个
字符串会跟着整份 state 一起写进本地数据库、也会出现在"导出全部数据"
生成的 JSON 里——不限制的话一张几十 MB 的照片会明显拖慢这两者。定了
8MB 原始文件（约 10.7MB 的 data URI）作为上限，超出直接拒绝并提示，
不做压缩/裁剪（引入图片处理逻辑超出这个功能本身的范围）。文件类型
校验用 `file.type.startsWith('image/')`，配合 `<input accept="image/*">`
在选择器层面也过滤一遍。

原来的 URL 文本输入框保留（外部图片链接仍然是合法输入），新增的
"浏览本地文件"按钮和它并排放在同一行，选中本地文件后覆盖同一个字段，
两种方式不冲突、后选的生效。

验收：
- 设置页"背景图片"这一行除了原来的 URL 输入框，多一个"浏览本地文件"
  按钮，点击后弹出系统文件选择器，只能选图片文件
  （`accept="image/*"`）
- 选中一张本地图片后，背景图立即生效（复用已有的透明度滑块），效果
  和粘贴一个外部图片 URL 一致
- 选择超过 8MB 的图片会被拒绝并提示，不会写入 state
- 选择非图片文件（如果绕过了 `accept` 限制强行选择）会被拒绝并提示
- 手动粘贴 URL 这条既有路径完全不受影响

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（文件选择器、
`FileReader` 的真实读取效果依赖真实浏览器环境，无法在当前环境模拟）。
`node --check` 校验了三个 locale 文件；`@vue/compiler-sfc` 的
`parse`+`compileScript`+`compileTemplate` 实际编译通过。三个语言文件
`settingsView` 分区 key 数量/名称核对完全一致（各 37 个）。手工通读了
整个 `SettingsPanel.vue` 的 `<script setup>`，逐一核对每个新增的
`ref`/`function` 声明和已有的 `importInputRef`/`triggerImport` 等
既有声明没有命名冲突，也没有像 REQ-073 那样意外删掉任何既有声明。
真实浏览器里选择本地图片、拒绝超大/非图片文件的实际效果需要用户本地
验证。

---

## [REQ-076] 背景图片去掉透明度调节，按原样全不透明显示

状态：completed
模块：src/App.vue, src/components/SettingsPanel.vue, src/state/persistence.js,
src/i18n/locales/{zh,en,ja}.js

描述：
用户要求"背景图的效果不用设置透明化"——REQ-011 时期背景图层配了一个
透明度滑块（`appearance.backgroundOpacity`，默认 20%），原意是"图层
调淡，不影响正文/卡片可读性"；用户反馈不需要这个可调项，直接去掉。

`App.vue` 的 `backgroundStyle` 不再读取/计算 `backgroundOpacity`，
直接返回 `{backgroundImage: url(...)}`，CSS 没有设置 `opacity`，浏览器
默认按 100% 不透明显示——卡片本身有不透明背景色，图片只在卡片间隙
露出来，可读性本来就不依赖这层透明度调节。`SettingsPanel.vue` 里
`v-if="appearance.backgroundImage"` 控制显示的那个 `n-slider` 分区
整个删除。`state/persistence.js` 的 `createDefaultState()` 不再生成
`backgroundOpacity` 字段（老数据里如果还带着，走 `appearance` 已有的
浅展开合并原样留着当死数据，不影响任何逻辑）。三个语言文件的
`backgroundOpacityLabel` 一并删除（不再有任何地方引用）。

验收：
- 设置页"背景图片"分区不再有透明度滑块
- 设置了背景图的用户，图片按原样全不透明显示（不再有半透明变淡的
  效果）
- 没设置背景图时这一层依然正确隐藏，不受影响
- 老数据里残留的 `backgroundOpacity` 字段不会导致任何报错或异常行为

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`persistence.js`/三个 locale 文件；`@vue/compiler-sfc` 编译
`App.vue`/`SettingsPanel.vue` 均通过。三个语言文件 `settingsView`
分区 key 数量核对一致（各 36 个，比 REQ-075 时少了刚删掉的这一个）。
Grep 全 `src/` 确认 `backgroundOpacity` 只剩 `persistence.js` 里一句
解释性注释，没有任何活代码引用。手工重新通读了 `App.vue`/
`SettingsPanel.vue` 改动处前后的代码，确认没有像 REQ-073 那样误删
相邻的其它声明。真实浏览器视觉效果需要用户本地刷新确认。

---

## [REQ-077] 右上角透明化切换按钮 + 设置/Google 同步表单细节打磨

状态：completed
模块：src/App.vue, src/components/SettingsPanel.vue, src/components/GoogleSyncPanel.vue,
src/state/persistence.js, css/layout.css, css/components.css,
src/i18n/locales/{zh,en,ja}.js

描述：
用户一次提了三点：①"右上角一个透明按钮，日历透明化切换显示"；
②设置页和 Google 同步页的表单"看起来不是很自然"，举了两个例子——
"图片链接不用显示全长"、"谷歌密码之前是前面，后面加密"；③过程中追加
"背景图片怎么取消，给我加个勾选框"。

**A. 右上角透明化切换按钮**：新增
`settings.appearance.transparentMode`（持久化布尔字段，和主题/字体同
一类外观偏好）。`App.vue` 固定右上角新增一个按钮（`BlurOnRound` 图标，
样式和已有的 `.sidebar-toggle` 汉堡按钮同一套视觉语言），只在设了
背景图时渲染——没有背景图，"透明"没有东西可透出来，切换没有意义。
点击切换 `.app-shell`（侧边栏+主内容区整体）的 `opacity`
（`.app-shell--transparent`，0.82），让 `.app-background` 那张背景图
透出来。选择"整体调 opacity"而不是"逐个组件的卡片背景色单独换成半
透明色"，是因为后者要给 `--bg-secondary`/`--bg-tertiary` 这类目前都是
纯色 hex 的变量重新适配透明通道，改动面覆盖全部组件、成本过高；代价
是文字对比度也会跟着变淡，这是"要透出背景图就要牺牲一点可读性"的
预期取舍，用户随时可以再点一下关掉。

**B. 表单细节打磨**：
- Google 同步页的 Client ID 输入框改用 `n-input` 自带的
  `type="password"` + `show-password-on="click"`，默认遮起来、点眼睛
  图标才显示——这串 ID 不算真正机密（本来就会出现在每次授权请求里），
  但截图/分享屏幕求助时不想意外整个亮出来。
- 设置页背景图输入框：本地文件转出来的 `data:` URI 可能近 11MB 长
  （见下方体积上限说明），糊在一整行输入框里"不自然"。改成区分来源
  展示——外部 URL（`http(s)://...`）本身通常不长，继续用可编辑文本框；
  本地文件来源的 `data:` URI 不再回显原始字符串，换成一句友好提示
  "已选择本地图片"，实际存的值不变，只是展示方式不同。新增一个 36×36
  的缩略图预览（`.background-image-preview`，两种来源共用同一份
  展示逻辑），给用户一个"现在设置的是这张图"的直接反馈。

**C.（追加）背景图片启用勾选框**：用户反馈想取消背景图不够直观（原来
只能去文本框里点不太显眼的清除图标）。新增"启用背景图片"勾选框
——状态直接从 `!!appearance.backgroundImage` 派生，不额外维护独立的
enabled 字段：取消勾选即"清空这个字段"，语义上就是"取消背景图片"；
从空状态勾选会直接唤起文件选择器（和点"浏览本地文件"按钮是同一个
入口），选完/取消，勾选框自动跟着 `backgroundImage` 是否真的有值
同步，不会出现"勾选框亮着但其实没图"这种状态不一致。想用外部 URL 的
话，输入框本身随时可编辑，不需要先勾选。

验收：
- 设了背景图后，右上角出现一个可点击的图标按钮；点击后整个日历界面
  （侧边栏+主内容区）变透明，能看到背景图透出来；再点一次恢复不透明
- 没有设置背景图时，右上角不出现这个按钮
- Google 同步页的 Client ID 默认显示成一串圆点，点击输入框旁边的
  眼睛图标才能看到明文，再点一次重新遮住
- 设置页选择本地图片后，输入框位置显示"已选择本地图片"而不是一长串
  乱码字符串，旁边有一个缩略图预览；粘贴外部图片 URL 时输入框正常
  显示/可编辑
- 设置页新增"启用背景图片"勾选框：勾掉能直接清除背景图；从未设置
  状态勾选会弹出文件选择器；选择器里选中图片后勾选框自动变成勾选态，
  取消选择文件后勾选框保持未勾选（不会出现"假勾选"）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（文件选择器、密码框显隐
切换、透明化视觉效果都依赖真实浏览器环境）。`node --check` 校验了
`persistence.js`/三个 locale 文件；CSS 大括号配平校验通过
（`components.css` 120/120，`layout.css` 28/28）；`@vue/compiler-sfc`
的 `parse`+`compileScript`+`compileTemplate` 实际编译
`App.vue`/`SettingsPanel.vue`/`GoogleSyncPanel.vue` 均通过。三个语言
文件 `nav`/`settingsView`/`sync` 三个分区 key 数量/名称逐一核对完全
一致（10/37/36 个）。手工完整通读了 `App.vue` 和 `SettingsPanel.vue`
改动涉及的每一段代码，逐一核对新增声明和既有声明没有冲突、没有像
REQ-073 那样误删相邻代码（过程中确实发现并修正了一处 IME 误输入的
日文汉字"選"混进中文注释，已改回"选"）。真实浏览器里的按钮位置、
透明效果、密码框显隐、勾选框联动这几处交互效果需要用户本地验证。

---

## [REQ-078] 悬浮按钮挪到右下角，改成可扩展的悬浮工具栏 + 新增快速添加事件

状态：completed
模块：src/App.vue, css/layout.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户要求把 REQ-077 加的"右上角透明按钮"挪到右下角，并且改造成一个
"悬浮工具栏"，"可以试着集成一些常见功能"——后半句是开放性授权，AI
自主决定要加什么，不需要逐项确认。

**位置/结构调整**：CSS 类从单按钮的 `.transparency-toggle` 改成容器
`.floating-toolbar`（`position:fixed; right:12px; bottom:12px;` 纵向
`flex` 排列多个按钮）+ 按钮类 `.floating-toolbar__btn`（视觉样式不变，
沿用原来的方形圆角卡片背景+悬浮阴影），原有的透明化切换按钮迁移进来，
逻辑（只在设了背景图时渲染、点击切换 `transparentMode`）完全不变。

**新增功能——快速添加事件**：考虑了几个候选后选定这一个：主题切换
已经在侧边栏一直可见（不需要重复放）；"回到今天"每个日历视图自己的
头部已经有（重复放容易和已有入口混淆）；语言切换 REQ-008 时用户明确
要求从悬浮位置挪回设置页，不应该再放回悬浮的地方。快速添加事件是唯一
一个"目前没有跨视图快捷入口、且是日历类应用里公认常见"的功能——原来
建事件必须先切到日/周视图、找到具体某一天再点格子，现在不管停在哪个
视图，点这个"+"按钮就能直接弹出新建事件表单，默认日期是今天、默认
开始时间取"现在"这一刻按 15 分钟取整。`openQuickAddModal()` 直接给
`uiState.modal` 赋值（通过已有的 `navigate()` 函数，不强制切换到某个
特定视图——`EventModal.vue` 是独立于 `activeView` 的覆盖层，弹层叠加
在当前视图上面，关闭后停留在原来的视图，不会把用户"传送"到日视图）。

验收：
- 悬浮按钮从右上角移到了右下角
- 右下角固定显示一个"+"图标按钮，任意视图下点击都能弹出新建事件表单，
  默认日期是今天、默认时间接近当前时刻
- 设了背景图时，"+"按钮下方会出现透明化切换按钮，行为和 REQ-077 时
  完全一致；没设背景图时只有"+"按钮
- 新建事件表单正常填写保存后，弹层关闭，停留在点击"+"按钮之前所在的
  视图（不会被强制切到日视图）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
三个 locale 文件；CSS 大括号配平校验通过（`layout.css` 29/29）；
`@vue/compiler-sfc` 的 `parse`+`compileScript`+`compileTemplate` 实际
编译 `App.vue` 通过。手工完整通读了整个 `App.vue` 文件（不只是改动
片段），逐一核对所有 import/声明/模板引用之间的一致性，确认没有像
REQ-073 那样误删相邻代码。真实浏览器里的按钮位置、快速添加事件的
弹层交互效果需要用户本地验证。

---

## [REQ-079] 悬浮工具栏改横排 + 加展开/收起开关 + 修复无背景图时仍可能透明化的缺陷

状态：completed
模块：src/App.vue, css/layout.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户提了两点：①悬浮工具栏改横向摆放，并且要能切换收起（内容不显示）；
②没有背景图片时不应该进行透明化，要给透明化加一个条件。

**A. 横排 + 展开/收起**：`css/layout.css` 的 `.floating-toolbar` 从
`flex-direction: column` 改成 `row`。新增 `uiState.toolbarExpanded`
（纯 UI 便利状态，不持久化，和 `sidebarOpen` 是同一类，默认 `true`
——刷新页面回到展开，不强迫用户每次重新点开）+ 一个常驻的"更多"开关
按钮（`MoreHorizRound` 图标）。原来的"+"快速添加/透明化切换两个功能
按钮加上 `v-if="uiState.toolbarExpanded"`，收起时只剩开关按钮。开关
按钮固定放在 DOM 顺序最后（容器用 `right` 定位，越靠后的子元素越贴近
固定的右边缘）——展开/收起时功能按钮从开关左侧冒出来/收回去，开关
本身位置不会跟着挪动，点击目标稳定不飘。

**B. 修复透明化条件缺陷**：排查确认这是一个真实的遗留问题，不是新
需求——REQ-077/078 只在**按钮**上加了
`v-if="state.settings.appearance.backgroundImage"`（没背景图不显示
按钮），但**效果**本身（`.app-shell` 的 `.app-shell--transparent`
class 绑定）只判断了 `transparentMode`，没有同时判断
`backgroundImage`。场景：用户设了背景图、开了透明化，之后又把背景图
删掉（REQ-077 新增的"取消勾选"）——`transparentMode` 这个持久化字段
不会跟着自动复位，界面会在没有任何东西可透出来的情况下继续变淡，
纯粹是缺陷，不是预期行为。修复：`.app-shell--transparent` 的绑定条件
改成 `transparentMode && backgroundImage` 两者都满足才生效。

验收：
- 右下角悬浮工具栏的按钮改成横向排列
- 点击工具栏最右侧的"更多"图标，能收起/展开另外几个功能按钮；收起后
  只剩这一个开关本身可见
- 展开/收起过程中，开关按钮本身的位置保持不动
- 设置了背景图并开启透明化后，再去设置页取消勾选背景图——日历界面应该
  立刻恢复完全不透明，不会继续处于"变淡但没有背景图可看"的状态
- 没有背景图时，悬浮工具栏里不会出现透明化切换按钮（沿用 REQ-077/078
  已有行为，不受这次改动影响）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
三个 locale 文件；CSS 大括号配平校验通过（`layout.css` 29/29）；
`@vue/compiler-sfc` 编译 `App.vue` 通过。三个语言文件 `nav` 分区 key
数量/名称核对完全一致（各 12 个）。手工完整通读了整个 `App.vue`
文件，确认没有误删相邻代码，`.app-shell--transparent` 的新条件
（`&&` 两个布尔值）逻辑简单直接、手工核对过四种组合
（有图开透明/有图关透明/无图开透明/无图关透明）都符合预期。真实
浏览器里的横排布局、收起展开动画、透明化条件生效效果需要用户本地
验证。

---

## [REQ-080]"兴趣活动"重新定位成"攻略笔记"：卡片露出摘要 + 详情/编辑改成阅读/写作排版

状态：completed
模块：src/components/ActivityCard.vue, src/components/ActivityModal.vue,
src/utils/markdown.js, css/components.css, src/i18n/locales/{zh,en,ja}.js

描述：
用户一开始反馈"兴趣活动"功能没用、想删掉；排查确认这个功能确实是一座
孤岛（跟日历/奖励完全没有联系，REQ-052 删除自动排程后就只剩一个纯
收藏卡片）；提出"加一个安排到日历的按钮"这个方案后，用户想起来自己
真正想要的其实是另一件事："我想要的是一片片类似攻略笔记之类的内容，
就是一个 md 文件记载着这个活动可以做的事情"——重点不是"从点子到日历
的桥梁"，是"这个功能本身该长成一个个人攻略笔记本"，content 这个
Markdown 字段才是重点，不是标题/分类/链接这些元信息。用户接着反馈
"显示详情的时候页面太小了，布局成一个正常适合阅读的 md，然后编辑的
时候也是太小了"，确认了具体改法。

**A. 卡片露出摘要**：新增 `utils/markdown.js` 的
`extractPlainTextSummary(source, maxLength)`——去掉标题/列表标记和
粗体/斜体/链接语法，留纯文字，截到 `maxLength` 字符（默认 70，两行
文字的经验值）。`ActivityCard.vue` 标题下面新增
`.activity-card__summary`（`-webkit-line-clamp:2` 两行截断，避免长
摘要撑高单张卡片破坏网格整齐度）。卡片从"只看得出标题+封面图+分类"
变成"扫一眼就知道这篇笔记大概写了什么"。

**B. 查看详情改成阅读排版**：`ActivityModal.vue` 弹层从固定
`560px` 加宽到 `min(1100px, calc(100vw - 48px))`。正文区域包一层
`.activity-modal__reading`（`max-height:62vh; overflow-y:auto`）单独
滚动，不让长文章把整个弹层撑出视口；`.activity-modal__content` 字号/
行距加大（15px/1.8），标题/列表间距也放宽，读起来更接近一篇文档而
不是表单详情的附属内容。

**C. 编辑改成写/预览双栏**：原来 8 行的纯文本框改成
`.activity-modal__editor`（`grid-template-columns: 1fr 1fr`，固定
`46vh` 高度）——左边 `n-input type="textarea"` 写 Markdown 源文本
（等宽字体、CSS 强制撑满高度），右边 `.activity-modal__editor-preview`
实时渲染预览（复用和 view 模式同一份 `renderMarkdown()`/
`.activity-modal__content` 样式，新增 `draftRenderedContent` computed
喂 `draft.content` 而不是已保存的 `activity.content`），写的时候就能
看到最终效果，不用保存后才知道排版对不对。标题/分类/链接/封面图这几个
"元信息"字段收进 `.activity-modal__meta-fields`（3 列紧凑网格，标题
单独占一整行），把纵向空间尽量让给正文编辑区。900px 断点下（复用
REQ-027 已有的响应式断点）双栏改上下堆叠，避免窄屏挤压变形。

验收：
- 兴趣活动卡片标题下方能看到一小段内容摘要（最多两行，超出省略号
  截断），没有内容的活动不显示这一块
- 点开一条有内容的活动，详情弹层明显变宽，正文区域字号/行距比之前
  舒展，超长文章在正文区域内部滚动，不会把整个弹层顶出屏幕
- 点"编辑"（或新建活动），内容字段变成左右两栏：左边输入 Markdown，
  右边实时显示渲染后的效果，输入的同时右边跟着刷新
- 窄屏（≤900px）下编辑区的写/预览两栏改成上下堆叠，仍然可用
- 标题/分类/链接/封面图等字段在编辑态排布更紧凑，不影响正常填写

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`markdown.js`/三个 locale 文件；CSS 大括号配平校验通过
（`components.css` 135/135）；`@vue/compiler-sfc` 的
`parse`+`compileScript`+`compileTemplate` 实际编译
`ActivityModal.vue`/`ActivityCard.vue` 均通过。写了独立测试脚本验证
`extractPlainTextSummary()`：混合标题/粗体/斜体/列表/链接的样例文本
被正确去除 markdown 语法、折叠成单行；给一个远小于原文长度的
`maxLength` 能正确截断并加省略号；空字符串/`undefined` 输入都返回
空字符串不报错。手工完整通读了 `ActivityModal.vue`/`ActivityCard.vue`
改动后的完整文件，确认新增声明和既有声明没有冲突、没有误删相邻代码；
发现并修正了一处把 Vue SFC `<style scoped>` 专属的 `:deep()` 选择器
误用在这个项目实际使用的全局 CSS 文件（`css/components.css`，这个
项目所有组件都没有 `<style>` 块，样式统一在这几个全局 css 文件里）里
的问题，改成普通的后代选择器。真实浏览器里的双栏编辑、阅读区滚动、
响应式断点切换效果需要用户本地验证。

---

## [REQ-081] 计划页"废止计划"改名"取消计划"+ 二次确认；兴趣活动封面图支持浏览本地文件、去掉图文链接、编辑/删除按钮挪到详情右上角

状态：completed
模块：src/components/PlanPanel.vue, src/components/ActivityModal.vue,
src/domain/activityPool.js, src/state/persistence.js,
src/i18n/locales/{zh,en,ja}.js, css/components.css

描述：
用户一条消息里提了两处不相关页面的调整，按涉及模块分成两部分记录：

**A. 计划页"废止计划"按钮改名"取消计划" + 加二次确认**（用户原话：
"计划页面 的那个废止计划按钮 改名改成取消计划 并加上取消的确认提醒
提醒的实现跟兑换按钮类似的效果就行"）：纯 UI 层面的措辞和交互调整，
底层数据模型不变——`abolished` 字段名、`domain/plans.abolishPlan()`
函数名都保留不改，计划数据依旧不会被物理删除，只是标记
`abolished: true`（只读、隐藏编辑入口、整卡片视觉变淡，这套行为
REQ-038 就有，这次没有改）。`PlanPanel.vue` 里
`handleAbolishPlan()` 重命名为 `handleCancelPlan()`，按钮从直接点击
触发改成 `<n-popconfirm v-if="!plan.abolished" @positive-click=
"handleCancelPlan(plan)">` 包一层——参考 `RewardPanel.vue` 兑换按钮
"点击→二次确认→真正执行"的同一套惯例，不是重新设计一套确认交互。
i18n 里原来的 `plan.abolishedToast`/`abolishPlan`/`abolishedTag` 三个
key 换成 `cancelPlanToast`/`cancelPlanBtn`/`cancelPlanConfirm`/
`cancelPlanTag`（新增了确认弹窗文案这一个 key），命名上跟已有的
`plan.cancel`（表单取消按钮，语义完全不同）区分开，避免混淆。没有
"恢复"入口——用户没有要求可撤销，这一点也写进了确认弹窗的提示文案里
（取消后不能恢复），提醒用户这是单向操作。

**B. 兴趣活动详情/编辑弹层（`ActivityModal.vue`）三处调整**（用户
原话："封面图片可以浏览本地文件 编辑删除按钮放在展开后卡片的右上角
图文的链接不需要"）：

1. 封面图支持浏览本地文件——跟 REQ-075 背景图片同一套
   `FileReader.readAsDataURL()` 惯例：新增 `coverFileInputRef`/
   `triggerCoverFilePicker()`/`handleCoverFileChange()`，文件类型校验
   （`file.type.startsWith('image/')`）、体积上限拒绝
   （`MAX_COVER_IMAGE_BYTES`，超出提示不写入）。上限定成 3MB，比背景
   图片的 8MB 更紧——背景图片全局只存一份，活动的封面图会随着条目数量
   累加，同样的单张上限乘以条目数量后对 state 体积的影响更明显，收紧
   一档更稳妥。原来的"粘贴外部图片链接"输入框保留，新增的"浏览本地
   文件"按钮跟它并排放在同一行，两种来源共用同一个 `imageUrl` 字段，
   后选的生效，跟 REQ-075 背景图片的处理方式一致。
2. 去掉图文链接字段——`buildDraft()`/`save()` 的 `fields` 对象、
   view 模式"访问链接"`<a>` 元素、edit 模式对应的 `n-form-item` 全部
   删除；`domain/activityPool.js` 的 `addActivity()` 不再写入
   `link` 字段；`state/persistence.js` 的 `migrateLegacyActivity()`
   （把 REQ-048 之前的旧版活动数据迁移到新分类体系）原来会把旧记录里
   的 `activity.link` 一并搬过来，现在新字段集合里已经没有这个字段，
   直接不迁移，老备份文件里如果本来带着 `link` 也会在迁移时被丢弃，
   跟"这个功能删掉了"的决定保持一致——没有新增任何"兼容旧字段"的
   特殊处理，旧记录里残留的 `link` 属性就是普通的死数据，不影响读取。
   `imageUrl` 对应的分类网格从 3 列（标题/分类/链接/封面图共占两行）
   改成 2 列（`grid-template-columns: 1fr 2fr`，封面图这一列因为要放
   下"浏览本地文件"按钮，分到比分类更宽的空间）。
3. 编辑/删除按钮从底部 `.settings-actions` 按钮行挪到 view
   模式详情区右上角悬浮——复用 `ActivityCard.vue` 卡片缩略图上已有的
   `.activity-card__icon-btn`（圆形、深色半透明背景）视觉样式，新增
   `.activity-modal__view`（相对定位容器）+
   `.activity-modal__cover-actions`（绝对定位，`top: 8px; right: 8px`）
   两个包装类；跟卡片缩略图上"悬停才出现"的透明度过渡不同，这里已经
   是用户主动点开的详情页，不需要"悬停才发现"，按钮常驻显示。没有
   封面图时（`activity.imageUrl` 为空）用
   `.activity-modal__view--no-cover`（`padding-top: 34px`）在容器顶部
   留出空间，避免悬浮按钮盖住紧挨着的分类标签行。

验收：
- 计划页每张未取消的计划卡片右上角按钮显示"取消计划"，点击弹出确认
  提示（文案说明取消后只读且不可恢复），确认后计划变成"已取消"状态、
  标签文案也是"已取消"，卡片视觉变淡；已取消的计划不再显示这个按钮
- 打开一条有封面图的兴趣活动详情，封面图右上角能看到悬浮的编辑/删除
  圆形图标按钮，点击效果和原来底部的编辑/删除按钮一致（删除仍有二次
  确认）；没有封面图的活动，按钮悬浮在详情区顶部，不会盖住分类标签
- 编辑活动时，"链接"输入框和详情页"访问链接"按钮都已经不存在
- 编辑活动时，封面图字段除了原来的 URL 输入框，多一个"浏览本地文件"
  按钮，选中本地图片后立即在字段里生效；选择超过 3MB 的图片会被拒绝
  并提示

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（文件选择器、真实浏览器
里的悬浮按钮定位/二次确认弹窗效果依赖真实浏览器环境，无法在当前环境
模拟）。`node --check` 校验了 `activityPool.js`/`persistence.js`/三个
locale 文件；CSS 大括号配平校验通过（`components.css` 138/138）；
`@vue/compiler-sfc` 的 `parse`+`compileScript`+`compileTemplate` 实际
编译 `ActivityModal.vue`/`PlanPanel.vue`/`ActivityCard.vue` 均通过；
写了独立脚本核对三个 locale 文件全部 key（不只是 `plan`/`library`
分区）的名称与数量完全一致（各 280 个）。手工完整通读了
`ActivityModal.vue`/`PlanPanel.vue` 改动后的完整文件，确认新增声明和
既有声明没有冲突、没有像 REQ-073 那样意外删掉相邻代码；`activity.link`
在 `src/` 下全局搜索确认只剩这份文档和迁移函数里说明性的注释提到，
代码里没有任何遗留引用。真实浏览器里悬浮按钮的定位效果、二次确认弹窗
的实际交互、本地图片选择的读取效果需要用户本地验证。

---

## [REQ-082] 兴趣活动去掉分类功能：搜索改成只按标题匹配，图文（活动）本身也不再有分类字段

状态：completed
模块：src/domain/activityPool.js, src/state/persistence.js,
src/constants/colors.js, src/utils/i18nLabels.js,
src/components/ActivityModal.vue, src/components/ActivityCard.vue,
src/components/ActivityLibraryPanel.vue, src/i18n/locales/{zh,en,ja}.js,
css/components.css

描述：
用户原话："进行分类搜索的功能去除掉 搜索时的 根据标题匹配搜搜就行
图文里面的分类也去掉"——把 REQ-050/053/058 陆续搭起来的"兴趣活动动态
分类"整套功能（列表页的分类筛选 chip/更多分类下拉框、活动详情/编辑里
的分类字段、内置 8 个默认分类的 i18n 翻译）整个删除，搜索只保留标题
子串匹配这一种方式。

**数据模型**：`domain/activityPool.js` 的 `addActivity()`/
`updateActivity()` 不再读写 `category` 字段，连带 `addCategory()`/
`touchCategoryUsage()`（维护 `useCount` 的内部函数）一起删除。
`state/persistence.js` 顶层 `activityCategories` 字段（新安装种 8 个
默认分类的 `SEED_ACTIVITY_CATEGORIES`）、`migrateActivityCategoryRef()`
（把老活动的 `category` 转成动态分类列表里的 id）、
`backfillCategorySeedKeys()`（给老分类数据补 `seedKey`）整个删除；
`migrateLegacyActivity()`（处理 REQ-048 之前更老一套分类体系
novel/interest/variety/routine 的迁移函数）保留——它检测的是"是不是
极老数据"这一步，跟这次删除的 REQ-053/058 分类系统是两回事，只是
迁移结果里不再写 `category` 字段了。老数据/老备份文件里残留的
`activity.category`/顶层 `activityCategories` 字段没有任何代码再读，
是无害的死数据，不需要专门清理。

**展示层**：`constants/colors.js` 的 `categoryColor()`/`categoryEmoji()`
（按类别 id 哈希取色/取值）、`utils/i18nLabels.js` 的 `categoryLabel()`
（按 `seedKey` 查 i18n 或回退原文）一起删除——这两个文件此前的注释
都明确说这是专门服务分类功能的，分类删了这些查表逻辑也就没有存在
的意义了。`ActivityCard.vue` 不再需要 `categories` prop，卡片右上角
的分类标签整个去掉，没有封面图时的占位从"按分类哈希取色的斜向渐变 +
对应 emoji"改成固定的强调色背景 + 固定的 📝 emoji。`ActivityModal.vue`
不再需要 `categories` prop，view 模式的分类标签行、edit 模式的分类
`n-select`（连同 `categoryOptions`/`handleCreateCategoryOption()`/
`handleCategoryUpdate()`）整个删除，编辑表单里标题/封面图这两项从
"紧凑网格"改回各自独占一整行（分类删掉后只剩两项，网格布局已经没有
存在的必要）。`ActivityLibraryPanel.vue` 的分类筛选整套状态
（`filterCategories`/`sortedCategories`/`topCategories`/
`overflowCategories`/`overflowCategoryIds`/`overflowOptions`/
`toggleCategory()`/`overflowSelected`）和对应的 chip/下拉框模板一起
删除，`activities` 这个 computed 从"分类 + 标题"两个条件叠加过滤简化
成只按标题子串匹配一个条件。

**i18n**：`domain.category`（8 个内置默认分类的翻译）、
`library.categoryLabel`/`categoryPlaceholder`/`categoryMoreLabel` 三个
分类相关的 key 从三个语言文件里一起删除（`library.searchPlaceholder`
本来就只说"搜索标题"，不用改）。

**CSS**：`css/components.css` 里 `.activity-library__category-chips`/
`.activity-library__category-more`、`.activity-card__category-tag`、
`.activity-modal__meta-row`（原来只装分类标签，删完这个 div 已经空了）
一起删除；`.activity-modal__meta-fields`/`--title`/`--image` 这套紧凑
网格连同 900px 断点下的对应响应式规则一并删除（ActivityModal.vue 编辑
表单改回普通堆叠布局，不再需要网格）；新增 `.activity-card__cover--
placeholder`（固定 `var(--accent)` 背景，替代原来按分类哈希取色的
渐变）。

验收：
- 兴趣活动列表页顶部只剩搜索框，没有任何分类筛选 chip 或"更多分类"
  下拉框；在搜索框输入文字，只有标题包含这段文字的活动会显示
- 添加/编辑活动的表单里没有"类别"这个字段，只剩标题、封面图、内容
  三项
- 活动卡片和详情弹层都不再显示任何分类标签；没有封面图的卡片显示
  固定颜色背景 + 固定的 📝 占位图标（不再随活动变化颜色/emoji）

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`activityPool.js`/`persistence.js`/`colors.js`/`i18nLabels.js`/三个
locale 文件；CSS 大括号配平校验通过（`components.css` 130/130）；
`@vue/compiler-sfc` 的 `parse`+`compileScript`+`compileTemplate` 实际
编译 `ActivityModal.vue`/`ActivityCard.vue`/`ActivityLibraryPanel.vue`
均通过；独立脚本核对三个 locale 文件全部 key 名称/数量完全一致（各
269 个，比改动前少 11 个，正好对应删掉的 `domain.category`8 个 +
`library.category*`3 个）。手工完整通读了这次改动涉及的全部文件
（`activityPool.js`/`persistence.js`/`colors.js`/`i18nLabels.js`/
`ActivityModal.vue`/`ActivityCard.vue`/`ActivityLibraryPanel.vue`），
过程中发现并修正了一处遗漏：`state/persistence.js` 顶部的 `createId`
导入在删掉 `activityCategories` 生成逻辑（唯一调用 `createId('cat')`
的地方）之后已经没有任何调用方，属于死代码，一并删除；全局搜索确认
`categoryColor`/`categoryEmoji`/`categoryLabel`/`activityCategories`/
`addCategory` 在 `src/` 下除说明性注释外没有任何遗留代码引用。真实
浏览器里搜索框、卡片占位样式的实际效果需要用户本地验证。

---

## [REQ-083] 兴趣活动详情页：封面图挪进正文滚动区，不再固定悬在顶部

状态：completed
模块：src/components/ActivityModal.vue

描述：
用户反馈"md 文件显示的时候 图片不要置顶卡住不动"——`ActivityModal.vue`
view 模式原来的结构是封面图（`<img class="activity-modal__image">`）
和正文阅读区（`.activity-modal__reading`，`overflow-y:auto` 单独滚动）
是两个平级的兄弟节点，图片在阅读区外面、阅读区上方。滚动阅读区看长
文章时，图片本身不在这个滚动容器内，不会跟着滚走，一直悬在最上面
占着屏幕空间，正是用户说的"置顶卡住不动"。

修复：把 `<img>` 挪到 `.activity-modal__reading` 内部，作为滚动内容的
第一部分，和正文 `.activity-modal__content` 一起滚动——图片现在跟随
正文滚动移出视口，不再固定占位。原来 `.activity-modal__reading` 只在
`activity.content` 非空时才渲染（`v-if="activity.content"`，没有正文
时图片单独露在外面、下面跟一个不在滚动区里的"还没有填写内容"提示），
现在这个滚动容器改成无条件渲染，图片和"内容 / 没有内容提示"都作为它
的子节点——只有图片没有正文的情况下（滚动区里只有一张图 + 提示文字）
效果和以前视觉上一致，不算行为变化，只是统一了结构，不用再维护两套
"有没有正文"的条件分支。右上角悬浮的编辑/删除按钮（REQ-081）仍然是
`.activity-modal__view` 的直接子节点，不受这次调整影响——它们本来就
不需要跟着正文滚动，`.activity-modal__view--no-cover` 那层"没有封面图
时顶部留白避免遮挡"的逻辑也照常生效（现在遮挡的是滚动区里的第一屏
内容，而不是专门针对图片，语义上更准确）。

验收：
- 打开一条带封面图、内容较长（超过阅读区可视高度）的活动详情，往下
  滚动正文时，封面图会跟着一起往上滚出视口，不再固定悬在最上面
- 打开一条没有封面图、或者没有正文内容的活动，显示效果和这次改动前
  一致（分别显示纯文字或"还没有填写内容"提示）
- 右上角编辑/删除悬浮按钮的位置和点击效果不受影响

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（滚动的实际视觉效果依赖
真实浏览器渲染，无法在当前环境模拟）。`@vue/compiler-sfc` 的
`parse`+`compileScript`+`compileTemplate` 实际编译 `ActivityModal.vue`
通过。手工通读了改动后的完整 view 模式模板片段，确认封面图/正文/
"没有内容"提示这三种条件渲染分支互斥且不遗漏任何原有分支，没有引入
额外的 CSS 改动（`.activity-modal__image`/`.activity-modal__reading`
已有样式直接适用于新的嵌套结构，不需要新增规则）。真实浏览器里的
滚动效果需要用户本地验证。

---

## [REQ-084] 项目改名为 Planto（寓意"计划落地生根、按部就班地长成"），项目文件夹同步改名

状态：completed
模块：package.json, index.html, vite.config.js, .gitattributes,
README.md, README.en.md, README.ja.md,
start-lifespark.bat→start-planto.bat, start-lifespark.sh→start-planto.sh,
src/i18n/locales/{zh,en,ja}.js, src/state/persistence.js,
src/calendar/googleAuthClient.js, src/calendar/googleCalendarService.js,
src/components/GoogleSyncPanel.vue, src/components/WeekBoard.vue,
src/components/DayTimeline.vue, docs/MODULES.md,
项目文件夹 LifeSpark → Planto

描述：
用户要求"把项目改一下名字，改成 Planto，寓意是计划落地生根、按部就班
地长成"。这是一次纯粹的品牌/命名调整，不涉及任何功能行为变化，全项目
搜索 `LifeSpark`/`lifespark` 逐一过了一遍，按"是当前状态描述还是历史
记录"分两类处理：

**改成 Planto 的（当前状态/用户可见）**：
- `package.json` 的 `name` 字段（`lifespark` → `planto`）
- `index.html` 的 `<title>`
- 三个语言文件的 `app.name`（侧边栏品牌文字，见 `SidebarNav.vue`）和
  `library.dataImportInvalid`（导入非法数据文件时的提示文案）
- 全项目 `console.warn`/`console.info` 里的 `[LifeSpark]` 日志前缀
  （`state/persistence.js` 4 处、`calendar/googleAuthClient.js` 2 处、
  `components/GoogleSyncPanel.vue`/`WeekBoard.vue`/`DayTimeline.vue`
  各 1 处）统一改成 `[Planto]`
- `calendar/googleCalendarService.js` 里同步到 Google 日历的事件标题
  前缀 `[LifeSpark] ${title}` 改成 `[Planto] ${title}`；写入
  `extendedProperties.private` 的标记 key `EXTENDED_PROP_KEY` 从
  `'lifespark'` 改成 `'planto'`——这个 key 是纯 write-only 标记（全项目
  搜索确认没有任何代码读回来做判断，去重实际靠 block 自己的
  `googleEventId` 字段），改名不影响任何现有同步逻辑，老数据里已经
  同步过的事件上还带着旧的 `lifespark` 标记，无害，不需要迁移
- `README.md`/`README.en.md`/`README.ja.md`：标题从"🌱 LifeSpark"改成
  "🌱 Planto"，标题下方新增一行斜体寓意 tagline（中文"计划落地生根，
  按部就班地长成。"；英文 "Where plans take root and grow, one step
  at a time."；日文"計画が根を張り、一歩ずつ育っていく。"）；
  `git clone` 命令、启动脚本文件名引用、正文里提到项目名的地方一并
  改成 Planto。**`git clone` 的仓库地址同步改成了
  `github.com/yiran201/Planto.git`——这是假设用户会同步把 GitHub 上的
  远程仓库也改名成 Planto（GitHub 改名后旧地址会自动跳转一段时间，
  但不会永久生效）；本地 git remote 本身没有改（`git remote -v` 显示
  还是指向 `.../LifeSpark.git`，实测确认这是真实远程，不是可以直接
  假装已改名的东西），需要用户自己在 GitHub 仓库设置里改名后，再跑
  `git remote set-url origin https://github.com/yiran201/Planto.git`
  同步本地 remote，否则现在 `git push`/`git fetch` 还是能正常工作
  （指向旧地址），只是 README 里写的 clone 命令会在仓库改名之前失效**
- `start-lifespark.bat`/`start-lifespark.sh` 用 `git mv` 重命名为
  `start-planto.bat`/`start-planto.sh`（保留 git 历史）；`.bat` 内容
  用 PowerShell `-Encoding Default` 写回（GBK，避免用 Edit 工具直接
  改写导致编码损坏，这是这个项目一直以来的规矩），`title LifeSpark`
  改成 `title Planto`；`.sh` 内容里两处自我引用的文件名注释同步更新
- `.gitattributes` 顶部注释里举例用的文件名（`start-lifespark.bat`/
  `.sh`）同步改成新文件名
- `docs/MODULES.md`"目录结构"这棵树是当前状态的活文档（不是历史
  记录），根目录名 `LifeSpark/` 改成 `Planto/`，两个启动脚本条目的
  文件名和描述文字同步更新
- 项目文件夹本身：用户明确要求"连文件夹也一起改名"，`E:\ai_workplace\
  LifeSpark` 重命名为 `E:\ai_workplace\Planto`（纯文件系统操作，跟
  git 无关——git 不关心工作区容器目录叫什么名字，仓库历史/远程配置都
  不受影响）；执行前用 `git status`/`git remote -v` 确认了这是一个
  干净可继续操作的 git 仓库，且全项目 grep 确认没有任何代码硬编码了
  旧的绝对路径 `ai_workplace\LifeSpark`，改名不会引入路径失效的问题

**保留不改的（历史记录）**：`docs/CHANGELOG.md`/`docs/REQUESTS.md` 里
提到 `LifeSpark` 的段落全部是叙述"当时发生了什么"的历史记录（比如
REQ-000 记录项目初始化时确认的文件夹名、REQ-045 描述加载动效品牌
决策时的原文、REQ-063/065 端口冲突排查时的原始描述、REQ-061 提到的
"当时的 GitHub 仓库 `github.com/yiran201/LifeSpark`"），按项目一贯的
"CHANGELOG/REQUESTS 是追加写、不回改历史条目"的惯例，这些原样保留，
不做溯及既往的批量替换——它们描述的是"发生这件事那一刻的事实"，不是
"现在的状态"，这份 REQ-084 本身就是新的一条追加记录，用来说明"现在
改名了"这件事，两者并不矛盾。

验收：
- 应用侧边栏品牌名显示"Planto"（三种语言下都是这个英文名，不走翻译）
- 浏览器标签页标题显示"Planto · ..."
- 设置页导入一个无效文件时，提示文案里的产品名是"Planto"
- 三份 README 标题都是"🌱 Planto"，标题下方能看到寓意 tagline
- Windows 下双击 `start-planto.bat`、Linux/macOS 下执行
  `./start-planto.sh` 都能正常启动开发服务器（不再有 `start-lifespark.*`
  这两个文件）
- 项目文件夹路径变成 `E:\ai_workplace\Planto`

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`persistence.js`/三个 locale 文件/`googleCalendarService.js`/
`googleAuthClient.js`；`package.json` 用 `JSON.parse` 校验过格式合法。
全局 `grep -rn "LifeSpark"` 分别核对过 `src/`、根目录配置文件
（`package.json`/`vite.config.js`/`index.html`）、三份 README、
`docs/MODULES.md`，改名后均无残留（`docs/CHANGELOG.md`/`REQUESTS.md`
里按上面说明的原则保留的历史记录除外）。手工核对了 `EXTENDED_PROP_KEY`
在全项目范围内只有写入方（`googleCalendarService.js` 自己），没有任何
读取方依赖这个具体字符串值，改名不影响同步逻辑。`.bat` 文件改完用
PowerShell `-Encoding Default` 读回校验过是合法的 GBK 双字节编码
（用 `xxd` 核对了中文字符的字节序列，不是 UTF-8 的三字节序列），没有
重蹈 REQ-055 之前的编码损坏问题。`git mv`/`git status` 确认两个启动
脚本被识别为重命名（`R` 状态）而不是删除+新增，保留 blame 历史。项目
文件夹重命名前用 `git status`/`git remote -v` 确认过仓库状态干净可以
安全操作，重命名后在新路径下重新跑了一遍上述 grep 校验，确认所有
文件都还在、内容没有因为路径变化而损坏。真实浏览器里的显示效果、
Windows 双击启动脚本、Google 日历同步事件标题前缀的实际效果需要用户
本地验证；GitHub 远程仓库改名和本地 `git remote set-url` 需要用户自己
决定是否要做、如果做的话手动执行（不是这次改动自动完成的部分）。

---

## [REQ-085] start-planto.bat 编码问题复现，改用纯英文内容彻底避开 Windows 批处理文件的代码页坑

状态：completed
模块：start-planto.bat, start-planto.sh, .gitattributes, docs/MODULES.md,
docs/KNOWLEDGE.md

描述：
用户反馈双击 `start-planto.bat` 报错，贴出的报错原文是乱码
（`'谌ɡ丛匆蠖丝诓荒?REM' 不是内部或外部命令`、`'形暮?UTF-8' 不是内部
或外部命令`）——这是 `docs/KNOWLEDGE.md`"中文 Windows 上 .bat 脚本
必须避开 UTF-8（不带 BOM）编码"这条知识记录过的同一类问题：`cmd.exe`
按系统代码页逐字节解析 `.bat` 文件，如果文件实际编码和这个代码页对不
上，多字节中文字符的字节配对会错位，偶然拼出 ASCII 分隔符，导致脚本
从中文注释/提示语"内部"被截断执行。REQ-055 当时的修复是把文件另存成
ANSI/GBK 编码，这次复现说明"存成 GBK"不是一劳永逸的——文件很可能在
后续被某个编辑器（比如这次改名过程中打开过这个文件的 Cursor）按默认
的 UTF-8 重新保存，悄悄把编码改回去了，而这个风险没有办法从源头杜绝
（没有一种"锁定编码"的机制能防止任何编辑器未来再次误存）。

排查方向上，最初考虑在脚本第一行加 `chcp` 强制指定代码页，但
`docs/KNOWLEDGE.md` 里已经记录过"这条路实测无效"（`cmd.exe` 解析批
处理文件不是按"改完代码页立刻对后续行生效"执行的）。用户明确要求
"不要使用 GBK，可以的话这些脚本使用英文注释"——这是更彻底的解法：把
`start-planto.bat`/`start-planto.sh` 里所有中文注释和运行时提示文案
（`echo`/`title`）全部翻译成英文，纯 ASCII 字节在任何代码页下都是同一
个字节序列，不管这个文件之后被什么工具用什么编码重新保存、不管运行
它的机器系统代码页是什么，都不可能再触发这类字节错位——从根上让这个
问题不可能复现，而不是每次编码被意外改回去了再修一次。`.bat` 文件
不再需要用 PowerShell `-Encoding Default` 这种特殊方式写入维护，普通
编辑器/工具直接编辑保存即可，维护成本也降低了。

配套更新：`.gitattributes`/`docs/MODULES.md` 里提到"GBK 编码"的地方
标注成已废弃，改成"纯 ASCII 英文内容"；`docs/KNOWLEDGE.md` 对应知识
条目补充说明——GBK 双字节配对错位这条技术原理本身仍然是普适事实，但
"必须用 GBK"这个具体应对方式已经不是本项目现在的做法，只在真的需要
在批处理脚本里保留中文文案时才需要考虑，本项目现在的选择是从根源上
不在这两个启动脚本里放任何非 ASCII 文案。

验收：
- Windows 下双击 `start-planto.bat`，不管用什么编辑器打开/保存过这个
  文件，都不会再出现"不是内部或外部命令"这类乱码报错
- 脚本运行效果不变：首次运行自动 `npm install`，然后启动开发服务器并
  用 `--open` 打开浏览器
- `start-planto.sh` 的提示文案改成英文后，Linux/macOS 上的功能行为
  不变

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（但确认了 `npm run dev`
本身在这个项目目录下能正常启动，是这次会话里改名验证时已经测过的）。
`file`/`xxd` 核对了新的 `start-planto.bat` 字节内容确认是纯 ASCII
（"ASCII text"，不再是"ISO-8859 text"意味的双字节 GBK），不存在任何
非 ASCII 字节，不可能再触发代码页错位问题。用 `Start-Process` 实际
执行了改写后的 `start-planto.bat`（用临时文件重定向 stdout/stderr），
确认脚本本身逐行正确执行到了 `npm run dev` 这一步，没有复现任何"不是
内部或外部命令"的错误；该次测试里 `npm` 本身报"not recognized"是
`Start-Process` 这个测试方法本身继承的是精简环境变量、没有用户交互式
会话的 PATH（`where.exe npm` 在正常 PowerShell 会话里能正确找到
`npm.cmd`），确认是测试方法的局限，不是脚本文件本身的问题。真实
Windows 桌面环境下双击执行的最终效果需要用户本地确认。

---

## [REQ-086] 浏览器标签页标题去掉中文副标题，只保留 Planto；新增 🌱 favicon

状态：completed
模块：index.html

描述：
用户反馈"浏览器标题的部分就显示 Planto 和图标就行吧，现在后面加了
一段中文"——`<title>` 从 `Planto · 年度生活规划与智能行程调度` 简化成
只有 `Planto`。用户确认还想要一个图标：项目此前完全没有配置
favicon（`<head>` 里没有任何 `rel="icon"`，浏览器标签页一直显示默认
空白图标）。新增图标直接复用侧边栏品牌同一个 🌱 emoji（见
`SidebarNav.vue`），用一个只画这一个字符的内联 SVG 通过 `data:` URI
嵌进 `<link rel="icon">`，不需要额外生成/维护一个 `.ico`/`.png`
文件，也不占用一次额外的网络请求。

验收：
- 浏览器标签页标题只显示"Planto"，不再有中文副标题
- 浏览器标签页图标显示 🌱

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`（`data:` URI favicon 的
实际渲染效果依赖真实浏览器，无法在当前环境截图确认）。手工检查
`index.html` 改动前后 `<head>` 结构完整，`<link>` 标签属性配对正确
闭合，emoji favicon 是这个项目里已经验证过可行的技术（内联 SVG +
`data:` URI 是浏览器广泛支持的标准做法，不依赖构建工具处理）。真实
浏览器标签页的显示效果需要用户本地确认。

---

## [REQ-087] 提供可直接运行的 dist 构建产物，方便打包成 GitHub Release

状态：completed
模块：serve-dist.cjs（新增）, package.json, README.md, README.en.md,
README.ja.md, docs/MODULES.md

描述：
用户想做一个 GitHub Release，只放 `dist/` 构建产物，方便别人不用
`npm install`/`npm run build` 就能直接下载用。排查确认这个诉求有一个
绕不开的技术前提：这个项目的本地数据库（`@sqlite.org/sqlite-wasm`，
OPFS 持久化）依赖浏览器的跨源隔离，必须由服务器带上
`Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy` 两个响应
头才能正常工作（`vite.config.js` 的 dev/preview 配置已经带了，README
的部署说明里也提过这个要求）——纯解压 `dist/` 双击打开
`index.html`（`file://` 协议不可能有任何服务器响应头），或者用大多数
通用静态服务器（`npx serve`、`python -m http.server`、GitHub Pages
默认配置等）直接托管，都不会自动带上这两个头，数据库会初始化失败。
跟用户确认后，方案是新增一个零依赖的 Node 静态文件服务器
`serve-dist.cjs`，专门给下载下来的 `dist/` 用，自带这两个响应头，
`node serve-dist.cjs` 就能跑起来，不需要装 Vite 或任何 npm 依赖。

`serve-dist.cjs` 用 `.cjs` 后缀而不是 `.js` 是刻意的，过程中实测踩了
两个方向相反的坑才确定下来：
1. 最初写成 `serve-dist.js`、内容用 `import`（ESM 语法）。单独解压到
   一个没有任何 `package.json` 的空目录里运行时，Node 默认把裸 `.js`
   当 CommonJS 处理，报"Cannot use import statement outside a
   module"——这正是 release 包"脱离项目单独解压"这个核心使用场景，
   必须在这种环境下能跑。
2. 改成 CommonJS（`require`）之后，在项目自己目录里跑
   `node serve-dist.js`（比如通过 `npm run serve:dist`）又报"require is
   not defined in ES module scope"——因为这个项目的 `package.json` 本身
   是 `"type": "module"`，Node 按最近的祖先 `package.json` 判断模块
   类型，项目目录里所有裸 `.js` 文件都会被当成 ESM，不管文件内容写的
   是什么语法。
   `.js` 在"脱离项目单独解压"和"项目内直接跑"这两种场景下，会因为
   相反的原因报错，没有一种 `.js` 写法能同时满足两边。改用 `.cjs`
   后缀彻底绕开这个冲突——Node 对 `.cjs` 后缀的文件，不管旁边有没有
   `package.json`、`package.json` 里 `type` 字段是什么，永远按
   CommonJS 处理，两种场景都用同一份 `require()` 语法的文件就都能跑。
   这两个坑都是靠真的把文件解压到空目录/在项目里实际执行才发现的，
   不是凭经验猜的。

配套加了 `package.json` 的 `serve:dist` 脚本（`node serve-dist.cjs`，
项目内自测用）；三份 README 的部署说明段落补充了"Releases 页面有打包
好的 dist + serve-dist.cjs，下载解压后 `node serve-dist.cjs` 直接可用"
这句话。`docs/MODULES.md` 补充了对应条目。GitHub Release 本身（打
tag、把 `dist/` + `serve-dist.cjs` 打包成 zip 上传成 release 资源
文件）这一步需要用户自己在 GitHub 网页上操作，不是这次改动自动完成的
部分——本机没有安装 `gh` CLI（`command not found`），没有办法代为
创建/上传。

验收：
- 从任意一台装了 Node.js（18+）的机器上，只解压
  `dist/` + `serve-dist.cjs` 这两样（不需要 `node_modules`、不需要
  `package.json`），执行 `node serve-dist.cjs`，能在
  `http://localhost:4173/` 正常打开应用，数据库读写功能正常（能新建
  活动/计划等，刷新页面后数据还在）
- 在项目自己目录里执行 `npm run serve:dist`，效果和上面一致
- 换端口（`PORT=8080 node serve-dist.cjs`）能正常生效

验证：
按 AGENTS.md P2-2，未代为执行 `npm run dev`，但这次改动的核心正是
"这个静态服务器脚本能不能真的跑起来"，所以对它做了比平时更彻底的
真实运行验证，不只是语法检查：`node --check` 通过只能说明语法合法，
不能发现本次遇到的两个模块类型冲突问题（这两个问题都是`--check`
测不出来、必须真的执行才会报错的运行时问题），因此额外做了：①在
项目目录内真实启动 `node serve-dist.cjs`（`npm run serve:dist` 会
触发的同一条路径），`curl` 请求确认返回 200 且带有正确的
`Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy` 响应头；
②把 `npm run build` 的真实 `dist/` 输出连同 `serve-dist.cjs` 复制到
一个全新的临时目录（这个目录及其所有上级目录都确认没有任何
`package.json`，真实模拟"用户下载 release 压缩包解压到任意位置"的
场景），在这个目录里执行 `node serve-dist.cjs`，同样用 `curl` 确认
主页面和一个 `.wasm` 资源文件的响应头都正确、状态码 200；③确认测试
结束后所有临时启动的 `node` 进程都已终止、没有残留占用端口。两轮真实
运行测试全部通过后才把最终版本打包成
`planto-v0.1.0-dist.zip`（`dist/`+`serve-dist.cjs`+`HOW_TO_RUN.txt`
说明文件）。真实创建/发布 GitHub Release、上传这个压缩包这一步，以及
不同操作系统（尤其是 Windows `cmd`/PowerShell 环境变量语法跟
`PORT=8080` 这种 POSIX 写法不一样）下的实际运行效果，需要用户自己
验证。

---

## [REQ-089] GitHub Pages 部署支持：Service Worker 跨源隔离垫片 + GitHub Actions 自动部署

状态：completed
模块：public/coi-serviceworker.js（新增）, index.html,
.github/workflows/deploy-pages.yml（新增）, README.md, README.en.md,
README.ja.md

描述：
用户问"GitHub 不是能够直接部署吗，可以教我一下怎么部署吗"，指的是
GitHub Pages。排查确认这里有一个跟 REQ-087（dist 发布包）同源的技术
前提冲突：GitHub Pages 是纯静态托管，**没有配置自定义响应头的能力**，
而这个项目的本地数据库依赖 COOP/COEP（REQ-090 排查后确认还需要 CORP）
响应头才能跨源隔离——直接把 `dist/` 部署上去，页面能打开，但数据库
初始化会失败。

跟用户确认后采用的方案：`coi-serviceworker` 技术（社区方案，
https://github.com/gzuidhof/coi-serviceworker）——不是直接照搬第三方
文件，而是基于这个技术的公开原理自己实现了一份（`WebFetch` 工具对这个
第三方仓库的逐字复制请求有内置的引用长度限制，没法直接原样拉取，改成
自己按原理重写，同时更方便针对这个项目做定制注释）：

- `public/coi-serviceworker.js`（新增）：拦截页面发出的每一个 fetch，
  用 `new Response(response.body, {...})` 重新构造一份带
  COOP/COEP（REQ-090 补了 CORP）响应头的响应，达成和服务器真的发送
  这些头等效的跨源隔离效果。处理了两个已知边界情况：
  `{cache:'only-if-cached'}` 配合跨源请求在 Chrome 里会直接抛异常
  （提前 return 跳过，不拦截这类请求）；`status===0` 的不透明
  （opaque，跨源 no-cors）响应不做任何改写直接透传（这类响应本来就
  读不到真实响应头，伪造 COOP/COEP 没有意义，需要跨源资源自己的服务器
  发 CORP 才能真正解决，这也是参考实现的既有取舍）。
- `index.html` 新增一段内联注册脚本：只在
  `window.crossOriginIsolated` 不是 `true` 时才注册这个 Service
  Worker（意味着在 dev/preview/serve-dist.cjs 这些服务器已经真的发送
  响应头的场景下，这段代码整体是空操作，不会有任何副作用或性能开销）；
  Service Worker 只对"注册之后的请求"生效，当前这次打开在它生效之前
  已经发生，所以注册成功后要用 `sessionStorage` 打一个标记、刷新一次
  页面，让这次访问本身也走上带着这些头的请求；标记本身防止极端情况
  （Service Worker 注册成功但因为某些浏览器策略仍然没能达成隔离）下
  反复刷新。
- `.github/workflows/deploy-pages.yml`（新增）：标准的 GitHub 官方
  Pages 部署工作流模板（`actions/checkout` → `actions/setup-node` →
  `npm ci` → `npm run build -- --base=/Planto/` →
  `actions/upload-pages-artifact` → `actions/deploy-pages`），触发条件
  是推送到 `master` 分支或手动触发（`workflow_dispatch`）。构建命令
  额外加了 `--base=/Planto/`——GitHub Pages 给一个仓库（不是
  `username.github.io` 根仓库或自定义域名）分配的地址是子路径形式
  （`https://yiran201.github.io/Planto/`），Vite 生成的资源 URL 需要
  知道这个前缀，这个 flag 只在这个工作流里传，不写进
  `vite.config.js`，本地开发/`serve-dist.cjs` 发布包都还是用默认的
  根路径。这个工作流本身还需要用户在仓库 Settings → Pages 里手动把
  "Source" 改成"GitHub Actions"这一次性设置，工作流本身没法代为完成
  这一步。
- 三份 README 的部署说明段落补充了 Pages 这个选项的简要提示。

验收：
- 仓库 Settings → Pages 设置成"GitHub Actions"来源后，推送到
  `master` 分支会自动触发构建+部署，几分钟后能在
  `https://yiran201.github.io/Planto/` 访问到应用
- 打开这个地址，数据库功能（新建活动、计划等，刷新页面后数据还在）
  正常工作，不会因为跨源隔离缺失而报错
- 在 dev/preview/serve-dist.cjs 这些已经会发送真实响应头的场景下，
  行为和加这个功能之前完全一致（Service Worker 不会被注册，没有任何
  副作用）

验证：
这次改动的核心是"这个垫片在真实浏览器里能不能真的达成跨源隔离"，做了
比平时远为彻底的真实浏览器验证，而不是只做语法检查——本机 Node 是
18.20.4，最新版 Playwright 要求 Node 20+ 装不上，改用兼容 Node 18 的
`playwright@1.40.0`（`npx playwright@1.40.0 install chromium`
装浏览器）编写测试脚本驱动真实 Chromium/Chrome，具体做了：①写一个
故意不带任何响应头的静态服务器（`headerless-server.cjs`，模拟 GitHub
Pages 的真实限制），确认 `curl` 验证过它确实不带 COOP/COEP/CORP 这几
个头；②用 Playwright 追踪完整的导航时间线（`framenavigated`/`load`
事件 + 时间戳），确认整个流程是"首次加载（未隔离）→ 注册 Service
Worker → 自动刷新一次 → 第二次加载（已隔离）"，且刷新只发生一次，
没有无限刷新循环；③用 `page.evaluate` 直接读 `navigator.storage.
getDirectory()` 检查 OPFS 目录内容，确认应用真的把 `lifespark.
sqlite3` 数据库文件写进了 OPFS（不只是页面"看起来"能打开）；④额外
用 `chromium.launch({channel:'chrome'})` 换成本机真实安装的 Chrome
（152.0.7977.76，不是 Playwright 自带的旧版 Chromium）重新跑过一遍，
排除"只是旧版 Chromium 的特殊行为"这种可能性。这轮验证过程中意外
发现了一个更严重、跟这次 Pages 功能本身无关的既有 bug——数据库在
**任何**部署方式下（dev/preview/serve-dist.cjs，不只是 GitHub
Pages）都完全没有真正落盘过，见下一条 REQ-090，这条本身记录的验收
结论是在 REQ-090 修复之后重新跑通过的最终结果。真实 GitHub Actions
执行、Pages 网站的实际可访问性需要用户自己在仓库设置里启用后验证
（工作流文件本身的构建步骤已经用等价的本地命令 `npm run build --
--base=/Planto/` 验证过能正确生成带 `/Planto/` 前缀的资源路径）。

---

## [REQ-090] 修复本地数据库在所有部署场景下完全无法初始化的严重问题：sqlite-wasm 运行时路径与 Vite 资源哈希不匹配 + 缺失 CORP 响应头

状态：completed
模块：public/assets/sqlite3.wasm（新增）,
public/assets/sqlite3-opfs-async-proxy.js（新增）, vite.config.js,
serve-dist.cjs, public/coi-serviceworker.js

描述：
在验证 REQ-089（GitHub Pages 部署的跨源隔离垫片）的过程中，用真实
浏览器做端到端测试时意外发现：`window.crossOriginIsolated` 变成
`true`（垫片本身工作正常）之后，应用数据库依然完全没有初始化——用
`page.evaluate` 直接检查 `navigator.storage.getDirectory()`，OPFS
根目录是空的，没有任何 `lifespark.sqlite3` 文件被创建。进一步排查
发现这**跟 GitHub Pages 或 Service Worker 垫片完全无关**——在
`npm run dev`、`npm run preview`、`serve-dist.cjs` 这三种此前被认为
"已经验证过没问题"的场景下用真实浏览器测试，同样的问题**全部复现**，
说明这是一个此前从未被真正验证过、影响当前所有部署方式的既有 bug，
不是这次改动引入的新问题。

排查过程（两层独立问题，各自定位）：

**问题一：`sqlite3.wasm`/`sqlite3-opfs-async-proxy.js` 请求 404**。
用 Playwright 追踪网络请求发现浏览器实际请求的是
`/assets/sqlite3.wasm`（不带 hash），而 Vite 构建产物里这个文件叫
`/assets/sqlite3-BVKGSWc-.wasm`（带 hash）——请求 404，
`WebAssembly.compile()` 因为拿到一个 404 响应直接抛出
"HTTP status code is not ok"，导致 `sqlite3Worker1Promiser` 的
worker 线程在能调用 `onready`/`onerror` 回调之前就整个崩溃退出，两个
回调都没有机会被调用，`db.js` 里 `getPromiser()` 返回的 Promise 因此
永远不会 resolve 或 reject，一路网上传导（`openDb()`→
`readStateJson()`→`loadState()`→`initStore()`）到 `main.js` 的
`bootstrap()` 卡死在 `await initStore()`——`main.js` 顶部注释里"数据库
读取失败会兜底成使用默认状态"这个设计假设的前提是 `onerror` 会被
调用，没有覆盖到"worker 直接崩溃、两个回调都不会触发"这种更极端的
失败模式，这也是为什么在真实浏览器里表现为"UI 界面正常渲染、看起来
一切正常"而不是一个明显的崩溃或错误提示——`appChildCount` 检查显示
应用在这次故障下其实卡在 `bootstrap()` 里，从未真正 `mount()` 过（
之前误以为"看到界面就是正常"的判断是不准确的）。根因定位：全局搜索
`node_modules/@sqlite.org/sqlite-wasm` 的源码，在
`dist/sqlite3-worker1.mjs` 里找到 `new URL("sqlite3.wasm",
import.meta.url).href`，`dist/sqlite3-opfs-async-proxy.js`
同理由另一个字符串路径引用——这是包官方自带的、写死的相对路径拼接
逻辑，Vite 对 `new URL(literal, import.meta.url)` 这个惯用法通常有
特殊的静态分析/哈希重写支持，但显然没有覆盖到这个包在
`optimizeDeps.exclude`（README 里官方文档要求的两项 Vite 配置之一，
这个项目从 REQ-024 起就配了）排除范围内、经过 worker 打包链路处理后
的这两处引用——不管是 dev server、`vite preview`、还是纯静态托管，
都会遇到同样的路径不匹配，这不是一个"某种服务器模式特有"的问题，是
这个第三方包在这套 Vite 打包管线下的通用集成问题。修复：把包自带的
原始（未加 hash）`sqlite3.wasm`/`sqlite3-opfs-async-proxy.js`
两个文件手动复制进 `public/assets/`（用 `md5sum` 核对过和 Vite 构建
出的带 hash 版本字节完全一致，确认只是文件名不同、内容是同一份），
这样 `dist/assets/` 目录里会同时存在带 hash 和不带 hash 两份同样的
文件——库运行时用不带 hash 的名字请求，能正确命中；Vite 自己的正常
打包分析用带 hash 的名字引用，两边互不干扰。这两个文件依赖的
`@sqlite.org/sqlite-wasm` 具体版本（`package.json` 锁定的
`3.53.0-build1`），如果将来升级这个依赖版本，需要记得重新执行一次
这个复制步骤——这一点写进了两个文件所在目录的说明里（见下方"已知
局限"）。

**问题二：`sqlite3-opfs-async-proxy.js` 请求被
`net::ERR_BLOCKED_BY_RESPONSE` 拦截**。修完问题一之后，`sqlite3.wasm`
能正确 200 了，但 OPFS 异步代理这个嵌套 worker（sqlite-wasm 用"worker
里再起一个 worker"实现真正的同步文件访问）的请求仍然被浏览器直接
拦截，控制台报 "Error initializing OPFS asyncer"。这是
`Cross-Origin-Embedder-Policy: require-corp` 的一个容易被忽略的
要求：COEP 不只要求顶层页面本身跨源隔离，还要求页面加载的**每一个子
资源**都带 `Cross-Origin-Resource-Policy` 响应头，否则会被直接拦截
——这个项目从 REQ-024 起 `vite.config.js`/`serve-dist.cjs` 一直只发了
COOP/COEP 两个头，从来没有发过 CORP，这个具体的组合此前显然从来没有
被跑通过跨源隔离下嵌套 Worker 创建这条路径。修复：`vite.config.js`
的 `server.headers`/`preview.headers`、`serve-dist.cjs`、
`public/coi-serviceworker.js` 三处统一补上
`'Cross-Origin-Resource-Policy': 'same-origin'`。

验收：
- 应用无论通过 `npm run dev`、`npm run preview`、`node
  serve-dist.cjs`、还是 REQ-089 的 GitHub Pages 垫片打开，数据库都能
  真正初始化：新建一条活动/计划，刷新整个页面（不是页面内局部刷新），
  数据还在
- 浏览器控制台不再出现"Error initializing OPFS asyncer"或
  "Failed to execute 'compile' on 'WebAssembly'"这类错误
- `navigator.storage.getDirectory()` 能看到真实的 `lifespark.sqlite3`
  文件

验证：
这是这次改动里验证强度最高的一条，因为这个 bug 本身就是"UI 表面正常、
实际功能完全失效"这种最容易被常规测试漏掉的类型，只做语法检查/看
界面截图完全不足以发现或确认修复。具体做法：①用 `curl`/`md5sum`
核对了 `public/assets/` 里手动复制的两个文件和 Vite 构建产物里对应
的带 hash 版本字节完全一致；②用 Playwright 分别对
`npm run dev`/`serve-dist.cjs`/REQ-089 的 headerless+ServiceWorker
场景各跑一遍完整的网络请求追踪，确认三种场景下 `sqlite3.wasm`/
`sqlite3-opfs-async-proxy.js` 都从 404/`ERR_BLOCKED_BY_RESPONSE`
变成 200，控制台不再有 OPFS 相关报错；③**最关键的一步**——不满足于
"没有报错"就下结论，额外写了一个直接调用应用真实持久化函数
（`import('/src/state/db.js')` 之后调用 `writeStateJson()`/
`readStateJson()`）的端到端测试：往数据库写入一个带时间戳的唯一
标记字符串，**整页刷新**（不是同一个 JS 上下文里读，是真的重新导航、
重新走一遍 `sqlite3Worker1Promiser` 初始化流程），再读出来，确认
标记字符串原样返回——这证明的不是"页面没报错"，而是"数据真的落盘、
真的能在下一次加载时读回来"，是这次持久化功能本身要求的最核心
保证。④用 `page.evaluate` 检查 `navigator.storage.getDirectory()`
的实际内容，确认 `lifespark.sqlite3` 文件真实存在且有非零大小
（16384 字节，对应一个刚建表的空 SQLite 文件的标准页大小）。修复
过程中产生的临时调试用的 `postMessage`/`console.log` 埋点（用来定位
问题一的具体响应字段）已经在确认修复后从 `coi-serviceworker.js`/
`index.html` 里移除，不留在最终代码里。测试用的所有临时 Node 进程
（headerless-server.cjs、serve-dist.cjs、vite dev/preview 的多次
重启）都逐一确认过端口已释放、没有残留后台进程。真实 GitHub Actions
CI 环境（跟本地 Windows 环境的路径/进程行为可能有细节差异）下的构建
产物需要用户在真正推送触发部署后自己确认一次效果，但核心的
"数据库能不能真正初始化"这个问题已经用本地能做到的最严格方式反复
验证过。

已知局限：`public/assets/sqlite3.wasm`/
`public/assets/sqlite3-opfs-async-proxy.js` 这两个文件是从
`node_modules/@sqlite.org/sqlite-wasm/dist/` 手动复制过来的，不是
这个项目自己的源码——如果将来升级 `@sqlite.org/sqlite-wasm` 这个
依赖的版本，需要记得重新执行一次复制（`cp node_modules/@sqlite.org/
sqlite-wasm/dist/sqlite3.wasm public/assets/sqlite3.wasm` 和对应的
`sqlite3-opfs-async-proxy.js`），否则可能因为新旧版本的 wasm/worker
文件不匹配而出现难以排查的行为。这次没有做成自动化的 `postinstall`
脚本——手动复制配合这条清晰的记录，比引入一个新的构建步骤更简单、
出问题时也更容易理解，这是刻意的取舍，不是遗漏；如果之后升级这个
依赖时忘了同步这一步，比较容易观察到的症状还是"数据库不落盘"，届时
参照这条 REQ 记录的定位方法应该能较快复现同样的排查路径。
