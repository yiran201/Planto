# MODULES.md

模块地图 + 接口契约。新增/删除/重构模块，或接口变更，必须同步本文件。

## 目录结构

REQ-003 起 UI 层迁移到 Vue 3 + Vite + Naive UI；`domain/`、`calendar/`、
`utils/dateUtils.js`/`id.js`/`random.js` 是框架无关的纯函数/数据层，
未受影响。REQ-024 把 `state/` 的持久化后端从 `localStorage` 换成浏览器
内的文件型数据库（OPFS SQLite），`state/persistence.js` 的对外接口
（`loadState`/`saveState`/`createDefaultState`）没变，只是前两个从同步
变成了异步，详见对应模块条目。

```
Planto/
  README.md                      # 项目说明，简体中文默认版（REQ-055/059 重构为产品介绍向；REQ-061 对照开源模板补齐"数据与隐私"/"许可证"/"贡献"分区；REQ-062 参考 excalidraw/siyuan-note 精简改写，篇幅收窄；REQ-084 项目改名为 Planto，补上寓意 tagline）
  README.en.md                   # REQ-062 新增：英文版，结构与 README.md 一致
  README.ja.md                   # REQ-062 新增：日文版，结构与 README.md 一致
  LICENSE                        # REQ-061 新增：Apache License 2.0 全文
  package.json / vite.config.js  # Vite 构建配置（REQ-024 新增 COOP/COEP 响应头 + sqlite-wasm 预构建排除；REQ-063 dev/preview 端口固定，strictPort:true；REQ-064 加 host:true 解决只绑定 IPv6 loopback 导致部分环境访问不到的问题；REQ-065 端口从 6000 改 8090，因为 6000 是浏览器内置不安全端口黑名单成员会报 ERR_UNSAFE_PORT；REQ-066 按用户要求改成 6060；REQ-090 补上 Cross-Origin-Resource-Policy 响应头，修复 OPFS 异步代理嵌套 worker 被 COEP 拦截导致数据库无法初始化的严重 bug）
  public/                        # REQ-089/090 新增：Vite 原样复制到 dist/ 根目录的静态资源
    coi-serviceworker.js          # REQ-089 新增：GitHub Pages 等纯静态托管的跨源隔离垫片（自己按 https://github.com/gzuidhof/coi-serviceworker 公开原理实现，不是照搬第三方文件），REQ-090 补上 Cross-Origin-Resource-Policy
    assets/sqlite3.wasm            # REQ-090 新增：从 node_modules/@sqlite.org/sqlite-wasm/dist/ 手动复制的未加 hash 原始 wasm 文件，修复 sqlite-wasm 运行时写死路径请求跟 Vite 构建 hash 文件名对不上导致数据库完全无法初始化的问题；升级这个依赖版本时需要记得重新复制
    assets/sqlite3-opfs-async-proxy.js  # REQ-090 新增：同上，OPFS 异步代理 worker 的未加 hash 原始文件
  .gitattributes                 # REQ-056 新增：锁定 *.bat=CRLF / *.sh=LF，不依赖各贡献者本地 core.autocrlf 设置，防止跨平台协作时换行符被悄悄改错
  start-planto.bat               # 一键启动脚本 Windows 版（REQ-046 新增，~~REQ-055 修复成 ANSI/GBK 编码~~ **REQ-085 改成纯 ASCII 英文内容，不再依赖任何特定系统代码页，见 docs/KNOWLEDGE.md**；REQ-084 项目改名前叫 start-lifespark.bat）：cd 到自身目录 -> 首次自动 npm install -> npm run dev -- --open；配一个指向它的桌面快捷方式（本机文件，不在仓库里，改名后需要用户自己重新指向新文件名）
  start-planto.sh                # 一键启动脚本 Linux/macOS 版（REQ-056 新增，start-planto.bat 的对应版本；REQ-084 项目改名前叫 start-lifespark.sh；REQ-085 文案同步改成英文，保持两份脚本一致）：逻辑与 .bat 版一致；UTF-8 + LF 编码，需要 `chmod +x` 后用 `./start-planto.sh` 执行
  serve-dist.cjs                 # REQ-087 新增：零依赖静态文件服务器，专门用来跑 `npm run build` 的 dist/ 产物（带上 OPFS 数据库需要的 COOP/COEP 响应头，通用静态服务器不会自动带；REQ-090 补上 Cross-Origin-Resource-Policy）；打包进 GitHub Release 的 dist 压缩包，下载解压后 `node serve-dist.cjs` 直接可用，不需要装任何依赖；`.cjs` 后缀是刻意的，见文件内注释——项目本身 package.json 是 "type":"module"，用 `.js` 会在"项目内"和"脱离项目单独解压"这两种场景里各自因为相反的原因报错；REQ-088 默认端口从 4173 改成 6060
  .github/workflows/deploy-pages.yml  # REQ-089 新增：GitHub 官方 Pages 部署工作流模板，推送到 master 分支或手动触发时自动 `npm run build -- --base=/Planto/` 并部署到 GitHub Pages；仓库 Settings → Pages 需要用户手动选一次"GitHub Actions"来源，工作流本身没法代为完成这一步
  index.html                     # Vite 入口页面（挂载点 + gapi 外部脚本 + REQ-024 加载占位，REQ-030 改成带淡出动效的独立遮罩层，REQ-045 改成"清新治愈"风格动效；REQ-072 移除 GIS 脚本标签，Google 登录改手写整页跳转不再需要它）
  css/
    variables.css                # 设计 token（深色主题色板/间距/圆角，含明暗两套）
    base.css                     # reset + 排版
    layout.css                   # 侧边栏 + 主区布局
    components.css               # 自定义日历网格样式（通用控件已改用 Naive UI）
    timeline.css                 # 小时级时间轴 + 可拖拽时间块样式
  src/
    main.js                      # 入口：REQ-024 起是 async bootstrap()，挂载前 await initStore()；REQ-030 挂载后淡出加载遮罩层，REQ-045 淡出等待时长同步加长到 550ms
    App.vue                      # 根组件：主题/语言 provider + 视图切换过渡 + 事件弹层挂载
    i18n/
      index.js                    # vue-i18n 启动配置（三语言、datetimeFormats）
      locales/
        zh.js / en.js / ja.js      # 三份完整文案（结构一致，按 key 对应）
    utils/
      dateUtils.js                # 日期/ISO周/小时/月历网格数学
      id.js                       # 唯一 id 生成
      random.js                   # 约束随机（加权随机抽取）
      markdown.js                 # 极简 Markdown → HTML 转换（REQ-048 新增，供兴趣活动内容字段用）
    composables/
      useNow.js                   # 共享的"当前时间"（日/周视图的"现在"横线用）
    constants/
      colors.js                   # 兴趣活动类别 / 时间块类型配色表（纯数据，REQ-048 类别配色换新分类）
    state/
      db.js                       # 文件型数据库读写封装（sqlite-wasm + OPFS，REQ-024；REQ-041/042 曾加 exportDbBytes/closeDb/OPFS_FILENAME，REQ-044 随镜像功能删除一起撤回，回到只有 readStateJson/writeStateJson 两个接口）
      persistence.js              # 数据读写、schema 版本、默认数据（REQ-024 起读写后端是 db.js；REQ-043 加导出/导入序列化）
      store.js                    # Vue reactive() 状态源 + 自动持久化（REQ-024 加异步初始化；REQ-041/042 曾加镜像触发/启动拉取/手动重新加载，REQ-044 删除镜像功能后撤回）
    domain/
      yearPhases.js                # 四阶段日期计算
      activityPool.js              # 兴趣活动库 CRUD + 类别增查/使用计数（REQ-048 从"服务自动排程的活动池"重做成个人兴趣参考库；REQ-053 类别改成动态数据）
      dayPlanner.js                 # 只剩 BLOCK_TYPES/IMPORTED_BLOCK_TYPE 两个类型常量（REQ-052 删掉 planWeekDays 及其私有辅助函数，见下方条目）
      recurringEvents.js            # 周期事件规则 + 未来实例物化
      plans.js                     # 计划（含关键事件、严格顺序推进）数据模型 + CRUD（REQ-017）
      rewards.js                    # 奖励名单（完成计划可领取）数据模型 + CRUD（REQ-018）
    calendar/
      googleAuthClient.js           # OAuth2 授权（REQ-072 从 GIS 弹窗 token client 改写为整页跳转的手写隐式授权流程，避开 COOP:same-origin 切断弹窗通信的问题）
      googleCalendarService.js      # gapi.client Calendar API 封装
      googleEventMapper.js          # Google 事件 → 按天分组时段（REQ-072 由 conflictMapper.js 改名，职责从"生成冲突警告"变成"生成要写进日历的只读块"）
    components/
      SidebarNav.vue                 # 阶段进度 + 导航 + 主题切换
      LanguageSwitcher.vue           # 语言切换（挂载在设置页里，中/EN/日 缩写）
      WeekBoard.vue                  # 周视图（按小时定位的时间轴网格，跨天/跨时段拖拽）
      DayTimeline.vue                # 日时间轴（拖拽/拉伸/点击建事件/点击编辑/跳过/现在横线）
      MonthBoard.vue                 # 月视图（月历 + 事件圆点）
      YearBoard.vue                  # 年视图（REQ-060，12 张迷你月历；REQ-068 活跃度热力图改成月度标语；REQ-069 补节假日标注）
      PlanPanel.vue                  # 计划管理面板（REQ-017）
      RewardPanel.vue                # 奖励名单面板（REQ-018）
      ActivityLibraryPanel.vue       # 兴趣活动面板（REQ-048 重做：搜索框+类别筛选+横屏卡片网格）
      SettingsPanel.vue              # 设置面板（REQ-043 新增"数据导出/导入"分区；REQ-048 删除"每阶段类别配额"表格）
      GoogleSyncPanel.vue            # Google 登录/同步面板（REQ-072：登录改整页跳转、新增外部用户配置引导、忙碌时段读取换成双向日历同步）
      EventModal.vue                 # 新建/编辑事件弹层（含周期事件表单）
      ActivityCard.vue               # 兴趣活动卡片（REQ-048 重做为横屏封面卡片）
      ActivityModal.vue              # 兴趣活动详情/编辑弹层（REQ-048 新增）
  docs/
    AGENTS.md / MODULES.md / KNOWLEDGE.md / CHANGELOG.md / REQUESTS.md
```

---

## src/utils/dateUtils.js

职责：日期/ISO 周/小时相关的纯函数工具，供 domain 和 ui 层复用。
依赖：无。

- `getISOWeekKey(date: Date): string` — 返回如 `2026-W29` 的 ISO 周标识。
- `getWeekStart(date: Date): Date` — 返回该日期所在周（周一）的 00:00。
- `getWeekDates(weekStart: Date): Date[]` — 返回该周 7 天的 Date 数组。
- `getDateKey(date: Date): string` — 返回 `YYYY-MM-DD`。
- `addDays(date: Date, n: number): Date`
- `addWeeks(date: Date, n: number): Date`
- `diffInWeeks(a: Date, b: Date): number`
- `hourToLabel(hour: number): string` — 如 `9.5 → "09:30"`。
- `getMonthStart(date: Date): Date` — 该月 1 号 00:00（REQ-002 新增，供
  月视图使用）。
- `addMonths(date: Date, n: number): Date`（REQ-002 新增）。
- `getMonthGridDates(date: Date): Date[]` — 返回 42 个 Date（6 周 × 7 天，
  周一起始），补齐月首/月末不满一周的部分，供月历网格渲染（REQ-002 新增）。
- `getMonthKey(date: Date): string` — 返回 `YYYY-MM`（REQ-068 新增，和
  `getDateKey` 是同一种写法，供 `YearBoard.vue` 的 `monthLabels` 当
  map key）。
- `getYearStart(date: Date): Date` — 该年 1 月 1 号 00:00（REQ-060 新增，
  供年视图使用，和 `getMonthStart` 是同一种写法）。
- `addYears(date: Date, n: number): Date`（REQ-060 新增，和 `addMonths`
  是同一种写法）。
- `weekdayIndex(date: Date): number` — 返回 0-6 的周一起始星期序号
  （`(date.getDay()+6)%7`），配合 i18n 的 `domain.weekdayShort`/
  `domain.weekdayFull` 数组取显示文案用（REQ-005 新增）。原来的
  `WEEKDAY_LABELS`（写死中文的星期数组）已删除，星期显示文案移到
  `src/i18n/locales/*.js`。
错误处理：入参非 Date 时抛 `TypeError`。无副作用。

## src/utils/id.js

- `createId(prefix?: string): string` — 基于时间戳+随机数生成唯一 id，
  无外部依赖（不用 crypto.randomUUID，兼容更广）。

## src/utils/random.js

- `weightedPick(candidates: {item:any, weight:number}[], rng?: () => number): any`
  — 加权随机抽取一个元素；weight ≤ 0 的元素不会被选中；`candidates` 为空
  时返回 `null`。
- `weightedPickMany(candidates, count, rng?): any[]` — 不重复地抽取多个
  （每次抽取后剔除已选项重新计算权重）。
- `mulberry32(seed:number): () => number` — 可选的可复现伪随机数生成器，
  测试时可传入替代 `Math.random`。

## src/utils/markdown.js（REQ-048，新增；REQ-080 加纯文本摘要提取）

职责：把兴趣活动的 `content` 字段（Markdown 源文本）转成可以用
`v-html` 渲染的 HTML 字符串，供 `ActivityModal.vue` 的详情视图用。
依赖：无。

- `renderMarkdown(source: string): string` — 只覆盖标题
  （`#`/`##`/`###`）、粗体（`**x**`）、斜体（`*x*`）、链接
  （`[text](https://...)`，只认 http(s) 协议，避免
  `javascript:` 链接被渲染成可点击的 `<a href>`）、无序列表
  （`-`/`*` 开头）、段落这几种最常用的语法，不追求完整实现 CommonMark
  规范——不引入第三方 Markdown 解析库依赖，这里的内容本来就是用户自己
  的个人笔记/攻略，不需要表格/代码块/引用这类更复杂的语法。渲染前先对
  原始文本做 HTML 转义（`&`/`<`/`>`/`"`/`'`），再在转义后的文本上应用
  Markdown 规则生成标签——避免用户笔记里恰好出现的尖括号被当成真的
  HTML 标签解析执行；这份数据只在用户自己本机单机使用，不是网络协作
  场景，但既然要用 `v-html` 插入 DOM，转义是该做的基本卫生，成本很低。
- 空字符串/`falsy` 输入返回空字符串，不抛异常。
- `extractPlainTextSummary(source: string, maxLength = 60): string`
  （REQ-080，新增）— 供 `ActivityCard.vue` 在卡片上露出内容摘要用：
  去掉标题/列表标记（`#`/`-`/`*` 行首）和粗体/斜体/链接语法（只留链接
  文字，丢弃 URL），空白折叠成单个空格拼成一行，超过 `maxLength` 截断
  并加"…"。不做 HTML 转义（结果只用于纯文本插值显示，不走 `v-html`）。
  和 `renderMarkdown()` 是同一份极简语法子集的两种不同输出目标（一个
  转 HTML 给 `v-html`，一个转纯文本给卡片摘要），没有共用内部实现——
  两者的正则都很简单，共用会需要抽象出一层没必要的中间表示，直接各写
  一份更直观。

## src/utils/i18nLabels.js（REQ-058，新增；REQ-082 删除 `categoryLabel`）

职责：奖励（`state.rewards`）自 REQ-018 起是"用户可以随时新建自由
文本"的动态列表，`title` 字段本身就是要展示的文本，用户自建的条目
没有另外两种语言的翻译，没法整体走 i18n。但内置的种子/默认数据（17
条默认奖励）是应用内置的固定内容，理应跟着界面语言切换——
`state/persistence.js` 给这些内置种子条目额外打了一个稳定的 `seedKey`
（不随用户改名/新增而变化，用户自己新建的条目没有这个字段），这个
函数是"有 `seedKey` 就查 i18n 表，没有就用原始文本"这条判断逻辑的唯一
实现，避免每处展示各写一遍判断、后续调整时漏改。依赖：无——不直接
import vue-i18n，`t` 由调用方（组件里的 `useI18n().t`）传入，保持这个
文件和 `utils/` 下其它模块一样不依赖任何具体框架 API。

- ~~`categoryLabel(t, category): string`（REQ-058，新增）——`category`
  为空返回空字符串；有 `seedKey` 查 `t('domain.category.' + seedKey)`，
  否则返回 `category.name`。调用方：`ActivityCard.vue`/
  `ActivityModal.vue`/`ActivityLibraryPanel.vue`。~~ **REQ-082 已整个
  删除**：用户要求"图文里面的分类也去掉"，兴趣活动的动态分类功能
  整个删除后，`state.activityCategories`/`activity.category` 都不存在
  了，这个函数因此没有任何调用方，见 `domain/activityPool.js` 条目。
- `rewardLabel(t, reward): string` — 同上逻辑，查
  `t('domain.reward.' + seedKey)`/`reward.title`。调用方：
  `RewardPanel.vue`。

## src/utils/blockOverlap.js（REQ-014，新增；REQ-020 改写为通用 N 路重叠）

职责：计算一天内事件块的水平布局（左右分栏），纯函数、不依赖 Vue。

- `computeBlockLayout(blocks): Map<blockId, {column, columns}>` —
  REQ-014 时只处理"两个块互相唯一重叠"这一种情况，一个块同时和 2 个及
  以上其他块重叠就直接放弃、维持整行宽度；REQ-020 改成标准的区间调度
  （interval partitioning）算法：先按开始时间把块分成若干"重叠簇"（簇
  内块通过直接或传递重叠连在一起，用一次扫描判断——当前簇里所有已纳入
  块的最晚结束时间 <= 下一个块的开始时间时才切出新簇），簇内部再按
  开始时间贪心分配"列"（每个块找一个当前空出来的列放，找不到就开新
  列，这是经典的"最少会议室数"算法）；簇最终用到几列，簇内每个块的
  `columns` 就是几，`column` 是它占的那一列。默认（没有任何重叠）时
  `columns` 恒为 1，和旧版行为兼容。典型场景验证：一个长事件（比如
  9-17 点）内部嵌套两个互不重叠的短事件（10-11、13-14）——长事件独占
  一列（整个跨度），两个短事件共享另一列（各自在自己的时间段内，B
  结束后 C 复用同一列），不再是三个块全部整行宽度叠在一起（用户反馈
  "跨度内有两个事件时显示有问题"，即这个 REQ-014 已知局限的场景）。
  排序/分列时 `block.recurringId` 存在的排在前面，但只在**开始时间
  相同**时才生效（必须严格按开始时间处理才能保证分簇/分列算法本身
  正确，不能为了这条优先级规则打乱处理顺序）——周期事件"优先靠左"从
  REQ-014 时的"两两分栏绝对保证"收窄为"开始时间相同时的平局优先"，是
  换成通用算法后更诚实但保证力度稍弱的取舍。
- `columnBoxStyle(column, columns): {left?, right?}`（REQ-020，新增）
  — 把 `computeBlockLayout()` 算出的 `{column, columns}` 换算成 CSS
  `left`/`right`：N 列等分宽度，列与列之间留 2px 缝隙，最外侧两条边
  保持和不分栏时一致的 8px；`columns<=1` 时返回空对象（不覆盖，沿用
  CSS 默认整行宽度）。取代了 REQ-014 时只处理 `columns===2` 这一种
  情况、直接写在 `DayTimeline.vue`/`WeekBoard.vue` 组件里的重复代码。
- 被 `components/DayTimeline.vue`/`WeekBoard.vue` 的 `blockStyle()`
  调用：`Object.assign(style, columnBoxStyle(column, columns))`。

## src/composables/useNow.js（REQ-006）

职责：提供一个每 30 秒刷新一次的"当前时间"（`ref<Date>`），供
`DayTimeline.vue`/`WeekBoard.vue` 画"现在"横线用。`now` 是模块级单例，
定时器按调用过 `useNow()` 的组件的挂载数量计数，最后一个卸载时才
`clearInterval`，避免同时挂载多个定时器或遗留定时器。

- `useNow(): Ref<Date>` — 组件 `setup()` 里调用，内部用
  `onMounted`/`onUnmounted` 管理生命周期。

## src/constants/colors.js（REQ-003；REQ-048 类别配色换新分类；REQ-050 加 CATEGORY_EMOJI；REQ-053 从固定表换成按 id 哈希取色；REQ-082 分类功能删除，`categoryColor`/`categoryEmoji` 一并删除）

纯数据，从旧版 `ui/activityCard.js` 拆出。`BLOCK_TYPE_COLORS` 被
`DayTimeline.vue`/`WeekBoard.vue`/`MonthBoard.vue` 共用（事件块左边框/
圆点配色）。

- ~~`CATEGORY_COLORS`/`CATEGORY_EMOJI`（按 `photography`/`camping`/...
  这 8 个固定标识符查表）~~ **REQ-053 已整个替换**：类别改成用户可以
  随时新建的动态数据（`state.activityCategories`，见
  `domain/activityPool.js` 条目）之后，没办法再用"标识符 → 颜色"这种
  写死的映射表了——用户随时可能新建一个之前没见过的类别 id。改成
  `categoryColor(categoryId)`/`categoryEmoji(categoryId)` 两个函数：对
  类别 id 字符串算一个稳定的字符串哈希（`hashString()`，内部函数，
  `hash = hash*31 + charCode` 逐字符滚动），从一个固定的调色板/emoji
  数组里取余数选一个。同一个类别 id 每次算出来的颜色/emoji 都一样
  （稳定），不同类别大概率落到不同颜色上，不需要为每个新建类别单独
  存一份颜色配置。调色板/emoji 表本身比原来两个固定映射表的选项更多
  （10 色/16 emoji），给动态增长的类别数量留了余量。~~**REQ-082 这两个
  函数连同调色板/emoji 表整个删除**~~：用户要求"图文里面的分类也去掉"，
  兴趣活动的分类功能整个删除后，`categoryColor`/`categoryEmoji` 没有
  任何调用方了，`ActivityCard.vue` 没有封面图时的占位改成固定的强调色
  背景 + 固定的 📝 emoji，见该组件条目。
- `BLOCK_TYPE_COLORS` — 按 `domain/dayPlanner.BLOCK_TYPES`（含 `busy`）
  取色，不受 REQ-048/050/053 影响，这套仍然是固定的标识符映射表（时间
  块类型是稳定的 5+1 个，不像兴趣活动类别那样会被用户动态扩展）。

## src/constants/timelineRange.js（REQ-009，新增；REQ-010 加显示起点；REQ-011 加起点留白；REQ-012 收窄留白的适用范围；REQ-045 加跨界拆分）

`TIMELINE_RANGE = {start:0, end:24}`——日/周时间轴 UI 层的显示与可编辑
范围（全天）。这个常量和 `domain/dayPlanner.js` 曾经的 `DAY_RANGE`
（`{start:7, end:23}`，自动排程默认把活动放在哪个清醒时段的业务规则）
本来就是两个独立常量、语义不同（前者是"时间轴上能看到/能手动放事件的
范围"，后者是"自动排程默认放在什么时间段"）；`DAY_RANGE` 随自动排程
子系统一起在 REQ-052 删除，`TIMELINE_RANGE` 不受影响。`DayTimeline.vue`/
`WeekBoard.vue` 的小时刻度、格线、事件块定位、点击建事件、拖拽移动/
拉伸的范围钳制都只用这一个常量。

（REQ-010）新增 `DISPLAY_START_HOUR = 6` 和两个换算函数：

- `toDisplayOffset(hour)` — 真实小时数（0-24，绑定某一天）→ 时间轴上
  "从上往下数第几份"（0-24，用来算百分比定位）。`DayTimeline.vue`/
  `WeekBoard.vue` 的 `hours`（刻度标签顺序）、`blockStyle()`（块的
  `top`）、`nowTop`（"现在"横线位置）都用这个函数，让网格从 6 点开始画
  （6,7...23,0...5 这个顺序），不是从 0 点开始。
- `fromDisplayRatio(ratio, totalHours)` — 上面的反函数，时间轴上"从上
  往下的比例"（0-1，来自鼠标 Y 坐标 / 容器高度）换算回真实小时数，供
  点击网格建事件、拖拽移动/放置事件这几处交互用。
- ~~已知局限：真实起止时间跨过 6 点这条分界线的块……显示得比实际时长
  短~~ **REQ-045 已修复，REQ-047 调整了拆分方向**：新增
  `needsDisplaySplit(block)`（判断真实起止时间是否骑在 6 点分界线
  两侧）和 `splitDisplaySegments(block)`（拆成
  `[block.start, DISPLAY_START_HOUR)` 和
  `[DISPLAY_START_HOUR, block.end)` 两个真实小时区间）——这两个函数
  本身只负责"要不要拆、拆成哪两段真实小时区间"，不负责"这两段各自画在
  哪一天"，那部分逻辑在组件层（`DayTimeline.vue`/`WeekBoard.vue`）。
  REQ-045 最初实现时两段都画在块自己所在的那一天；用户反馈"凌晨其实
  应该显示在前一天那里"后，REQ-047 把前半段（`[block.start, 6)`）改成
  画在**前一天**的视图里，后半段留在块自己真实所在的这一天，两段共用
  同一个 block 对象，不引入新的关联字段，详见这两个组件各自的条目。
  `moveBlock`/`resizeBlock` 这类改块本身起止时间的逻辑完全不受这个
  旋转影响，一直用的是真实小时数（`TIMELINE_RANGE`），钳制边界还是
  0-24，只有"画在哪"这个展示层面用了旋转后的偏移量；这类跨界的块本身
  现在整体禁用拖拽/拉伸（见 `DayTimeline.vue`/`WeekBoard.vue`），改时间
  只能走编辑弹层。

（REQ-011）新增 `DISPLAY_START_NUDGE_HOURS = 5/60` 和
`displayStartHour(block)`：块的渲染起点（位置）比 `block.start` 往后
错开最多 5 分钟（时长短于 10 分钟的事件按一半时长错开，避免错位值超过
`block.end`），纯粹是"看着不贴着整点格线，松弛一点"的展示效果。
`block.start` 本身不变，拖拽/排序/冲突判断等所有业务逻辑一律用真实的
`block.start`，不读这个"错位"值——这一点和 `toDisplayOffset` 的"旋转
显示起点"是两回事，一个管"从哪个小时开始画"，一个管"具体这个块要不要
贴着格线画"，都只影响渲染，不影响数据。

（REQ-012）**收窄了这个函数的适用范围**：REQ-011 实现时一度让
`DayTimeline.vue` 的时间文字标签也读 `displayStartHour()`（比如显示
"16:05"），用户实际用起来反馈"详细页面显示出来的时间有点奇怪"——点进
`EventModal.vue` 看到的是真实的 16:00，块上标注却是 16:05，两边对
不上，容易让人以为存错了时间。改成**只在 `blockStyle()` 算位置时用**，
时间文字标签（`displayTimeLabel()`）一律显示 `block.start`/`end` 的
真实值。以后如果要在其他地方用这个"留白"效果，只能用来算位置类的样式
（`top`/`left` 这种），不要再用来生成任何会被用户读作"这就是实际时间"
的文字。

## src/constants/fontStacks.js（REQ-011，新增）

`FONT_STACKS`——外观设置里字体选项的 CSS `font-family` 值，5 个 key：
`default`（Roboto，REQ-007 时引入的默认字体）/`system`/`rounded`/
`serif`/`mono`。全部是系统自带字体拼栈，没有再引入新的 Web Font 依赖，
没有网络也能正常显示。`DEFAULT_FONT_FAMILY = 'default'`。被
`App.vue`（应用实际生效）和 `components/SettingsPanel.vue`（选项列表）
共用，一个来源，不会出现两处字体选项对不上的问题。

## src/i18n/index.js + locales/{zh,en,ja}.js（REQ-005）

职责：三语言（中文/English/日本語）文案。`domain/*.js` 里原来的
`PHASE_LABELS`/`CATEGORY_LABELS`/`BLOCK_TYPE_LABELS` 和
`utils/dateUtils.js` 的 `WEEKDAY_LABELS` 这些写死中文的映射表已删除，
domain/utils 层只保留稳定的英文标识符（如 `'explore'`/`'novel'`/
`'work'`），显示文案统一收在这里的 `domain.phase.*`/`domain.category.*`/
`domain.blockType.*`/`domain.weekdayShort`/`domain.weekdayFull`/
`domain.rating.*`/`domain.energy.*`/`domain.recurrenceFreq.*`/
`domain.recurrenceEnd.*` 下，其余 key 按视图分组
（`nav`/`sidebar`/`week`/`day`/`month`/`library`/`settingsView`/
`sync`/`event`/`common`/`theme`/`language`）。

- `i18n = createI18n({legacy:false, locale:'zh', fallbackLocale:'zh',
  messages:{zh,en,ja}, datetimeFormats:{...}})` — Composition API 模式，
  组件里用 `useI18n()` 拿 `t()`（单条文案，支持 `{name}` 占位符插值）/
  `tm()`（取原始结构，用于 `domain.weekdayShort`/`weekdayFull` 这类
  数组）/`d()`（按 `datetimeFormats` 格式化日期，见
  `GoogleSyncPanel.vue` 的"上次同步"显示）。
- `SUPPORTED_LOCALES = [{value:'zh',label:'中文'}, {value:'en',...},
  {value:'ja',...}]` — 供 `SidebarNav.vue` 的语言选择器用。
- 语言选择持久化在 `state.settings.locale`（默认 `'zh'`，
  `persistence.js` 里新增字段）；`App.vue` 用 `watchEffect` 把
  `i18n.global.locale.value` 同步为 `state.settings.locale`，同时把
  Naive UI 自己的 `<n-config-provider :locale :date-locale>`
  （`zhCN`/`enUS`/`jaJP` 及对应 `date*` 对象，来自 `naive-ui` 包本身的
  导出）也跟着切——应用文案和 Naive UI 组件内部自带的文案（比如日期
  选择器的"清除"按钮）是两套独立机制，都要切才是真正的整体多语言。
- `domain/scheduler.js` 的 `generateWeeklyPlan` 返回的 `warnings` 从
  拼好的中文字符串改成 `{key, params}` 结构化对象（domain 层不应该
  直接产出某一种语言的文案），`WeekBoard.vue` 里按 `week.warningCooldown`/
  `week.warningPool` 这两个 key 取模板翻译后再展示。

## src/state/db.js（REQ-024，新增；REQ-090 修复运行时初始化会静默失败的严重 bug）

职责：文件型数据库的读写封装——用官方 `@sqlite.org/sqlite-wasm` 包在
Worker 线程里跑一份真正的 SQLite，靠 OPFS（Origin Private File System）
把数据持久化成浏览器私有文件系统里一个真实存在的 `lifespark.sqlite3`
文件。取代了 REQ-001 起一直用的 `localStorage`——用户明确要求"文件型
数据库，不加后端，不需要兼容 MySQL"，所以这里没有后端服务器，也没有走
关系型多表设计（原因见下）。
依赖：`@sqlite.org/sqlite-wasm`（`sqlite3Worker1Promiser`）。

- 整份应用状态仍然是 `persistence.js` 里那个大的 JSON 对象，这个文件
  只建一张单行表 `app_state(id INTEGER PRIMARY KEY CHECK (id=1), data
  TEXT NOT NULL)`，把整个状态序列化成 JSON 字符串存进 `id=1` 这一行的
  `data` 列——不做关系型拆分。这是刻意的简化：`domain/*.js` 里几十个
  函数全部是照着"读写同一个内存里的响应式 state 对象"这个模型写的，拆成
  真正的多表关系型结构需要重写这些函数，超出了"把持久化后端换掉"这个
  任务的范围，见文件顶部注释。
- `readStateJson(): Promise<string|null>` — 读出 `data` 列；数据库刚
  创建、还没写过任何数据时返回 `null`（`persistence.js` 的 `loadState()`
  据此判断"全新安装"）。
- `writeStateJson(json: string): Promise<void>` — 用 SQLite 3.24+ 的
  `INSERT ... ON CONFLICT(id) DO UPDATE` upsert 语法写入，永远只有这
  一行。
- 内部用 `sqlite3Worker1Promiser` 封装"启动内置 Worker + 通过
  `postMessage` 转发 SQL 请求"这层——OPFS 的同步文件访问 API 只能在
  Worker 线程里用，不能在主线程直接跑，这是官方包自带的、不需要自己
  写 Worker 脚本的封装方式。`open`/`exec` 两个命令背后都要求页面处于
  "跨源隔离"状态（COOP/COEP 响应头），见 `vite.config.js` 顶部注释和
  `README.md`"数据持久化"一节。
- 已知局限（文件顶部注释里写清楚了）：OPFS 的同步访问句柄是独占的，
  没有做跨标签页协调，同一份数据库文件不支持被两个标签页同时打开
  写入。
- （REQ-041/042 曾新增 `exportDbBytes()`/`closeDb()`/导出的
  `OPFS_FILENAME` 三个接口，服务于"镜像到本地文件夹"功能；REQ-044 应
  用户要求把那个功能整个删除后，这三个接口一起撤回，`DB_FILENAME` 改回
  内部常量——这个文件回到 REQ-024 时只有 `readStateJson`/`writeStateJson`
  两个对外接口的形态，核心 OPFS SQLite 存储路径完全不受影响。）
- **REQ-090 严重 bug 修复**：`sqlite3Worker1Promiser` 内部启动的
  Worker 脚本用写死的相对路径（`new URL("sqlite3.wasm",
  import.meta.url)`）请求自己的 wasm/OPFS 代理文件，跟 Vite 构建产物
  给这些文件加的 hash 文件名（如 `sqlite3-BVKGSWc-.wasm`）对不上，
  请求 404 导致这个 Worker 在能调用 `onready`/`onerror` 之前就直接
  崩溃——两个回调都不会触发，`getPromiser()` 返回的 Promise 因此永远
  不 resolve/reject，一路网上传导到 `main.js` 的 `bootstrap()` 卡死在
  `await initStore()`。这个失败模式在真实浏览器里表现为"UI 界面正常
  渲染"（`main.js` 顶部"数据库失败会兜底成默认状态"的注释假设的是
  `onerror` 会被调用，没覆盖到"Worker 直接崩溃、两个回调都不触发"这种
  更极端的情况），唯一能看出问题的地方是控制台报错和
  `navigator.storage.getDirectory()` 检查——数据库其实从未真正
  初始化过、也从未真正写入过任何数据。不限于任何特定部署方式：
  dev/preview/静态托管全部复现，见 `docs/REQUESTS.md` REQ-090
  条目的完整排查过程。修复靠新增的 `public/assets/sqlite3.wasm`/
  `public/assets/sqlite3-opfs-async-proxy.js`（见这两个文件各自的
  条目）解决路径不匹配，另外还需要 `Cross-Origin-Resource-Policy`
  响应头（COEP:require-corp 要求每个子资源都带，不只是顶层页面）——
  这一部分在 `vite.config.js`/`serve-dist.cjs` 条目里说明。

## src/state/persistence.js（REQ-024：读写后端从 localStorage 换成 state/db.js；REQ-025 加旧数据自动恢复；REQ-026 拆出可复用的读取函数，REQ-029 又改回内部函数；REQ-043 加导出/导入；REQ-058 类别/奖励种子数据加 seedKey；REQ-067 删除内置奖励种子数据；REQ-068 新增 monthLabels）

职责：状态读写、schema 版本管理、默认数据生成。
依赖：`utils/id.js`，`state/db.js`。

- （REQ-067）应用户明确要求，`SEED_REWARDS`（17 项内置示例奖励：相机/
  电脑/旅行等）、`REWARD_TITLE_TO_SEED_KEY`、`backfillRewardSeedKeys()`
  三者整个删除；`createDefaultState()` 的 `rewards` 字段改成恒为空
  数组，`meta` 不再生成 `rewardValuesRefreshedAt`（配套的
  `domain/rewards.refreshRewardValuesFromSeedPrices()` 一起删除，见该
  模块条目）。`fillMissingDefaults()` 的 `rewards` 合并逻辑相应简化为
  `parsed.rewards || defaults.rewards`，不再需要 `backfillRewardSeedKeys()`
  这一步。用户已有的、带着旧版 `seedKey` 的奖励记录不受影响——`seedKey`
  字段本身没有从数据结构里删除，`utils/i18nLabels.rewardLabel()` 的
  展示逻辑没变，i18n 里 17 条奖励的翻译表也保留，继续服务这些老数据。
- （REQ-068）顶层新增 `monthLabels: {}`（`{ [monthKey]: text }`，
  `monthKey` 是 `utils/dateUtils.getMonthKey()` 算出的 `YYYY-MM`），
  供 `YearBoard.vue` 的月度标语功能用（取代原来按事件数量染色的热力图，
  见该组件条目）。是一个简单的扁平 map，`fillMissingDefaults()` 顶层
  已有的 `{...defaults, ...parsed}` 浅展开就能正确合并，不需要像
  `settings.appearance` 那样再单独深一层合并。

- `LEGACY_LOCALSTORAGE_KEY = 'lifespark:v1'`（内部常量，不导出）— REQ-024
  之前 `localStorage` 一直用的 key，现在只在这个文件内部用来定位旧
  数据，不再是"当前生效"的存储 key。
- `readLegacyLocalStorageState(): AppState | null`（内部函数）— 读一次
  `localStorage[LEGACY_LOCALSTORAGE_KEY]`，解析成功就经过
  `fillMissingDefaults()` 返回，找不到/解析失败都返回 `null`，不抛
  异常。纯粹是"这份旧数据现在长什么样"，不做任何"要不要用"的判断，由
  下面的 `autoRecoverFromLegacyLocalStorage()` 决定什么时候调用、找到
  之后要不要用。REQ-025 时新增就是内部函数，REQ-026 一度导出给
  `state/store.js` 的 `restoreFromLegacyBackup()`（手动恢复入口）用，
  REQ-029 应用户要求把那个手动入口整个删除后，这个函数又改回不导出
  （唯一的调用方又变回了同文件内的自动恢复分支）。
- `loadState(): Promise<AppState>` — REQ-024 起是**异步**函数（原来是
  同步读 `localStorage`，现在要异步读 OPFS 文件，调用方 `store.js` 的
  `initStore()` 需要 `await` 它）。读 `state/db.js` 的
  `readStateJson()`：读到数据就解析后经过 `fillMissingDefaults()`
  （内部函数）用当前默认值补齐缺失的顶层/`settings` 子字段，兼容旧
  版本保存、缺少某些字段的数据；读到 `null`（新数据库真的从来没写过）
  时调用内部函数 `autoRecoverFromLegacyLocalStorage()`（REQ-025）——
  它包一层 `readLegacyLocalStorageState()`，找到旧数据就立刻用
  `writeStateJson()` 写回新数据库（下次启动就不用再走这个分支），
  都没有才落到 `createDefaultState()`。不会抛出异常（内部 try/catch）。
  **已知局限**：这个自动恢复只有"数据库确实从来没写过"这一次机会窗口
  内生效——如果用户在这次自动恢复实现之前就已经打开过一次新版本（哪怕
  什么都没做，也可能已经往数据库写过一行默认状态），窗口关闭后不会再
  自动触发。REQ-026 曾经加过一个不受这个窗口限制的手动入口
  （`store.restoreFromLegacyBackup()`），REQ-029 应用户要求删除了——
  错过窗口的情况现在没有代码层面的补救手段了，见 `state/store.js`
  条目。
- `saveState(state: AppState): Promise<void>` — REQ-024 起同样是异步
  函数，序列化后调用 `state/db.js` 的 `writeStateJson()`；写入失败时
  捕获异常并在控制台警告，不中断应用，和原来 localStorage 版本的容错
  行为一致。
- `serializeStateForExport(state): string`（REQ-043，新增）—
  `JSON.stringify(state, null, 2)`，供 `SettingsPanel.vue`"导出全部数据"
  按钮下载成 `.json` 文件。不需要任何浏览器专属 API，Firefox/Safari 也能
  用——`state/fileMirror.js`（REQ-041/042，Chromium 专属、需要持续目录
  授权的另一套备份手段）已经在 REQ-044 应用户要求整个删除，这个函数现在
  是唯一的手动备份手段，见 `docs/CHANGELOG.md` REQ-044 条目。
- `parseImportedState(json): AppState | null`（REQ-043，新增）— 供
  `SettingsPanel.vue`"导入数据"按钮用，`JSON.parse` 失败或结果不是对象都
  返回 `null`（不抛异常）；解析成功则复用内部 `fillMissingDefaults()`
  补齐缺失字段，和 `loadState()` 读数据库时走的是同一套"缺字段用默认值
  补齐"逻辑，导入一份旧版本导出的、缺新字段的数据不会出现 `undefined`。
  调用方拿到非 `null` 结果后直接 `store.setState(parsed)`——`setState`
  的 `Object.assign(state, partial)` 对一个带着全部顶层字段的对象做的
  就是整体覆盖，不需要为"导入"这个场景单独在 `store.js` 加新接口。
- `createDefaultState(): AppState` — 生成默认 meta/settings/空活动库等。
  `settings` 新增 `theme: 'dark' | 'light'`（默认 `'dark'`，REQ-002）；
  顶层新增 `recurringEvents: []`（REQ-002，见
  `domain/recurringEvents.js`）。
  （REQ-011）`settings` 新增 `region`（默认 `'CN'`，见
  `domain/holidays.js`）和 `appearance`（嵌套对象：
  `fontFamily`/`accentColor`/`backgroundImage`/`backgroundOpacity`，见
  `constants/fontStacks.js` 和 `components/SettingsPanel.vue`）。
  `appearance` 是新增的嵌套对象，`fillMissingDefaults()` 对它单独做了
  一层合并（`{...defaults.settings.appearance, ...parsed.settings?.appearance}`），
  不能靠 `settings` 那层的浅展开——旧数据如果只存了 `appearance` 的部分
  字段，浅展开会让整个 `appearance` 对象覆盖掉 defaults 里的新字段。
  （REQ-016）`settings.phaseWeeks` 整个删除了，阶段周数改成从顶层新增
  的 `goals`（默认空数组）现算，见 `domain/goals.js`；
  `fillMissingDefaults()` 加了 `goals: parsed.goals || defaults.goals`。
  旧数据里如果还带着 `settings.phaseWeeks` 字段，会原样留在合并结果里
  当死数据，不影响任何逻辑（没有地方再读它了），不需要专门清理。
  （REQ-017）顶层新增 `plans`（默认空数组，见 `domain/plans.js`），
  `fillMissingDefaults()` 同款处理。`goals` 字段和读取它的调用链本身
  没有删除（见 `domain/goals.js` 条目），只是 UI 入口被"计划"取代了，
  往后 `goals` 会一直是空数组——这不是需要清理的死数据，是这个字段
  预期中的稳定状态（阶段周数因此会一直落回兜底的 13 周）。
  （REQ-018，REQ-019 改为按日元参考价定数值；REQ-022 界面上不再称呼
  它是"日元"；REQ-023 刷新为 2026-07-22 的最新参考价，见
  `domain/rewards.js` 顶部注释）顶层新增 `rewards`（见
  `domain/rewards.js`），和 `activityPool` 的 `SEED_ACTIVITIES` 同一个
  模式：`createDefaultState()` 给全新用户种入用户提供的 17 项奖励清单
  （`SEED_REWARDS`，数值来源见 `docs/CHANGELOG.md` REQ-023 条目——相机/
  耳机/手表/电脑几项是查到的日本官方零售价或当前实际市场流通价，其余
  按人民币参考预算换算日元取整；这些数字不代表"钱"，只是不再对用户
  显示"日元"这个单位），`fillMissingDefaults()` 只在 `parsed.rewards`
  完全不存在（老用户升级）时才用这份种子数据补齐，用户后续清空/编辑过
  的 `rewards` 不会被再次种入。（REQ-058）`SEED_REWARDS` 每项加了
  `seedKey`（驼峰命名的稳定标识符，纯供 i18n key 和内部匹配用，不是给
  用户看的文本），`createDefaultState()` 种数据时带上；`fillMissingDefaults()`
  额外过一遍新增的 `backfillRewardSeedKeys()`，给 REQ-058 之前落盘、
  还没有这个字段的老数据补标记（按 `title` 精确匹配默认标题才补，用户
  自建的奖励不受影响）。展示层查表用
  `utils/i18nLabels.rewardLabel(t, reward)`，见该文件条目；
  `domain/rewards.refreshRewardValuesFromSeedPrices` 的匹配键也从
  `title` 改成了 `seedKey`，见该函数条目。
  （REQ-019，REQ-022 一度改成默认 2000 起始点数，REQ-023 又改回 0，
  REQ-046 把这个字段整个删除，见下面）`settings` 新增
  `pointsPerHourWeekday`/`pointsPerHourWeekend`（完成一小时平日/周末
  事件能拿多少点数，默认都是 1000，`SettingsPanel.vue` 可分别调整），
  取代了 REQ-019 时单一的 `pointsPerHour` 字段，见 `domain/rewards.js`。
  （~~REQ-028 曾经在这里新增 `meta.pointsResetAt: null`~~，**REQ-046
  已删除**：配对的 `domain/rewards.resetPointsFromMonday` 整个删掉了，
  新安装不再生成这个字段；老数据里如果还带着，走
  `fillMissingDefaults()` 的 `...parsed.meta` 浅展开原样留着当死数据。）
  （REQ-031）`meta` 新增 `rewardValuesRefreshedAt: null`，配对
  `domain/rewards.refreshRewardValuesFromSeedPrices`（把奖励名单价格
  对齐到最新日元参考价的一次性操作）的幂等标记，走
  `meta: {...defaults.meta, ...parsed.meta, ...}` 已有的浅展开合并，
  不需要额外代码。
  （REQ-033）`meta` 再新增 `claimedRewardsClearedAt: null`，配对
  `domain/rewards.clearClaimedRewards`（清空已兑换奖励记录的一次性
  操作），同一套幂等标记机制。
  （REQ-046）顶层的 `rewardPoints`（点数余额存储字段，REQ-019 新增）
  整个删除——`domain/rewards.computeRewardBalance(state)` 现算余额，
  不再需要一个持久化存储、需要手动增减的字段。老数据里如果还带着这个
  字段，走 `fillMissingDefaults()` 顶层的 `...parsed` 浅展开原样留着
  当死数据，不影响任何逻辑，和 REQ-016 处理 `settings.phaseWeeks`、
  REQ-022 处理 `settings.pointsPerHour` 是同一个模式。
  （REQ-048）`SEED_ACTIVITIES`（12 项内置种子活动）整个删除，新安装
  `activityPool` 是空数组——旧种子是给自动排程用的通用建议条目，新版
  兴趣活动库需要真实的链接/图片/内容，编不出真实有意义的种子数据，
  硬造几条"看起来像推荐"的占位内容风险大于价值，交给用户自己用
  「添加活动」建第一条。新增 `LEGACY_ACTIVITY_CATEGORIES`（旧分类
  novel/interest/variety/routine 的集合）和 `migrateLegacyActivity()`：
  `fillMissingDefaults()` 里对 `activityPool` 里每一条都过一遍，
  `category` 还是旧值的条目只保留 id/title/createdAt/imageUrl，其余旧
  字段（blockType/tags/durationMinutes/energyLevel/rating/
  weightMultiplier/lastScheduledAt/timesScheduled）丢弃，`category`
  归到新分类的 `other`，~~`link`/`content` 留空~~ **REQ-081 起只有
  `content` 留空**（新字段集合里已经没有 `link` 了，老数据里如果带着
  `activity.link` 直接丢弃不迁移，跟"图文链接用不上、删掉这个功能"的
  决定保持一致）；已经是新分类（或者压根
  没设过 `category`）的条目直接原样返回，不做任何改动。这个函数本身
  幂等（判断标准是"`category` 是不是那四个旧值之一"，不是某个额外的
  一次性标记），`fillMissingDefaults()` 每次加载状态都会跑一遍，不需要
  像 `pointsResetAt` 那类一次性操作那样单独维护一个"有没有执行过"的
  标记字段。
  （REQ-052）`settings.categoryQuotas`（含 `DEFAULT_CATEGORY_QUOTAS` 常量）、
  `settings.cooldownWeeks`、顶层 `weeklyPlans` 三个字段整个删除——三者
  唯一的写入/读取方都是已随本次一起删除的 `domain/scheduler.js`
  （`generateWeeklyPlan`）及其调用链，REQ-048 之后就已经是"留着当死
  数据"（不是像 REQ-016 处理 `phaseWeeks` 那样谨慎保留字段兼容旧数据，
  而是应用户明确要求主动清理），`createDefaultState()` 新安装不再生成
  这三个字段，`fillMissingDefaults()` 也不再为它们做任何合并处理——老
  数据库里如果还带着这几个字段，会原样留在数据里但没有任何代码再读它们
  （纯死数据，无需迁移清理）。
  ~~（REQ-053）顶层新增 `activityCategories: [{id, name, useCount,
  seedKey?}]`：新安装种 8 条内置默认类别（`SEED_ACTIVITY_CATEGORIES`，
  和 `SEED_REWARDS` 同一个"只有全新/老到完全没有这个字段的数据才种入
  初始清单"模式），配套 `migrateActivityCategoryRef(activity,
  categories)`（把 `activity.category` 从旧英文标识符/`'other'` 转成
  这份类别列表里对应条目的 id，按 `cat_` 前缀判断幂等）和
  `backfillCategorySeedKeys(categories)`（REQ-058，给"落盘时还没有
  `seedKey`"的老类别数据补标记，必须在 `migrateActivityCategoryRef()`
  之前跑，不然按 `seedKey` 匹配会对老数据全部落空）。~~ **REQ-082
  应用户要求"图文里面的分类也去掉"，`activityCategories` 这个顶层
  字段、`SEED_ACTIVITY_CATEGORIES`、`migrateActivityCategoryRef()`/
  `backfillCategorySeedKeys()` 一起整个删除**：`createDefaultState()`
  新安装不再生成这个字段，`fillMissingDefaults()` 也不再对
  `activityPool` 做这一层类别引用迁移（紧跟其后的 `migrateLegacyActivity()`
  这一层——处理 REQ-048 之前更老一套分类体系的迁移——保留，跟这里删掉
  的是两回事，见 `domain/activityPool.js` 条目）；老数据/老备份文件里
  残留的 `activityCategories`/`activity.category` 字段没有任何代码
  再读，属于无害死数据，不需要专门清理。

## src/state/store.js（REQ-003 重写，接口不变；REQ-024 加异步初始化；REQ-041/042 曾加自动镜像触发/启动拉取/手动重新加载，REQ-044 删除镜像功能后撤回）

职责：应用运行期的单一状态源 + 自动持久化，用 Vue `reactive()` 实现。
依赖：`state/persistence.js`，`vue`。

- `store.getState(): AppState` — 返回 `reactive()` 代理对象；Vue 组件读取
  其字段会被自动收集为响应式依赖，只有真正用到的部分变化时才重渲染
  （REQ-001/REQ-002 时期"任何 setState 都全量重建 DOM"的问题由此解决）。
- `store.setState(patch: Partial<AppState> | (state)=>Partial<AppState>): void`
  — `Object.assign(state, partial)`。**`domain/*.js` 和 `calendar/*.js`
  里所有 `store.setState((s) => ({...}))` 的调用方式不需要改**，这是
  REQ-003 UI 架构迁移、REQ-024 数据层迁移都特意选择"响应式包一层薄壳"
  而不是"重写 domain 层"的原因——两次持久化后端切换（内存态 →
  localStorage → OPFS SQLite）对 `domain/*.js` 完全透明。REQ-043 的"导入
  数据"也复用这同一个接口——`parseImportedState()` 返回一个带全部顶层
  字段的对象，直接 `store.setState(parsed)` 就是整体覆盖。
- `initStore(): Promise<void>`（REQ-024，新增）— 模块顶层先用
  `reactive(createDefaultState())` 同步创建一个占位状态（保证
  `getState()` 在任何时候调用都有值可读，不需要处理"还没 ready"的
  undefined 状态）；这个函数 `await persistence.loadState()` 拿到真实
  数据后，用 `Object.assign(state, loaded)` 整体覆盖进同一个 reactive
  对象——Vue 会正常追踪到这次整体覆盖并触发界面刷新，不需要重新挂载
  组件树。**必须在应用挂载前 `await` 一次**（见 `src/main.js`），负责
  这件事之前 `watch()` 自动保存还没启动，避免占位状态被误当成真实数据
  写回数据库、覆盖用户已有的记录。
- 内部用 `watch(state, ..., {deep:true})` + 150ms 防抖调用 `saveState`
  （REQ-024 起是异步函数，不 `await`，失败已经在 `persistence.js` 内部
  catch 住），把一次同步任务里的多次连续 `setState`（例如生成周计划时
  循环调用 `markScheduled`）合并成一次数据库写入。这个 `watch` 由
  `initStore()` 里的 `startWatching()` 显式启动，不是模块加载时就自动
  开始（原因见上一条）。
- 不再提供 `subscribe()`——Vue 组件通过读取 `store.getState()` 里用到的
  字段自动建立响应式依赖，不需要手动订阅。
- ~~`restoreFromLegacyBackup(): Promise<boolean>`（REQ-026 新增）~~
  **REQ-029 已删除**：曾经是供 `SettingsPanel.vue`"数据恢复"分区调用的
  手动恢复入口——不看数据库现在有没有数据，只要 `localStorage` 里还
  找得到旧数据就直接覆盖当前 `state` 并写回数据库。用户确认真实数据已
  经通过这个按钮成功恢复，不再需要它，明确要求删除，连同
  `SettingsPanel.vue` 里的"数据恢复"分区、`persistence.js` 里配套导出的
  `readLegacyLocalStorageState()`（改回内部函数）、三个 locale 文件里
  的 `dataRecovery*` i18n key 一并删除。`persistence.js` 的
  `loadState()` 自动恢复（REQ-025）本身不受影响，仍然保留——那是挂载时
  静默执行的安全网，不是用户会看到的"功能"。
- ~~`hydrateFromDirectory()`（REQ-041，`initStore()` 开头调用）/
  `reloadFromDisk()`（REQ-042，新增）/`saveState(state).then(() =>
  mirrorNow())`（REQ-041，自动保存链路里）~~ **REQ-044 已删除**：这三处
  都是服务"数据库镜像到本地文件夹"这个实验性功能的胶水代码，用户明确
  要求把那个功能整个去掉后一起撤回，见下面 `state/fileMirror.js` 条目。

## ~~src/state/fileMirror.js~~（REQ-041 新增，REQ-042 加反向读取，**REQ-044 已整个删除**）

用户要求把 REQ-041/042 做的"数据库镜像到本地文件夹（实验性）"功能整个
去掉，理由：这个功能需要 Chromium 系浏览器 + 用户手动选目录并持续重新
授权，和刚被回退的 REQ-043"文件夹作为唯一存储"实验是同一类"依赖本地
文件系统授权"的复杂度（虽然这个版本失败时静默降级，不强制），而
REQ-043 新增的"数据导出/导入"（见 `state/persistence.js` 的
`serializeStateForExport`/`parseImportedState`）已经覆盖了同样的手动
备份诉求，且不挑浏览器。原本这个模块负责把 OPFS 权威数据库和用户选的
真实本地文件夹之间做整份字节的双向搬运（`mirrorNow()`
往外写/`hydrateFromDirectory()` 往里读，用 File System Access API），
`state/db.js` 配套的 `exportDbBytes()`/`closeDb()`/`OPFS_FILENAME`、
`state/store.js` 里的调用胶水、`SettingsPanel.vue` 的整个"数据库镜像到
本地文件夹"分区、三个 locale 文件的 24 个 `fileSync*` key，都随这次
删除一起清理干净。这个功能是纯增量的可选能力，删除不影响核心 OPFS
SQLite 存储路径，见 `docs/CHANGELOG.md` REQ-044 条目。

## src/domain/yearPhases.js

职责：四阶段（探索/筛选/进阶/记忆）日期计算。
依赖：`utils/dateUtils.js`。

- `PHASES = ['explore','filter','advance','memory']`
- `getPhaseSchedule(yearStart: Date, phaseWeeks: Record<phase, number>): {phase, start, end}[]`
- `getPhaseForDate(date: Date, yearStart: Date, phaseWeeks): {phase, index, weekInPhase, totalWeeksInPhase, progress}`
  — `progress` 为 0~1 的整年进度。日期超出年度范围时按最近阶段边界钳制
  （不抛异常）。
- `PHASE_LABELS` 已删除（REQ-005）：显示文案改走 i18n 的
  `domain.phase.*`，不在 domain 层写死中文。
- （REQ-016）这个模块本身完全没改——`phaseWeeks` 这个参数一直是外部
  传入的纯数据，这次只是改变了"外部从哪里算出这份数据"（从
  `settings.phaseWeeks` 直接读，改成 `domain/goals.computePhaseWeeksFromGoals()`
  现算），`getPhaseSchedule`/`getPhaseForDate` 的调用方式和函数签名都
  没变。

## src/domain/goals.js（REQ-016，新增）

职责：长期目标的数据模型 + CRUD + 汇总成阶段周数。
依赖：`utils/id.js`，`domain/yearPhases.js`（只用到 `PHASES` 这个常量）。

- `goal = {id, title, phase, weekBudget, createdAt}` —
  `phase` 是 `PHASES` 里的一个阶段标识符，`weekBudget` 是这个目标打算
  花的周数（正整数，`createGoal`/`updateGoal` 内部会 `Math.max(1, ...)`
  钳制，避免出现 0 或负数）。
- `createGoal(store, {title, phase, weekBudget}): Goal` /
  `updateGoal(store, id, patch): void` / `deleteGoal(store, id): void` —
  和 `domain/recurringEvents.js` 一样的 `store.setState((s)=>({...}))`
  调用惯例，操作顶层 `state.goals` 数组。
- `computePhaseWeeksFromGoals(goals): Record<phase, number>` — 汇总成
  `domain/yearPhases.js` 需要的 `{explore,filter,advance,memory}` 结构：
  阶段长度 = 该阶段下所有目标 `weekBudget` 之和；某阶段一个目标都没有
  （或目标周数加起来是 0，理论上不会出现，因为 `weekBudget` 已经钳制
  成正数）时，用 `DEFAULT_PHASE_WEEKS_FALLBACK = 13`（原来
  `settings.phaseWeeks` 的默认值）兜底，避免阶段长度变成 0——
  `getPhaseSchedule()` 按周数顺序累加计算各阶段起止日期，长度为 0 的
  阶段会导致排在它后面的阶段全部往前错位。
- 被 `components/SidebarNav.vue`（阶段进度条）、`WeekBoard.vue`（阶段
  标签）、`SettingsPanel.vue`（长期目标管理界面）三处调用，取代了原来
  直接读 `state.settings.phaseWeeks` 的写法（原本还有 `domain/
  scheduler.js` 的 `generateWeeklyPlan` 选品类逻辑调用，该文件已随
  REQ-052 删除）。

## src/domain/activityPool.js（REQ-048 从"服务自动排程的活动池"重做为"兴趣活动参考库"；REQ-053 类别改成动态数据；REQ-082 分类功能整个删除）

职责：兴趣活动库的增删改查。REQ-048 之前这个模块的数据是专门喂给
`domain/scheduler.js`/`domain/noveltyEngine.js`（自动挑活动排进周
计划）用的，`category` 是 novel/interest/variety/routine 这种"新鲜度"
维度，配 blockType/durationMinutes/energyLevel/rating/weightMultiplier/
timesScheduled/lastScheduledAt 这些字段。Grep 全项目确认
`generateWeeklyPlan`/`planWeekDays`/`markScheduled` 在任何 `.vue` 文件
里都没有调用方（REQ-015 已经删掉了唯一的"生成本周计划"触发按钮），
这套自动排程子系统本来就已经是死代码，用户借此机会要求把这个页面
重做成一个纯粹的个人兴趣活动参考库：每条记录只有标题/封面图/一段
Markdown 内容，供浏览/检索，不再喂给任何自动排程逻辑。
依赖：`utils/id.js`, `state/store.js`。

- ~~`CATEGORIES = ['photography','camping',...,'other']`（8 个固定
  标识符，显示文案走 i18n）~~ **REQ-053 已整个删除**：类别改成动态数据
  `state.activityCategories: [{id, name, useCount}]`，不再有一个固定的
  标识符数组——用户要求"添加活动时如果类别不存在就顺便建一个新的"，
  固定数组这个形状本身就和这个诉求冲突。
- ~~`getCategoryName(categories, categoryId): string`（REQ-053，新增）
  ——按 id 在传入的类别列表里查 `name`，查不到兜底空字符串~~ **REQ-058
  已整个删除**：这个纯 domain 函数不带 i18n 感知（domain 层不依赖
  vue-i18n），只能原样返回 `name`；用户要求"类别种子数据也要跟着切
  语言"之后，两处调用方都改成了能查 i18n 的
  `utils/i18nLabels.categoryLabel(t, category)`，这个函数因此没有任何
  调用方了，删掉，不留死代码。
- ~~`addCategory(store, name): Category | null`（REQ-053，新增）——按
  `name.trim()` 后精确匹配去重创建/复用一个类别，供 `ActivityModal.vue`
  的类别选择框在用户输入一个不存在的名字时调用~~、~~`touchCategoryUsage
  (store, categoryId)`（内部函数，`useCount +1`）~~ **REQ-082 都已整个
  删除**：用户明确要求"图文里面的分类也去掉"，`state.activityCategories`
  这份动态类别列表连同它的增查/计数维护函数一起删除，见
  `state/persistence.js` 条目。
- `addActivity(store, fields): Activity` — 字段精简为
  `{id, title, imageUrl（默认 ''）, content（默认 ''）, createdAt}`
  （~~原来还有 `category`~~ **REQ-082 整个删除**：见上一条；~~原来还有
  `link`（默认 ''）~~ **REQ-081 整个删除**：用户反馈"图文的链接不
  需要"）。所有函数第一个参数为 `store` 实例（而非隐式单例），便于
  测试；UI 层统一传入 `state/store.js` 导出的单例。`content`（REQ-048
  新增）：正文笔记（Markdown 源文本，见 `utils/markdown.js` 的
  `renderMarkdown()`）。`imageUrl`（REQ-035 沿用，REQ-081 补充本地
  文件上传入口）：封面图，可以是用户粘贴的外部 URL，也可以是
  `ActivityModal.vue` 浏览本地文件读出来的 data URI，字段本身不区分
  来源，和 `settings.appearance.backgroundImage` 同一个模式。
- `updateActivity(id, patch): void` — 通用 `{...a, ...patch}` 合并。
  ~~（REQ-053）只有 `patch.category` 存在且和这条活动当前的 `category`
  不同时，才给新类别 `useCount +1`~~ **REQ-082 这段类别计数逻辑随分类
  功能一起整个删除**，现在就是单纯的浅合并，不再有任何字段触发额外的
  副作用。
- `removeActivity(id): void`
- ~~`listActivities`/`markScheduled`/`rateActivity`~~ **REQ-048 已删除**：
  `listActivities`/`markScheduled` 本来就已经没有调用方；`rateActivity`
  删除前还有真实调用方（`ActivityCard.vue` 旧版评价按钮、
  `DayTimeline.vue` 的 `onRate`/`findActivity`），随这次改动一起清理，
  见这两个组件的条目。`rateActivity` 唯一依赖的
  `domain/feedbackAdjuster.js`（`RATING_MULTIPLIER`/`applyFeedback()`，
  按评价调整 `weightMultiplier`）随之整个删除——不是"删按钮留函数"那种
  可恢复的暂存，它操作的 `weightMultiplier` 字段在新数据模型里已经不
  存在了。
- ~~**取舍说明（REQ-053）**：`useCount` 只增不减是刻意的简化……新建的
  类别也没有删除入口……~~ **REQ-082 起这条说明不再适用**：分类功能
  整个删除，不存在 `useCount`/新建类别这些概念了。

## src/domain/noveltyEngine.js / src/domain/scheduler.js（REQ-052 已删除）

REQ-015 已经删掉了"生成本周计划"这个唯一会触发 `domain/scheduler.
generateWeeklyPlan`（进而调用 `noveltyEngine.scoreActivity`/
`isInCooldown`）的 UI 入口；REQ-048 进一步把这两个模块依赖的
`activity.category`/`weightMultiplier`/`lastScheduledAt`/
`timesScheduled` 这些字段从数据模型里整体移除，两个文件从此变成纯死
代码（REQ-048 时的决定是"删按钮不删函数"暂时保留，理由是万一以后想
恢复自动排程不需要重新实现）。**REQ-052 应用户明确要求（"随机生成本周
计划的程序看看有没有漏下来的，帮我删除掉"）把这两个文件整个删除**——
不再保留"以后可能恢复"的余地，改为需要时从 git 历史里找回。

## src/domain/dayPlanner.js（REQ-052 起只剩类型常量）

**REQ-052 删掉了 `planWeekDays`**（把一周选中的活动 + 固定块 + Google
忙碌块编排为每日小时级时间块的自动排程函数）及其全部私有辅助函数
（`overlapsAny`/`subtractIntervals`/`pickWindowForActivity`/
`TIME_PREFERENCE`/`DAY_RANGE`）——这个函数从 REQ-015 删掉唯一触发按钮
起就没有任何 UI 调用方，REQ-048 重做 `activityPool.js` 后它读的
`activity.blockType`/`activity.durationMinutes` 等字段也已从数据模型里
移除，是纯死代码，随 `scheduler.js`/`noveltyEngine.js` 一起按用户要求
删除。

文件现在只剩两个类型常量：
- `BLOCK_TYPES = ['work','exercise','experience','relax','free']` ——
  仍被 `EventModal.vue` 用于手动创建/编辑事件的类型选择器。
- `IMPORTED_BLOCK_TYPE = 'busy'` — 用于标识只读的 Google 导入事件（不
  计入 5 大类别，但会参与冲突避让）；虽然目前没有代码按名字导入这个
  常量，但 `'busy'` 这个字符串字面量在 `DayTimeline.vue`/
  `WeekBoard.vue`/`GoogleSyncPanel.vue`/`colors.js` 多处直接使用，保留
  这个导出做语义说明。

`BLOCK_TYPE_LABELS` 早在 REQ-005 就已删除：显示文案走 i18n 的
`domain.blockType.*`。原本的 `DAY_RANGE = {start:7, end:23}`（自动排程
放置块的小时范围）随 `planWeekDays` 一起删除，不要和时间轴显示范围用的
`constants/timelineRange.js` 常量混淆（两者早已是独立常量，见下方
`DayTimeline.vue` 条目）。

## src/domain/recurringEvents.js（REQ-002，新增；REQ-070 物化策略改成滚动续期）

职责：周期事件（每天/每周固定星期几/每月固定日期）的规则数据模型 +
物化未来实例。策略不变：把具体的 block 直接写入 `state.dayTimelines`
（`source:'manual'`），完全复用 `domain/dayPlanner.js` 已有的"保留
manual 块、不覆盖、并当作已占用区间排除在自动排程可用空档之外"的
逻辑，`dayPlanner.js` 本身不需要为周期事件做任何改动。
依赖：`utils/id.js`, `utils/dateUtils.js`。

- `RECURRENCE_FREQUENCIES = ['daily','weekly','monthly']`
- `RECURRENCE_END_TYPES = ['never','until','count']`
- （REQ-070）用户反馈原来"创建时一次性生成、之后不再管"的策略有问题
  ——受 `MAX_HORIZON_DAYS`（366 天）/`MAX_INSTANCES`（200 个实例）任一
  先达到就停这两个硬上限约束，高频的"每天"系列 200 个实例撑不到 200
  天（约 6.5 个月）就"断供"，且没有任何代码会再自动续。改成**滚动
  续期**：`RecurringEvent` 新增 `materializedUntil`（已生成到哪天，
  dateKey）/`materializedCount`（已生成实例数）两个进度字段；
  `ROLLING_HORIZON_DAYS = 366`——`'never'` 类型系列的物化目标永远是
  "今天 + 这么多天"，随"今天"推移不断往后移；`'until'`/`'count'`
  类型如果自己的截止条件比这个滚动终点更早，用自己的截止条件封顶。
  原来"总数≤200"这条硬性限制去掉，换成只针对极端输入（比如"每天，
  直到 3000 年"）的安全兜底 `MAX_INSTANCES_PER_OP=3000`/
  `MAX_SCAN_DAYS=3660`（内部常量，不导出），不是日常场景会碰到的
  数字。
- `computeOccurrenceDates(rule): Date[]`（**REQ-070 已删除**，功能被
  下面的内部函数 `occurrencesInRange`/`materializeUpTo` 取代，两者都
  不对外导出——外部只需要 `createRecurringEvent`/`extendAllRecurringSeries`
  这两个高层入口，不需要再单独拿到"计算日期列表"这一步的中间结果）。
- `createRecurringEvent(store, fields): RecurringEvent` — `fields =
  {title, type, startHour, endHour, seriesStartDate, recurrence, end}`。
  REQ-070 起内部实现变成"新建一条 `materializedUntil` 为
  `seriesStartDate` 前一天、`materializedCount:0` 的规则，立刻调用一次
  内部 `materializeUpTo()` 续期"——创建只是"从空白起点续期一次"的
  特殊情况，和下面 `extendAllRecurringSeries` 共用同一套生成逻辑，
  外部调用方式和返回值（`RecurringEvent`）没有变化。
- `extendAllRecurringSeries(store): void`（REQ-070，新增）— 遍历
  `state.recurringEvents` 里每一条，用内部 `materializeUpTo()` 算出
  "这次该续到哪"并生成缺的那段实例；没有任何规则需要更新时直接
  return，不触发 `store.setState()`（幂等、低开销，可以放心高频调用）。
  由 `App.vue` 的 `onMounted` 和 `watch(now, ...)` 共同调用，见该文件
  条目。
- `deleteRecurringSeries(store, recurringId): void` — 从
  `state.recurringEvents` 移除该条，并删除 `dayTimelines` 里所有
  `block.recurringId === recurringId` 的块（整系列删除；单个实例删除走
  普通的删除 block 逻辑，见 `components/EventModal.vue`/`DayTimeline.vue`）。
  不受 REQ-070 影响。

已知限制：编辑单个周期事件实例只改动那一个 block（`recurringId` 保留但
规则不再联动），不支持"批量修改本系列所有未来实例"；如需改变重复规则，
需删除整个系列后重新创建。

## src/domain/plans.js（REQ-017，新增；REQ-054 重新加入 addKeyEvent）

职责：计划（含一串有先后顺序的关键事件，严格按顺序完成才能推进到终点）
的数据模型 + CRUD。取代了 REQ-016"长期目标"的 UI 概念（`domain/goals.js`
本身没删，见该模块条目和下面 persistence.js 的说明）。
依赖：`utils/id.js`。

- `plan = {id, title, createdAt, abolished, keyEvents}`（REQ-038 新增
  `abolished: boolean`，默认 `false`），
  `keyEvent = {id, title, estimatedHours, completedAt}`。**核心设计**：
  `keyEvents` 数组本身的顺序就是完成顺序，不单独存排序字段；"严格按
  顺序完成"这个约束靠"只允许追加到末尾、只允许标记当前第一个未完成的
  那个"在数据结构层面天然满足，不需要额外的顺序校验代码。
- `createPlan(store, {title, keyEvents}): Plan` — `keyEvents` 是
  `{title, estimatedHours}` 的数组，内部补全 id/`completedAt:null`；
  REQ-038 起还补 `abolished: false`。
- ~~`deletePlan(store, id): void`~~ **REQ-038 已删除，改成
  `abolishPlan(store, planId): void`**：用户明确要求"去掉删除计划的
  功能，改成废止计划，只是显示变成不能操作而已"——不再从
  `state.plans` 里整个移除计划，只翻 `abolished: true` 这个标记位，
  计划的标题/关键事件/完成进度原样保留。没有配对的"恢复"函数，用户
  没有要求可撤销，重复调用是安全的空操作。
- `updatePlan(store, planId, patch): void`（REQ-032，新增；REQ-038 起
  对已废止的计划无操作）— 修改计划本身的字段，目前只有 `title` 会被
  UI 用到。用户反馈"计划设置可以进行修改，现在修改不了"，原来只有
  创建/删除，没有编辑入口。
- `updateKeyEvent(store, planId, keyEventId, patch): void`（REQ-032，
  新增；REQ-038 起对已废止的计划无操作）— 编辑一个还没完成的关键事件
  （`title`/`estimatedHours`）；只在 `!ke.completedAt` 时才会真正应用
  `patch`，传入已完成的 `keyEventId` 是静默无操作（不抛异常）——和
  `removeKeyEvent` 的保护是同一个道理，已完成的关键事件是历史记录，
  改了会失真。
- ~~`addKeyEvent(store, planId, {title, estimatedHours}, insertBeforeId?)`~~
  REQ-037 时曾经整个删除过：REQ-036 刚加过"可以插到任意未完成关键事件
  前面"的能力（不只是追加到末尾），但用户紧接着反馈"添加关键事件的
  功能不需要"。**REQ-054 重新加回来了**（签名简化，去掉了当时的
  `insertBeforeId?` 参数——这次用户明确说的是"在后面添加"，不是"任意
  位置插入"）：`addKeyEvent(store, planId, {title, estimatedHours}):
  void`，只追加到 `keyEvents` 数组末尾，`estimatedHours` 走和
  `createPlan`/`updateKeyEvent` 一样的 `Math.max(0.25, Number(x) || 1)`
  归一化规则；REQ-038 起对已废止的计划无操作，和这个模块其它修改类
  函数同一套保护惯例。往一份"全部完成"的计划追加新事件会让
  `computePlanProgress().isFinished` 自然变回 `false`（新事件变成
  `activeKeyEvent`）——这是数据结构的自然结果，函数本身不需要为这个
  场景写任何特殊分支。这不是撤销 REQ-036/037 当时的决定又走回头路，是
  需求随时间变了，两次都是各自时间点上用户的真实诉求。
- `removeKeyEvent(store, planId, keyEventId): void`（REQ-038 起对已
  废止的计划无操作）— 只允许删除还没完成的（`completedAt` 为空的）
  关键事件；已完成的会被这个函数忽略（不会被删除），保留作为"做过
  什么"的历史记录。
- `getActiveKeyEvent(plan): KeyEvent | null` — `keyEvents` 里第一个
  `completedAt` 为空的那个，即"当前解锁、可以添加到时间轴/标记完成"的
  那一个；返回 `null` 代表全部完成，即"已到达终点"。不看 `abolished`
  ——纯粹是数据结构上的查询，"已废止计划不能再操作"这层限制由
  `completeKeyEvent`/`EventModal.vue` 的 `planOptions` 各自把关，见
  下面对应条目。
- `computePlanProgress(plan): {total, completedCount, isFinished,
  activeKeyEvent}`。
- `completeKeyEvent(store, planId, keyEventId): void`（REQ-038 起对已
  废止的计划无操作）— 只有 `keyEventId` 等于
  `getActiveKeyEvent(plan).id` 时才会真正标记完成（写入
  `completedAt`），否则整个调用是空操作——这是"严格顺序"约束在写入
  路径上的兜底防线（配合 UI 层只对当前解锁项显示"标记完成"按钮，
  双重保证不会跳过顺序）。一个块要是关联着已废止计划的关键事件（废止
  之前就已经添加到时间轴上了），结算时不会再推进这份计划的进度，但块
  本身照常算点数，两者是独立的，见 `domain/rewards.settleCompletedBlocks`。
- `uncompleteLastKeyEvent(store, planId): void`（REQ-038 起对已废止的
  计划无操作）— 撤销最近一次完成（`keyEvents` 里最后一个
  `completedAt` 非空的那个），用于误点后悔，和 `DayTimeline.vue` 的
  `toggleSkip` 一样是"可逆操作"的设计惯例；不提供撤销任意一个的接口，
  避免破坏"已完成部分是数组前缀"这个不变式。
- 被 `components/EventModal.vue`（"从计划添加"下拉框只列出未废止计划
  的 `getActiveKeyEvent()`，REQ-038 加了 `!plan.abolished` 过滤）、
  `components/DayTimeline.vue`（"标记完成"按钮调用 `completeKeyEvent`）、
  `components/PlanPanel.vue`（计划管理界面的编辑/废止操作，REQ-054 起
  还有追加关键事件的 `addKeyEvent`）调用。
- `dayTimelines[dateKey].blocks[]` 里的 block 新增两个可选字段
  `planId`/`keyEventId`（`EventModal.vue` 从计划添加时写入）——这是
  block 到某个计划关键事件的**引用**，不是复制；关键事件的完成状态
  始终只存在 `state.plans` 里，block 只负责"这个关键事件被安排在哪一天
  哪个时间段"。

## src/domain/rewards.js（REQ-018，新增；REQ-019 从"计划触发领取"改写为点数经济；REQ-020 加一天延迟结算；REQ-022 拆分平日/周末比率；REQ-046 改为实时结算 + 余额改为派生计算；REQ-051 起连每个块的点数本身也改成每次现算；REQ-058 价格刷新改按 seedKey 匹配；REQ-067 删除 refreshRewardValuesFromSeedPrices）

职责：奖励名单（数值上按日元参考价定，但**界面上一律只称"点数"，不出现
任何货币标识**，见文件顶部注释）数据模型 + CRUD + 点数经济（攒点数、
兑换）。REQ-018 时和 `domain/plans.js` 是"完成计划直接领取"的配对关系；
REQ-019 改成完全独立的点数经济；REQ-020 进一步取消了"手动标记完成"这个
动作——时间轴上的事件默认视为完成，只有标记跳过才不计分；REQ-022 把
结算比率从单一的 `pointsPerHour` 拆成"平日"/"周末"两档；REQ-046 把
REQ-020 时"延迟一天结算"改成实时判断资格，把点数余额从需要手动维护的
存储字段改成每次现算的派生值；REQ-051 用户进一步要求"单位时间的点数
需要考虑一下……不是说保存在数据库里就行了的"，连每个块的点数本身也从
"结算时存一次快照"改成"每次都用当前比率现算"——调整
`pointsPerHourWeekday`/`pointsPerHourWeekend` 会立刻影响所有历史上已经
完成的事件，不只是新完成的。完整取舍说明见文件顶部注释。
依赖：`utils/id.js`, `utils/dateUtils.js`（`getDateKey`/`parseDateKey`/
`weekdayIndex`），`domain/plans.js`（`completeKeyEvent`，一个块首次
"有资格"时联动推进计划）。（REQ-067：`state/persistence.js` 的
`SEED_REWARDS` 这条依赖已随 `refreshRewardValuesFromSeedPrices()` 一起
删除，这个模块现在不再 import `persistence.js`。）

- `reward = {id, title, value, claimed, claimedAt, createdAt}` —
  `value` 是兑换所需点数（`Math.max(0, ...)` 钳制非负数），数值来源
  见 `persistence.js` 的 `SEED_REWARDS` 注释；REQ-018 时的
  `claimedByPlanId` 字段已经不存在了（兑换不再和某份计划绑定）。
  `components/RewardPanel.vue` 的"已兑换"表格本身就是用户口中的"兑换
  记录表"，`computeRewardBalance()`（见下）直接读这份数据算"花了多少"，
  不需要另外维护一份兑换流水。
- `createReward(store, {title, value}): Reward` /
  `updateReward(store, id, patch): void` — 和 `domain/plans.js` 一样的
  `store.setState` 调用惯例。
- `deleteReward(store, id): void` — 只允许删除还没被兑换的
  （`claimed:false`）；已兑换的删除请求会被忽略，保留作为"用点数换到了
  什么"的历史记录，和 `domain/plans.js` 的 `removeKeyEvent` 对已完成
  事件的保护是同一个设计。
- `computePointsForDuration(hours, pointsPerHour): number` — 时长 ×
  比率，四舍五入取整；比率由调用方按平日/周末传入，这个函数本身不关心
  具体是哪一档，没有写死的"标准换算率"。
- `isWeekend(dateKey): boolean`（REQ-022，新增）— 用
  `utils/dateUtils.weekdayIndex(parseDateKey(dateKey))` 判断这一天是不是
  周六/周日（周一起始索引 5/6）。这个判断只用来决定结算比率，和
  `settings.workHours.days`（自动排程默认工作日）是两个独立概念，不
  共用同一份配置——前者是用户的个人激励尺度，后者是排程算法的业务
  规则。
- `isBlockEligible(block, dateKey, todayKey, nowHour): boolean`（REQ-051，
  内部函数）— 不是 Google 来源、没被标记跳过、真实结束时间已经过去
  （过去的日期整天都算，"今天"要看 `block.end` 是否早于此刻的
  `nowHour`）。`computeRewardBalance()`/`settleCompletedBlocks()` 共用
  这同一条判断，避免两处各写一份、以后改一处忘了改另一处。
- `computeRewardBalance(state): number`（REQ-046 新增，取代
  `state.rewardPoints` 存储字段；REQ-051 起不再读任何存储的点数字段）
  — 遍历全部 `dayTimelines`，对每个"有资格"（`isBlockEligible`）的块，
  用它所在那天是不是周末选**当前**的 `pointsPerHourWeekday`/
  `pointsPerHourWeekend`、乘真实时长（`block.end - block.start`）现算
  出点数再累加，减去 `state.rewards` 里 `claimed:true` 条目的 `value`
  之和，`Math.max(0, ...)` 钳制下限。每次调用都是一次全量遍历 + 现算，
  不缓存、不存储——数据量小（一整份状态就是一个 JSON 对象）所以这么做
  完全够用，好处除了 REQ-046 时说的"消除余额漂移 bug"之外，REQ-051 起
  还多了一条：调整比率会立刻对所有历史事件生效，不需要一个"重新结算
  历史数据"的额外步骤。`components/RewardPanel.vue` 用一个 `computed`
  包一层。
- `redeemReward(store, rewardId): boolean` — 用 `computeRewardBalance()`
  现算一次余额判断够不够（同步单线程代码，不存在并发竞态），够了才
  标记 `claimed:true` + `claimedAt` 并返回 `true`，不做任何"扣钱"的
  额外写入——余额是派生值，标记兑换这一步本身就会让下一次
  `computeRewardBalance()` 自动算出更低的余额。不够则不做任何写入、
  返回 `false`，调用方（`RewardPanel.vue`）据此决定要不要提示"点数
  不够"。
- `listUnclaimedRewards(rewards): Reward[]`。
- `settleCompletedBlocks(store): void`（REQ-020 新增时叫
  `settlePastDays`，只处理"今天之前"的日期；REQ-046 重写为实时判断
  资格，改了名字；**REQ-051 起职责大幅收窄**）— 现在**只负责计划
  推进**，不再计算或存储点数（点数改成 `computeRewardBalance()` 每次
  现算，见上）。对每个还没被标记过（`!block.pointsSettled`）且
  `isBlockEligible` 的块，写 `block.pointsSettled=true`；如果这个块
  关联了计划关键事件（`block.planId`/`keyEventId`），同时调用
  `completeKeyEvent` 推进那份计划，按日期从早到晚处理保证多个关键事件
  按正确顺序推进。`block.pointsSettled` 这个字段名字沿用 REQ-046 之前
  的叫法，但**含义收窄为"这个块有没有已经因为自己推进过关联的计划"**
  ——纯粹是 `completeKeyEvent` 的幂等标记 + `DayTimeline.vue` 的
  `toggleSkip()` 判断"跳过时要不要连带撤销计划进度"用，和点数计算
  完全脱钩（点数现在不管这个字段是什么，只看 `isBlockEligible` 此刻
  的结果）。**天然幂等**：不需要额外记"处理到哪了"的游标，靠
  `pointsSettled` 本身去重——每次调用都会把当前所有符合条件的块重新
  扫一遍，已处理的会被自然跳过。被 `components/App.vue` 在挂载时和
  `useNow()` 每次 tick（30 秒一次）都调用一次，不只在跨天时触发——
  这样一个关联了计划的事件一结束，最多 30 秒内计划进度就会自动推进。
- ~~`resetPointsFromMonday(store)`（REQ-028 新增，"重置点数余额、从本周一
  开始计算"）~~ **REQ-046 已删除**：这个函数的整个操作对象是
  `state.rewardPoints` 这个存储字段——余额改成派生计算之后，"重置一个
  存储余额到某个时间点"这个概念不再成立（没有一个"当前余额"可以被
  强行改写，余额永远等于历史记录的现算结果），删除时连同
  `components/App.vue` 挂载时按 `state.meta.pointsResetAt` 幂等标记
  调用它的那行代码一起删掉。老数据里如果还带着 `meta.pointsResetAt`
  这个字段，走 `fillMissingDefaults()` 的浅展开原样留着当死数据，见
  `state/persistence.js` 条目。
- ~~`addPoints(store, delta)`（累加/扣减 `state.rewardPoints`）~~
  **REQ-046 已删除**：余额是派生值之后，不再有一个需要显式增减的存储
  字段——`components/DayTimeline.vue` 的 `toggleSkip()`/`removeBlock()`
  只需要正确清掉/维护 `pointsSettled`（或者把块整个删掉），
  `computeRewardBalance()` 下次求和时自然就不会再算上它，不需要一个
  专门"退点数"的函数。
- ~~`block.pointsAwarded`（结算时存的点数快照）~~ **REQ-051 已删除**：
  点数改成 `computeRewardBalance()` 每次现算之后，不再需要在 block 上
  存一份"这次算出多少点数"的快照——老数据里如果还带着这个字段，原样
  留着当死数据，没有任何地方再读它。
- ~~`refreshRewardValuesFromSeedPrices(store): void`（REQ-031 新增，
  REQ-058 改按 `seedKey` 匹配）~~ **REQ-067 已整个删除**：曾经是"把
  奖励名单点数对齐最新日元参考价"的一次性操作，依赖 `persistence.js`
  的 `SEED_REWARDS`。用户要求把内置示例奖励数据（`SEED_REWARDS` 这份
  17 项清单）整个清掉后，这个函数失去了唯一的数据来源，随之一起删除，
  连同 `App.vue` 挂载逻辑里 `state.meta.rewardValuesRefreshedAt` 幂等
  标记的调用点、`createDefaultState()` 里这个字段的生成，见
  `state/persistence.js`/`src/App.vue` 各自条目。
- `clearClaimedRewards(store): void`（REQ-033，新增）— 用户直接要求的
  一次性操作："奖励页面的已兑换数据帮我清理掉"，把 `state.rewards` 里
  `claimed:true` 的条目整个过滤掉，待兑换的不受影响。`deleteReward`
  故意保护已兑换条目不让删（历史记录），这个函数是用户明确要求绕开
  这层保护的批量清空；用 `state.meta.claimedRewardsClearedAt` 做"只
  执行一次"的幂等标记，同一套机制。
- `resetPointsFromMonday` 曾经（REQ-034~REQ-036）在 `components/
  RewardPanel.vue` 里还有一个手动触发的按钮，REQ-039 应用户要求
  （"删除重置点数的功能"）把那个按钮整个删除了；函数本身随后在 REQ-046
  也被整个删除，见上面对应条目。
- 被 `components/DayTimeline.vue`（`toggleSkip()` 联动撤销计划进度，
  REQ-046 起不再需要联动"退点数"，见该组件条目）、`components/App.vue`
  （挂载时和 `useNow()` 每次 tick 都触发 `settleCompletedBlocks`；
  REQ-033 起还会按需调用一次 `clearClaimedRewards`；~~REQ-031 起还会
  按需调用一次 `refreshRewardValuesFromSeedPrices`~~ **REQ-067 已随该
  函数一起删除**）调用。

## src/domain/holidays.js（REQ-011，新增；REQ-071 补 2027 年美国/日本数据）

职责：纯展示用的静态节假日数据表，不参与自动排程。

- `SUPPORTED_REGIONS = ['CN', 'US', 'JP']`
- `HOLIDAY_TYPE = {HOLIDAY:'holiday', WORKDAY:'workday'}` —
  `workday` 专指中国大陆"调休上班"的那几个周末（比如国庆调休 9/20 和
  10/10 要上班），其他地区目前用不到这个类型。
- `getHolidayInfo(dateKey, region): {name, type} | null` —
  `dateKey` 是 `utils/dateUtils.getDateKey()` 产出的 `'YYYY-MM-DD'`；
  查不到时返回 `null`（地区没数据，或者这个地区在这一年没收录），调用方
  按"这天没有特殊标记"处理。
- 数据覆盖年份**三个地区不一样**（REQ-071）：中国大陆只有 **2026 年**，
  美国/日本有 **2026-2027 两年**。原因是数据来源性质不同——中国大陆的
  "放假+调休"具体安排由国务院办公厅每年临时发文公布，历史规律是上一年
  10~12 月才发（2026 年这份是 2025-11-04 发的），写入 2027 年数据时
  （2026-08）官方还没公布，**不能凭元旦/春节的公历日期去猜调休安排**，
  没有添加；美国联邦假日由固定法律规则决定（多数是"每月第 N 个星期几"
  +"落在周末就顺延/提前到最近工作日"），日本国民の祝日由法律+天文台
  春分/秋分推算日期决定，两者都可以提前多年准确算出，2027 年数据已经
  用 WebSearch 核对多个独立权威来源（美国：timeanddate.com/
  federalpay.org；日本：国立天文台暦計算室官方 + 内閣府）补齐。所有
  年份的数据写入前都用 WebSearch 核对过，不是凭训练记忆编的日期，来源
  链接列在文件末尾注释里。
- **已知局限**（文件顶部注释里写清楚了）：纯手工维护的静态表，没有
  联网更新机制，往后每年都要照官方通知/权威信息源手动补新的一份数据
  进去；中国大陆 2027 年及以后的数据要等官方正式公布放假调休安排后才能
  补（预计每年 10~12 月），这是"调休安排本身就是行政决定、不是能提前
  算出来的东西"这个数据性质决定的局限，不是代码能解决的。原来这里还
  说明"没有接入自动排程逻辑，只做日历上看得见、不做排程自动避让"，但
  那套自动排程子系统（`domain/scheduler.js`/`dayPlanner.planWeekDays`）
  已在 REQ-052 整个删除，不再有相关取舍需要说明。
- 被 `components/MonthBoard.vue`/`WeekBoard.vue`/`DayTimeline.vue`/
  `SettingsPanel.vue`（地区选项列表）引用。

## src/calendar/googleAuthClient.js（REQ-072 从 GIS 弹窗 token client 整个重写为手写的整页跳转 OAuth2 隐式授权流程）

职责：Google OAuth2 授权（登录、维持内存态 token、登出）。
依赖：无第三方脚本依赖（不再需要 index.html 引入 Google Identity
Services，这次改写移除了这个脚本标签）。

- 改写原因：`vite.config.js` 给页面加的
  `Cross-Origin-Opener-Policy: same-origin`（OPFS 本地数据库的硬性
  前提）会把这个页面自己打开的弹窗的 `window.opener` 置空，导致 GIS
  弹窗式登录完成授权后没法把结果 `postMessage` 传回主页面——**静默
  失败、不报错**，用户体感是"弹窗流程走完了，但应用死活不显示已登录"。
  两个更宽松的 COOP 选项都不能两全：`same-origin-allow-popups` 保住
  弹窗通信但会让页面失去跨源隔离状态、本地数据库打不开；
  `restrict-properties` 理论上两全但 Chrome 已在 2025-04 暂停这个
  提案、没有浏览器真正支持。结论和调研来源见 `docs/KNOWLEDGE.md`。
- `SCOPES` — 和原来一样的两个 scope（`calendar.events`/
  `calendar.readonly`），导出供文档/排查引用。
- `getRedirectUri(): string` — 返回 `location.origin + location.pathname`，
  既是发起授权时用的 `redirect_uri` 参数，也是 `GoogleSyncPanel.vue`
  引导步骤里展示给用户去 Cloud Console 登记"已获授权的重定向 URI"的
  那个值——两处必须是同一个来源，用同一个函数保证不会手滑写岔。
- `startLogin(clientId: string): void` — 生成随机 `state`（CSRF 防护）
  存进 `sessionStorage`（整页跳转会让当前 JS 执行环境整个销毁重建，
  只有跨导航持久的存储能带着这个值"活过"跳转），拼出 Google 标准
  OAuth2 授权端点 URL（`response_type=token` 隐式授权），
  `window.location.href = ...` 整页跳转过去。调用后当前页面即将被
  导航离开，函数本身没有返回值可等待。
- `consumeRedirectToken(): boolean` — 应用启动时调用一次（`App.vue` 的
  `onMounted`）。检查 URL 片段：没有 `access_token` 也没有 `error`
  就是空操作返回 `false`；有 `error`（用户在 Google 同意页点了取消/
  拒绝）就清理地址栏、打日志、返回 `false`，不弹错误提示（这是用户
  主动的选择，不是异常）；有 `access_token` 就校验 `state` 是否和
  `sessionStorage` 里存的一致，不一致（伪造的回调或过期的跳转）同样
  清理后返回 `false` 且不写入 token；校验通过才存进内存变量、清理
  地址栏（`history.replaceState`，避免这个短期有效的 token 留在浏览器
  历史记录/书签里）、返回 `true`。
- `isLoggedIn(): boolean` / `getAccessToken(): string | null` — 取代了
  旧版分散在 `sessionState.js`（`isConnected`）和这个文件
  （`getAccessToken`）两处的状态，现在登录状态和 token 是同一份内存
  状态的两个视角，不需要分别维护。
- `signOut(): void` — 清空内存 token，尽力而为地（不 `await`、失败
  不影响）调 Google 的 revoke 端点吊销这个 token。

## src/calendar/googleCalendarService.js

职责：封装 gapi.client 对 Calendar API v3 的调用，不受 REQ-072 影响
（`getAccessToken()` 的调用方式没变，只是背后的实现从 GIS 弹窗换成了
整页跳转，这个文件感知不到差异）。
依赖：`calendar/googleAuthClient.js`，全局 `gapi`（index.html 引入）。

- `isGapiLoaded(): boolean`
- `loadGapiClient(): Promise<void>` — 懒加载 `gapi.client` 并加载 Calendar
  discovery doc，只执行一次。
- `listEvents(timeMinISO, timeMaxISO): Promise<GoogleEvent[]>` — 读取
  `primary` 日历指定范围内的事件（`singleEvents:true` 展开重复事件）。
- `insertEvent(event): Promise<GoogleEvent>`
- `buildEventPayload(block, dateKey): GoogleEventPayload` — 把本地时间块
  转成 Calendar API 事件体，写入
  `extendedProperties.private.lifespark = block.id` 用于去重标记。

## src/calendar/googleEventMapper.js（REQ-072，由 conflictMapper.js 改名）

职责：Google 事件 → 按天分组的时段列表。原名 `conflictMapper.js`，当时
只服务"读取忙碌时段避让冲突"（REQ-072 已删除）这一个功能，产出结果
单纯拿去和用户自己的块比对生成文字警告，不落地成真正的日历块；现在
服务"从 Google 同步到本地"（`components/GoogleSyncPanel.vue`），产出的
时段被直接转成 `source:'google'` 的只读块写进 `dayTimelines`，改名
贴合新用途，内部逻辑（含跨天事件按天切分、全天事件忽略）完全没变。
依赖：`utils/dateUtils.js`。

- `mapEventsToDaySegments(events: GoogleEvent[]): Record<dateKey,
  {start:number, end:number, title:string, googleEventId:string}[]>`
  — 只处理有明确 `dateTime` 的事件（跳过全天事件，全天事件的语义和
  这个应用"小时级时间块"的数据模型不匹配）；跨天事件按天切分。

## ~~src/calendar/sessionState.js~~（REQ-006 新增，**REQ-072 已整个删除**）

原来的职责是会话内存态（登录连接状态 + 最近一次读取到的忙碌时段
缓存），不落 localStorage，刷新页面后重置。REQ-072 删除"读取忙碌时段"
功能后，`busyMap`/`lastFetchedRangeLabel` 这两个状态没有任何调用方了；
`connected` 这一个状态折进了 `googleAuthClient.js` 的
`isLoggedIn()`（登录状态和 access token 是同一份内存态的两个视角，
不需要分开维护两处），整个文件因此删除，不留下只剩一个字段的空壳。

## index.html + src/main.js（启动加载动效，REQ-030）

职责：应用挂载前（`initStore()` 异步读 OPFS 数据库期间，见
`state/store.js`）的加载态展示；用户反馈原来纯黑底 + 文字的占位"直接
黑屏"，太生硬，要求有个动效过渡。

- `index.html`：`<div id="app-loading">` 现在是 `<div id="app">` 的**兄弟
  节点**（REQ-024 时是嵌套在 `#app` 内部的），改动原因：Vue
  `mount('#app')` 会把 `#app` 的全部内容整体替换掉，嵌套在里面的占位
  元素完全没有机会做淡出过渡，只能被"啪"一下摘掉。挪成兄弟节点后，
  `main.js` 能在挂载完成后手动控制它的淡出时机。内容是一个 CSS 边框
  转圈 spinner（`@keyframes app-loading-spin`）+"加载中…"文字，整个
  容器还有一个入场淡入（`@keyframes app-loading-in`，页面刚解析到时
  透明度从 0 到 1，避免瞬间闪现的生硬感）。样式写在 `<head>` 里的
  `<style>` 块，**特意不用** `css/variables.css` 的颜色变量——那份
  样式表要等 `main.js` 的 JS `import` 执行后才会注入，直接用变量在
  浏览器刚解析到这里时可能还没生效，改成手抄一份深色主题默认色值
  （`#000`/`#8ab4f8`/`#9aa0a6`），和 `variables.css` 数值上一致但没有
  真正的代码依赖。
- `src/main.js`：新增 `fadeOutLoadingScreen()`，在 `createApp(...).mount('#app')`
  之后调用——先让 Vue 应用在底下渲染完成，再给 `#app-loading` 加
  `app-loading--out` 这个 class（触发它自己 CSS 里定义的
  `opacity` transition），用 `setTimeout`（400ms，比 CSS transition
  的 350ms 稍长）等过渡结束后再把这个元素整个移除，而不是监听
  `transitionend` 事件（一个元素同时有入场 `animation` 和退场
  `transition` 时，事件可能触发多次或有边界情况，`setTimeout` 更简单
  可靠）。视觉效果是黑色加载层平滑淡出、露出下面已经渲染好的界面，
  不是应用内容瞬间蹦出来顶掉黑屏。

## src/App.vue（REQ-003，取代旧版 src/ui/renderApp.js；REQ-077 新增右上角透明化切换按钮；REQ-078 挪到右下角悬浮工具栏 + 新增快速添加事件；REQ-079 改横排 + 加展开/收起 + 修复透明化条件缺陷）

职责：应用根组件。`<n-config-provider :theme :theme-overrides>` +
`<n-message-provider>` 包裹全部内容——`theme` 根据
`state.settings.theme` 在 `darkTheme`（Naive UI 内置）和 `null`（浅色，
Naive UI 默认）之间切换，`theme-overrides.common.primaryColor` 对齐
`css/variables.css` 的 `--accent-strong`，让 Naive UI 组件和自定义日历
网格视觉统一；`watchEffect` 把 `document.documentElement.dataset.theme`
同步为当前主题，供 `css/variables.css` 里的 `:root[data-theme="light"]`
覆盖块生效。

维护一个不持久化的 `uiState`（`reactive`）
`{activeView, selectedWeekStart, selectedDate, selectedMonth, selectedYear,
modal}`（`selectedYear` 是 REQ-060 新增，默认 `getYearStart(new Date())`，
配 `YearBoard.vue`），`navigate(view, extra?)` 更新它。`<component :is="...">`
按 `activeView` 在 `SidebarNav` 旁边切换 `viewComponents` 里注册的视图
组件（REQ-060 起共 9 个：week/day/month/year/plan/reward/library/
settings/sync）；`uiState.modal` 非空时用 `v-if` 挂载 `EventModal.vue`。
`state`/`uiState`/`navigate` 三个 props 统一往下传给每个视图组件，保持
和旧版 `render(state, uiState, navigate)` 函数签名一致的调用约定。

因为改用 Vue `reactive()`，不再需要"整树 clear + 重建"，也不再需要旧版
那种"模块级草稿状态 + 显式 onInput 赋值"来规避输入框失焦——各表单组件
改用组件内 `reactive` 草稿 + `v-model`，`v-model` 天然不会因为同组件内部
状态变化而销毁重建输入框。

（REQ-005）`<n-config-provider>` 新增 `:locale`/`:date-locale`，跟着
`state.settings.locale` 在 `zhCN`/`enUS`/`jaJP`（及对应 `date*`）之间切
——这是 Naive UI 组件自己内部的文案（比如日期选择器的按钮），和应用自己
用 vue-i18n 翻译的文案是两套机制。`watchEffect` 把
`i18n.global.locale.value` 也同步为 `state.settings.locale`。
`<component :is>` 外面包了 `<transition name="view-fade" mode="out-in">`
做视图切换的淡入淡出（原来是硬切，见 `css/layout.css`）。

（REQ-006）`<n-message-provider>` 内新增挂载 `<LanguageSwitcher
:state="state" />`，靠 CSS `position:fixed` 固定在视口右上角，和
`app-shell`/`EventModal` 平级，不受当前视图影响，任何页面都能看到。
（REQ-008 已移除这个全局挂载，见下方 SettingsPanel.vue 条目。）

（REQ-011）`themeOverrides` 新增读取
`state.settings.appearance.accentColor`：有值时整个覆盖掉 Google 蓝
默认色板（`primaryColor`/`primaryColorHover`/`primaryColorPressed`/
`primaryColorSuppl` 四个状态色统一用同一个颜色，没有做深浅变体，是
简化取舍）；`fontFamily` 改从 `constants/fontStacks.FONT_STACKS` 取值。
新增两个 `watchEffect`：一个用
`document.documentElement.style.setProperty` 把 `--font-sans`/
`--accent`/`--accent-strong` 这几个自定义 CSS 变量同步成当前外观设置
（不设置自定义强调色时用 `removeProperty` 退回 `css/variables.css` 的
主题默认值），保证 Naive UI 组件和自己手写的 `.timeline-block` 等 CSS
视觉一致；另一个是 `backgroundStyle` computed + 新增的
`.app-background`（`position:fixed`，铺在 `.app-shell` 后面的独立图层，
`css/layout.css`），没设置背景图时 `display:none`（REQ-076 起这一层
不再单独调自身 `opacity`，按图片原样全不透明显示，见 REQ-076 条目）。
（REQ-077，新增；REQ-078 从单按钮改成悬浮工具栏）新增
`toggleTransparentMode()`，切换 `settings.appearance.transparentMode`
（持久化布尔字段，`state/persistence.js` 的 `createDefaultState()`
新增）；`.app-shell` 绑 `.app-shell--transparent` class
（`css/layout.css`，`opacity:0.82`）——效果是把侧边栏+主内容区整体调
透明，代价是文字对比度也跟着变淡，是"要透出背景图就要牺牲一点可读性"
的预期取舍。按钮本身（`v-if="uiState.toolbarExpanded &&
state.settings.appearance.backgroundImage"`，没背景图不渲染）REQ-078
起从固定右上角的单按钮 `.transparency-toggle`，改成固定右下角、可以
放多个按钮的容器 `.floating-toolbar`（REQ-079 起横向 `flex` 排列，
按钮类改名 `.floating-toolbar__btn`，视觉样式不变）。**REQ-079 修复**：
`.app-shell--transparent` 的绑定条件原来只判断了 `transparentMode`，
没有同时要求 `backgroundImage` 存在——用户开过透明化后又把背景图删掉
（REQ-077 的"取消勾选背景图"），`transparentMode` 这个持久化字段不会
跟着自动复位，界面会在没有背景图可透出来的情况下继续变淡，是真实的
遗留缺陷不是新需求；改成 `transparentMode && backgroundImage` 两者都
满足才生效。
（REQ-078）同一个悬浮工具栏里新增 `openQuickAddModal()` + "+"按钮
（不依赖 `state.settings.appearance.backgroundImage`，任何时候都
渲染）：默认日期取今天、默认开始时间取"现在"按 15 分钟取整，通过
`navigate(uiState.activeView, {modal:{...}})` 打开
`components/EventModal.vue`（不强制切视图，`EventModal.vue` 本来就是
独立于 `uiState.activeView` 的覆盖层，见该组件条目），解决"建事件
必须先切到日/周视图找到具体某一天再点格子"这个跨视图操作的麻烦。
（REQ-079）新增 `uiState.toolbarExpanded`（不持久化 UI 便利状态，
默认 `true`，和 `sidebarOpen` 同一类）+ 常驻的"更多"开关按钮
（`MoreHorizRound` 图标，不受 `toolbarExpanded` 本身影响、永远渲染），
"+"和透明化切换两个功能按钮都加了 `v-if="uiState.toolbarExpanded"`。
开关按钮固定放在模板里最后一个（`.floating-toolbar` 用 `right` 定位，
越靠后的子元素越贴近固定右边缘），展开/收起时功能按钮从它左侧
冒出来/收回去，开关本身位置不移动。

（REQ-017）`viewComponents` 新增 `plan: PlanPanel`，导航视图从 6 个增加
到 7 个（周/日/月/**计划**/体验库/设置/Google同步）。

（REQ-018）`viewComponents` 新增 `reward: RewardPanel`，导航视图增加到
8 个（周/日/月/计划/**奖励**/体验库/设置/Google同步）。

（REQ-060，用户要求"加个能切换到年视图的机制"）`viewComponents` 新增
`year: YearBoard`，导航视图增加到 9 个（周/日/月/**年**/计划/奖励/
体验库/设置/Google同步）；`uiState` 新增 `selectedYear`。

（REQ-020 新增点数结算触发逻辑，REQ-046 改为实时）`onMounted` 时调用
一次 `domain/rewards.settleCompletedBlocks(store)`；`useNow()`（模块级
单例的"当前时间"，每 30 秒刷新）+ `watch(now, () =>
settleCompletedBlocks(store))`——REQ-020 时期这里只 `watch` 日期是否
跨天（`getDateKey(now.value)` 变没变），今天的事件要等到明天才结算；
REQ-046 起改成每次 `now` 本身变化（也就是每 30 秒）都重新结算一次，
配合 `settleCompletedBlocks` 内部"今天的块看真实结束时间是否已过"的
判断，做到应用开着不刷新页面也能在事件结束后最多 30 秒内自动到账，
见 `domain/rewards.js` 顶部注释。`App.vue` 本身不调用 `useMessage()`
（技术限制：`useMessage()` 依赖的 `<n-message-provider>` 是这个组件
自己在模板里渲染出来的，不是祖先，子组件里能用而这里不能），所以结算
本身是静默的，没有 toast 提示，用户从"奖励"页面点数余额的变化间接
感知到。

（~~REQ-028 曾经在这里加过 `if (!state.meta.pointsResetAt)
resetPointsFromMonday(store)`~~，**REQ-046 已删除**：余额改成派生
计算后，`resetPointsFromMonday` 这个函数本身已经整个删除，见
`domain/rewards.js` 条目，这里配套的调用自然也删掉了。）

（~~REQ-031 曾经在这里加过 `if (!state.meta.rewardValuesRefreshedAt)
refreshRewardValuesFromSeedPrices(store)`~~，**REQ-067 已删除**：用户
要求把内置示例奖励种子数据整个清掉后，`refreshRewardValuesFromSeedPrices`
这个"对齐内置奖励到最新日元参考价"的函数本身已经整个删除（见
`domain/rewards.js` 条目），这里配套的调用和 `import` 一起删掉了；
`createDefaultState()` 也不再生成 `rewardValuesRefreshedAt` 这个幂等
标记字段，见 `state/persistence.js` 条目。）

（REQ-033）同一个 `onMounted` 里再加
`if (!state.meta.claimedRewardsClearedAt) clearClaimedRewards(store)`
——用户要求"奖励页面的已兑换数据帮我清理掉"，同样是一次性操作，同一套
幂等标记机制，和另外两个一次性操作互相独立。

（REQ-070）`onMounted` 和 `watch(now, ...)` 里都新增调用
`domain/recurringEvents.extendAllRecurringSeries(store)`——不是"只执行
一次"的幂等操作（和上面几个不同，没有 `meta.xxx` 标记），因为它要
追的目标"今天 + 一年"本身每天都在变，需要反复检查。放进 `onMounted`
覆盖"重新打开应用"这个主要场景，同时挂进已有的 30 秒 `watch(now,...)`
tick 里覆盖"长时间开着标签页不关、正好跨过续期边界"这种少见场景——
函数内部已经做了"没有规则需要更新就直接 return、不触发
`store.setState()`"的判断，高频调用的开销可以忽略，不需要额外节流，
见 `domain/recurringEvents.js` 条目。

（REQ-072）`onMounted` 里最先执行
`if (consumeRedirectToken()) navigate('sync')`——Google 登录改成整页
跳转后（见 `calendar/googleAuthClient.js` 条目），跳转回来是全新一次
应用启动，`uiState.activeView` 会重置回默认的 `'week'`；这里检测到
这次加载确实是刚登录成功回来的，就直接跳回"Google 同步"页，让"登录
完成"有一个立刻看得见的反馈——呼应用户反馈过的"登录完成之后页面没有
显示已登录状态"这个体验问题。放在 `onMounted` 最前面执行，在其它
一次性初始化逻辑之前，纯粹是顺序上的自然选择（不依赖其它初始化先
完成），没有实际的先后依赖关系。

（REQ-027，响应式适配）`uiState` 新增 `sidebarOpen: false`——只在窄屏
（`css/layout.css` 的 `max-width:900px` 断点）下有意义，控制侧边栏抽屉
是否展开，宽屏下这个字段不影响任何样式。模板里 `.app-shell` 内新增两个
元素：一个恒定存在于 DOM、靠 CSS `display:none` 在宽屏隐藏的
`.sidebar-toggle` 汉堡按钮（点击切换 `uiState.sidebarOpen`），和一个
`v-if="uiState.sidebarOpen"` 控制的 `.sidebar-backdrop` 遮罩层（点击
收起抽屉）。用户明确选择"窄屏侧边栏改汉堡菜单抽屉"而不是"只是变窄"或
"底部 Tab 栏"，具体断点/交互设计见 `css/layout.css` 里 `.sidebar`/
`.sidebar-toggle`/`.sidebar-backdrop` 相关注释。新增
`import { useI18n } from 'vue-i18n'` + `const { t } = useI18n()`
（之前 `App.vue` 没用过 `t`，汉堡按钮的 `aria-label` 需要）。

## src/components/SidebarNav.vue
- 四阶段进度条（当前阶段高亮，逻辑同旧版，标题走 `t('domain.phase.'+
  phase)`；REQ-006 把 `sidebar.phaseCurrent` 文案改得更明确，写清楚是
  "阶段内第几周"）+ 导航改用 Naive UI 的 `<n-menu :options>`（REQ-005：
  原来是手写 `<button class="nav-item">` 循环，并不是真正的 Naive UI
  组件，换成 `n-menu` 才有正确的选中态/hover 过渡）+ 底部主题切换
  `<n-button quaternary>`（点击直接 `store.setState` 切换
  `settings.theme`）。语言选择器 REQ-006 挪到了
  `components/LanguageSwitcher.vue`，这里不再有。
- （REQ-007）导航图标和主题切换图标从 emoji 换成 `@vicons/material`
  的 Material Design 图标（Round 风格）。`n-menu` 的 `options[].icon`
  字段要求一个返回 vnode 的函数，用
  `renderIcon(icon) { return () => h(NIcon, null, {default:()=>h(icon)}) }`
  这个小helper 包一层；普通模板里直接用图标组件作为标签即可（如
  `<n-icon><LightModeRound /></n-icon>`），不需要这层包装——两种用法
  在这个项目里都出现，别混淆。全项目用到的图标名单见
  `docs/CHANGELOG.md` REQ-007 条目，新增图标前先用 WebFetch 核对
  `unpkg.com/@vicons/material@<version>/es/<Name>.js` 真实存在
  （见 `docs/KNOWLEDGE.md`"引入第三方包的具名导出前先核实存在"）。
- （REQ-016）阶段进度条的 `phaseInfo` 计算改用
  `domain/goals.computePhaseWeeksFromGoals(props.state.goals)` 现算
  `phaseWeeks`，不再直接读 `settings.phaseWeeks`（这个字段已经删除）。
- （REQ-017）`NAV_ICONS`/`NAV_VIEWS` 新增 `plan: FlagRound`，导航项排在
  "月度视图"之后、"体验库"之前。`phaseInfo` 的计算逻辑本身不变（依然调
  `computePhaseWeeksFromGoals`），只是往后 `props.state.goals` 会一直是
  空数组（"长期目标"UI 入口被"计划"取代，见 `SettingsPanel.vue` 条目），
  阶段周数因此会一直落回兜底的 13 周，这是预期内的结果。
- （REQ-018）`NAV_ICONS`/`NAV_VIEWS` 新增 `reward: CardGiftcardRound`，
  紧跟在"计划"后面——奖励是计划的配对数据，两个导航项排在一起。
- （REQ-027，响应式适配）根节点 `<aside class="sidebar">` 新增
  `:class="{ 'sidebar--open': uiState.sidebarOpen }"`，配合
  `css/layout.css` 窄屏断点下的 `transform` 过渡实现抽屉展开/收起。
  `onMenuUpdate(key)` 从只调 `props.navigate(key)` 改成
  `props.navigate(key, { sidebarOpen: false })`——窄屏下点导航项之后顺带
  收起抽屉，不然切完视图还得再点一次汉堡按钮/遮罩层才能看到内容。宽屏下
  多带的这个字段不影响任何样式，没有副作用。
- （REQ-057）用户反馈"当前阶段：进阶阶段（第 9 周 / 阶段共 13 周）"这行
  文字没必要，删掉了 `.phase-progress__label`（对应 i18n key
  `sidebar.phaseCurrent`，已从三个语言文件里一并删除）。四阶段色块进度条
  （`.phase-progress__bar`，当前阶段高亮 + hover 显示阶段名）和下面的
  "全年进度 N%"（`.phase-progress__year`）保留——只去掉了这一行具体到
  "第几周/阶段共几周"的文字说明，`phaseInfo` 这个 computed 本身
  （`getPhaseForDate`）还在用，驱动色块高亮和全年百分比计算，底层四阶段
  年度系统（探索/筛选/进阶/记忆）没有被移除，只是这一处文字展示被去掉。
- （REQ-060）`NAV_ICONS`/`NAV_VIEWS` 新增 `year: GridViewRound`，排在
  "月度视图"之后、"计划"之前——和周/月视图同属"日历类视图"，逐级放大
  着看比夹在计划/奖励这类"内容管理"类视图中间更符合直觉；图标特意选了
  和月视图的单张日历图标 `CalendarMonthRound` 区分明显的 12 宫格网格
  图标，避免两个导航项看起来太像。

## src/components/LanguageSwitcher.vue（REQ-006，新增；REQ-008 改挂载位置）
- `props:{state}`，纯展示 + 交互，没有自己的 emits。渲染
  `SUPPORTED_LOCALES`（来自 `i18n/index.js`）三个缩写按钮（中/EN/日，
  `title` 属性是完整语言名），当前语言高亮，点击直接
  `store.setState` 写 `settings.locale`。组件本身逻辑自 REQ-006 起未变；
  挂载位置变过一次：REQ-006 时固定在视口右上角（`.language-switcher`
  配 `position:fixed`），REQ-008 按用户反馈改成挂载进
  `SettingsPanel.vue` 的"语言"分区里，`.language-switcher` 对应改成
  `display:inline-flex` 的普通行内胶囊（`css/layout.css`），不再悬浮。

## src/components/WeekBoard.vue（REQ-006 整体重写渲染方式）
- 不再是"每天一列、卡片堆叠"的 Notion 风格看板，改成和
  `DayTimeline.vue` 共用同一套 `.timeline-block` 视觉、按小时绝对定位的
  7 天并排时间轴网格（新增 `.week-timeline*` 系列 CSS，
  `css/timeline.css`）——这样才能"看出安排具体在哪个时间段"，是这次
  改动的主要诉求。原来承载单个卡片渲染的 `ActivityCard.vue` 姊妹组件
  `BlockCard.vue` 因此变成死代码，已删除，时间块直接在 `WeekBoard.vue`
  模板里内联渲染（复用 `.timeline-block` class，不需要单独组件）。
- 拖拽：`onDrop` 现在除了换天，也会按放下位置的纵坐标换算新的开始时间
  （`moveBlock(blockId, fromKey, toKey, newStart)`），包括同一天内拖拽
  改时间（原来同天拖拽是空操作，因为卡片列表不表达时间位置；现在块
  本身有了绝对时间位置，同天拖拽理应也能调时间）。
- 新增点击网格空白处直接开建事件表单（`onDayGridClick`，复用
  `DayTimeline.vue` 同款 `@click.self` + 纵坐标换算小时的写法）。
- 「+ 新建周期计划」按钮（`openRecurringShortcut`）：不用先点进某一天，
  直接从周视图头部打开 `EventModal.vue` 的创建表单，
  `dateKey` 取本周内的"今天"（若本周不含今天则取周一），`defaultStart`
  取当前小时，并带上 `modal.recurrenceEnabled = true` 让"设为周期事件"
  默认勾选。**（REQ-015 已删除这个按钮和 `openRecurringShortcut`，见
  下方 REQ-015 条目；周期事件仍然可以通过正常打开创建表单、手动勾选
  「设为周期事件」来创建，只是没有这个快捷入口了。）**
- 今天那一列显示"现在"横线（`useNow()`，逻辑同 `DayTimeline.vue`）。
- 「生成本周计划」按钮调用
  `domain/scheduler.generateWeeklyPlan` + `domain/dayPlanner.planWeekDays`
  （读取 `calendar/sessionState.getBusyMap()` 避让冲突）并一次性
  `store.setState` 写回，随后循环调用 `activityPool.markScheduled`——这些
  连续的 `setState` 会被 Vue 的响应式调度和 `store.js` 里的持久化防抖
  自动合并，不需要手工改造成单次批量写入。跨天拖拽用原生
  `@dragstart`/`@dragover.prevent`/`@drop`，拖拽悬停时目标列高亮
  （`.drop-target`，对应旧版 `dragDrop.js` 的视觉反馈）。「清空本周安排」
  按钮（`<n-popconfirm>` 二次确认，REQ-004）把当前周 7 天的
  `dayTimelines` 全部置空并移除该周的 `weeklyPlans` 记录。
  （REQ-005）`generateWeeklyPlan` 返回的结构化 `warnings`（
  `{key, params}`）在这里通过 `translateWarning()` 按 `week.
  warningCooldown`/`week.warningPool` 翻译成当前语言再用
  `message.warning()` 展示，`params.category` 这个标识符本身也会先
  经过 `t('domain.category.'+category)` 转成本地化名称再插值进模板。
  **（REQ-015 已删除「生成本周计划」「清空本周安排」这两个按钮和
  `handleGenerate`/`handleClearWeek`/`translateWarning`，见下方 REQ-015
  条目；`domain/scheduler.js`/`domain/dayPlanner.js` 里被调用的函数
  本身没有删除，只是暂时没有 UI 入口调用了。）**
- （REQ-009）时间轴范围从 `dayPlanner.DAY_RANGE`（7-23 点）换成
  `constants/timelineRange.TIMELINE_RANGE`（全天 0-24 点），高度/定位
  的像素→百分比改造与拖拽换算方式和 `DayTimeline.vue` 同一套逻辑，见
  该组件条目下的 REQ-009 说明，不重复展开。
- （REQ-010）同步 `DayTimeline.vue` 的改动：`hours`/`blockStyle()`/
  `nowTop`/`onDrop`/`onDayGridClick` 换成 `toDisplayOffset`/
  `fromDisplayRatio`（6 点开始画），`blockStyle()` 的 `height` 用
  `calc(X% - 2px)` 留块间间隙。周视图的块本来就只显示标题（没有时间/
  类型这两行），不需要 `DayTimeline.vue` 那个"标题+时间合并一行"的
  模板改动，只有 `.timeline-block__title` 的字号/间距因为共用 CSS
  跟着变了。
- （REQ-011）`blockStyle()` 同步换成 `displayStartHour(block)` 做起点
  留白、间隙从 `calc(X% - 2px)` 调到 `calc(X% - 4px)`；日期头新增
  `holidayInfo(date)`，日期数字变色（放假红色/调休静音色），完整假日名
  放进 `.week-timeline__day-header` 的 `title` 属性做原生 tooltip，
  周视图空间紧张，不像日/月视图那样直接展示文字。
- （REQ-014）`blockStyle(block, dayBlocks)` 签名新增第二个参数（当天
  全部块的数组，来自模板里的 `blocksForDate(date)`），内部调用
  `utils/blockOverlap.computeBlockLayout(dayBlocks)` 算出这个块是否要
  和别的块分栏显示，逻辑和 `DayTimeline.vue` 共用同一个工具函数，见
  `utils/blockOverlap.js` 的模块条目。
- （REQ-020，bug 修复）分栏样式改用 `utils/blockOverlap.columnBoxStyle()`
  支持任意列数，和 `DayTimeline.vue` 同一处改动，见该组件条目和
  `utils/blockOverlap.js` 模块条目，不重复展开。
- （REQ-021，bug 修复）`blockStyle()` 的可读性最小高度上限新增
  "`columns>1` 时不能超过自己真实高度"这条约束，和 `DayTimeline.vue`
  完全对称的同款改法，见该组件条目里的完整说明，不重复展开。
- （REQ-015）删除「生成本周计划」「重新生成」「清空本周安排」「新建
  周期计划」四个按钮和对应的 `handleGenerate`/`handleClearWeek`/
  `openRecurringShortcut`/`translateWarning` 函数，以及只被它们用到的
  `weekKey`/`plan` 这两个 computed；周视图头部右侧现在只剩阶段进度
  标签。清理了因此未使用的 import（`generateWeeklyPlan`/`planWeekDays`/
  `markScheduled`/`getBusyMap`/`AddRound`/`getISOWeekKey`）。用户明确
  要求删的是"按钮"不是"功能"，`domain/scheduler.js`/`domain/dayPlanner.js`
  里的函数本身当时没有删除，只是暂时没有调用方——**REQ-052 起
  `scheduler.js`/`noveltyEngine.js` 已整个删除，`dayPlanner.
  planWeekDays` 也已删除，这条历史记录仅供追溯当时的决定，不代表现状，
  见 REQ-052 条目。**
- （REQ-016）`phaseInfo` 改用
  `domain/goals.computePhaseWeeksFromGoals(props.state.goals)` 现算
  `phaseWeeks`，不再直接读 `settings.phaseWeeks`（已删除）。
- （REQ-017，bug 修复）`blockStyle()` 不再给块设固定的 CSS
  `minHeight:'18px'`——这个固定值在块自然高度（真实时长换算的百分比）
  比它小、且块后面紧跟着另一个不重叠的块时，会把撑高的部分啃到下一个
  块的起点，吃掉两者之间该有的 4px 视觉间隔（用户反馈"时间上紧邻的两个
  事件之间看不出间隔"的根因）。改成用 JS 找到当天排在这个块之后、且不
  与它重叠的下一个块（`dayBlocks.filter((b) => b.id !== block.id &&
  b.start >= block.end)` 取时间最近的一个），算出到它为止还有多少可用
  空间，用 CSS `min(max(calc(自然高度% - 4px), 18px), calc(可用空间% -
  4px))` 把"保证可读性的最小高度"钳制在这个空间以内，交给浏览器渲染时
  用真实像素计算，不需要 JS 现算容器高度。没有下一个块时行为不变（退化
  为 `max(calc(自然高度% - 4px), 18px)`）。`DayTimeline.vue` 的
  `blockStyle()` 是完全对称的同款改法，见该组件条目。
- （REQ-027，响应式适配）组件本身没有改动，纯 CSS：
  `css/timeline.css` 在 `max-width:900px` 断点下给 `.week-timeline` 加
  `overflow-x:auto`，`.week-timeline__day` 加 `min-width:90px`
  （`.week-timeline__days` 整体 `min-width:630px`），`.week-timeline__hours`
  改 `position:sticky; left:0`。用户明确选择"横向滚动、保留 7 列"而不是
  压缩列宽或窄屏下改单日视图——7 天并排一起看是这个视图的核心信息结构，
  不希望窄屏下丢失；小时刻度列固定在滚动容器左侧，不然横向滚动到周末
  那几天时刻度也跟着滚走，没法对照时间。
- （REQ-045，修复"跨 6 点分界线的块显示异常"；REQ-047 改成前半段挪去
  前一天渲染）新增 `renderItemsForDate(date)`：对 `blocksForDate(date)`
  里每个块调用 `constants/timelineRange.needsDisplaySplit()`，需要
  拆分的块只产出后半段（`{key, block, dateKey, segStart, segEnd,
  isClosing:true}`，`dateKey` 就是 `date` 自己）；同时还会看
  `addDays(date, 1)` 那一天的块，把它们里需要拆分的前半段借来一起产出
  （`dateKey` 是明天的日期，`isClosing:false`）。模板的 `v-for` 从遍历
  `blocksForDate(date)` 改成遍历这个函数的结果。`blockStyle(item,
  dayBlocks)` 第一个参数从 block 改成片段 `item`（`{block, segStart,
  segEnd}`），用片段自己的范围算 `top`/`height`，`dayBlocks`（第二
  参数，重叠分栏/nextBlock 判定用）只看这一天自己的块，不含借来的
  片段。`draggable` 新增 `item.isClosing && !needsDisplaySplit
  (item.block)` 两层条件——跨界的块整体禁用拖拽（原因见
  `constants/timelineRange.js` 条目），`moveBlock()` 里也加了同款
  `needsDisplaySplit` 防御性判断。点击（原来是无条件
  `navigate('day',{selectedDate:date})`）改成
  `navigate('day',{selectedDate:parseDateKey(item.dateKey)})`——借来
  显示在"前一天"那一列的凌晨片段，`item.dateKey` 是它真实所在的那
  一天（不是当前列的 `date`），点击会正确跳到那一天，不会跳错。和
  `DayTimeline.vue` 是同一套拆分方案的两处独立实现（模板结构不同，
  没有抽出共用组件），细节见该组件条目，这里不重复展开。
- （REQ-057）删掉了 `.view-header` 右侧那个显示"当前阶段 · 第 N 周
  （共 M 周）"的 `<n-tag>`（对应 i18n key `week.phaseTag`，已从三个
  语言文件删除），连带清掉了只为这个标签服务的 `phaseInfo` computed 和
  `getPhaseForDate`/`PHASE_COLORS`/`computePhaseWeeksFromGoals` 三个
  import——这几个在本文件里除了这个标签没有其它用途，不是死代码残留。
  `.view-header__right` 容器本身也一并删除（没有其它内容了）；
  `.view-header` 是 `justify-content:space-between`，只剩左侧内容时
  自然靠左显示，不需要额外样式调整。跟 `SidebarNav.vue` 同一次改动
  （REQ-057），底层四阶段年度系统本身没有变化，只是这处重复展示被去掉
  （周视图和侧边栏此前会同时显示同一份"当前阶段第几周"信息）。

**关于其余组件的 i18n（REQ-005）**：`DayTimeline.vue`/`MonthBoard.vue`/
`ActivityLibraryPanel.vue`/`ActivityCard.vue`/
`SettingsPanel.vue`/`GoogleSyncPanel.vue`/`EventModal.vue` 都统一用
`useI18n()` 拿 `t()`（文案）/`tm()`（`domain.weekdayShort`/
`weekdayFull` 这类数组）/`d()`（`GoogleSyncPanel.vue` 里格式化"上次
同步"时间），原来散落在各组件里的 `RATING_ICONS`（表情符号，语言无关，
保留）之外的中文文案（如 `ENERGY_LABELS`/`FREQ_LABELS`/
`END_TYPE_LABELS`/`WEEKDAY_OPTIONS` 的 label）全部改成从 i18n 的
`domain.energy.*`/`domain.recurrenceFreq.*`/`domain.recurrenceEnd.*`/
`domain.weekdayShort` 取，不再是组件本地写死的映射表；下面每个组件的
条目只记录这次连带改了什么结构性的东西，纯文案替换不逐条列出。

## src/components/DayTimeline.vue
- 小时级竖向网格（`constants/timelineRange.TIMELINE_RANGE`，全天 0-24
  点），逻辑与旧版 `ui/dayTimeline.js` 一致：块可拖拽移动/拖拽下边缘
  调整时长/删除，挂在活动上的块可标记 loved/neutral/skipped/hated；
  来自 Google 的块只读。拉伸交互仍然是"拖拽中直接改 `el.style`（不经
  Vue 响应式）、`mouseup` 才提交到 store"的写法，整合成组件内一个
  `startResize` 函数，不再依赖单独的 `dragDrop.js` 工具模块。点击网格
  空白处（`@click.self`）或头部「+ 添加事件」打开创建弹层；点击已有
  （非 Google）块打开编辑弹层，两者都通过
  `navigate('day', {modal:{...}})` 设置 `uiState.modal`。
- （REQ-009）时间轴高度不再是"每小时固定多少像素"的 JS 常量算出来的
  固定像素值，改成 CSS flex 铺满 `.day-view` 的可视高度（见
  `css/timeline.css` 顶部注释），小时格线/事件块的位置和高度全部改用
  百分比（相对 24 小时）。`onGridClick`/`onGridDrop`/`startResize` 这类
  需要把鼠标 Y 坐标换算成小时数的交互，改成在交互发生的当下用
  `getBoundingClientRect().height` 现算"每小时多少像素"，不能再假设一个
  写死的常量——这是这次改动里少数还留着像素计算的地方，其余都是纯 CSS。
- （REQ-006）查看的是今天时，网格上叠一条 `.now-line`"现在"横线
  （`useNow()` 提供的 `now` 驱动，30 秒刷新一次）；查看其他日期不显示。
- （REQ-006）新增 `toggleSkip(block)`：给块加/去掉 `status:'skipped'`
  字段（不删除），配 `.timeline-block--skipped` 样式（变淡 + 标题
  删除线）。这是"这一次没做"的记录，和活动评价的 skipped 评分是两个
  独立概念（评价影响活动未来的排程权重），对没有关联活动库条目的手动/
  周期事件块（没有 `activityId`，因此不会显示评价按钮行）也适用，
  按钮图标特意用 🚫 而不是复用评价行的 ⏭️ 避免混淆。
- （REQ-010）块内布局从"时间+类型一行、标题另起一行"改成"标题+时间
  合并一行（`.timeline-block__title-row`）、类型退到下面单独一行"，
  根因是短时长块在旧的两行结构下，可用高度连一行字都放不下，标题被
  `overflow:hidden` 整个裁没——不是字号问题，是结构问题，见
  `css/timeline.css` 里 `.timeline-block__title-row` 上方的注释。
  `hours`/`blockStyle()`/`nowTop`/`onGridClick`/`onGridDrop` 都改用
  `constants/timelineRange.js` 新增的 `toDisplayOffset`/
  `fromDisplayRatio`，让时间轴从 6 点开始画（该文件里有已知局限的
  说明，跨 6 点的块会显示偏短）。`blockStyle()` 的 `height` 用
  `calc(X% - 3px)` 而不是纯百分比，给无缝衔接的相邻块之间留一条固定的
  视觉间隙。
- （REQ-011）`.timeline-block__type`（类型文字）连模板带 CSS 一起删掉
  了，类型只靠块左边框颜色区分。`.timeline-block__title-row` 加了
  `padding-right`，给右上角的跳过/删除按钮让位，之前时间文字会写到
  按钮底下。块间间隙从 `calc(X% - 3px)` 调到 `calc(X% - 5px)`。
  `blockStyle()` 改用 `timelineRange.js` 新增的 `displayStartHour(block)`
  而不是裸的 `block.start`，做"起点留白"这个展示性微调，见该常量文件
  里的说明。（REQ-011 时 `displayTimeLabel()` 也一度读这个值，REQ-012
  已改回真实值，见下一条。）
- （REQ-012）`displayTimeLabel(block)` 改回直接用 `block.start`/`end`
  的真实值，不再经过 `displayStartHour()`——REQ-011 让时间文字标签也
  跟着"起点留白"错开显示，用户反馈点进 `EventModal.vue` 看到的真实
  时间和块上标注的时间对不上，看着奇怪，因此把这个效果收窄成只影响
  `blockStyle()` 的位置计算，不再影响任何文字内容。
- （REQ-011）新增 `holidayInfo` computed（`domain/holidays.getHolidayInfo(
  dateKey, region)`），日期标题旁用 `n-tag` 显示当天的节假日名（不同
  `type` 用 `error`/`default` 两种 tag 类型区分放假/调休上班）。
- （REQ-013）删掉了带 `recurringId` 的块下面那行"🔁 周期事件"标注
  （`.timeline-block__recurring-tag`，连同 `RepeatRound` 图标 import 和
  三个语言文件的 `day.recurringTag` key 一起删除，都不再被引用）。
  用户反馈同一类问题（占用块高度、不需要）已经处理过"类型"标注
  （见上面 REQ-011 条目），这次是同类问题的第二个实例。周期事件本身的
  创建/编辑/删除逻辑完全没变，只是不再在时间轴上单独标出来。
- （REQ-014）新增 `blockLayout` computed（`utils/blockOverlap.
  computeBlockLayout(blocks.value)`），`blockStyle()` 读取对应块的
  `{column, columns}` 并用 `columnBoxStyle()`（REQ-020 新增，见
  `utils/blockOverlap.js` 模块条目）换算成内联 `left`/`right`。数据
  层面本来就不会因为时间重叠发生覆盖——追加/原地更新 block 的逻辑
  （`EventModal.vue`/`recurringEvents.js`）从来没有"新建/移动到某个
  时间点就删掉原有块"这种代码，这条改动解决的纯粹是视觉问题。
- （REQ-017，bug 修复）`blockStyle()` 不再用固定的 CSS `minHeight:'20px'`，
  改成 JS 里找到当天排在这个块结束之后、且不与它重叠的下一个块，用 CSS
  `min(max(calc(自然高度% - 5px), 20px), calc(可用空间% - 5px))` 把最小
  可读高度钳制在到下一个块为止的可用空间内——原来的固定值在短时长块
  后面紧跟着另一个块时会撑高到吃掉两者间隔，详见
  `utils/blockOverlap.js` 隔壁的 `WeekBoard.vue` 条目（两边改法对称，
  完整原理写在那边，这里不重复展开）。
- （REQ-020，bug 修复）`columns===2` 那种只处理两列的写法改成调用
  `utils/blockOverlap.columnBoxStyle(column, columns)` 支持任意列数——
  原来的算法一个块同时和 2 个及以上其他块重叠时直接放弃分栏，典型场景
  "一个长事件内部嵌套两个互不重叠的短事件"会让三个块全部整行宽度叠在
  一起，用户反馈"跨度内有两个事件时显示有问题"，完整原理见
  `utils/blockOverlap.js` 模块条目，两个组件用的是同一个函数，这里不
  重复展开。
- （REQ-017）曾经新增过"标记完成"按钮，只在 `block.planId`/`keyEventId`
  指向的计划关键事件还没完成时显示，点击推进计划进度；REQ-019 把它
  泛化成所有非 Google 来源的块都能点；**REQ-020 把这个按钮整个删掉了，
  见下一条**——这三次改动叠在一起看，是"要不要手动点击才算完成"这个
  设计反复调整的完整过程，最终定型为 REQ-020 的"默认完成"。
- （REQ-020）删除"标记完成"按钮（`toggleDone`/`revertDone`/
  `findPlanKeyEvent` 曾经支撑这个按钮显示条件的 `pendingPlanKeyEvent`
  等函数）——用户明确要求"事件不需要完成点击，默认没有点击跳过就算
  完成"。点数原来是延迟一天批量结算（见 `domain/rewards.settlePastDays`，
  由 `App.vue` 挂载/跨天时调用），REQ-046 起改成实时判断资格
  （`settleCompletedBlocks`，由 `App.vue` 挂载和 `useNow()` 每次
  tick 都调用，见该函数/组件条目）。这个组件里现在只保留
  `findPlanKeyEvent`（供 `toggleSkip` 判断要不要联动撤销计划进度）。
  `.timeline-block__title-row` 的 padding 从三个按钮的 60px 改回两个
  按钮（跳过/删除）的 42px。
- **REQ-046**：点数余额改成派生计算后（见 `domain/rewards.js` 条目），
  `toggleSkip()`/`removeBlock()` 不再需要显式调用任何"退点数"的函数，
  `addPoints()` 这个专门做余额增减的函数本身也随之删除。
- **REQ-051**：`toggleSkip()` 现在的逻辑是——标记跳过时如果这个块的
  `pointsSettled` 是 `true`（REQ-051 起这个字段含义收窄为"有没有已经
  因为自己推进过关联的计划"，和点数完全脱钩，见 `domain/rewards.js`
  条目），把已经推进的计划进度用 `domain/plans.uncompleteLastKeyEvent`
  退回去，并把 `pointsSettled` 清回 `false`；取消跳过只把状态改回
  默认，不主动重新推进计划进度，交给下一次 `settleCompletedBlocks`
  自然处理。**不再需要清 `pointsAwarded`**（REQ-051 起这个字段已经不
  存在，点数每次现算，标记 `status:'skipped'` 这一步本身就足够让
  `computeRewardBalance()` 下次求和时自然排除这个块，不需要任何额外
  清理）。`removeBlock()` 本身（见 REQ-046 那条，已经简化成单纯的
  `filter` 删除）不联动撤销计划进度，沿用 REQ-019 时定下的简化取舍：
  删除只是拿掉记录，不等于"承认没做过"。
- （REQ-021，bug 修复）`blockStyle()` 的可读性最小高度上限
  （`min()`/`max()` 那套）只考虑了"下一个不重叠的块"（`nextBlock`），
  没考虑"左右分栏、时间上互相重叠的块"——比如 8:00-9:00 和 8:30-9:00
  这两个块互相重叠、各占一列，彼此都不会被对方算作 `nextBlock`，导致
  自然高度不到 20px 的 8:30-9:00 被下限撑高后，越过自己真实的结束
  时间，显示得比同一竖排的 8:00-9:00 更晚结束。`ceilings` 数组新增一项
  ——**只在 `columns>1`（这个块确实和别的块分栏）时**，加一条"不能超过
  `naturalHeight`（自己真实高度）"的上限；`columns===1` 的孤立块不受
  影响，仍然可以为了可读性撑得比真实比例高（REQ-010 的原始设计意图，
  这次修复不连带削弱）。`WeekBoard.vue` 是完全对称的同款改法。
- （REQ-045，修复"跨 6 点分界线的块显示异常"；REQ-047 改成前半段挪去
  前一天渲染，理由见文件顶部"用户明确要求'凌晨其实是显示在前一天'"）
  新增 `nextDateKey`/`nextDayBlocks` 两个 computed（明天的日期/明天的
  块），`renderItems` 现在看两天的数据：`blocks`（自己这天）里跨界的
  块只产出后半段（`{key, block, dateKey, segStart, segEnd,
  isClosing:true}`，`dateKey` 是自己这天）；`nextDayBlocks`（明天）里
  跨界的块把前半段借来产出（`dateKey` 是明天，`isClosing:false`）。
  模板的 `v-for` 从遍历 `blocks` 改成遍历 `renderItems`。
  `blockStyle(item)` 参数从 block 改成片段，用片段自己的
  `[segStart, segEnd)` 算 `top`/`height`；`blockLayout`（重叠分栏）
  继续只用"自己这天"的 `blocks`（真实未拆分）算，不含借来的片段
  （已知局限，极少见的边界情况叠加边界情况，不值得为它重新推导）。
  只有 `isClosing`（承载真实结束时间、且真实所在就是当前查看这天）的
  片段显示时间标注、评价/跳过/删除按钮和拉伸手柄、允许点击打开编辑
  弹层（模板 `@click` 从无条件改成 `item.isClosing &&
  onBlockClick(item.block)`）；借来的前半段只做视觉延续，不可交互——
  它真实的 `dateKey` 跟正在查看的日期不是同一天，可交互的话
  `onBlockClick` 内部沿用当前查看日期当 `dateKey` 会用错。两个片段
  共用同一个 `block` 对象，不引入任何新的关联字段，跳过/删除天然同时
  对两段生效。`draggable` 新增 `item.isClosing &&
  !needsDisplaySplit(item.block)` 两层条件，
  `moveBlock()`/`resizeBlock()`/`onBlockDragStart()` 里也加了同款
  `needsDisplaySplit` 防御性判断——这类块的拖拽/拉伸整体禁用，原因是
  这两个交互依赖的像素↔小时换算假设"渲染高度对应块的整个真实时长"，
  拆分后每段渲染的只是真实时长的一部分，这个假设不再成立；要调整这类
  块的时间只能通过点击打开编辑弹层直接改 `start`/`end`。
- ~~时间块右下角的评价按钮组（`findActivity(block.activityId)` 找到
  关联活动时显示，点击调用 `domain/activityPool.rateActivity`）~~
  **REQ-048 已删除**：`rateActivity`/活动的 `rating` 字段随"活动库"
  重做成"兴趣活动"一起从数据模型里删除（见 `domain/activityPool.js`
  条目），这里是唯一还在调用它的活代码（`block.activityId` 只有已经
  没有 UI 调用方的自动排程会赋值，实际运行中永远是 `undefined`，但这
  段按钮渲染代码本身是活的，删除依赖的函数必须同步清理这里，不能留着
  报错），连同 `RATING_ORDER`/`RATING_ICONS` 常量、`onRate()`/
  `findActivity()` 两个函数、`rateActivity` 的 import 一起删除。

## src/components/MonthBoard.vue（REQ-068：blocksForDate() 过滤掉周期事件实例）
- 月历网格（`utils/dateUtils.getMonthGridDates` 产出的 42 格，周一起始），
  每格显示日期数字 + 当天 blocks 的类型圆点（超过 4 个显示 `+N`，颜色取自
  `constants/colors.BLOCK_TYPE_COLORS`）；非本月日期视觉变暗，今天高亮；
  点击任意格子 `navigate('day', {selectedDate})` 跳转日视图。
  （REQ-068）`blocksForDate(date)` 现在会过滤掉 `block.recurringId`
  存在的块（周期事件的物化实例）再返回，只有一次性事件参与点数标注——
  用户反馈"月度页面主要是标注节假日之类的，周期事件不进行数量标注"：
  周期事件天天/每周重复出现，同一个事件在很多天里各占一个点，参考
  价值低，还挤占本就只有 4 个点位的展示空间；周期事件本身仍然能在
  点进日/周视图后看到，只是不再占月历格子的点位。
- （REQ-011）新增 `holidayInfo(date)`（`domain/holidays.getHolidayInfo`），
  日期数字下面多一行假日名（`.month-cell__holiday`），放假用红色、调休
  上班用淡化的静音色区分。
- （REQ-027，响应式适配）组件本身没有改动，纯 CSS：`.month-grid__cells`
  的 7 列本来就是 `fr` 单位的 CSS Grid，窄屏下会随视口天然收缩，不像
  周视图那样需要横向滚动；`css/components.css` 在 `max-width:900px`
  断点下只是把固定行高从 92px 降到 76px、格子内边距从默认收紧到 4px，
  避免变窄的列配上原来的高度显得"细高"不协调。

## src/components/YearBoard.vue（REQ-060，新增；REQ-068 热力图改成月度标语；REQ-069 补上节假日标注；REQ-074 修复"今天"高亮重复出现的遗留 bug）

职责：年度总览——一屏铺开当前选中年份的 12 张迷你月历，点某个月份
卡片跳月视图，点某一天跳日视图；每个月份卡片可以添加一句自由文本
标语（给月份目标做标记用）；节假日/调休格子有颜色标注。用户要求
"加个能切换到年视图的机制"，`nav.year` 排在 `nav.month` 后面，和周/月
视图同属"日历类视图"，逐级放大着看。
依赖：`utils/dateUtils.js`（`getYearStart`/`addYears`/`getMonthGridDates`/
`getDateKey`/`getMonthKey`，最后一个是 REQ-068 新增，见该文件条目），
`state/store.js`（`store.setState` 写 `monthLabels`），
`domain/holidays.js`（`getHolidayInfo`，REQ-069 新增依赖，和
`MonthBoard.vue`/`WeekBoard.vue` 共用同一份静态数据）。

- `props:{state, uiState, navigate}`，和 `MonthBoard.vue`/`WeekBoard.vue`
  同一套约定；`uiState.selectedYear`（`App.vue` 新增的字段，默认
  `getYearStart(new Date())`）决定当前显示哪一年。
- `monthsInYear` computed：12 份 `{month, start, key, gridDates}`
  （`key` 是 REQ-068 新增的 `getMonthKey(start)`），`gridDates` 直接
  复用 `MonthBoard.vue` 同款的 `getMonthGridDates(start)`（42 格，
  周一起始，补齐月首/月末）——年视图不重新发明月历网格算法，只是把它
  铺 12 份、渲染方式不同（格子小很多，放不下假日名文字/事件圆点这类
  细节，属于别的月份的补位格子直接渲染成空白且不可点，不像月视图那样
  把它们淡化显示成真实日期——年视图一屏信息密度已经很高，这一层细节
  留给点进去之后的月/日视图）。
- ~~`dayIntensity(dateKey)`：数当天 blocks 排除 Google/跳过后剩几条，
  映射成 0~4 五档热力图色阶~~ **REQ-068 已整个删除**：用户反馈"不要
  标注事件颜色深的深度"，不再有任何按数量深浅染色的逻辑；配套的 CSS
  五档色阶、底部 `.year-legend` 图例、i18n 的
  `year.legendLess`/`legendMore` 一并删除。
- `holidayInfo(date)`（REQ-069，新增）：`getHolidayInfo(getDateKey(date),
  settings.region || 'CN')`，和 `MonthBoard.vue`/`WeekBoard.vue` 里同名
  函数逻辑完全一样。`.year-day` 格子现在有
  `year-day--in-month`/`year-day--blank`/`year-day--today`/
  `year-day--holiday`/`year-day--workday` 五种状态（后两个可以和前三个
  叠加），放假态染 `--danger` 红色背景，调休上班态描一圈 `--text-muted`
  边框——格子太小放不下假日名文字，改用原生 `title` 属性 hover 提示，
  不引入额外的弹层/tooltip 组件。CSS 里 `.year-day--today` 特意写在
  `.year-day--holiday`/`.year-day--workday` 后面，同一天既是"今天"又
  被标了节假日这种罕见情况下，"今天"的描边优先生效。
- ~~`year-day--today` 的判断条件只比较 `getDateKey(date) === todayKey`，
  没有像 `year-day--holiday`/`year-day--workday` 那样加
  `date.getMonth() === m.month` 这层限制~~ **REQ-074 已修复**（REQ-060
  上线时就有的遗留 bug，用户截图反馈后才发现）：42 格网格里属于"上/下
  个月"的补位格子，本质上是相邻月份卡片里已经真正渲染过一次的同一个
  日期——"今天"恰好落在某张卡片的补位区域时（每年大概率会撞上几次），
  两张卡片会同时显示"今天"高亮，其中一张（补位格所在的那张）是错的。
  补上月份判断后，补位格子（`year-day--blank`）不会再显示任何状态
  标记，和"节假日"这两个状态类保持一致的写法。
- 月度标语（REQ-068，新增，取代上面删掉的热力图）：`monthLabel(key)`
  从 `state.monthLabels` 读文本；`editingMonthKey`/`labelDraft` 两个
  `ref` 管理"同一时间只有一个月份卡片处于编辑态"（和 `PlanPanel.vue`
  的追加关键事件表单是同一类"单份草稿"写法）。`startEditLabel(key)`
  进入编辑态；`saveLabel(key)` 由 `@keyup.enter`/`@blur` 触发，开头有
  `editingMonthKey.value !== key` 的前置判断防止重复/误保存（详见组件
  内注释——`n-input` 靠 `v-if` 卸载会紧跟一次原生 blur，这个判断让
  "Esc 取消后紧跟的 blur"和"回车保存后紧跟的 blur"都安全地变成空
  操作）；`cancelEditLabel()` 由 `@keyup.esc` 触发，只清空编辑态、不
  写 state。文本为空（trim 后）时 `saveLabel()` 会把这个 key 从
  `monthLabels` 里删掉，不存空字符串。输入框用 `n-input` 自带的
  `autofocus` prop 在进入编辑态时自动聚焦。UI 上未设置标语时 hover
  显示"+ 添加标语"幽灵按钮（`EditRound` 图标 + 文字），已设置时显示
  为一行强调色小字（`text-overflow:ellipsis` 截断过长文本），点击文字
  重新进入编辑态；标语区域整体 `@click.stop`，避免点击它的同时触发
  月份卡片本体的 `navigate('month', ...)` 跳转。
- 月份标题文字（`.year-month__title`）走新增的 `tm('domain.monthShort')`
  数组（12 个月份短名，和已有的 `domain.weekdayShort`/`weekdayFull`
  是同一套"数组按 i18n 语言切换"写法），不是拼接数字加"月"这种只对
  中文/日文成立的写法——英文版是 `Jan`/`Feb`/... 这类月份缩写。

## src/components/ActivityLibraryPanel.vue（REQ-048 从"活动库"重做为"兴趣活动"；REQ-049 调整筛选区位置和网格列数；REQ-050 搜索/类别筛选重新设计；REQ-058 类别名跟着语言切换；REQ-082 去掉类别筛选，只剩标题搜索）

标题模糊搜索框（`n-input`，子串匹配，不是拼写纠错式的真模糊）独立成
页头下面一行 `.activity-library__filters`（`css/components.css`，flex
水平居中）——REQ-048 实现时最初放在 `view-header__right`（页头右上角，
和"添加活动"按钮并排），用户反馈"不要放右上角，放页面里面居中"，
REQ-049 挪了位置，`view-header__right` 现在只留"添加活动"按钮。
- （REQ-050）用户反馈原来的搜索框"样式太简陋"，重新设计：
  `.activity-library__search` 加了 `round`/`size="large"` +
  `--shadow-elevation-1/2` 悬浮态阴影分层，呼应 REQ-007"卡片类容器靠
  阴影分隔层次"的整体视觉方向。
- ~~REQ-050~058 期间这里还有一整套类别筛选：从单选下拉框改成"直接
  平铺全部 8 个类别、可多选"的 chip 行（`filterCategories`
  数组 + `toggleCategory()`），REQ-053 类别改成动态数据后进一步拆成
  "最常用的按 `useCount` 降序铺成 chip（`topCategories`，
  `TOP_CATEGORY_COUNT=6`）+ 其余塞进一个可多选下拉框
  （`overflowCategories`/`overflowSelected`）"，`activities` computed
  把类别筛选和标题搜索两个条件叠加过滤。~~ **REQ-082 应用户要求
  "分类搜索的功能去除掉，搜索时的根据标题匹配搜索就行"，这一整套
  （`filterCategories`/`sortedCategories`/`topCategories`/
  `overflowCategories`/`overflowCategoryIds`/`overflowOptions`/
  `toggleCategory()`/`overflowSelected`，连同模板里的 chip 行/更多分类
  下拉框）整个删除**：`activities` computed 现在只剩一个条件——
  `searchQuery` 对 `a.title.toLowerCase()` 做 `includes`。
- 展示区是横屏卡片网格（`.activity-grid`，固定 4 列，见 REQ-049 关于
  列数的说明和 `ActivityCard.vue` 条目）。原来页面顶部的内联
  增/改表单（`formOpen`/`draft` + Naive UI 表单控件）整个删除，改成
  点击后弹出 `ActivityModal.vue`——这个组件多了内容（含上传 .md 文件）
  这个新字段（~~原来还有链接~~ REQ-081 起已删除，~~原来还有分类~~
  REQ-082 起已删除，见该组件条目），表单本身也比原来复杂，弹层比内联
  更聚焦。`modalTarget`（`null`=不显示，字符串 `'new'`=新建，一个真实
  的 activity 对象=查看/编辑）是这个面板自己的局部 `ref`，没有像
  `EventModal.vue` 那样挂到 `App.vue` 的全局 `uiState.modal` 上——这个
  弹层只在这一个页面内使用，不需要跨组件共享，局部状态更简单。卡片
  右上角的快捷删除（`handleQuickDelete`，经 `ActivityCard.vue` 自己的
  `<n-popconfirm>` 二次确认）和弹层里的删除（`ActivityModal.vue` 自己
  的 `<n-popconfirm>` + `removeActivity`）是两条独立入口，分别处理，
  不共用同一个函数——弹层内部直接调用 `domain/activityPool.js`，不需要
  这个父组件转发。~~（REQ-053）`ActivityCard`/`ActivityModal` 都新增了
  `categories` prop，这个面板把 `state.activityCategories` 原样转发
  下去~~ **REQ-082 这两个 prop 随分类功能一起整个删除**，两个子组件
  不再需要类别数据。

## src/components/SettingsPanel.vue（REQ-075 背景图片新增"浏览本地文件"；REQ-076 去掉透明度调节；REQ-077 背景图片展示打磨 + 启用勾选框）
- 年度起始日（`n-date-picker`）、工作时间/工作日（`n-checkbox-group`）；
  组件内 `reactive` 草稿（`draft = {yearStart, workStart, workEnd,
  workDays}`）+ 显式「保存设置」/「撤销未保存的修改」两个按钮，草稿在
  组件挂载时从当前 store 值初始化一次。（REQ-016 之前这里还有"阶段
  周数"的 `n-input-number` 网格，已删除，见下方 REQ-016 条目；"每阶段
  类别配额表格"REQ-048 已删除，见下方该条目；"防重复冷却周期"设置项
  REQ-052 已删除，`draft` 不再包含 `cooldownWeeks`，见 REQ-052 条目。）
- （REQ-008）新增"语言"分区，直接挂载 `<LanguageSwitcher :state="state"
  />`（见 `components/LanguageSwitcher.vue`）。这个分区不走 `draft`/
  「保存」流程——`LanguageSwitcher` 内部点击即 `store.setState`，是
  即时生效的设置项，和这个页面其余"改草稿、点保存才生效"的字段不是
  同一套交互模式，未来如果再往这个分区加即时生效类设置，保持这个约定。
- （REQ-011）新增"外观"分区（字体 `n-select`、强调色 `n-color-picker`
  + 「跟随主题默认」重置按钮、~~背景图 URL `n-input` + 透明度
  `n-slider`~~ **REQ-076 起透明度 `n-slider` 已删除，见下方 REQ-076
  条目**）和"地区"分区（`n-select`，驱动 `domain/holidays.js`）。和
  "语言"分区一样是即时生效（`updateAppearance(patch)`/
  `updateRegion(region)` 直接 `store.setState`，不进 `draft`）。
  `n-color-picker` 是这次新用到的 Naive UI 组件标签，官方文档页请求
  404，退而用 GitHub 源码 `naive-ui` 的 `src/components.ts` 确认了
  `color-picker` 这个组件目录真实存在——这类全局注册的模板标签风险比
  具名 JS 导入低（标签名写错只是控制台警告，不会导致整个应用起不来），
  没有再进一步核实每个 prop 名称。
- （REQ-076）~~背景图透明度滑块（`appearance.backgroundOpacity`，
  默认 20%，`v-if="appearance.backgroundImage"` 控制显示）~~ **已整个
  删除**：用户反馈"背景图的效果不用设置透明化"。配套的
  `App.vue` `backgroundStyle` 不再应用 `opacity`（浏览器默认 100% 不
  透明），`state/persistence.js` 的 `createDefaultState()` 不再生成
  这个字段，三个语言文件的 `backgroundOpacityLabel` 一并清理。
- （REQ-075）背景图 URL 输入框旁边新增"浏览本地文件"按钮
  （`triggerBackgroundFilePicker()` 点击隐藏的
  `<input type="file" accept="image/*">`）：`handleBackgroundFileChange()`
  校验 `file.type`/`file.size`（上限 `MAX_BACKGROUND_IMAGE_BYTES`，
  8MB）后，用 `FileReader.readAsDataURL()` 把文件转成 base64 的
  `data:` URI，写进和 URL 输入框同一个 `appearance.backgroundImage`
  字段——CSS `url()` 原生支持 `data:` URI，`App.vue` 的
  `backgroundStyle` 不需要为这个来源单独处理，两种输入方式（粘贴 URL/
  选本地文件）后写入的一方生效，互不冲突。体积上限是因为这个字符串
  会跟着整份 state 一起进本地数据库、也会出现在"导出全部数据"的 JSON
  里，不加限制的话一张大图会明显拖慢这两者。
- （REQ-077）背景图这一块继续打磨：新增 `isBackgroundImageDataUri`
  computed（判断 `backgroundImage` 是否以 `data:` 开头）——是的话不再
  把可能近 11MB 长的原始字符串塞进 `n-input` 显示，改成一句
  `.background-image-local-label` 友好提示；不是（外部 URL）则继续用
  可编辑的 `n-input`。新增 36×36 的 `.background-image-preview` 缩略图
  （两种来源共用）。新增"启用背景图片" `n-checkbox`，`:checked` 直接
  派生自 `!!appearance.backgroundImage`（不额外存一个独立的 enabled
  字段，避免"勾选框亮着但其实没图"这种状态不一致）：
  `onToggleBackgroundImage(checked)` 取消勾选时清空
  `backgroundImage`，勾选时直接调用 `triggerBackgroundFilePicker()`
  唤起文件选择器。
- （REQ-016，**REQ-017 已整个删除，见下一条**）"年度与阶段"分区里原来
  手填每阶段周数的 `n-input-number` 网格删掉了，新增独立的"长期目标"
  分区：顶部按阶段显示 `domain/goals.computePhaseWeeksFromGoals(state.goals)`
  现算出的周数（只读，`state.goals` 一变就自动更新）；中间是目标列表
  （`n-input-number` 可编辑 `weekBudget`、`n-button` 删除）；底部是新增
  目标的表单（`n-input`/`n-select`/`n-input-number`/`n-button`，本地
  `goalDraft` 草稿只用于填表，提交后立刻清空，不是"年度与阶段"那种
  draft/保存模式）。这个分区整体和"语言"分区一样即时生效
  （`createGoal`/`updateGoal`/`deleteGoal` 直接操作 store），不进
  `draft`。
- （REQ-017）上面 REQ-016 新增的"长期目标"分区整个删除（含
  `createGoal`/`updateGoal`/`deleteGoal`/`computePhaseWeeksFromGoals`
  的 import、`phaseOptions`/`phaseWeeksPreview`/`goalDraft` 及
  `addGoal`/`setGoalWeekBudget`/`removeGoal` 三个函数），用户明确要求
  "计划取代长期目标"，管理界面挪到新的 `components/PlanPanel.vue`。
  `domain/goals.js` 模块本身、`state.goals` 字段、`SidebarNav.vue`/
  `WeekBoard.vue` 里仍在调用的 `computePhaseWeeksFromGoals()` 都没有
  删除，见 `domain/goals.js` 条目（原文提到的 `scheduler.js` 调用方已随
  REQ-052 一起删除）。
- （REQ-019，REQ-022 拆成平日/周末两个输入框）新增"奖励点数"分区，两个
  `n-input-number`（平日/周末各一个）即时生效地调整
  `settings.pointsPerHourWeekday`/`pointsPerHourWeekend`
  （`updatePointsPerHour(key, value)`，`Math.max(0, ...)` 钳制非负），和
  "语言"/"外观"/"地区"这几个分区一样不进 `draft`/保存流程。位置排在
  "年度与阶段"之前——这是个相对独立的数值型设置，不需要和年度/工作时间
  那些排程规则字段放在一起。
- ~~（REQ-026）"数据恢复"分区~~ **REQ-029 已整个删除**：曾经紧跟在
  "语言"分区之后，一段说明文字 + `<n-button type="warning">`「从旧版本
  恢复数据」+ `<n-popconfirm>` 二次确认，`handleRestoreLegacy()` 调用
  `state/store.js` 的 `restoreFromLegacyBackup()`。用户确认真实数据已经
  用这个按钮成功恢复，明确要求删除，连同脚本里的 `handleRestoreLegacy`
  函数、`restoreFromLegacyBackup` 的 import、三个 locale 文件里的
  `dataRecovery*` key 一并删除，见 `state/store.js` 条目。
- （REQ-027，响应式适配）"每阶段类别配额"分区的 `<table class="quota-table">`
  外面包了一层 `<div class="table-scroll">`（`css/components.css` 的
  `overflow-x:auto`，无媒体查询限制，只有内容真的超出容器宽度时才出现
  滚动条），避免窄屏下 5 列（阶段名 + 4 个类别的输入框）挤在一起把父容器
  撑破或内容被截断。同款包装也用在 `RewardPanel.vue` 的两个表格上。
- ~~（REQ-041，REQ-042 加反向读取按钮）"数据库镜像到本地文件夹（实验性）"
  分区~~ **REQ-044 已整个删除**（连同 `fileSyncSupported` 等六个 `ref`、
  `refreshFileSyncStatus`/`handlePickDirectory`/`handleReauth`/
  `handleMirrorNow`/`handleClearDir`/`handleLoadFromFolder` 六个函数、
  因此变成未使用的 `onMounted` 导入和 `useI18n()` 的 `d`），用户明确
  要求去掉这个需要 Chromium 系浏览器 + 持续目录授权的实验性功能，见
  `docs/CHANGELOG.md` REQ-044 条目。下面 REQ-043 的"数据导出/导入"分区
  不受影响，是现在唯一的手动备份手段。
- （REQ-043）新增独立的"数据导出 / 导入"分区。"导出全部数据"按钮调用
  `persistence.serializeStateForExport(store.getState())`，用临时创建的
  `<a download>` + `URL.createObjectURL(Blob)` 触发浏览器下载
  `lifespark-backup-<日期>.json`，下载完立刻 `revokeObjectURL` 释放。
  "导入数据"按钮外包 `<n-popconfirm>`（确认文案讲清楚"会整体覆盖当前
  数据且不可撤销"），确认后触发一个隐藏的
  `<input type="file" accept="application/json">`；选中文件后
  `handleImportFile()` 读文本内容、调用
  `persistence.parseImportedState()` 校验+补齐字段，失败（返回 `null`）
  只弹错误提示、不碰当前数据，成功则 `store.setState(parsed)` 整体覆盖
  （`setState` 的 `Object.assign` 天然支持"传一个带全部顶层字段的对象
  = 整体替换"，不需要为导入单独加 store 接口），并重新用
  `buildDraft(store.getState())` 同步一次本地的年度/工作时间 `draft`
  （这几个字段走的是"改草稿点保存"模式，不会因为 `state` 变了就自动跟着
  变，导入之后必须手动重新拉一次，否则用户会在设置页看到导入前的旧草稿
  值。原文提到的"冷却周期"字段已随 REQ-052 从 `draft` 里删除）。
- ~~"每阶段类别配额"分区（`<table class="quota-table">`，`CATEGORIES`
  当列头、`draft.categoryQuotas[phase][c]` 当格子）~~ **REQ-048 已整个
  删除**：`domain/activityPool.CATEGORIES` 从"新鲜度"维度换成真实兴趣
  类型（摄影/露营/...）后，这张表格的列头会变成"探索阶段排几个摄影类
  活动"这种完全对不上号的展示——这套配额本来就是喂给已经没有 UI 调用方
  的 `domain/scheduler.js` 用的（见该模块条目），列头换了名字后，从
  "安静的死代码"变成"看起来像能用、实际点了没反应"的误导性 UI，所以
  一并删除，是这次类别重定义的必然后果，不是单独的范围扩大。连带从
  `buildDraft()`/`save()` 里删除 `categoryQuotas` 字段的读写、删除
  `CATEGORIES`/`PHASES` 两个不再被使用的 import。当时 `settings.
  categoryQuotas` 这个字段本身留在 schema 里当死数据（`persistence.js`
  的 `DEFAULT_CATEGORY_QUOTAS`/`createDefaultState()` 都没有跟着删），
  和 `settings.phaseWeeks`/`pointsPerHour` 是同一个"字段失去 UI 入口但
  留着当死数据"的处理模式——**REQ-052 起 `settings.categoryQuotas`/
  `DEFAULT_CATEGORY_QUOTAS` 已从 `persistence.js` 里彻底删除**（连同
  `settings.cooldownWeeks`、顶层 `weeklyPlans`），不再是"留着当死数据"，
  见 `state/persistence.js` 条目和 REQ-052 条目。

## src/components/GoogleSyncPanel.vue（REQ-072 大改：登录改整页跳转、新增外部用户配置引导、忙碌时段读取换成双向日历同步；REQ-077 Client ID 输入框加密码遮罩）

四个分区（Client ID 配置 / 登录状态 / Google→本地同步 / 本地→Google
同步），依赖 `calendar/googleAuthClient.js`（`startLogin`/`signOut`/
`isLoggedIn`/`getRedirectUri`）、`calendar/googleCalendarService.js`
（`listEvents`/`insertEvent`/`buildEventPayload`）、
`calendar/googleEventMapper.js`（`mapEventsToDaySegments`）、
`domain/dayPlanner.js`（`IMPORTED_BLOCK_TYPE`）。不再依赖
`calendar/sessionState.js`（REQ-072 已删除，见该模块条目），`connected`
这个 ref 现在直接从 `isLoggedIn()` 初始化，登录/登出时手动同步更新，
不需要哑响应式计数器桥接。

- （REQ-056 起）Step 1 是面板内直接可操作的编号引导列表
  （`.sync-guide-list`），几个固定路由常量对应 Google Cloud Console 里
  项目首页/Calendar API 启用页/凭据页；REQ-072 引导列表从 5 步扩展到
  6 步：新增第 3 步"配置 OAuth 同意屏幕"（新增常量
  `GOOGLE_CONSENT_SCREEN_URL`，标准固定路由）——用户实测撞上过"错误
  403：org_internal"（OAuth 同意屏幕的用户类型被设成"内部"，个人 Gmail
  会被拒绝），补一步引导去把用户类型改成"外部"、测试模式下加自己为
  测试用户；原第 4 步（创建 OAuth 客户端）/第 5 步（授权来源，REQ-072
  扩展成同时展示`getRedirectUri()`算出的重定向 URI，两个地址各自配
  `copyOrigin()`/`copyRedirectUri()`复制按钮）/第 6 步（保存 Client ID）
  顺移编号，内容不变。
- （REQ-077）Client ID 的 `n-input` 加了 `type="password"` +
  `show-password-on="click"`（Naive UI 自带的密码遮罩+点击显隐能力，
  没有自己实现遮罩逻辑）：这串 ID 不算真正机密（本来就会出现在每次
  授权请求里，浏览器网络面板能看到），但用户截图/分享屏幕求助时不想
  意外把它整个亮出来，默认遮住、点眼睛图标才显示。
- （REQ-072）登录/登出：`handleLogin()` 校验有没有填 Client ID 后调用
  `startLogin(clientId)`——这个调用会让整个页面跳转离开，函数本身
  不需要 `try/catch`（原来包着弹窗流程的错误处理已经不再需要，跳转
  本身不会在这里抛出可捕获的异常）。`handleLogout()` 调 `signOut()`
  后手动把本地 `connected` ref 设成 `false`。真正"登录成功"的状态更新
  发生在 `App.vue` 的 `onMounted`（`consumeRedirectToken()`），不是这个
  组件自己完成的——因为跳转会让页面整个重新加载，这个组件届时是全新
  挂载，`connected = ref(isLoggedIn())` 初始化时就已经能读到刚登录
  成功写进 `googleAuthClient.js` 内存里的状态。
- ~~`handleFetchBusy()`（读取忙碌时段生成文字冲突提示）~~ **REQ-072
  已整个删除**，换成 `handleSyncFromGoogle()`：拉取当前正在查看的这一
  周（`weekDates`）范围内的 Google 事件，用 `mapEventsToDaySegments()`
  按天切分成时段，转成 `{id, type:IMPORTED_BLOCK_TYPE, start, end,
  source:'google', title, googleEventId}` 的只读块。策略是"整周
  替换"：这一周每一天，先过滤掉 `dayTimelines` 里所有旧的
  `source==='google'` 块，只留用户自己的（`source!=='google'`），再
  拼上这次新生成的块——Google 那边删掉/挪走的事件，下次同步本地会
  自动跟着清掉，不需要额外维护"要不要删除"的判断。这套"Google 来源的
  块只读、不计入奖励点数、不算月/年视图事件点数"的展示逻辑
  （`DayTimeline.vue`/`WeekBoard.vue`/`domain/rewards.js`/
  `MonthBoard.vue`/`YearBoard.vue` 里通过 `source==='google'`/
  `type===IMPORTED_BLOCK_TYPE` 判断）早在更早的 REQ 就存在，这次只是
  第一次有真正的调用方把 Google 事件写成这种块，不需要新增任何组件的
  UI 处理。写入成功后更新 `state.googleSync.lastSyncFromGoogleAt`。
- `handleSyncToGoogle()`（REQ-018 起就有，逻辑不变）：跳过
  `block.type===IMPORTED_BLOCK_TYPE` 和已经带 `googleEventId` 的块，
  其余新建成 Google 日历事件；更新
  `state.googleSync.lastSyncToGoogleAt`（REQ-072 前是单一字段
  `lastSyncedAt`，见 `state/persistence.js` 条目）。**已知局限**（原有
  实现就有，REQ-072 没有扩大也没有缩小）：只会新建，本地块后续被
  编辑/删除不会同步撤销/更新已经推过去的 Google 事件。

## src/components/EventModal.vue（对应旧版 REQ-002 的 ui/eventModal.js）
- 用 `<n-modal preset="card">` 承载表单。因为这个组件本身由 App.vue 用
  `v-if="uiState.modal"` 控制挂载/卸载，每次打开一个新的（创建或编辑
  另一个块的）弹层时组件都是全新挂载的，`reactive` 草稿在 `setup()` 里
  基于 `props.uiState.modal` 构建一次即可，不需要像旧版 vanilla 实现
  那样手动比对"modal 身份"来决定要不要重置草稿——这是本次迁移里因为
  换了渲染模型而自然消失的一处复杂度。
  - 创建模式：未勾选"设为周期事件"直接写入
    `state.dayTimelines[dateKey].blocks`；勾选后调用
    `domain/recurringEvents.createRecurringEvent`，重复规则区
    （频率/星期几/每月第几天/结束条件）用 `v-if`/`v-else-if` 按
    `draft.freq`/`draft.endType` 切换显示。`buildDraft()` 的
    `recurrenceEnabled` 初始值读取 `modal.recurrenceEnabled`
    （REQ-006：`WeekBoard.vue` 的"新建周期计划"快捷按钮打开 modal 时会
    带上这个字段，让复选框默认勾选，省得用户再点一次）。
  - 编辑模式：更新该 block 字段；「删除此次」只删这一个 block；若
    `block.recurringId` 存在，额外提供「删除整个系列」（调用
    `domain/recurringEvents.deleteRecurringSeries`）。Google 来源的块
    不会打开这个弹层（`DayTimeline.vue` 的 `onBlockClick` 已经在触发前
    判断并 return，`EventModal.vue` 内部不需要重复防御）。
  - （REQ-010）footer 的 `.settings-actions`（`css/components.css`）
    加了 `flex-wrap:wrap`——编辑周期事件时最多 4 个按钮（保存/取消/
    删除此次/删除整个系列），中文场景勉强够放，切到英文/日文或窗口
    稍窄就容易溢出，加 wrap 让放不下时自动换行，没有改按钮本身的字号
    （用户明确要求这个弹层的字体不用跟着事件块一起缩小）。
  - （REQ-017）创建模式表单顶部新增"从计划添加（可选）"`n-select`
    （`planOptions`，只在有可选项时用 `v-if` 显示），只列出每个计划里
    `domain/plans.getActiveKeyEvent()` 返回的那一个（"当前解锁"的关键
    事件），选中后 `onSelectPlan()` 把标题/结束时间（开始时间+预计
    时长）写进草稿，并记下 `draft.planId`/`draft.keyEventId`；保存时
    这两个字段随 `addSingleBlock()` 一起写进新建的 block（`planId` 为空
    时不写这两个字段，保持 block 结构和之前一致，不产生冗余字段）。
    只在创建模式提供（`v-if="!isEdit"`）——编辑一个已经关联了计划的
    block 时，`updateBlockFields()` 用 `{...b, ...patch}` 合并 patch，
    `planId`/`keyEventId` 会自动保留在原有字段里，不需要在编辑表单里
    重复处理。周期事件分支（`createRecurringEvent`）没有接入这两个
    字段——计划关键事件是"一次性里程碑"，语义上不需要支持周期重复，
    两者同时勾选时选中的计划仅起到"帮你填一下标题和时长"的效果，不会
    产生真正的计划关联，这是刻意不处理的边界情况，不是遗漏。
  - （REQ-038）`planOptions` 新增 `.filter((plan) => !plan.abolished)`
    ——已废止的计划不再出现在这个下拉框里，避免用户还能从这里继续往
    一份"不能再操作"的计划上添加新的时间轴安排，见
    `domain/plans.js`/`components/PlanPanel.vue` 的 REQ-038 条目。

## src/components/ActivityCard.vue（REQ-048 重做为横屏封面卡片；REQ-053 类别改动态数据；REQ-058 类别名跟着语言切换；REQ-080 加内容摘要；REQ-082 分类功能整个删除）

`props:{activity}`（~~原来还有 `categories`~~ **REQ-082 整个删除**，
见下方说明），`emits:['open','edit','delete']`——`open` 点卡片本体
触发（打开 `ActivityModal.vue` 的查看模式），`edit`/`delete` 是封面
右上角两个圆形图标按钮（`@click.stop` 防止顺带触发 `open`），`delete`
按钮自己包了一层 `<n-popconfirm>` 二次确认。（`BlockCard.vue` REQ-006
时删除——周视图不再需要单独的卡片组件，时间块直接在 `WeekBoard.vue`
里复用 `.timeline-block` 渲染，见上面 WeekBoard 条目。）
- ~~`categories` prop（REQ-053 新增）是父组件
  `ActivityLibraryPanel.vue` 转发的 `state.activityCategories`，供查回
  `activity.category`（id）对应的类别对象；`categoryName` 这个
  computed（REQ-058）查出类别对象后传给
  `utils/i18nLabels.categoryLabel(t, category)`~~ **REQ-082 应用户
  要求"图文里面的分类也去掉"，`categories` prop、`categoryName`/
  `color`/`placeholderIcon` 这三个跟分类相关的 computed 一起整个
  删除**，见 `domain/activityPool.js`/`utils/i18nLabels.js`/
  `constants/colors.js` 各自的条目。

- 16:9 横屏封面（`.activity-card__cover`，CSS `aspect-ratio` 而不是
  固定像素高度，见 REQ-035 时期的写法在 REQ-048 里被这个换掉了）：有
  `activity.imageUrl` 时背景图铺满（`background-size:cover`），~~没有
  时用按 `activity.category` 算出的强调色做斜向渐变背景（REQ-053 起
  `constants/colors.js` 的 `categoryColor(id)`/`categoryEmoji(id)`
  对 id 字符串哈希取值），中间叠一个 emoji 占位~~ **REQ-082 改成固定
  样式**：没有图片时套 `.activity-card__cover--placeholder`（固定
  `var(--accent)` 背景），中间固定叠一个 📝 emoji（不再是按类别变化的
  computed，直接写死在模板里）——分类功能删除后没有任何"按什么取值"
  的依据了，改成一个统一的占位样式更直接。~~类别标签（`.activity-card__
  category-tag`）叠在封面左下角~~ **REQ-082 整个删除**，编辑/删除两个
  图标按钮（`.activity-card__cover-actions`）仍然叠在右上角，默认
  `opacity:0`，`.activity-card:hover` 时才显现，减少默认状态下的视觉
  噪音。
- 卡片底部原来只剩标题（`.activity-card__title`）——旧版的评价标签/
  普通标签/"时长 · 已安排 N 次"这行 meta 信息全部删除，见
  `domain/activityPool.js` 条目里字段精简的说明。（REQ-080）标题下面
  新增 `.activity-card__summary`：`summary` computed 用
  `utils/markdown.extractPlainTextSummary(activity.content, 70)` 从
  正文提炼出一段两行内的纯文字预览（`-webkit-line-clamp:2` 截断），
  用户反馈"卡片上看不出内容讲了什么，像收藏夹不像笔记本"，加这个之后
  扫一眼卡片网格就能看出每条笔记大概写了什么，不用逐个点开。没有
  正文内容的活动 `v-if="summary"` 不渲染这一块。

## src/components/ActivityModal.vue（REQ-048，新增；REQ-053 类别改动态数据 + 现场新建；REQ-058 类别名跟着语言切换；REQ-080 改成阅读/写作排版；REQ-081 去掉链接字段 + 封面图支持本地文件 + 编辑/删除按钮挪到右上角；REQ-082 分类字段整个删除；REQ-083 封面图挪进正文滚动区）

职责：兴趣活动的"查看详情"+"新建/编辑"，一个弹层组件承担两种模式，和
`EventModal.vue` 的 `isEdit` 写法是同一类惯例，但多了"看完详情再决定
要不要编辑"这一种场景，所以用一个可以来回切换的 `mode`
（`'view'|'edit'`）而不是进来就定死。`props:{activity}`（~~原来还有
`categories`~~ **REQ-082 整个删除**，见下方说明）——`activity` 为
`null` 表示新建（`mode` 直接是 `'edit'`），传了具体对象表示查看/编辑
那一条（`mode` 先是 `'view'`，点"编辑"切到 `'edit'`）。`emits:['close']`。
依赖：`domain/activityPool.js`（`addActivity`/`updateActivity`/
`removeActivity`）、`utils/markdown.js`（`renderMarkdown`）。

- （REQ-080）弹层本身从固定 `560px` 加宽到
  `style="width: min(1100px, calc(100vw - 48px))"`——用户反馈"想要的是
  攻略笔记，正文才是重点"，原来的窄弹层装不下一篇正常长度的笔记。
- view 模式：~~类别标签~~（**REQ-082 整个删除**，见下方说明）、
  ~~"访问链接"按钮（`activity.link` 非空时才显示，`target="_blank"
  rel="noopener noreferrer"` 新标签页打开）~~ **REQ-081 整个删除**
  （用户反馈"图文的链接不需要"，`link` 字段连同这个按钮一起从组件、
  `domain/activityPool.js`、`state/persistence.js` 的旧数据迁移逻辑里
  清掉，见下方对应条目）。~~底部"编辑"/"删除"（`<n-popconfirm>` 二次
  确认）两个按钮~~ **REQ-081 挪到右上角**：用户反馈"编辑删除按钮放在
  展开后卡片的右上角"——外面新增 `.activity-modal__view`（相对定位
  容器）包住整个 view 模式内容，按钮组 `.activity-modal__cover-actions`
  （`position:absolute; top:8px; right:8px`）复用 `ActivityCard.vue`
  卡片缩略图上已有的 `.activity-card__icon-btn` 圆形图标按钮样式，
  删除按钮仍然是 `<n-popconfirm>` 二次确认；跟卡片缩略图"悬停才出现"
  不同，这里是常驻显示（已经是主动点开的详情页，不需要"悬停才发现"）。
  没有封面图时（`activity.imageUrl` 为空）额外加
  `.activity-modal__view--no-cover`（`padding-top:34px`）留出空间，
  避免按钮盖住紧挨着的正文。（REQ-080）新增一层
  `.activity-modal__reading`（`max-height:62vh; overflow-y:auto`）——
  长文章在这个容器内部单独滚动，不会把整个弹层撑到超出视口；
  `.activity-modal__content` 的字号/行距也放大（15px/1.8），读起来
  更像一篇文档。~~类别标签文字用 `getCategoryName(categories,
  activity.category)`，REQ-058 改成 `categoryLabel(t, categories.
  find((c) => c.id === activity.category))`~~ **REQ-082 应用户要求
  "图文里面的分类也去掉"，`.activity-modal__meta-row`（原来只装这个
  分类标签）连同 `categoryColor`/`categoryName` 两个 computed 一起
  整个删除**。~~封面图（`.activity-modal__image`，REQ-080 起 `21:9`
  更宽的 `aspect-ratio`，横幅感更强）原来是 `.activity-modal__reading`
  外面的兄弟节点，在阅读区上方~~ **REQ-083 挪进 `.activity-modal__
  reading` 内部**：用户反馈"md 文件显示的时候图片不要置顶卡住不动"——
  图片在滚动区外面导致滚动长文章时它不跟着滚、一直悬在最上面。现在
  `<img>` 是这个滚动容器的第一个子节点，和正文/`activity.content` 为空
  时的"还没有填写内容"提示一起放在里面，会随内容一起滚动移出视口；
  这个容器原来只在 `activity.content` 非空时才渲染，现在改成无条件
  渲染（图片和"正文/无内容提示"都是它的子节点），不用再维护两套"有没有
  正文"的条件分支，没有图片/没有正文时的显示效果不受影响。
- edit/create 模式：`n-form` 表单。~~（REQ-080，REQ-081 去掉了链接
  字段）标题/类别/图片 URL 这三个字段从各占一整行改成收进
  `.activity-modal__meta-fields`（REQ-081 改成 2 列网格，
  `grid-template-columns:1fr 2fr`，标题单独占满一行，封面图这一列比
  类别宽是因为要放下"浏览本地文件"按钮），给下面的正文编辑区腾纵向
  空间~~ **REQ-082 分类字段整个删除后，`.activity-modal__meta-fields`
  紧凑网格连同 `.activity-modal__meta-field--title`/`--image`、900px
  断点下的对应响应式规则一起整个删除**：标题/封面图这两项现在各自
  独占一整行普通堆叠，不再需要网格布局——分类删掉后只剩两项，紧凑排布
  已经没有存在的必要。下面的正文编辑区——用户反馈"编辑的时候也太小
  了"，原来 8 行的纯文本框改成 `.activity-modal__editor`
  （`grid-template-columns:1fr 1fr`，固定 `46vh` 高度，900px 断点下
  改上下堆叠）：左栏还是 `n-input type="textarea"`（CSS 强制撑满容器
  高度、等宽字体），右栏 `.activity-modal__editor-preview` 实时显示
  `draftRenderedContent`（新增 computed，`renderMarkdown(draft.content)`
  ——和 view 模式的 `renderedContent` 是同一个渲染函数，只是喂给它的是
  还没保存的草稿内容，不是已保存的 `activity.content`），写的时候就能
  看到最终排版效果。"上传 .md 文件"按钮
  （`<label>` 包一个隐藏的 `<input type="file"
  accept=".md,text/markdown">`，`handleUploadMd()` 用
  `FileReader.readAsText()` 把文件内容读成纯文本塞进
  `draft.content`，读完清空 `input.value` 以便下次能重新选中同一个
  文件也能触发 `change`）挪到双栏编辑区上方，不受这次布局调整影响——
  上传不是唯一的录入方式，用户读完文件后仍然可以在左栏继续手动改，
  改的同时右栏预览也会跟着刷新。（REQ-081）封面图字段新增"浏览本地
  文件"入口，跟 `SettingsPanel.vue` 背景图片同一套
  `FileReader.readAsDataURL()` 惯例：`coverFileInputRef`（隐藏的
  `<input type="file" accept="image/*">`）+
  `triggerCoverFilePicker()`/`handleCoverFileChange()`，文件类型校验
  （`file.type.startsWith('image/')`）+ 体积上限
  `MAX_COVER_IMAGE_BYTES = 3 * 1024 * 1024`（比背景图片的 8MB 更紧，
  因为封面图会随活动条目数量累加，同样的单张上限对 state 体积的影响
  更明显）；超出直接拒绝并 `message.error` 提示，不写入
  `draft.imageUrl`。原来手动粘贴外部 URL 的 `n-input` 保留，两个入口
  并排放在同一行（`.settings-inline-row`），共用同一个 `imageUrl`
  字段，后选的生效。保存（`save()`）按 `props.activity`
  是否存在决定调用 `updateActivity`/`addActivity`；取消
  （`activity ? (mode='view') : close()`）——编辑一个已有活动时取消
  只是切回查看模式而不是直接关闭弹层，新建时没有"查看模式"可回退，
  直接关闭。
- ~~（REQ-053）类别字段从固定选项的 `n-select` 改成
  `filterable + tag + on-create` 组合，支持"输入一个不存在的名字直接
  创建"……真正的创建被推迟到 `handleCategoryUpdate(value)`……
  `categoryOptions` 按 `useCount` 降序排列……~~ **REQ-082 应用户要求
  "图文里面的分类也去掉"，`mostUsedCategoryId()`/`categoryOptions`/
  `handleCreateCategoryOption()`/`handleCategoryUpdate()` 这一整套
  类别选择逻辑（含 REQ-053 时用 `node_modules/naive-ui` 源码核对过
  `on-create` 每敲一个字符都会触发一次这个细节）连同 `n-select` 那个
  分类字段一起整个删除**，不留死代码。
- 组件内部两处 `<template v-if="mode===...">` 分别渲染 view/edit 的
  内容，两种模式各自把操作按钮放在内容区底部（`<div
  class="settings-actions">`），没有使用 `<n-modal>` 的 `#footer`
  具名插槽——具名插槽必须是 `<n-modal>` 的直接子节点，不能嵌套在一个
  用于 `v-if`/`v-else` 控制流的 `<template>` 里面，两种模式各自需要
  不同的按钮组合，写在内容区底部比拆出一个还要再判断 `mode` 的公共
  `#footer` 更直接。

## src/components/PlanPanel.vue（REQ-017，新增；REQ-054 重新支持追加关键事件；REQ-057 折叠默认值反过来；REQ-081"废止计划"改名"取消计划"+ 二次确认）
- 新建计划表单（复用 `.activity-form` 卡片外观）：标题 + 动态增减的
  关键事件行（每行标题 + 预计时长 `n-input-number`，`addDraftRow`/
  `removeDraftRow` 增减，至少保留一行），提交调用
  `domain/plans.createPlan` 一次性建好整个计划。
- 计划列表（`plansWithProgress` computed，每项附带
  `domain/plans.computePlanProgress()` 算出的进度）：卡片头部标题 +
  进度 `n-tag`（"已到达终点"或"{done}/{total} 已完成"）+ 操作按钮
  （REQ-038 起是"废止计划"，见下方对应条目）；`n-progress` 线性进度条；
  关键事件列表（`<ol>`，`keyEventStatus()` 按"已完成/当前解锁/还锁着"
  三种状态给不同样式——已完成带 `CheckCircleRound` 对勾图标，当前解锁
  用强调色左边框高亮，锁着的整体变淡且不显示删除按钮，见
  `css/components.css` 的 `.plan-key-event*` 系列样式）。（REQ-037 起
  卡片底部不再有"继续追加关键事件"的小表单，见下方对应条目。）
- 关键事件的完成状态本身不在这个面板里操作——"标记完成"这个动作在
  `DayTimeline.vue` 的时间块上（把关键事件添加到时间轴之后），这个面板
  只做"定义计划结构"和"查看进度"，职责边界见 `domain/plans.js` 顶部
  注释里"完成是一次性动作"的设计说明。
- （REQ-018，**REQ-019 已整个删除，见下一条**）计划卡片底部曾经有一个
  "领取奖励"区域，计划到达终点后可以直接在这里选一个奖励领取。
- （REQ-019）上一条的"领取奖励"区域整个删除（连带 `canClaimReward`/
  `claimedReward`/`submitClaim`/`rewardOptions`/`claimSelection` 这些
  变量和函数，以及 `domain/rewards.js` 的相关 import）——奖励改成完全
  独立的点数经济，不再由某一份计划的完成直接触发，见
  `domain/rewards.js`/`components/RewardPanel.vue` 的 REQ-019 条目。
  计划到达终点后现在只保留"已到达终点"这个进度标签（`progress.isFinished`
  驱动的 `n-tag`），没有其他连带效果。
- （REQ-032，用户反馈"计划设置可以进行修改，现在修改不了"）新增两处
  行内编辑：
  - 计划标题：`plan-card__title-row` 里 `h3` 旁边加一个铅笔图标按钮
    （`titleEditingId`/`titleDraft` 两个 ref 控制），点击把标题换成
    `n-input` + 勾选/取消两个图标按钮，保存调用 `domain/plans.updatePlan`。
  - 关键事件：只在 `!ke.completedAt` 时显示铅笔按钮（已完成的不给编辑
    入口，和它本来就没有删除按钮是同一个道理），点击把那一行换成
    `n-input`（标题）+ `n-input-number`（时长）+ 勾选/取消，保存调用
    `domain/plans.updateKeyEvent`。`keyEventEditingId`/`keyEventDraft`
    两个响应式变量控制，同一时刻只有一个关键事件处于编辑态（和标题
    编辑是各自独立的两套状态，互不影响）。
- ~~（REQ-032）关键事件列表默认收起，点击展开~~ **REQ-036 已整个删除**：
  用户实际用起来之后反馈"现在显示得不太自然，不需要点击展开的提示"，
  而且默认收起还间接导致用户找不到编辑入口（误以为编辑功能没生效，见
  REQ-036 描述）。`expandedPlans`/`toggleExpanded` 和
  `plan-card__toggle` 按钮（连同 `css/components.css` 里对应的
  `.plan-card__toggle*` 样式）整个删除，`<ol class="plan-key-event-list">`
  和 `plan-card__add-row` 改回直接渲染，不再包在任何 `v-if` 里——退回
  REQ-032 之前"关键事件列表始终显示"的行为，标题/关键事件的行内编辑
  功能保留。
- ~~（REQ-036）追加关键事件的小表单 + "插入位置"下拉框~~
  **REQ-037 已整个删除**：用户紧接着反馈"添加关键事件的功能不需要"，
  `plan-card__add-row`、`addRowDrafts`/`addRowDraftFor`/
  `insertPositionOptions`/`submitAddKeyEvent` 这些脚本状态和函数，连同
  `domain/plans.js` 里配套的 `addKeyEvent` 一起整个删除（含
  `css/components.css` 里不再用到的 `.plan-card__add-row` 样式、
  `plan.keyEventAddedToast`/`insertAtEnd`/`insertBeforeOption` 这三个
  不再用到的 i18n key）。计划创建之后的关键事件清单变成固定的（只能
  编辑/删除，不能再追加），见 `domain/plans.js` 条目。
- （REQ-037，用户反馈"计划通过点击可以折叠计划"）整张计划卡片新增
  折叠/展开：卡片头部标题左边新增一个 chevron 图标按钮
  （`KeyboardArrowDownRound`，展开态朝下、折叠态用 CSS `transform:
  rotate(-90deg)` 转成朝右），点击调用 `toggleCollapse(planId)`
  （当时叫 `collapsedPlans`，`reactive({})`，纯界面状态、不写进 store，
  ~~默认展开~~ **REQ-057 改成默认折叠，见下方对应条目**）。和 REQ-036
  删掉的"关键事件列表单独展开/收起"不是同一回事——这次折叠的是整张卡片
  的主体部分（`n-progress` 进度条 + 关键事件列表 + "当前待完成"提示，
  一起包在一个条件渲染的 `<template>` 里），卡片头部（标题、编辑按钮、
  进度标签、操作按钮）折叠状态下始终可见，折叠后仍能看到进度标签一眼
  判断这份计划的大致进度。
- ~~"删除计划"按钮（`handleDeletePlan` 调用 `domain/plans.deletePlan`）~~
  **REQ-038 已改成"废止计划"**：用户明确要求"去掉删除计划的功能，改成
  废止计划，只是显示变成不能操作而已"。~~`handleAbolishPlan` 调用~~
  **REQ-081 改名 `handleCancelPlan`**（调用的底层
  `domain/plans.abolishPlan` 函数名不变——这次只是按钮文案从"废止
  计划"改成"取消计划"，字段/函数命名保留旧名，不是语义变化，没必要
  连带改动数据结构），只在 `!plan.abolished` 时显示这个按钮
  （已经废止的没有"再废止一次"的必要）；~~点击直接触发~~
  **REQ-081 包了一层 `<n-popconfirm>` 二次确认**（跟
  `RewardPanel.vue` 兑换按钮同一套"危险操作二次确认"惯例），确认弹窗
  文案里说明取消后不能恢复。卡片根节点新增
  `:class="{ 'plan-card--abolished': plan.abolished }"`（整卡片调暗，
  见 `css/components.css`）；标题旁边的编辑铅笔按钮、每个未完成关键
  事件的编辑/删除按钮都追加了 `!plan.abolished` 条件，废止后这些入口
  直接不渲染（不是禁用状态，是"显示变成不能操作"的字面实现）；进度
  标签旁边新增一个~~"已废止"~~ **REQ-081 改成"已取消"** 的
  `n-tag`（~~`plan.abolishedTag`~~ **`plan.cancelPlanTag`**）；
  `activeHint`（"当前待完成：xxx"）也追加了 `!plan.abolished`，废止后
  不再提示"可以添加到时间轴"（因为 `EventModal.vue` 的下拉框也已经把
  已废止计划过滤掉了，见该组件条目）。没有"恢复"入口。
- （REQ-054，用户重新要求"计划编辑时可以在后面添加事件"）关键事件
  列表下面新增一行内联"追加"表单（`.plan-key-event-row--add`，虚线
  顶部分隔线和列表本身区分开）：标题 `n-input` + 预计时长
  `n-input-number` + 一个"添加到末尾"按钮，只在 `!plan.abolished` 时
  显示。每张卡片自己一份草稿（`newKeyEventDrafts`，`reactive({})`，按
  `planId` 存，`getNewKeyEventDraft(planId)` 懒初始化——和上面
  `expandedPlans` 是同一套"局部 UI 状态按 id 存"写法），提交
  （`handleAddKeyEvent`）调用 `domain/plans.addKeyEvent`，成功后把这张
  卡片的草稿重置回空、方便连续添加多条，标题为空时提示
  `plan.keyEventTitleRequired`（复用新建计划表单已有的同一个 key，
  语义完全一致，不需要再造一个）。这不是 REQ-037 删掉的那个"追加关键
  事件小表单"的简单复原——REQ-036/037 那版还带了"插入位置"下拉框（可以
  插到任意未完成事件前面），这次用户原话是"在后面添加"，只支持追加到
  末尾，比当时的版本更简单，见 `domain/plans.js` 条目。
- （REQ-057，用户反馈"计划不要默认细节展开"）折叠状态的默认值反过来：
  从"默认展开、`collapsedPlans[id]` 真值时才折叠"改成"默认折叠、
  `expandedPlans[id]` 真值时才展开"。变量本身也从 `collapsedPlans`
  改名成 `expandedPlans`（`toggleCollapse(planId)` 函数名没变，改的是
  它写入的这个 reactive 对象的语义），避免"默认值是 `undefined`
  （falsy）但要读成'没折叠＝展开'"这种绕一层的写法，直接让"有没有在这个
  对象里显式记录为 `true`"就等于"是否展开"。折叠图标的判断相应取反
  （`!expandedPlans[plan.id]` 时加 `--collapsed` 旋转样式），内容区
  `v-if` 从 `!collapsedPlans[plan.id]` 改成 `expandedPlans[plan.id]`。
  **注意跟 REQ-032 那版已经被 REQ-036 整删的 `expandedPlans`/
  `toggleExpanded`（见上面带删除线那条）不是同一个东西**——那次是"关键
  事件列表单独展开/收起"，这次是"整张卡片一起折叠/展开"（REQ-037 引入
  的机制），只是这次重新引入默认收起时顺手把变量名换成了语义更直接的
  同名词，两次改动之间没有代码延续关系，纯粹是命名巧合。

## src/components/RewardPanel.vue（REQ-018，新增；REQ-019 改为点数兑换；REQ-022 加兑换二次确认；REQ-046 余额改用派生计算；REQ-058 默认奖励名跟着语言切换）
- 顶部一个简单的添加表单（标题 + 兑换所需点数 `n-input-number`），提交
  调用 `domain/rewards.createReward`。
- （REQ-058）"待兑换"/"已兑换"两个表格里的名称列、兑换二次确认文案
  （`reward.redeemConfirm`）、兑换成功提示（`reward.redeemedToast`）
  这几处原来直接显示 `reward.title` 的地方，全部改成
  `utils/i18nLabels.rewardLabel(t, reward)`——17 条内置默认奖励（带
  `seedKey`）会跟着语言切换，用户自己新建的奖励（没有 `seedKey`）继续
  显示自己填的 `title`。新增表单本身（`draft.title`）不受影响，用户
  输入什么就存什么。
- （REQ-019，REQ-046 改用派生计算）`view-header` 右侧新增点数余额展示
  （`n-tag`）。REQ-046 起新增
  `balance = computed(() => computeRewardBalance(props.state))`，模板
  和 `canAfford()`/`handleRedeem()` 都读这个 computed，不再直接读
  `state.rewardPoints`（这个字段已经不存在，见 `domain/rewards.js`
  条目）——`props.state` 里 `dayTimelines`/`rewards` 任何一处相关变化，
  这个 computed 会自动重新算，不需要手动同步。下面一行说明文字解释
  点数怎么来（`reward.pointsHint`，提示去日/周视图标记事件完成）。
- "待兑换"分区（REQ-018 时叫"待领取"）：表格列出所有未兑换的奖励，
  价值可以直接在表格里用 `n-input-number` 改（`updateReward`）；新增
  "兑换"按钮（`canAfford(reward)` 判断 `balance.value >= reward.value`，
  不够时按钮 `:disabled` 置灰并且文字换成"还差 N 点"）；
  删除按钮只在这个分区出现（已兑换的不可删，见 `domain/rewards.
  deleteReward` 的保护）。REQ-018 时分区标题下面那句"待领取奖励一共值
  多少钱"的汇总提示（`totalValue` computed）删掉了——点数经济下，
  "待兑换奖励的价值总和"不是一个特别有意义的数字（点数不是按单个奖励
  分别积累的，是同一份余额），换成上面的点数余额展示更直接。
- （REQ-022）"兑换"按钮外面包了一层 `<n-popconfirm>`（trigger 插槽放
  按钮本身，默认插槽放确认文案 `reward.redeemConfirm`），
  `@positive-click` 才真正调用 `domain/rewards.redeemReward`——按钮本身
  的点击不再直接触发兑换，用户要求防止手滑误触。`canAfford()` 为 false
  时按钮 `:disabled`，disabled 状态下 popconfirm 不会弹出（Naive UI
  对禁用的 trigger 元素本身就不响应点击），不需要额外处理。
- "已兑换"分区：表格列出已兑换的奖励和兑换时间
  （`d(new Date(reward.claimedAt), 'long')`，复用
  `GoogleSyncPanel.vue` 已经用过的 vue-i18n `d()` 日期格式化写法）；
  REQ-018 时这里还有一列"兑现自哪份计划"，REQ-019 把它删掉了（`reward`
  数据结构里已经没有 `claimedByPlanId` 这个字段，兑换不再和某份计划
  绑定）。这个分区没有编辑/删除操作，是纯只读的历史记录——REQ-046 起
  这份记录本身就是 `computeRewardBalance()` 算"已经花掉多少点数"的
  唯一数据来源，不是单纯展示用的。
- （REQ-027，响应式适配）"待兑换"/"已兑换"两个表格外面都包了一层
  `<div class="table-scroll">`，和 `SettingsPanel.vue` 的配额表用同一套
  `css/components.css` 里的 `.table-scroll`（`overflow-x:auto` 兜底），
  见该组件条目里的说明。
- ~~（REQ-034，REQ-036 修复过漏调 `settlePastDays` 的 bug）"重置点数"
  按钮~~ **REQ-039 已删除**：用户明确要求"删除重置点数的功能"。
  `handleResetPoints()`、按钮本身的 `<n-popconfirm>`、
  `resetPointsFromMonday`/`settlePastDays` 的 import，以及
  `reward.resetPointsButton`/`resetPointsConfirm`/`pointsResetToast`
  三个 i18n key 都整个删除。`domain/rewards.resetPointsFromMonday`
  函数本身当时没有删——`App.vue` 挂载时的自动一次性迁移（REQ-028）还在
  用它，那是一个没有 UI 界面的静默安全网，和这次被删掉的、用户能点到的
  手动按钮是两回事。（`resetPointsFromMonday` 函数本身后来在 REQ-046
  随着点数余额改成派生计算被整个删除，见 `domain/rewards.js` 条目。）
