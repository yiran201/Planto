# CHANGELOG.md

格式：模块 / 改了什么 / 为什么（对应 REQ 编号）。错误修复额外记录现象和
修复方式。

---

## 2026-09-07（第五次追加）

**REQ-095：README 补上在线体验链接 + 全文润色 + 日语标语改回原文**

REQ-094 之后用户要求补上之前故意留白的试用链接、给中文原文润色并
同步三语言风格、日语标语改回 REQ-084 最初的版本（中文/英文维持新版）。
补链接前先用 `curl` 实测确认 GitHub Pages 部署已经正常（之前的
"Deploy from a branch"配置错误、workflow 未触发这些问题都解决了），
才把 `https://yiran201.github.io/Planto/` 写进三份 README。

润色内容：给截图展示区加上 `## 📸` 标题（跟其它分区格式统一）；四段
说明从口语化流水账改成"**加粗小标题**：一句话描述"的紧凑格式；图片
alt 文字从原始文件名改成有意义的页面名；副标题精简；标点统一。这些
改动逐条同步进了英文/日文版。

**验证**（REQ-095）：纯文档改动。`curl` 实测过线上部署状态和资源
路径确认正常。`grep` 核对三份文件的链接地址一致。真实网页渲染效果
需要用户自己确认。

---

## 2026-09-07（第四次追加）

**REQ-094：README 加截图展示区 + 更新标语，三语言版本同步**

用户手动给 `README.md` 加了一段截图展示区（日历/计划/奖励/设置四张
截图各配说明）和新的标语/副标题，要求同步到英文/日文版，英文标语
指定用"Plant your plans. Let time grow them."。同步时顺手修正了一处
图片路径的反斜杠（`img\...` → `img/...`，GitHub 上反斜杠不会正常
渲染），三份文件统一修正。副标题也相应调整成强调"日历型"这个产品
定位。"可以通过链接试用"这句故意没补实际链接——GitHub Pages 部署
当时还在联调，留给用户自己决定何时补。

**验证**（REQ-094）：纯文档改动。`grep` 核对过三份文件图片引用路径
统一、`img/` 目录下文件名逐一核对存在。真实渲染效果需要用户自己在
GitHub 网页上确认。

---

## 2026-09-07（第三次追加）

**REQ-093：新安装的语言/地区默认值改成跟随浏览器系统配置**

用户要求"根据用户的系统配置自动配置语言，然后设置地区"。新增
`detectDefaultLocale()`/`detectDefaultRegion()` 两个内部函数，读
`navigator.languages`/`navigator.language` 自动判断，只在
`createDefaultState()`（全新安装）里生效，识别不出来时兜底成
`en`/`US`（用户明确要求）。跟 REQ-092 一样只影响新安装，老用户的
已保存设置不受影响。

**验证**（REQ-093）：`node --check` 通过。写了独立模拟测试，用
`globalThis.navigator` 造出 `zh-CN`/`en-US`/`ja-JP`/`en-GB`/`zh-TW`/
完全不支持语言/无 `navigator` 等场景，逐一核对返回结果符合预期，
包括几个边界兜底情况。

---

## 2026-09-07（第二次追加）

**REQ-092：默认主题改成浅色；点数默认值平日 100、周末 200**

用户要求改系统默认配置：默认主题从深色改成浅色；点数换算默认值从
平日/周末都是 1000 改成平日 100、周末 200。都在 `createDefaultState()`
里，只影响新安装——已有数据的老用户走既有的"老数据优先"合并逻辑，
不受影响，不需要迁移。

**验证**（REQ-092）：`node --check` 通过。核对过 `fillMissingDefaults()`
的合并逻辑确认不会覆盖老用户已保存的设置。

---

## 2026-09-07（第一次追加）

**REQ-091：新增 DEPLOYMENT.md，整理各种部署方式的配置步骤**

REQ-089/090 期间用户陆续问了好几个部署相关的问题，明确要求"把配置的
手顺记载到文件里"。新增 `DEPLOYMENT.md`（项目根目录，跟 README 同级，
不放进 `docs/`——那里是治理文件专用的）：开头讲清楚 COOP/COEP/CORP
三个响应头这个核心前提，再分四种部署方式给具体步骤——本地测试
（`npm run preview`/`serve:dist`）、GitHub Pages（REQ-089 的 Service
Worker 垫片）、GitHub Release、自建服务器（Nginx/Apache/Tomcat/
Express/`npx serve` 各给配置示例）。结尾加了"部署后自查清单"。三份
README 补了指向这份文档的链接。

**验证**（REQ-091）：纯文档新增。核心的响应头要求/症状描述、
`npm run preview`/`serve:dist`/GitHub Pages 部分是复述本次会话里
已经验证过的事实；Nginx/Apache/Tomcat/Express/`npx serve` 的配置
示例是按各平台标准写法给的参考片段，没有在本次会话里实际搭建对应
服务器逐一跑通，如实作为文档性质的示例，不是"已验证可用"的断言。

---

## 2026-09-06（第十次追加）

**REQ-090：修复本地数据库在所有部署场景下完全无法初始化的严重问题**

验证 REQ-089 的 GitHub Pages 垫片时，用真实浏览器端到端测试意外发现
跨源隔离达成之后数据库依然完全没有初始化——OPFS 里没有任何数据库
文件。排查确认这跟 GitHub Pages 无关，`npm run dev`/`npm run
preview`/`serve-dist.cjs` 这三种此前"以为已经验证过"的场景全部同样
复现，是一个从未被真正验证过的既有 bug。

两层原因：①`@sqlite.org/sqlite-wasm` 的 worker 脚本用
`new URL("sqlite3.wasm", import.meta.url)` 这类写死的相对路径请求
wasm/OPFS 代理文件，Vite 构建产物却把这些文件加了 hash
（`sqlite3-BVKGSWc-.wasm`），请求 404，`WebAssembly.compile()` 抛出
异常导致 worker 直接崩溃、`onready`/`onerror` 两个回调都不会触发，
`bootstrap()` 永远卡在 `await initStore()`——UI 界面照常渲染，表面
看起来"一切正常"，实际上数据库从未真正落盘过。修复：把包自带的
未加 hash 原始文件手动复制进 `public/assets/`。②修完①之后 OPFS
异步代理这个嵌套 worker 的请求被 `net::ERR_BLOCKED_BY_RESPONSE`
拦截——`Cross-Origin-Embedder-Policy:require-corp` 要求每个子资源都
带 `Cross-Origin-Resource-Policy`，这个项目从 REQ-024 起一直没发过
这个头。修复：`vite.config.js`/`serve-dist.cjs`/
`coi-serviceworker.js` 三处补上这个响应头。

**验证**（REQ-090）：这个 bug 本身就是"界面正常、功能完全失效"的
类型，只看界面/日志不足以发现。用 Playwright 写了一个直接调用
`writeStateJson()`/`readStateJson()` 的端到端测试：写入带时间戳的
唯一标记、整页刷新（重新走一遍数据库初始化流程）、读回确认标记原样
返回，同时用 `navigator.storage.getDirectory()` 确认
`lifespark.sqlite3` 文件真实存在。在 dev/preview/serve-dist.cjs/
GitHub Pages 垫片四种场景下都各自验证过。已知局限：`public/assets/`
里手动复制的两个文件如果将来升级 `@sqlite.org/sqlite-wasm` 版本需要
记得同步更新，详见 REQUESTS.md。

---

## 2026-09-06（第九次追加）

**REQ-089：GitHub Pages 部署支持——Service Worker 跨源隔离垫片 + GitHub Actions 自动部署**

用户问"GitHub 不是能够直接部署吗，可以教我一下怎么部署吗"，指
GitHub Pages。这里有跟 REQ-087 同源的技术前提冲突：GitHub Pages
不支持自定义响应头，而本地数据库依赖 COOP/COEP 才能跨源隔离。方案
用 `coi-serviceworker` 技术（自己按公开原理实现，不是直接照搬第三方
文件）：新增 `public/coi-serviceworker.js` 拦截每个 fetch 补上响应
头，`index.html` 里加注册脚本（只在还没跨源隔离时才生效，其余场景
是空操作），配一个标准的 GitHub Actions 工作流
（`.github/workflows/deploy-pages.yml`）自动构建部署到 Pages。

**验证**（REQ-089）：本机 Node 18 装不了最新版 Playwright，改用
`playwright@1.40.0` 驱动真实 Chromium/Chrome 做端到端测试：故意用一个
不带任何响应头的静态服务器模拟 GitHub Pages，追踪导航时间线确认
"首次加载（未隔离）→ 注册 Service Worker → 自动刷新一次 → 已隔离"
且没有无限刷新循环，额外换成本机真实 Chrome（非 Playwright 自带的
旧版 Chromium）复测过一遍。这轮验证中意外发现了一个更严重、跟这次
功能本身无关的既有 bug，见 REQ-090。

---

## 2026-09-06（第八次追加）

**REQ-088：serve-dist.cjs 默认端口从 4173 改成 6060**

用户反馈想让 release 包里 `serve-dist.cjs` 的默认端口跟开发服务器
（`vite.config.js` 固定的 6060）保持一致，不用因为跑的是哪个服务器
就记两个不同的地址。改了一行 `PORT` 默认值，重新打包并在项目内/
脱离项目单独解压两种场景下各实测了一遍，确认 `curl` 返回 200 且带
正确的 COOP/COEP 响应头。

---

## 2026-09-06（第七次追加）

**REQ-087：提供可直接运行的 dist 构建产物，方便打包成 GitHub Release**

用户想做一个只含 `dist/` 构建产物的 GitHub Release。排查确认这个
项目的本地数据库（OPFS SQLite）依赖跨源隔离，必须由服务器带上
COOP/COEP 两个响应头才能工作——纯解压双击 `index.html`，或者用通用
静态服务器（`npx serve`/`python -m http.server`/GitHub Pages）直接
托管，都不会自动带这两个头，数据库会初始化失败。新增零依赖的
`serve-dist.cjs`，自带这两个响应头，`node serve-dist.cjs` 直接可用，
不需要装任何依赖。

`.cjs` 后缀是刻意的：最初写成 `.js` + ESM `import`，脱离项目单独
解压到空目录运行报"Cannot use import statement outside a module"；
改成 `.js` + CommonJS `require` 后，在项目自己目录里跑又因为
`package.json` 的 `"type":"module"` 报"require is not defined in ES
module scope"——`.js` 在两种场景下会因为相反的原因报错，改用 `.cjs`
（Node 对这个后缀永远按 CommonJS 处理，不受任何 `package.json`
影响）才同时满足"脱离项目单独解压"和"项目内直接跑"两种场景。这两个
坑都是真实执行才发现的，不是凭经验猜的。

三份 README 补充了 Releases 页面的使用说明，`docs/MODULES.md` 加了
对应条目，`package.json` 新增 `serve:dist` 脚本。GitHub Release 本身
（打 tag、上传 zip）需要用户自己在网页上操作——本机没装 `gh` CLI。

**验证**（REQ-087）：这次改动核心是"脚本能不能真的跑起来"，做了比
平时更彻底的真实运行验证：①项目目录内启动，`curl` 确认响应头正确；
②把真实 `dist/` 产物复制到一个确认没有任何 `package.json` 的全新
临时目录，模拟"下载 release 压缩包解压到任意位置"，同样 `curl`
验证主页面和 `.wasm` 资源的响应头/状态码；③确认测试进程全部清理
干净、无残留端口占用。两轮测试通过后才打包成
`planto-v0.1.0-dist.zip`。真实发布 Release、Windows 环境变量语法
差异下的运行效果需要用户自己验证。

---

## 2026-09-06（第六次追加）

**REQ-086：浏览器标签页标题去掉中文副标题，只保留 Planto；新增 🌱 favicon**

用户反馈标题栏"后面加了一段中文"，希望只显示"Planto"和图标。
`<title>` 简化成只有 `Planto`；项目之前完全没有配置 favicon，新增的
图标直接复用侧边栏品牌同一个 🌱 emoji，用内联 SVG + `data:` URI 实现，
不需要额外的图片文件。

**验证**（REQ-086）：手工检查 `index.html` 的 `<head>` 结构完整、
`<link>` 属性正确闭合。真实浏览器标签页显示效果需要用户本地确认。

---

## 2026-09-06（第五次追加）

**REQ-085：start-planto.bat 编码问题复现，改用纯英文内容彻底避开 Windows 批处理文件的代码页坑**

用户反馈双击 `start-planto.bat` 报乱码错误——跟 `docs/KNOWLEDGE.md`
记录过的"中文 Windows .bat 脚本必须避开 UTF-8"是同一类问题。REQ-055
当时修成 GBK 编码，但这次复现说明"存成 GBK"不是一劳永逸的：文件很
可能在改名过程中被某个编辑器（Cursor）按默认的 UTF-8 重新保存，悄悄
把编码改回去了，这个风险没有源头性的防护手段。

`chcp` 强制指定代码页这条路 `docs/KNOWLEDGE.md` 已经记录过实测无效。
用户明确要求"不要用 GBK，脚本用英文注释"——把 `start-planto.bat`/
`start-planto.sh` 里所有中文注释和 `echo`/`title` 文案全部翻译成
英文，纯 ASCII 字节在任何代码页下都是同一个字节序列，不管之后被什么
工具用什么编码重新保存都不会再出问题，从根上让这类 bug 不可能复现。
`.gitattributes`/`docs/MODULES.md`/`docs/KNOWLEDGE.md` 里提到 GBK 的
地方同步标注更新。

**验证**（REQ-085）：`file`/`xxd` 核对新文件是纯 ASCII，不存在任何
非 ASCII 字节。用 `Start-Process` 实际跑了改写后的脚本，确认执行到
`npm run dev` 这一步没有复现编码错误（该次测试里 `npm` 报
"not recognized" 确认是测试方法本身环境变量精简导致，不是脚本问题，
正常会话里 `where.exe npm` 能正确找到）。真实 Windows 双击执行效果
需要用户本地确认。

---

## 2026-09-06（第四次追加）

**REQ-084：项目改名为 Planto（寓意"计划落地生根、按部就班地长成"），项目文件夹同步改名**

用户要求把项目改名成 Planto，并给出了寓意。纯品牌/命名调整，不涉及
任何功能行为变化。

全项目搜索 `LifeSpark`/`lifespark`，按"当前状态 vs 历史记录"分类处理：
`package.json` name 字段、`index.html` 标题、三个语言文件的
`app.name`/导入报错文案、全项目 `[LifeSpark]` 日志前缀、Google 日历
同步事件标题前缀和 `extendedProperties` 标记 key（write-only，改名
不影响同步逻辑）、三份 README（标题 + 新增寓意 tagline + clone 命令 +
启动脚本引用）、`start-lifespark.{bat,sh}` 用 `git mv` 重命名为
`start-planto.{bat,sh}`（`.bat` 内容用 PowerShell `-Encoding Default`
写回保持 GBK 编码）、`.gitattributes`/`docs/MODULES.md` 里的活文档
引用，全部改成 Planto。`docs/CHANGELOG.md`/`docs/REQUESTS.md` 里的
历史记录原样保留，不做溯及既往的批量替换。

用户明确要求"连文件夹也一起改名"，项目文件夹从 `E:\ai_workplace\
LifeSpark` 重命名为 `E:\ai_workplace\Planto`——纯文件系统操作，git
仓库历史/远程配置不受影响。README 里的 `git clone` 地址已经预先改成
指向 `github.com/yiran201/Planto.git`，但 GitHub 上的远程仓库本身
还没有改名（`git remote -v` 确认还指向 `.../LifeSpark.git`）——这是
留给用户自己决定的一步：去 GitHub 仓库设置改名，再执行 `git remote
set-url origin` 同步本地配置。

**验证**（REQ-084）：`node --check` 校验了改动的 JS 文件；全局 grep
确认 `src/`、根目录配置文件、三份 README、`docs/MODULES.md` 改名后
无残留；`git mv` 确认两个启动脚本被识别为重命名（保留 git blame
历史）；`.bat` 文件用 PowerShell 写回后核对了字节序列确认是合法 GBK
编码，没有重蹈 REQ-055 之前的编码损坏问题；文件夹重命名前后各跑了
一遍 grep 校验。真实浏览器显示效果、双击启动脚本、GitHub 仓库改名
需要用户自己验证/决定。

---

## 2026-09-06（第三次追加）

**REQ-083：兴趣活动详情页——封面图挪进正文滚动区，不再固定悬在顶部**

用户反馈"md 文件显示的时候图片不要置顶卡住不动"——`ActivityModal.vue`
的封面图原来是正文滚动区（`.activity-modal__reading`，单独
`overflow-y:auto`）外面的兄弟节点，滚动长文章时图片本身不跟着滚，
一直占着最上面的空间。

把 `<img>` 挪到 `.activity-modal__reading` 内部，作为滚动内容的第一
部分，跟正文一起滚动移出视口。滚动容器从"只在有正文时才渲染"改成
无条件渲染，图片和"正文/没有内容提示"都是它的子节点，统一了结构，
不用再维护两套条件分支；没有图片/没有正文的显示效果不受影响。

**验证**（REQ-083）：`@vue/compiler-sfc` 编译通过。手工通读改动后的
模板片段确认三种条件渲染分支互斥不遗漏，没有引入额外 CSS。真实浏览器
滚动效果需要用户本地验证。

---

## 2026-09-06（第二次追加）

**REQ-082：兴趣活动去掉分类功能——搜索改成只按标题匹配，图文本身也不再有分类字段**

用户反馈"进行分类搜索的功能去除掉，搜索时的根据标题匹配搜索就行，
图文里面的分类也去掉"——把 REQ-050/053/058 陆续搭起来的"动态分类"
整套功能（列表页分类筛选 chip/更多分类下拉框、详情/编辑里的分类字段、
8 个内置默认分类的 i18n 翻译）整个删除。

`domain/activityPool.js` 不再读写 `category` 字段，`addCategory()`/
`touchCategoryUsage()` 一起删除；`state/persistence.js` 顶层
`activityCategories` 字段、`migrateActivityCategoryRef()`/
`backfillCategorySeedKeys()` 整个删除（处理更老一套分类体系的
`migrateLegacyActivity()` 保留，跟这次删的是两回事）；
`constants/colors.js` 的 `categoryColor()`/`categoryEmoji()`、
`utils/i18nLabels.js` 的 `categoryLabel()` 一起删除。`ActivityCard.vue`/
`ActivityModal.vue` 去掉 `categories` prop 和所有分类相关的 UI，没有
封面图时的卡片占位从"按分类哈希取色"改成固定的强调色 + 固定 emoji；
`ActivityLibraryPanel.vue` 的分类筛选整套状态删除，`activities`
computed 简化成只按标题子串匹配。三个语言文件删掉 `domain.category`
（8 个）+ `library.categoryLabel`/`categoryPlaceholder`/
`categoryMoreLabel`（3 个）共 11 个 key。

**验证**（REQ-082）：`node --check`/CSS 大括号配平
（`components.css` 130/130）/`@vue/compiler-sfc` 编译均通过。三个
locale 文件全部 key 数量一致（各 269 个，比改动前少 11 个）。手工
通读改动文件，过程中发现并修正一处遗漏：`persistence.js` 顶部的
`createId` 导入在删掉 `activityCategories` 生成逻辑后已经没有调用方，
一并清理。真实浏览器交互效果需要用户本地验证。

---

## 2026-09-06（第一次追加）

**REQ-081：计划页"废止计划"改名"取消计划"+ 二次确认；兴趣活动封面图支持浏览本地文件、去掉图文链接、编辑/删除按钮挪到详情右上角**

用户一条消息提了两处不相关页面的调整。

计划页：把"废止计划"按钮改名"取消计划"，加二次确认，"提醒的实现跟
兑换按钮类似的效果就行"——`PlanPanel.vue` 的按钮外面包一层
`<n-popconfirm>`（跟 `RewardPanel.vue` 兑换按钮同一套惯例），
`handleAbolishPlan()` 改名 `handleCancelPlan()`；只是文案和交互的
调整，`abolished` 字段、`domain/plans.abolishPlan()` 函数名不变，
没有新增"恢复"入口，确认弹窗文案里说明了这一点。

兴趣活动详情/编辑弹层（`ActivityModal.vue`）：①封面图支持浏览本地
文件（跟 REQ-075 背景图片同一套 `FileReader.readAsDataURL()`，上限
3MB——比背景图 8MB 更紧，因为封面图会随活动条目数量累加）；②去掉
图文链接字段（`link`），`domain/activityPool.js`/
`state/persistence.js` 里对应的读写和旧数据迁移逻辑一并去掉；
③编辑/删除按钮从底部按钮行挪到详情区右上角悬浮，复用
`ActivityCard.vue` 卡片缩略图上已有的 `.activity-card__icon-btn`
样式，常驻显示（不需要像卡片缩略图那样"悬停才出现"）。

**验证**（REQ-081）：`node --check`/CSS 大括号配平
（`components.css` 138/138）/`@vue/compiler-sfc` 编译均通过。独立
脚本核对三个 locale 文件全部 280 个 key 名称/数量完全一致。手工
完整通读了 `ActivityModal.vue`/`PlanPanel.vue` 改动后的完整文件，
确认没有误删相邻代码；全局搜索确认 `link` 字段在 `src/` 下已无任何
代码引用。真实浏览器里悬浮按钮定位、二次确认弹窗、本地图片选择的
实际效果需要用户本地验证。

---

## 2026-08-30（第八次追加）

**REQ-080："兴趣活动"重新定位成"攻略笔记"：卡片露出摘要 + 详情/编辑改成阅读/写作排版**

用户反馈"兴趣活动"没用想删掉；排查确认它跟日历/奖励完全没有联系，是
一座孤岛。提了"加个安排到日历的按钮"的方案后，用户想起来真正想要的
是另一件事："我想要的是一片片类似攻略笔记之类的内容，就是一个 md
文件记载着这个活动可以做的事情"——content 这个 Markdown 字段才是
重点。接着反馈"显示详情的时候页面太小了……编辑的时候也是太小了"，
确定了具体改法。

新增 `utils/markdown.js` 的 `extractPlainTextSummary()`（去掉 markdown
语法留纯文字，截断加省略号），`ActivityCard.vue` 卡片标题下新增两行
摘要，从"只看得出标题+封面图"变成"扫一眼知道写了什么"。
`ActivityModal.vue` 弹层从 560px 加宽到 `min(1100px, 100vw-48px)`，
查看态正文包一层单独滚动的阅读区（字号/行距加大，读起来像文档）；
编辑态改成写/预览双栏（左边 Markdown 源文本、右边实时渲染，共用同一份
`renderMarkdown()`），标题/分类/链接/封面图收进紧凑网格给正文腾空间，
900px 断点下双栏改上下堆叠。

**验证**（REQ-080）：`node --check`/CSS 大括号配平/`@vue/compiler-sfc`
编译均通过。独立测试脚本验证了 `extractPlainTextSummary()` 的语法
剥离/截断/空输入处理均正确。手工完整通读改动文件确认没有误删相邻
代码；过程中发现并修正了一处把 Vue `<style scoped>` 专属的 `:deep()`
误用在这个项目实际使用的全局 CSS 文件里的问题（这个项目所有组件都
没有 `<style>` 块，样式统一写在 `css/*.css`），改成普通后代选择器。
真实浏览器交互效果需要用户本地验证。

---

## 2026-08-30（第七次追加）

**REQ-079：悬浮工具栏改横排 + 加展开/收起开关 + 修复无背景图时仍可能透明化的缺陷**

用户提了两点：①悬浮工具栏改横向摆放，能切换收起；②没有背景图片时
不应该进行透明化，加个条件。

`.floating-toolbar` 从 `flex-direction: column` 改 `row`；新增
`uiState.toolbarExpanded`（不持久化，默认 `true`）+ 常驻的"更多"开关
按钮（`MoreHorizRound`，固定在 DOM 顺序最后、贴着容器的固定右边缘，
展开/收起时位置不动），功能按钮加 `v-if="uiState.toolbarExpanded"`。

排查确认第二点是真实的遗留缺陷：REQ-077/078 只在**按钮**上判断了
`backgroundImage`，**效果**本身（`.app-shell--transparent` 绑定）只看
了 `transparentMode`——用户开过透明化后又把背景图删掉，`transparentMode`
不会自动复位，界面会在没有背景图可透出来的情况下继续变淡。修复：
绑定条件改成 `transparentMode && backgroundImage` 都满足才生效。

**验证**（REQ-079）：`node --check`/CSS 大括号配平/`@vue/compiler-sfc`
编译均通过。三个语言文件 `nav` key 数量一致。手工完整通读整个
`App.vue`，核对了透明化条件四种组合（有图/无图 × 开/关）都符合预期。
真实浏览器交互效果需要用户本地验证。

---

## 2026-08-30（第六次追加）

**REQ-078：悬浮按钮挪到右下角，改成可扩展的悬浮工具栏 + 新增快速添加事件**

用户要求把 REQ-077 的"右上角透明按钮"挪到右下角，改成"悬浮工具栏"，
并"试着集成一些常见功能"（开放性授权，AI 自主决定加什么）。

CSS 从单按钮 `.transparency-toggle` 改成容器 `.floating-toolbar` +
按钮类 `.floating-toolbar__btn`（`position:fixed; right:12px;
bottom:12px;` 纵向排列），透明化切换按钮迁移进来，逻辑不变。新增
"快速添加事件"："+"按钮，任意视图下点击直接弹出新建事件表单（默认
今天、默认时间取当前时刻按 15 分钟取整），不强制切换视图。候选功能
筛选过程：主题切换侧边栏已有、"回到今天"各视图头部已有，都不重复放；
语言切换 REQ-008 时用户明确要求从悬浮位置挪回设置页，不再放回来；
快速添加事件是唯一"没有跨视图快捷入口、且日历类应用里公认常见"的
功能，选了这一个。

**验证**（REQ-078）：`node --check`/CSS 大括号配平/`@vue/compiler-sfc`
编译均通过。手工完整通读整个 `App.vue`（不只是改动片段），确认没有
误删相邻代码。真实浏览器交互效果需要用户本地验证。

---

## 2026-08-30（第五次追加）

**REQ-077：右上角透明化切换按钮 + 设置/Google 同步表单细节打磨**

用户一次提了三点：①右上角加个透明按钮，切换日历透明化显示；②设置页/
Google 同步页表单"不自然"，举例"图片链接不用显示全长""谷歌密码前面
显示后面加密"；③过程中追加"背景图片怎么取消，加个勾选框"。

新增 `settings.appearance.transparentMode`，`App.vue` 右上角新增按钮
（设了背景图才显示），切换 `.app-shell` 整体 `opacity`
（`.app-shell--transparent`），让背景图透出来——选择整体调
opacity 而不是逐组件换透明背景色，因为后者要重新适配所有纯色 hex 的
`--bg-*` 变量，改动面太大。Google 同步页 Client ID 输入框改用
`type="password"` + `show-password-on="click"` 默认遮住。设置页背景图
字段：`data:` URI（本地文件，可能近 11MB 长）不再回显原始字符串，改成
"已选择本地图片"提示 + 36×36 缩略图预览，外部 URL 继续用可编辑文本框。
新增"启用背景图片"勾选框（状态从 `!!backgroundImage` 派生，不额外维护
字段），取消勾选即清除背景图，从空状态勾选直接唤起文件选择器。

**验证**（REQ-077）：`node --check`/CSS 大括号配平/`@vue/compiler-sfc`
编译（`App.vue`/`SettingsPanel.vue`/`GoogleSyncPanel.vue`）均通过。三个
语言文件 `nav`/`settingsView`/`sync` key 数量一致。手工完整通读改动
代码确认没有误删相邻声明（过程中发现并修正一处 IME 误输入的日文汉字，
已改回中文）。真实浏览器交互效果需要用户本地验证。

---

## 2026-08-30（第四次追加）

**REQ-076：背景图片去掉透明度调节，按原样全不透明显示**

用户要求"背景图的效果不用设置透明化"。删掉了 REQ-011 时期的透明度
滑块（`appearance.backgroundOpacity`，默认 20%）——`App.vue` 的
`backgroundStyle` 不再计算/应用 opacity，浏览器默认 100% 不透明显示；
`SettingsPanel.vue` 对应的 `n-slider` 分区删除；`persistence.js` 的
`createDefaultState()` 不再生成这个字段，老数据里的原样留着当死数据；
三个语言文件的 `backgroundOpacityLabel` 一并清理。

**验证**（REQ-076）：`node --check`/`@vue/compiler-sfc` 校验通过；三个
语言文件 `settingsView` key 数量一致（各 36 个）。Grep 确认
`backgroundOpacity` 只剩一句解释性注释，无活代码引用。手工重新通读了
两处改动前后的代码，确认没有误删相邻声明（吸取 REQ-073 的教训）。

---

## 2026-08-30（第三次追加）

**REQ-075：背景图片支持浏览本地文件**

用户要求"背景图片可以通过浏览本地文件设置"，原来只能粘贴外部图片 URL。
纯前端应用没有后端上传，用 `FileReader.readAsDataURL()` 把选中的本地
图片转成 base64 `data:` URI 存进同一个 `appearance.backgroundImage`
字段——CSS `url()` 原生支持 `data:` URI，`App.vue` 的渲染逻辑不需要
改动，两种来源（URL 粘贴/本地文件）共用同一个字段和已有的透明度滑块。
定了 8MB 原始文件大小上限（超出拒绝并提示，避免把本地数据库/导出 JSON
拖得太大），文件类型用 `accept="image/*"` + `file.type` 双重校验。
原有的 URL 输入框保留，新按钮并排放在同一行。

**验证**（REQ-075）：按 AGENTS.md P2-2，未代为执行 `npm run dev`。
`node --check`/`@vue/compiler-sfc` 校验通过；三个语言文件
`settingsView` 分区 key 完全一致（各 37 个）。手工通读整个组件的
`<script setup>` 确认新增声明和既有的 `importInputRef` 等没有命名
冲突、没有误删任何既有代码（吸取 REQ-073 的教训）。真实浏览器验证
需要用户本地完成。

---

## 2026-08-30（再追加）

**REQ-074：修复年视图"今天"高亮在相邻月份卡片上重复出现（REQ-060 遗留 bug）**

用户截图反馈：8 月卡片的 31 号和 9 月卡片开头（属于 8 月的空白补位格）
同时都显示"今天"的蓝色描边。排查确认是 REQ-060 年视图上线时就有的
遗留 bug，不是这次会话新引入的——`year-day--today` 的判断条件只比较
日期字符串，没有像 REQ-069 新增的 `year-day--holiday`/`year-day--workday`
那样加上"只在真正属于这张月份卡片的格子上生效"的月份判断；补位格子
本质上是相邻月份卡片里已经渲染过一次的同一个日期，"今天"落在某张卡片
的补位区域时就会两张卡片同时高亮。

修复：给 `year-day--today` 补上 `date.getMonth() === m.month` 判断，
和另外两个状态类保持一致写法。

**验证**（REQ-074）：`@vue/compiler-sfc` 编译通过。写验证脚本模拟
"今天=2026-08-31"（9 月第一天是周二，8/31 是 9 月卡片的补位格）这个
真实场景：修复前 9 月卡片会误命中 1 次，修复后 8 月/9 月分别正确命中
1 次/0 次。真实浏览器视觉效果需要用户刷新确认。

---

## 2026-08-30（追加）

**REQ-073：修复 REQ-072 引入的运行时崩溃（App.vue 页面卡死在加载动画）**

用户反馈"一直处于加载中状态"。先用真实备份数据把持久化/迁移管线在
Node 里跑了一遍确认不是数据问题，再让用户截图 Console 看到真实报错：
`ReferenceError: now is not defined at setup (App.vue:89:7)`。

**现象与根因**：REQ-072 编辑 `App.vue` 时，`old_string`/`new_string`
替换不小心把紧挨着 `onMounted(...)` 前面的 `const now = useNow();`
整行删掉了，`watch(now, ...)` 因此引用一个从未声明的变量，
`<script setup>` 执行阶段直接抛异常，导致 `mount('#app')` 永远不会
成功、加载动画永远不会淡出——是一次真实的 AI 编辑失误，不是既有代码
问题。静态编译检查（`@vue/compiler-sfc`）只做语法解析，不检查"变量
有没有声明"，这类错误编辑当时没能被发现。

**修复方式**：`onMounted(...)` 前补回 `const now = useNow();`，其余
代码不变。

**验证**（REQ-073）：`@vue/compiler-sfc` 编译通过；手工通读整个
`App.vue` 的 `<script setup>`，逐一核对每个 import/声明是否都在
使用前完成，确认这是唯一一处遗漏。真实浏览器加载需要用户本地刷新
确认。

---

## 2026-08-30

**REQ-072：Google 同步重做：登录改整页跳转 + 补外部用户配置引导 + 双向日历同步取代忙碌时段读取**

用户连续反馈三点，一次性处理：①Google 登录弹窗完成授权后应用不显示
已登录状态；②之前手动教的"OAuth 同意屏幕改外部用户"步骤要补进应用
自己的引导流程；③"读取忙碌时段（避让冲突）"去掉，换成双向日历同步，
同步方式 AI 自主决定、事后报告。

**根因排查**：登录不显示状态不是操作问题——`vite.config.js` 给页面加的
`Cross-Origin-Opener-Policy: same-origin`（OPFS 本地数据库硬性前提）
会把弹窗的 `window.opener` 置空，Google 登录弹窗完成后没法把结果传回
主页面，**静默失败、不报错**。用 WebSearch 核实这是 COOP:same-origin
和 OAuth 弹窗的已知通病，两个更宽松的 COOP 选项都不能两全，结论记进了
`docs/KNOWLEDGE.md`。解法：`calendar/googleAuthClient.js` 整个重写，
登录从"弹窗 token client"改成"整页跳转的手写 OAuth2 隐式授权流程"
——跳到 Google 授权页，同意后带 `access_token` 跳回来，
`consumeRedirectToken()`（`App.vue` 挂载时调用）解析 token、`state`
参数做 CSRF 校验、清理地址栏；检测到刚登录成功会自动跳回 Google 同步
页给用户一个立刻看得见的反馈。`index.html` 删掉不再需要的 Google
Identity Services 脚本。

`GoogleSyncPanel.vue` 的配置引导新增"配置 OAuth 同意屏幕（外部用户+
测试用户）"这一步，原来的步骤重新编号；"已获授权来源"步骤扩展成同时
展示新增必填的"已获授权的重定向 URI"。

`handleFetchBusy()`（读取忙碌时段生成文字提示，不落地成真正日历块）
连同它依赖的 `calendar/sessionState.js` 整个删除。新增"Google → 本地"
同步：排查发现 `DayTimeline.vue` 等组件里早就有一整套"Google 来源的
块只读、不计入奖励点数、不算月/年视图事件点数"的展示逻辑，只是之前
没有真正的调用方用过，直接复用；策略是"整周替换"（清空这一周所有旧
Google 块、写入这次拉到的新块），Google 那边删掉的事件本地会自动跟着
清掉。`calendar/conflictMapper.js` 改名 `googleEventMapper.js` 贴合
新用途。"本地 → Google"方向保留原逻辑不变，只是时间戳字段从单一的
`lastSyncedAt` 拆成 `lastSyncToGoogleAt`/`lastSyncFromGoogleAt` 两个
独立方向。`persistence.js` 新增 `migrateGoogleSync()` 处理老数据迁移，
确认从未被读写过的 `syncedEventIds` 字段一并删除。

**验证**（REQ-072）：按 AGENTS.md P2-2，未代为执行 `npm run dev`——
整页跳转式 OAuth 涉及真实浏览器导航和 Google 服务器交互，真实登录/
同步效果需要用户本地验证，是本次验证覆盖最弱的一环。`node --check`/
`@vue/compiler-sfc` 校验通过；三个语言文件 `sync` 分区 key 完全一致
（各 36 个）。写了三份 stub 掉浏览器全局对象的独立验证脚本：登录/
CSRF 校验/取消授权三个场景、`migrateGoogleSync()` 三种输入、"整周
替换"合并逻辑四个场景，全部通过。Grep 确认删除的模块/函数无残留引用。

---

## 2026-08-29（第十次追加）

**REQ-071：补齐 2027 年美国/日本节假日数据（中国大陆官方尚未公布）**

用户要求把明年（2027）的节假日数据也加载进来。分地区核实可得性：
中国大陆的放假调休安排每年由国务院临时发文，历史规律是上一年底才
发布，核实时（2026-08）2027 年具体安排官方还没公布，只知道节日本身
的公历日期、不知道调休安排，**没有添加**，不能凭空猜；美国联邦假日
由固定法律规则决定、日本国民の祝日由法律+天文推算决定，两者都能提前
准确算出，用 WebSearch 核对多个独立来源（美国：timeanddate.com/
federalpay.org；日本：国立天文台暦計算室官方 + 内閣府）后**已添加**
`US_2027`/`JP_2027`。文件顶部注释同步说明中国大陆数据缺失的原因，
避免以后被误认为漏补。

**验证**（REQ-071）：`node --check` 通过；`node -e` 直接调用真实的
`getHolidayInfo()` 核对了美国/日本 2027 年数份已知日期（含 Independence
Day/Juneteenth 的 observed 变体、日本春分の日/振替休日）返回正确，
中国大陆 2027 年确认返回 `null`（没有被误填），2026 年既有数据不受
影响。

---

## 2026-08-29（第九次追加）

**REQ-070：周期事件改成滚动续期，始终保持未来一年已物化**

用户问了周期事件的加载机制，排查确认原实现是"创建时一次性生成"，受
366 天/200 实例两个硬上限约束、之后不会再自动续——高频的"每天"系列
200 个实例撑不到 200 天就断供。用户要求"始终保持未来一年已加载，不
需要切换月份触发"，确认可行后实现。

`domain/recurringEvents.js` 重写物化策略：每条规则新增
`materializedUntil`/`materializedCount` 两个进度字段；'never' 类型的
物化目标永远是"今天+366天"这个随时间推移的滚动终点，'until'/'count'
类型用自己的截止条件封顶；`createRecurringEvent()` 变成"从空白起点
续期一次"的特殊情况，和新增的 `extendAllRecurringSeries(store)`（批量
续期，无变化时不写 state）共用同一套逻辑。原来"总数≤200"的硬限制
换成只针对极端输入的安全兜底（`MAX_INSTANCES_PER_OP=3000`）。
`state/persistence.js` 新增 `migrateRecurringEventRule()`：老数据
通过扫描 `dayTimelines` 反推初始进度，安全接入新逻辑。`App.vue` 的
`onMounted` 和 `watch(now,...)` 里都调用续期，覆盖"重新打开应用"和
"长时间开着标签页跨年"两种场景。

**验证**（REQ-070）：`node --check`/`@vue/compiler-sfc` 校验通过。写了
独立验证脚本（内存态 store 桩）跑了四个场景：daily/never 创建后物化到
今天+366天、立即再续期是空操作、回拨进度后能正确补齐；daily/until 正好
生成到截止日为止；weekly/count 正好生成够数；老数据迁移取值正确且
幂等。全部通过。真实浏览器里的物化效果需要用户本地验证。

---

## 2026-08-29（第八次追加）

**REQ-069：年视图补上节假日标注**

REQ-068 删掉年视图热力图之后，用户紧接着要求"年视图的节假日要标上"
——节假日标注是 REQ-011 就有的既有能力（月/周视图都已经在用），年视图
之前一直没接入，不是这次删热力图连带删掉的，是本来就缺。

格子只有 9px 字号放不下假日名文字，改成格子染色（放假红/调休静音色
描边，颜色惯例和 `.month-cell__holiday` 一致）+ 原生 `title` 属性
hover 提示完整假日名，不新增组件。数据来源直接复用
`domain/holidays.getHolidayInfo()`，和 `MonthBoard.vue` 同一套逻辑。

**验证**（REQ-069）：`@vue/compiler-sfc` 编译通过；CSS 大括号配平
（118/118）。`node -e` 直接调用真实的 `getHolidayInfo()` 核对了四个
已知日期（国庆节/国庆节调休/美国独立日/无节假日），结果符合预期。
真实浏览器视觉效果需要用户本地确认。

---

## 2026-08-29（第七次追加）

**REQ-068：月视图去掉周期事件的点数标注 + 年视图热力图改成月度标语**

用户一次提了两点：①月视图应主要标注节假日之类的，周期事件不进行数量
标注；②年视图不要按事件数量深浅染色，改成支持在页面上给月份目标添加
标语。

`MonthBoard.vue` 的 `blocksForDate()` 加一层过滤，排除
`block.recurringId` 存在的周期事件实例——周期事件天天/每周重复出现，
挤占本就只有 4 个点位的展示空间，参考价值低；节假日名标注不受影响。
`YearBoard.vue` 删除 REQ-060 时期的 0~4 五档热力图（`dayIntensity()`/
对应 CSS/图例/i18n key 一并清理），改成每个月份卡片下方一行可编辑的
标语（未设置时 hover 显示"+ 添加标语"，点击进入编辑态，`n-input`
`autofocus` 自动聚焦，回车/失焦保存，Esc 取消）。新增 `utils/dateUtils.js`
的 `getMonthKey(date)` 和 `state/persistence.js` 顶层的
`monthLabels: {}`（`{monthKey: text}`，纯自由文本），走已有的顶层浅
展开合并。

**验证**（REQ-068）：按 AGENTS.md P2-2，未代为执行 `npm run dev`。
`node --check`/`@vue/compiler-sfc`（含 compileTemplate）校验通过；CSS
大括号配平（116/116）。手工审查了 Esc 取消 vs 回车保存的时序竞态——
`n-input` 卸载会紧跟一次原生 blur，`saveLabel()` 靠
`editingMonthKey.value !== key` 的前置判断避免了"Esc 取消后被 blur
补救性存进去"和"回车保存后被 blur 重复写一次"这两个潜在问题。三个
语言文件 `year` 分区 key 数量一致（各 5 个）。真实浏览器交互效果需要
用户本地验证。

---

## 2026-08-29（第六次追加）

**REQ-067：删除内置奖励种子数据，新装用户"奖励"页不再自带 17 项示例**

用户要求"奖励里面的默认数据帮我清除掉"。`state/persistence.js` 的
`SEED_REWARDS`（17 项示例：佳能相机/MacBook/多国旅行等，用户在
REQ-018 时提供，REQ-019/022/023/031/058 陆续调整过定价/展示方式）一直
是新装用户默认拿到的"奖励"清单——开源发布前，这份带具体品牌/价格的
示例数据不适合让每个新用户自动拿到，和 REQ-048 清空兴趣活动库内置
种子数据是同一类取舍。

`SEED_REWARDS` 连同只服务它的 `REWARD_TITLE_TO_SEED_KEY`/
`backfillRewardSeedKeys()`、`refreshRewardValuesFromSeedPrices()`
（"把内置奖励价格对齐最新日元参考价"的一次性操作，唯一数据来源就是
`SEED_REWARDS`）一并整个删除，不是留着当死代码——种子数据没了，这几个
函数留着调不出任何有意义的结果。`createDefaultState()` 的 `rewards`
改成恒为空数组，`meta` 不再生成配套的 `rewardValuesRefreshedAt`
幂等标记，`App.vue` 挂载逻辑里对应的调用点和 import 一起删除。用户
已有的、带着 `seedKey` 的老奖励记录不受影响——`seedKey` 字段和
`rewardLabel()` 的展示逻辑都没变，三个语言文件的 17 条奖励翻译表也
保留，继续服务这些老数据。

**验证**（REQ-067）：按 AGENTS.md P2-2，未代为执行 `npm run dev`。
`node --check` 校验了 `persistence.js`/`rewards.js`；`@vue/compiler-sfc`
实际编译 `App.vue`/`RewardPanel.vue` 均通过。Grep 全 `src/` 确认
`SEED_REWARDS`/`refreshRewardValuesFromSeedPrices`/
`backfillRewardSeedKeys`/`REWARD_TITLE_TO_SEED_KEY` 只剩说明性注释，
没有活代码残留。真实浏览器里全新安装奖励页为空、老数据奖励记录不受
影响，需要用户本地验证。

---

## 2026-08-29（第五次追加）

**REQ-066：端口从 8090 改成 6060（用户指定）**

用户直接要求换成 6060，不是又一次报错排查——REQ-065 选定的 8090 本身
没有问题，纯粹是用户偏好换个更好记的数字。先用
`Get-NetTCPConnection` 确认 6060 当时本机空闲，并核对不在
`docs/KNOWLEDGE.md` 新记录的浏览器不安全端口黑名单里，才动手改，不是
拿到数字就直接改。把 REQ-065 里所有 `8090` 统一替换成 `6060`：
`vite.config.js`、三个语言文件、`GoogleSyncPanel.vue` 注释、两个启动
脚本、三份 README。

**验证**（REQ-066）：`Get-NetTCPConnection`/`netstat` 实测确认 6060
空闲；对照黑名单列表核对不在其中。`node --check`/`@vue/compiler-sfc`
校验通过；`start-lifespark.bat` 改动后验证仍是 GBK 编码。真实浏览器
验证需要用户本地完成。

---

## 2026-08-29（第四次追加）

**REQ-065：端口从 6000 改成 8090（6000 是浏览器内置黑名单端口，ERR_UNSAFE_PORT）**

REQ-064 修完后用户浏览器直接报 `ERR_UNSAFE_PORT`。用 WebSearch 核实
确认：6000 是 Chrome/Firefox 等主流浏览器内置的"不安全端口"黑名单
成员（历史上是 X11 保留端口，浏览器出于防跨协议攻击考虑直接拒绝对
这批端口发 HTTP 请求），服务器怎么配置都没用，必须换端口——REQ-063
选 6000 这个数字本身就是问题根源。

本想换成更常见的 8080，但实测这台机器上已经有个无关的 node 进程占着
8080，`strictPort:true` 会导致启动失败，改选 **8090**（不在浏览器
黑名单里，也不是常见框架默认端口，撞车概率更低，实测确认空闲）。全
仓库 Grep `6000`（排除 CSS 颜色 `#b06000`、奖励参考价、`3600000` 毫秒
常量这几处巧合数字命中）逐个改成 `8090`：`vite.config.js`、三个语言
文件、`GoogleSyncPanel.vue` 注释、两个启动脚本（`.bat` 继续用
PowerShell `-Encoding Default` 保持 GBK 编码）、三份 README。新增
`docs/KNOWLEDGE.md` 条目记录"浏览器内置 HTTP 不安全端口黑名单"这个
教训。

**验证**（REQ-065）：WebSearch 核实"6000 是 Chrome 不安全端口"这个
客观事实（多个独立来源一致）；`Get-NetTCPConnection`/`netstat`/
`tasklist` 实测确认 8080 被占用、8090 空闲，不是猜测。`node --check`/
`@vue/compiler-sfc` 校验通过；`start-lifespark.bat` 改动后验证字节
仍是 GBK 编码。真实浏览器里完整走一遍登录流程需要用户本地验证。

---

## 2026-08-29（第三次追加）

**REQ-064：修复开发服务器只绑定 IPv6 loopback 导致部分环境"网页访问不到"**

REQ-063 固定端口重启后，用户反馈"网页访问不到了好像"。用
`Get-NetTCPConnection`/`Invoke-WebRequest` 实测确认：`vite.config.js`
没有显式设置 `host` 时，这台机器上 Vite/Node 只把端口绑定到 IPv6
loopback（`[::1]`），`http://127.0.0.1:6000` 会被直接拒绝——
`http://localhost:6000` 能不能打开因此取决于当时浏览器/系统把
"localhost" 解析成哪个地址族，不稳定，这正好解释了固定端口后反而出现
的访问异常。

`server`/`preview` 都加了 `host: true`，让 Vite 同时监听本机所有
IPv4/IPv6 地址。代价是开发服务器也能被同一局域网内其它设备访问到——
应用是纯前端 SPA，真实数据只在各自浏览器的 OPFS 里，不经过开发服务器，
对单人本地开发场景可以接受。Google OAuth 用的 Authorized origin 不受
影响，仍然是域名形式的 `http://localhost:6000`。

**验证**（REQ-064）：按 AGENTS.md P2-2，未代为重启用户自己终端里的
`npm run dev` 进程，只做了只读诊断：确认当时监听 6000 端口的进程只
绑定了 `[::1]`；分别请求 `localhost`/`127.0.0.1`/`[::1]` 复现了
"127.0.0.1 连接被拒绝、另外两个返回 200"的不对称现象。`host:true`
是 Vite 官方文档记录的标准选项，配置语法按类型定义核对无误。改动后
是否真的双栈监听、浏览器实际能否访问，需要用户重启开发服务器后本地
验证。

---

## 2026-08-29（再追加）

**REQ-063：开发/预览端口固定为 6000，解决 Google OAuth 端口漂移导致的 401 invalid_client**

用户配置 Google Calendar 联动时报"错误 401：invalid_client / no
registered origin"。排查确认根因是 Vite 默认端口 5173 被占用时会静默
换成 5174 等，而 Google Cloud Console 的"已获授权的 JavaScript 来源"
要求逐字符匹配当前端口，用户截图也证实了这个客户端的 Authorized
origins 确实是空的。用户要求把端口固定为 6000，并要求"涉及端口的都
修改好"。

`vite.config.js` 的 `server`/`preview` 都加了 `port:6000` +
`strictPort:true`（端口冲突时直接报错退出，不再静默换端口）。全仓库
Grep `5173` 逐个改掉：三个语言文件的 Google 同步引导文案、
`GoogleSyncPanel.vue` 顶部注释、三份 README 的快速开始命令、
`start-lifespark.sh` 注释都是常规文本替换；`start-lifespark.bat` 因为
必须保持 ANSI/GBK 编码（`docs/KNOWLEDGE.md` 已有踩坑记录），改用
PowerShell `-Encoding Default` 读写，没有用会把文件转存成 UTF-8 的
普通编辑工具。`GoogleSyncPanel.vue` 里"动态显示 `window.location.origin`
真实值给复制"这个设计本身**没有改**——生产部署域名场景仍然需要这个
动态取值，只更新了面向"本地开发端口"这句纯说明性文案里的数字。

**验证**（REQ-063）：按 AGENTS.md P2-2，未代为执行 `npm run dev`。
`node --check`/`@vue/compiler-sfc` 校验通过；Grep 确认 `5173` 只剩
`CHANGELOG.md`/`REQUESTS.md` 里既有历史 REQ 条目的记录，代码/README/
脚本里已无活引用。`start-lifespark.bat` 改动后用 PowerShell 验证字节：
无 UTF-8 BOM、非合法 UTF-8 字节序列，确认仍是 GBK 编码。真实浏览器里
端口是否真的固定在 6000、Google 登录流程是否不再报错，需要用户本地
验证。

---

## 2026-08-29（追加）

**REQ-062：README 精简改写 + 拆分中/英/日三份文件**

用户反馈 REQ-061 版 README"有点过于复杂"，要求参考其它开源产品的写法
精简，并且要中/英/日三份独立的 README 文件，不是一份文件里放语言切换。

用 WebFetch 实际抓取了 `excalidraw/excalidraw`（徽章居中、Features 单行
bullet、Contributing/License 独立成节）和 `siyuan-note/siyuan`（语言
切换链接紧跟在标题上方）两个成熟开源项目的真实 README 结构，不是凭
印象设计。据此把 REQ-061 版本里的多段开场散文、每条 feature 后面的长
解释从句、数据隐私/技术栈/Google 集成里的多层分点结构，统一压成每节
3-6 行的单层 bullet 列表；语言切换链接挪到标题正上方。

拆成 `README.md`（简体中文，默认）/`README.en.md`/`README.ja.md` 三个
文件，结构完全一致，互相用相对链接指向对方。REQ-061 核对过的三处事实
修正（Google 联动才联网、兴趣活动不自动进日程、计划关键事件必须严格
按顺序）压缩成一行内嵌短语保留，没有为了精简而丢准确性。英/日文版的
"文档"一节如实标注 `docs/` 下的治理文档目前只有中文版本，没有假装
它们也多语言。

**验证**（REQ-062）：纯文档改动，按 AGENTS.md P2-2 未代为执行
`npm run dev`/`build`。逐条核对三份 README 的事实性描述与仓库真实文件/
代码一致；三份文件互相的语言切换链接路径手工核对正确。真实 GitHub
页面渲染效果需要用户 push 后自行确认。

---

## 2026-08-29

**REQ-061：README 对照开源发布模板重新整理 + 补齐 Apache-2.0 许可证**

用户准备开源发布，提供了一份通用"日程管理日历"项目的 README 模板
（核心特性/数据与隐私/技术栈/部署运行/桌面快捷启动/许可证/贡献这套
结构），要求整理进项目 README，并让核对是否符合项目真实情况。

逐条核对后发现模板三处和真实实现不符：①"数据不经过任何网络传输"这个
绝对化表述和已有的 Google Calendar 可选联动（会发起真实网络请求）矛盾；
②"活动池子……挑选事件填入日程"描述的是 REQ-048 之前、REQ-052 已删除的
旧自动排程设计，现在的"兴趣活动"是手动维护的个人参考库，不会自动填入
日程；③"计划"描述弱化了 `domain/plans.js` 里"关键事件必须严格按顺序
解锁"这条硬规则。README 重写时保留模板的章节结构和 emoji 风格，内容按
真实代码行为改写这三处；技术栈补齐成实际的 Vue3+Vite+Naive UI+
vue-i18n+sqlite-wasm(OPFS)；快速开始/桌面快捷启动换成项目真实的
`npm run dev`/`start-lifespark.bat`/`.sh`，不留模板占位符。原有的
"低效率做计划人群"定位开场（REQ-055/059 迭代成果）和核心功能列表细节
予以保留，只是重新套进新章节结构。

许可证此前项目完全没有定过，是没有来源的项目专属决策（P0-3），用
AskUserQuestion 停下来问用户，用户选择 Apache License 2.0（不是模板
默认建议的 MIT）。新增 `LICENSE`（标准 Apache-2.0 全文，Appendix 版权行
`Copyright 2026 yiran201`，取自 GitHub 远程仓库 `yiran201/LifeSpark`），
README 新增"许可证"分区链接过去。

**验证**（REQ-061）：纯文档改动，按 AGENTS.md P2-2 未代为执行
`npm run dev`/`build`。逐条对照 README 新写的描述和真实源码：
`domain/plans.js` 的顺序推进逻辑、`domain/activityPool.js` 的字段集合
（不含任何自动排程相关字段）、`src/calendar/googleAuthClient.js`/
`googleCalendarService.js` 确认联动会发起真实网络请求、
`vite.config.js` 的 COOP/COEP 响应头配置、`start-lifespark.bat`/`.sh`
和 `package.json` 的 `dev`/`build`/`preview` 脚本名，均核对一致，未发现
新的夸大或过时描述。`LICENSE` 内容与 Apache 官方发布的标准文本核对一致。
真实 GitHub 页面渲染效果需要用户 push 后自行确认。

---

## 2026-08-27（第五次追加）

**REQ-060：新增年视图 + 月视图/其它改进建议**

用户问月视图有什么建议，同时明确要求"加个能切换到年视图的机制"，另外
让想想还有哪些地方能改进。年视图是明确的构建需求，直接实现；月视图
建议和其它改进想法是开放性问题，只在对话里给了建议列表，没有未经确认
就动手改。

`utils/dateUtils.js` 新增 `getYearStart`/`addYears`（和 `getMonthStart`/
`addMonths` 同一种写法）。新增 `src/components/YearBoard.vue`：一屏铺开
当前年份的 12 张迷你月历（复用 `getMonthGridDates()` 现成算法），点月份
卡片跳月视图、点某天跳日视图；每个格子按"当天有几个非 Google、非跳过
的时间块"染成 0~4 五档热力图色阶（`color-mix(in srgb, var(--accent)
N%, var(--bg-tertiary))`，深浅主题自动适配）。属于别的月份的补位格子
在年视图里直接留空不可点，边角日期细节留给月/日视图。`App.vue` 新增
`uiState.selectedYear`、注册 `viewComponents.year`；`SidebarNav.vue`
新增导航项（图标 `GridViewRound`，排在"月度视图"后面）。三个语言文件
新增 `nav.year`/`year.*`/`domain.monthShort`（12 个月份短名数组，英文
是 Jan/Feb 缩写）。

月视图建议（未实现，供参考）：加一点"完成/跳过"状态的视觉区分（不只是
事件类型圆点）；节假日名窄屏容易被截断，可以加 tooltip。其它改进想法：
计划页缺"全部展开/折叠"批量操作；奖励页"待兑换"列表缺排序/筛选；可以
考虑一个汇总点数/计划进度/本周完成率的总览仪表盘；主题缺"跟随系统"
选项。

**验证**（REQ-060）：按 AGENTS.md P2-2 未代为执行 `npm run dev`。
`node --check`/`@vue/compiler-sfc` 校验全部通过；写脚本验证了
`getYearStart`/`addYears` 正确性（含跨年边界、闰年）和 12 份月历网格
首尾日期；`GridViewRound` 图标核对过真实存在；三个语言文件新增 key
完全一一对应（274/274/274）。真实浏览器里热力图色阶效果、`color-mix()`
渲染效果需要用户本地确认。

---

## 2026-08-27（第四次追加）

**REQ-059：README 重新定位，面向"低效率做计划"人群，突出计划事件推进 + 奖励机制**

用户要求把 README 重新写一遍："主要是给低效率做计划的人群准备，按照
计划可以进行的事件，并控制好奖励的分类"——在 REQ-055 那版"产品介绍
优先"重构基础上进一步收窄开场定位，把"目标拆解成按顺序推进的关键
事件"（`domain/plans.js`）和"奖励点数经济"（`domain/rewards.js`）这两
个具体机制摆到最前面，不是简单换几句话。

开场从"体验驱动 + 新鲜感优先"的年度规划定位，改成直接点名目标用户
（做计划总是低效率的人）和卡住的具体原因（目标太大/选项太多/没有即时
反馈），给出解法：计划必须拆成有先后顺序的关键事件、严格按顺序解锁
推进（对应 `plans.js` 顶部注释里的硬规则）；完成即时结算点数，攒够去
兑换自定义的奖励清单（对应 `RewardPanel.vue` 的待兑换/已兑换两个
分区）。"这是什么"改成先讲这两套核心机制，原来放最前面的"四阶段年度
节奏 + 每周自动生成"降级成"除此之外……"的可选补充能力（这是真实情况，
四阶段生成本身独立可选，不依赖也不被计划/奖励机制依赖）。"核心功能"
列表顺序相应调整，补了"可继续追加事件"、"待兑换/已兑换分类查看"这些
之前没写但确实存在的细节；多语言那条补了一句呼应 REQ-058 的说明。
快速开始/Google Calendar 配置/技术实现/目录结构/开发流程几节内容没有
事实性变化，原样保留。

**验证**（REQ-059）：纯文档改动，逐条核对新写的功能描述和真实代码行为
一致（`domain/plans.js` 的顺序推进规则、`RewardPanel.vue` 的待兑换/
已兑换分区和二次确认、点数按平日/周末比率结算），没有夸大或编造功能。

---

## 2026-08-27

**REQ-055：修复一键启动脚本报错 + README 重构成产品介绍向**

用户反馈"启动脚本执行不了，执行就报错"，并要求把 README 重构成主要
介绍产品的版本，准备把项目上传到 git。

**现象与根因**：`start-lifespark.bat` 双击/执行报"'xxx' 不是内部或
外部命令"，报错里的"命令名"是脚本里某句中文注释或提示语的后半截。
排查发现文件保存成了 UTF-8（无 BOM）——中文 Windows 的 `cmd.exe` 默认
按 GBK（936）代码页逐字节扫描 `.bat` 文件找命令分隔符，UTF-8 的 3 字节
中文字符用 GBK 双字节配对规则解析会错位，错位后偶然拼出 ASCII 分隔符，
把脚本从中文文本内部截断执行。曾尝试在脚本第一行加 `chcp 65001 >nul`
补救，实测无效（`cmd.exe` 批处理解析不是逐行按最新代码页重新生效，
紧跟在 `chcp` 后面的中文行依旧按原代码页解析出错）。

**修复方式**：整个文件转成 ANSI（GBK）编码保存，CRLF 换行；脚本原有
逻辑（cd 到自身目录 → 首次自动 `npm install` → `npm run dev -- --open`）
未做任何改动，纯编码修复。用 `cmd.exe` 实际执行验证：修复前在第一行
中文 REM 注释处即报错；修复后完整跑通到 `VITE v6.4.3 ready` 并监听
`http://localhost:5173/`。这条踩坑记录写入了
`docs/KNOWLEDGE.md`（"中文 Windows 上 .bat 脚本必须避开 UTF-8（不带
BOM）编码"），防止以后新增的 `.bat` 脚本重复出这个问题。

`README.md` 原版是"技术选型演进记录"式写法（大段 REQ 编号引用、存储
方案取舍细节），作为 git 仓库首页第一印象不合适。重构成产品介绍优先的
结构：开头一句话定位 + 核心功能 bullet 列表，技术细节收进靠后的"技术
实现"精简小节（详细决策历史改链接到 `docs/CHANGELOG.md`），快速开始
部分补充了双击 `start-lifespark.bat` 一键启动的说明。Google Calendar
配置步骤、目录结构/开发流程链接原样保留，没有事实性内容被删除，只是
重新组织了呈现顺序和详略。

上传 git 前额外确认了 `data/lifespark-backup-2026-08-22.json`（含真实
用户数据的导出备份）已经被 `.gitignore` 里 `lifespark-backup-*.json`
规则正确排除（`git check-ignore` 验证通过），不需要额外处理。

**验证**（REQ-055）：这次是 AGENTS.md P2-2 的例外——用户明确要求排查
"启动脚本报错"这个执行类问题，不实际运行脚本无法定位/验证根因，因此
执行了项目启动命令（`npm run dev`、`cmd.exe` 运行
`start-lifespark.bat`）确认了修复前后的具体行为差异。README 改动是
纯文档，未做代码层面校验。

---

## 2026-08-27（第三次追加）

**REQ-058：兴趣活动类别 + 奖励种子数据补齐多语言**

用户要求"实现项目的多语言对应，实现中日英三种语言"。排查确认 vue-i18n
核心配置和界面文案早就完整实现了（三份语言文件 242 个 key 一一对应，
所有组件走 `t()`，没有硬编码文字），但两处内置数据不跑 i18n：8 个默认
兴趣活动类别（REQ-053 起类别变成用户自由文本，没法整体走 i18n）、17
条默认奖励种子数据（佳能相机/MacBook/各国旅行等）。跟用户确认后明确：
只需要把这两处种子数据也补上翻译，不是要把整个类别/奖励体系强制 i18n
——用户自建的类别/奖励继续没法自动翻译，这个限制保留。

给两类种子数据加了稳定的 `seedKey`（只有内置的 8/17 条带，用户新建的
没有）。`state/persistence.js`：`SEED_ACTIVITY_CATEGORY_NAMES` 改造成
`SEED_ACTIVITY_CATEGORIES: [{seedKey, name}]`，`SEED_REWARDS` 每项加
`seedKey`；新增 `backfillCategorySeedKeys()`/`backfillRewardSeedKeys()`
在 `fillMissingDefaults()` 里给老数据（按默认名字/标题精确匹配）补
标记，不影响自建数据；`migrateActivityCategoryRef()` 的匹配方式从
"英文标识符→中文名→按名字查 id"三级转换简化成直接按 `seedKey` 匹配，
`LEGACY_CATEGORY_ID_TO_NAME` 映射表整个删除。`domain/rewards.
refreshRewardValuesFromSeedPrices` 的匹配键从 `title` 文本改成
`seedKey`，顺带修掉了"标题一旦被翻译展示就必然匹配不上"这个潜在脆弱点。

新增 `utils/i18nLabels.js`，导出 `categoryLabel(t, category)`/
`rewardLabel(t, reward)`：有 `seedKey` 查 i18n 表，没有就用原始
`name`/`title`，不 import vue-i18n（`t` 由调用方传入，和 `utils/` 下
其它模块一样框架无关）。`domain/activityPool.js` 的 `getCategoryName()`
（不带 i18n 感知）失去最后两个调用方后整个删除。4 个展示类别名/奖励名
的组件（`ActivityCard.vue`/`ActivityModal.vue`/
`ActivityLibraryPanel.vue`/`RewardPanel.vue`）全部改用新函数。三个
语言文件新增 `domain.category.*`（8 个）/`domain.reward.*`（17 个）。

**验证**（REQ-058）：按 AGENTS.md P2-2 未代为执行 `npm run dev`。
`node --check`/`@vue/compiler-sfc` 校验全部通过，三个语言文件新增 key
仍然完全一一对应（267/267/267）。用 Node 的模块 resolve hook 把
`state/db.js`（依赖浏览器专属 OPFS/sqlite-wasm，纯 Node 环境无法直接
import）替换成内存桩，对真实源码做了端到端功能验证（17 项断言全部
通过）：全新安装类别/奖励都带 `seedKey`；`categoryLabel`/`rewardLabel`
对内置数据正确按语言翻译、对自建数据始终返回原文；伪造"REQ-058 之前
落盘的老数据"（含同名撞车风险的自建数据）跑 `loadState()`，确认内置
数据被正确补 `seedKey`、自建数据不受影响；旧英文标识符（`hiking`）的
遗留活动正确迁移关联；`refreshRewardValuesFromSeedPrices` 按
`seedKey` 正确刷新内置奖励价格、不动自建奖励。真实浏览器里切换语言后
的显示效果需要用户本地确认。

---

## 2026-08-27（再追加）

**REQ-057：计划卡片默认折叠 + 去掉周视图/侧边栏的"当前阶段第几周"文字**

用户两条消息连续被打断，追问后确认：①计划卡片默认不应该展开细节；
②"阶段"指的是周视图/侧边栏上"进阶阶段（第 9 周 / 阶段共 13 周）"这类
具体到周数的文字提示，觉得没必要，要求去掉——明确不是要移除探索/筛选/
进阶/记忆这套四阶段年度系统本身（问过用户确认）。git 上传用户说自己来。

`PlanPanel.vue` 折叠状态默认值反过来：变量从 `collapsedPlans`（真值时
折叠，默认展开）改名为 `expandedPlans`（真值时展开，默认折叠），折叠
图标旋转样式和内容区 `v-if` 相应取反，纯 UI 状态调整，`domain/plans.js`
未动。`SidebarNav.vue` 删掉 `.phase-progress__label`（"当前阶段：{phase}
阶段（第 {week} 周 / 阶段共 {total} 周）"），保留四阶段色块进度条和
"全年进度 N%"。`WeekBoard.vue` 删掉 `.view-header` 右侧的 `phaseTag`
`<n-tag>`，连带清掉只为它服务的 `phaseInfo` computed 和三个不再使用的
import（`getPhaseForDate`/`PHASE_COLORS`/`computePhaseWeeksFromGoals`）
及空掉的 `.view-header__right` 容器。四阶段年度系统本体
（`domain/yearPhases.js`）没有改动，`SidebarNav.vue`/`domain/plans.js`/
`domain/goals.js` 仍在用它驱动实际的计划生成/颜色高亮，只是去掉了周
视图和侧边栏重复展示的这行文字。三个语言文件同步删除
`sidebar.phaseCurrent`/`week.phaseTag` 这两个不再引用的 key，
`css/components.css` 里 `.phase-progress__label` 规则删除，
`.phase-progress__year` 补上原来靠它撑开的 `margin-top`。

**验证**（REQ-057）：按 AGENTS.md P2-2 未代为执行 `npm run dev`。
`@vue/compiler-sfc` 编译 `PlanPanel.vue`/`SidebarNav.vue`/`WeekBoard.vue`
三个文件的 script/template 均通过，`node --check` 校验三个语言文件语法
通过，CSS 大括号配对校验通过，手工核对了 `WeekBoard.vue` 里删掉的三个
import 确实只被删掉的那处用到。真实浏览器效果需要用户本地确认。

---

## 2026-08-27（追加）

**REQ-056：补 Linux/macOS 启动脚本 + 多平台兼容性排查 + Google 同步页引导优化**

用户要求补一份 Linux 版启动脚本、顺便排查项目有没有多平台不兼容的
问题，并要求 Google 同步页面显示更友好、指导授权步骤、加上链接。

新增 `start-lifespark.sh`，逻辑与 `start-lifespark.bat` 对齐，UTF-8 +
LF 编码（bash 不像 cmd.exe 有代码页问题，不需要 REQ-055 那套 GBK
处理）。多平台排查结论：项目本体（Vue + Vite + 浏览器内 OPFS SQLite）
不含任何 Node 端的 OS 专属代码，`process.platform`/硬编码路径分隔符/
Windows 专属 API 均未出现；REQ-041/042 引入过的 File System Access
API（仅 Chromium 支持）已在 REQ-044 删除，不再是遗留风险。唯一的平台
专属产物就是启动脚本本身——这是启动脚本这类东西的本质决定的。排查中
发现一个真实风险点：如果不锁定换行符，一个 `core.autocrlf=true`
（Windows 上常见默认值）的贡献者碰一下 `.sh` 脚本再提交，就可能把它的
LF 悄悄转成 CRLF，导致 Linux/macOS 上执行报 "bad interpreter" 找不到
解释器；新增 `.gitattributes` 锁定 `*.bat`=CRLF / `*.sh`=LF，不依赖
任何人本地设置。

`GoogleSyncPanel.vue` Step 1 从"配置步骤见 README"改成面板内可直接操作
的编号引导列表：三个链接分别跳转 Google Cloud Console 首页 / Calendar
API 启用页 / 凭据页（Google Cloud Console 标准固定路由）；"已获授权的
JavaScript 来源"这一步额外把 `window.location.origin` 的当前真实值
渲染出来配一键复制按钮，因为本地开发端口经常因为占用而漂移（5173 →
5174 等），直接复制比用户自己拼容易出错的地址更可靠。三个语言文件同步
新增文案，`css/components.css` 新增 `.sync-guide-list`/`.sync-origin-
row`/`.sync-origin-value` 样式。README 快速开始部分补充了 `.sh` 脚本的
运行方式。

**验证**（REQ-056）：`GoogleSyncPanel.vue`/语言文件改动按 AGENTS.md
P2-2 未代为执行 `npm run dev`，用 `node --check` 和
`@vue/compiler-sfc` 的 `compileScript`/`compileTemplate` 做了语法/编译
校验，全部通过。`start-lifespark.sh` 按 REQ-055 同样的例外（脚本类
改动不实跑无法确认真的能用）实际执行验证：`bash -n` 语法检查通过，
完整跑通到 `VITE ... ready` 并监听 `http://localhost:5173/`。真实浏览器
里 Step 1 引导列表的排版和复制按钮交互效果需要用户本地确认。

---

## 2026-08-22（第五十次追加）

**REQ-054：计划编辑支持在末尾追加新的关键事件**

用户要求"修改一下计划，编辑是可以在后面添加事件"。REQ-036 时用户曾经
明确反馈"添加关键事件的功能不需要"而删除过 `addKeyEvent`——这次是需求
随时间变了，重新要求加回来，不是那次决定有问题。

`domain/plans.js` 新增 `addKeyEvent(store, planId, {title,
estimatedHours})`：只追加到 `keyEvents` 数组末尾（不支持插入中间），
`estimatedHours` 走和 `createPlan`/`updateKeyEvent` 一致的归一化规则，
对已废止的计划无操作。往一份"已到达终点"的计划追加新事件会让它自然
重新变回"未完成"，新事件成为当前解锁的那个——预期内的自然结果。
`PlanPanel.vue` 每张计划卡片的关键事件列表下面新增一行内联"追加"表单
（只在未废止时显示），每张卡片自己一份懒初始化的草稿（`newKeyEventDrafts`，
按 `planId` 存，和 `collapsedPlans` 同一套写法）。`css/components.css`
新增虚线分隔的 `.plan-key-event-row--add` 样式。三个语言文件新增
`plan.appendKeyEventBtn`/`plan.keyEventAddedToast`。

**验证**（REQ-054）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check`/
`@vue/compiler-sfc` 全部通过。`plans.js` 无 sqlite 依赖，直接测试真实
源码：追加到末尾且顺序不变、`estimatedHours` 归一化规则一致、追加到
已完成计划会正确重新打开、对已废止计划无操作，均验证通过。真实浏览器
效果需要用户本地确认。

---

## 2026-08-22（第四十九次追加）

**REQ-053：兴趣活动类别改成动态可扩展列表**

用户要求"分类样式还行，稍微修改：显示最常用的（点击次数最多的）放在
前面，使用少的全部放进一个下拉框；需要修改表结构就修改，添加类别的
时候可以设置不存在的类别，顺便一起添加分类"——明确授权修改 schema，
核心诉求是类别从固定列表变成用户可现场扩展的动态数据，并按使用次数
分层展示。

`persistence.js` 新增顶层 `activityCategories: [{id, name, useCount}]`，
`activity.category` 存 id 不再是英文标识符；`name` 不再走 i18n（动态
用户输入无法自动翻译，旧的 8 个固定类别也改成固定中文名，是这次改动
必然的取舍）。新增 `migrateActivityCategoryRef()` 做旧数据迁移（按
`cat_` 前缀判断幂等）。`activityPool.js` 删掉固定 `CATEGORIES`，新增
`addCategory()`（按名去重）/`getCategoryName()`，`addActivity`/
`updateActivity` 维护 `useCount`（只在类别真变化时 +1，不减）。
`colors.js` 的 `CATEGORY_COLORS`/`CATEGORY_EMOJI` 固定表换成按类别 id
哈希取值的 `categoryColor()`/`categoryEmoji()`，适配任意动态类别。
`ActivityModal.vue` 的类别框换成 `n-select` 的 `filterable+tag+
on-create`（核对过 naive-ui 源码确认 `on-create` 在打字过程中会被
频繁调用，必须是纯函数，真正创建延后到确认选中那一刻）。
`ActivityLibraryPanel.vue` 类别筛选拆成"常用 chip（前 6，按 useCount
降序）+ 更多分类下拉框"两部分，共用同一个筛选状态。

**验证**（REQ-053）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check`/
`@vue/compiler-sfc` 全部通过。stub 掉 `db.js` 直接测试真实
`persistence.js`：新装种子类别、旧数据迁移、迁移幂等、自定义类别
round-trip 不受影响，均验证通过。`activityPool.js` 无 sqlite 依赖，
直接测试真实源码：`useCount` 增减规则、`addCategory` 去重/拒绝空名、
`getCategoryName` 正常/兜底均验证通过。真实浏览器里 `n-select` tag
模式的交互效果需要用户本地确认。

---

## 2026-08-22（第四十八次追加）

**REQ-052：删除"防重复冷却周期"设置及关联的自动排程死代码**

用户要求"设置里面的防重复冷却周期这个删除，然后相关随机生成本周计划的
程序看看有没有漏下来的，帮我删除掉"。排查确认这套自动排程子系统
（`domain/scheduler.js`、`domain/noveltyEngine.js`、`dayPlanner.js` 里的
`planWeekDays`）从 REQ-015 删掉唯一的 UI 触发按钮起就已经没有任何调用
方，REQ-048 重做 `activityPool.js` 数据模型后它依赖的字段也早已不存在，
是纯死代码。

整个删除 `scheduler.js`/`noveltyEngine.js`；`dayPlanner.js` 删掉
`planWeekDays` 及其私有辅助函数，只保留仍被使用的 `BLOCK_TYPES`/
`IMPORTED_BLOCK_TYPE`。`SettingsPanel.vue` 删掉"防重复冷却周期"整个
分区及 `cooldownWeeks` 读写。`persistence.js` 的 `createDefaultState()`
删掉 `settings.categoryQuotas`（含 `DEFAULT_CATEGORY_QUOTAS`）、
`settings.cooldownWeeks`、顶层 `weeklyPlans`。`holidays.js` 头部注释
（原本说明节假日不参与自动排程避让）改写为说明该子系统已删除。三个
语言文件删掉 `cooldownSection`/`cooldownLabel` 两个 key。

**验证**（REQ-052）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 依次校验
`dayPlanner.js`/`persistence.js`/`holidays.js`/三个语言文件均通过；
`@vue/compiler-sfc` 编译 `SettingsPanel.vue` 通过。Grep 全仓库确认
`scheduler`/`noveltyEngine`/`planWeekDays`/`generateWeeklyPlan`/
`cooldownWeeks`/`cooldownSection`/`cooldownLabel`/`categoryQuotas`/
`weeklyPlans`/`DEFAULT_CATEGORY_QUOTAS` 均无活代码引用，只剩解释性
注释。真实浏览器效果需要用户本地确认。

---

## 2026-08-22（第四十七次追加）

**REQ-051：奖励点数改为完全实时现算，不再存任何快照**

用户要求"奖励点数按照逻辑重新计算一下"。用 AskUserQuestion 确认：沿用
REQ-046 的派生计算方向，但要考虑"单位时间的点数"，且明确"应该自动更新，
每次进入页面都重新计算，不是保存在数据库里就行了的"。排查发现 REQ-046
只把**余额**改成派生计算，每个块的**点数本身**在结算那一刻仍会算出一个
数字快照存进 `block.pointsAwarded`——用户之后调整点数比率，历史事件不会
跟着变，和这次的要求对不上。

`domain/rewards.js`：新增 `isBlockEligible()` 抽出"有没有资格算点数"的
判断，`computeRewardBalance()`/`settleCompletedBlocks()` 共用。
`computeRewardBalance()` 重写为不读任何存储点数字段，对每个有资格的块
现算（用当前比率），调整比率立刻影响所有历史事件。`settleCompletedBlocks()`
职责收窄为只推进关联计划，`pointsSettled` 含义收窄为"有没有已经推进过
计划"，`pointsAwarded` 不再写入。`DayTimeline.vue` 的 `toggleSkip()` 不再
需要清 `pointsAwarded`。三个语言文件的 `pointsPerHourHint` 重写，去掉
过时的"一天延迟"描述，说明现在是实时现算。

**验证**（REQ-051）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check`/
`@vue/compiler-sfc` 通过。手抄一份一致的实现验证了核心诉求：不改历史
数据、只改设置里的比率，同一个历史块立刻按新比率算出新点数（100/h→200点，
300/h→600点，无需任何"重新结算"步骤）；重复调用幂等。Grep 确认
`pointsAwarded` 无活代码引用。真实浏览器效果需要用户本地确认。

---

## 2026-08-22（第四十六次追加）

**REQ-050：兴趣活动页面——搜索框/类别筛选重新设计**

用户反馈搜索框/类别筛选"样式太简陋"，且类别应该"直接列出常用的，通过
一个多选框进行选择"。`constants/colors.js` 新增 `CATEGORY_EMOJI`（从
`ActivityCard.vue` 抽出共用）。`ActivityLibraryPanel.vue`：类别筛选从
单选 `n-select` 改成 8 个类别直接平铺的可多选 chip 行
（`n-tag checkable round`，选中态用 `CATEGORY_COLORS` 高亮），
`filterCategory` 字符串换成 `filterCategories` 数组 + `toggleCategory()`；
搜索框加 `round`/`size="large"`。`css/components.css` 新增
`.activity-library__search`（阴影分层）和 `.activity-library__category-chips`
（flex 换行居中）。删除不再使用的 `library.filterAll` i18n key。

**验证**（REQ-050）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check`/
`@vue/compiler-sfc` 通过；三个语言文件 `library` key 数量一致（各 28
个）。真实浏览器视觉效果需要用户本地确认。

---

## 2026-08-22（第四十五次追加）

**REQ-049：兴趣活动页面——搜索/筛选挪到页面内居中 + 卡片网格固定 4 列**

用户对刚做完的"兴趣活动"页面反馈：搜索框/类别筛选框不要放页头右上角，
挪到页面里面居中；卡片太小，一行 4 个就够，要控制列数。

`ActivityLibraryPanel.vue`：页头右上角只留"添加活动"按钮，搜索框+
筛选框搬到新增的 `.activity-library__filters` 一行，和卡片网格分开。
`css/components.css`：新增 `.activity-library__filters`
（flex 居中，12px 间距）；`.activity-grid` 的
`repeat(auto-fill, minmax(250px,1fr))`（宽屏下会自动挤出 5-6 列导致
卡片变小，这正是"卡片太小"的原因）改成固定 `repeat(4, 1fr)`，列数不
再随视口变宽增加；新增 900px 断点下收成 2 列，和侧边栏抽屉断点保持
一致。

**验证**（REQ-049）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`@vue/compiler-sfc` 编译
通过；CSS 大括号数量改动前后一致（93/93）。真实浏览器布局效果需要
用户本地确认。

---

## 2026-08-22（第四十四次追加）

**REQ-048："体验库"改名"兴趣活动"并重做：新分类体系 + 手动录入 + 横屏卡片 + 筛选/搜索**

用户要求把"体验库"改名"兴趣活动"并整体重做：类别从服务自动排程的
"新鲜度"维度（新体验/兴趣/变化/固定安排）换成真实兴趣类型（摄影/露营/
登山/游泳/滑雪/购物/社交，补了"其他"兜底）；字段简化成手动录入的
标题/链接/图片/内容（内容一般直接上传 .md 文件）；卡片改横屏封面图，
一行 3-4 张；页面顶部加类别筛选 + 标题模糊搜索。

排查确认这不只是改字段名：旧字段集合（category 配 blockType/
durationMinutes/energyLevel/rating/weightMultiplier/timesScheduled/
lastScheduledAt）是专门喂给 `domain/scheduler.js`/`noveltyEngine.js`
自动排程用的，但 Grep 全项目确认 `generateWeeklyPlan`/`planWeekDays`
在任何 `.vue` 文件里都没有调用方——REQ-015 早就删掉了唯一的触发按钮，
这套自动排程本来就是死代码，重定义字段风险很小，只需要清理"引用了
不存在字段的活代码"。

`domain/activityPool.js`：`CATEGORIES` 换新分类，`addActivity` 字段
精简为 `{id,title,category,link,imageUrl,content,createdAt}`；删除
`markScheduled`/`rateActivity`/`listActivities`。`rateActivity` 删除前
还有真实调用方（`ActivityCard.vue` 旧评价按钮、`DayTimeline.vue` 的
`onRate`/`findActivity`），一并清理，不留悬空引用；配套的
`domain/feedbackAdjuster.js`（`weightMultiplier` 在新模型里已经不存在）
整个删除。新增 `src/utils/markdown.js`：极简 Markdown→HTML 转换（标题/
粗体/斜体/链接/列表/段落），不引入第三方依赖，渲染前转义原始文本防止
`v-html` 执行用户笔记里的标签。

`ActivityCard.vue` 重做为 16:9 横屏封面卡片（类别标签叠左下角，编辑/
删除图标 hover 显现于右上角）；新增 `ActivityModal.vue`（查看详情 + 
新建/编辑，和 `EventModal.vue` 的 isEdit 是同一类惯例，多一个"看完再
决定编辑"的模式切换）；`ActivityLibraryPanel.vue` 重做为搜索框+筛选框
+横屏网格（`repeat(auto-fill, minmax(250px,1fr))`）。`DayTimeline.vue`
删除死掉的评价按钮相关代码。`SettingsPanel.vue` 删除"每阶段类别配额"
表格——列头换成新分类后会从"安静的死代码"变成"看起来能用、点了没反应"
的误导 UI，这是字段重定义的必然后果，不是范围扩大。`constants/colors.js`
的 `CATEGORY_COLORS` 换新配色。

`persistence.js`：`SEED_ACTIVITIES` 删除，新安装 `activityPool` 是空
数组（编不出真实链接/图片，不造假种子数据）；新增
`migrateLegacyActivity()`：老数据里 category 还是旧值的条目，保留
id/title/createdAt/imageUrl，其余字段丢弃，`category` 归到 `other`，
函数本身幂等，`fillMissingDefaults()` 每次加载都跑一遍，不需要一次性
标记。三个语言文件的 `domain.category.*`/`library.*` 整段重写，删除
`domain.rating.*`/`day.ratedToast`/`settingsView.quotaSection`/
`quotaHeader`。CSS 删除已无引用的评价/标签相关类，新增卡片/弹层样式。

**验证**（REQ-048）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`activityPool.js`/`persistence.js`/`markdown.js`/`colors.js`；
`@vue/compiler-sfc` 编译 5 个改动组件均通过。用 WebFetch 核对了新用到
的三个 `@vicons/material` 图标（`SearchRound`/`UploadRound`/
`OpenInNewRound`）确实存在。`node -e` 实测 `renderMarkdown()`：标题/
粗体/斜体/链接/列表正确转换，混入的 `<script>` 被转义成纯文本。手抄一份
和 `migrateLegacyActivity()` 一致的实现（`persistence.js` 依赖
sqlite-wasm，Node 下无法直接 import）验证了迁移正确性和幂等性。三个
语言文件 key 数量核对一致（`library` 29 个、`domain.category` 8 个）。
Grep 确认 `src/components/` 下没有残留的旧字段引用（`dayPlanner.js`/
`noveltyEngine.js`/`scheduler.js` 仍引用旧字段名，但这几个文件本来就是
确认没有 UI 调用方的死代码，都有 `||` 默认值兜底，特意没有连带清理，
保持模块边界）。真实浏览器视觉效果需要用户本地确认。

---

## 2026-08-22（第四十三次追加）

**REQ-047：修正 REQ-045——跨 6 点分界线的凌晨片段应画到前一天**

REQ-045 把跨 6 点分界线的块（如 4:00-8:00）拆成两段渲染，但两段都画在
块自己所在的那一天。用户反馈"应该凌晨其实是显示在前一天那里的"，用
AskUserQuestion 确认是拆分**方向**错了：凌晨到 6 点这段应该画到前一天
的时间轴，不是块自己当天（不是"每天 0-6 点都属于前一天"这种更根本的
重新定义，只针对已经需要拆分的跨界块）。

`DayTimeline.vue` 新增 `nextDateKey`/`nextDayBlocks`，`renderItems` 现在
看两天的数据：自己这天的跨界块只渲染后半段（`isClosing:true`，可
交互）；明天的跨界块把前半段借来渲染在"今天"视图的底部（纯视觉，
`isClosing:false`，不可点击/拖拽——它真实的 `dateKey` 是明天，让它可
交互会对错数组）。模板 `@click` 从无条件改成只在 `isClosing` 时触发。
`WeekBoard.vue` 同款改法，每个渲染片段自带 `dateKey`，点击"借来"的
凌晨片段会用 `parseDateKey(item.dateKey)` 正确跳转到它真实所在的那
一天（不是当前列对应的日期）。`blockLayout` 重叠分栏继续只看每天自己
的块，不含借来的片段，已知局限。

**验证**（REQ-047）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`@vue/compiler-sfc` 编译
两个组件通过。手抄一份和 `renderItems` 逻辑完全一致的实现跑了三场景
测试（2026-08-20 有个 4:00-8:00 事件）：查看前一天只产出借来的
`[4,6)` 片段（`isClosing:false`）、查看自己那天只产出 `[6,8)` 片段
（`isClosing:true`）、查看普通一天只产出未拆分的原始记录，全部符合
预期。真实浏览器视觉排布/点击跳转需要用户本地确认。

---

## 2026-08-22（第四十二次追加）

**REQ-046：桌面一键启动脚本 + 奖励点数改为实时结算 + 余额改为派生计算**

**A. 桌面启动脚本**：新增 `start-lifespark.bat`（`cd` 到自身所在目录、
`node_modules` 不存在时自动 `npm install`、`npm run dev -- --open`，
`--open` 让 Vite 就绪后自动打开正确端口的浏览器，不写死 5173 端口）。
用 PowerShell `WScript.Shell` 在桌面创建了指向它的快捷方式
`LifeSpark.lnk`（本机文件，不在 git 仓库里）。

**B. 奖励点数实时化 + 余额派生化**：用户反馈"未实时计算，时间从7/20
开始到前一天"，排查确认是 REQ-020 的"一天延迟结算"设计（今天的事件
必须等到第二天才计入点数）。当初加延迟是为了"结算即时的话跳过就要
先撤销已发点数"，但这个撤销逻辑早就已经在 `DayTimeline.toggleSkip()`
里实现了，延迟并非必须。用户同时提出新的余额算法："兑换表（就是
`RewardPanel.vue` 已有的'已兑换'表格）记录兑换记录，点数减去兑换记录
里的点数就行"——把余额从**存储字段**（历史上多次因漏调用导致和实际
记录对不上，如 REQ-036 修过的"重置按钮漏调 settlePastDays 导致停在
0"）改成**派生计算**（`computeRewardBalance()` = 已结算块之和 − 已
兑换奖励之和，每次现算，不存在"忘记同步"）。

`domain/rewards.js`：`settlePastDays`→`settleCompletedBlocks`，今天的
块看 `block.end` 是否已早于此刻小时数才结算，真正实时；新增
`computeRewardBalance()`；`redeemReward` 改用它判断余额；删除
`addPoints()`（余额增减函数）和 `resetPointsFromMonday`（REQ-028/034，
派生模型下"重置存储余额"不再有意义）。`App.vue` 的 `watch(now, ...)`
改成每次 30 秒 tick 都重新结算一次（原来只在跨天时触发）。
`RewardPanel.vue` 改用 `computed(() => computeRewardBalance(state))`。
`DayTimeline.vue` 的 `toggleSkip`/`removeBlock` 删除显式退点数的代码
（块状态变化后派生求和自然正确，不需要手动同步）。`persistence.js`
新安装不再生成 `rewardPoints`/`meta.pointsResetAt`，老数据里的这两个
字段原样留作死数据，和 REQ-016/022 处理废弃字段同一个模式。

**验证**（REQ-046）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --check` 校验了
`rewards.js`/`plans.js`/`persistence.js`；`@vue/compiler-sfc` 编译
`App.vue`/`RewardPanel.vue`/`DayTimeline.vue`/`SettingsPanel.vue` 均
通过。`rewards.js` 经 `persistence.js` 间接依赖 `@sqlite.org/sqlite-wasm`
在 Node 下无法直接 import（同 REQ-031 遇到的限制），手抄一份完全一致
的算法跑了端到端测试：过去日期正确结算、Google/跳过的块不结算、
**今天已过真实结束时间的块会结算、还没到点的不会结算**（证明真的是
实时而非延迟一天）、派生余额=已结算和−已兑换和、兑换后余额正确下降、
重复结算幂等，全部通过。桌面快捷方式用 `Test-Path` 确认创建成功，
真实双击启动效果需要用户本地确认。

---

## 2026-08-22（第四十一次追加）

**REQ-045：加载画面改为"清新治愈"风格 + 修复跨越 6 点分界线的事件显示异常**

**A. 加载画面**：`index.html` 的 `#app-loading` 从"黑底+转圈 spinner"
改成浅色柔和渐变背景 + 呼吸光晕 + 缓慢生长的 🌱 + 升起消散的小圆点 +
底部跳动小圆点，文案改成"正在生长中…"，呼应 LifeSpark/🌱 品牌。配色是
独立的浅色调色板，不跟随应用当前主题（这个页面在 Vue 挂载前就要显示，
本来读不到 `state.settings.theme`，"清新治愈"这个方向也更适合浅色）。
`main.js` 的淡出等待时长从 400ms 同步加长到 550ms，配合新的 0.5s
transition。particle 元素顺手把重复的 `id` 改成 `class`（原来三个粒子
共用同一个 `id`，不是合法 HTML）。

**B. 6 点分界线显示异常**：用户反馈"时间从凌晨开始跨到第二天显示很
奇怪"，排查确认这是 `constants/timelineRange.js` 里 REQ-010 时期就
记录过的已知局限——时间轴视觉上从 6 点开始画（往下 7...23,0...5 循环
回来），真实起止时间横跨这条 6 点旋转分界线的块（比如 4:00-8:00）没法
用单个绝对定位的 div 在视觉上"从底部绕回顶部"，原来的处理方式是让超出
的部分在底部被裁掉，块显示得比实际短。用 `node -e` 验证过修复前这类
块算出来的 `top+height` 会到 108%。

用户明确要求"你可以自行将其分成两段 但标注的是统一事件 取消时也是
同时取消"，这正是这个限制最自然的解法：新增 `needsDisplaySplit()`/
`splitDisplaySegments()`，`DayTimeline.vue`/`WeekBoard.vue` 把需要拆分
的块渲染成两个 DOM 元素（前半段在网格底部、后半段在网格顶部），**两段
共用同一个 block 对象**，不引入任何新字段——标题天然一致，跳过/删除
作用的就是同一个 block，天然"一件事、操作一次两段一起生效"。只有承载
真实结束时间的后半段显示时间标注和操作按钮，避免重复入口；拖拽/拉伸
（依赖"渲染高度=真实时长"这个假设，拆分后不成立）对这类块整体禁用，
只能通过编辑弹层改时间；拆分出来的两段之间不再互相当"下一个块"参与
最小高度可读性优化（这两段本来就是同一个块，紧挨着渲染是预期效果）。

**验证**（REQ-045）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了 `timelineRange.js`；`@vue/compiler-sfc` 实际编译
`DayTimeline.vue`/`WeekBoard.vue` 的 script/template 均通过。`node -e`
精确模拟了拆分前后的位置计算：4:00-8:00 的块修复前 `top+height=
108.33%`（超出被裁），修复后两段分别是 `top=92.0%,height=8.0%`（正好
落在底边）和 `top=0.35%,height=8.0%`（贴着顶边），互不重叠、加起来
覆盖完整真实时长；五个不跨界的场景（9-17、1-3、20-23、2-6 边界重合、
6-10 边界重合）`needsDisplaySplit` 都正确返回 `false`，行为和拆分前
完全一致。真实浏览器里的动效观感和拆分排布的视觉效果需要用户本地确认。

---

## 2026-08-22（第四十次追加）

**REQ-044：删除"数据库镜像到本地文件夹（实验性）"功能**

用户要求把 REQ-041/042 做的"数据库镜像到本地文件夹（实验性）"整个去掉。
这个功能需要 Chromium 系浏览器 + 用户手动选目录并持续重新授权，和刚在
REQ-043 里被回退的"文件夹作为唯一存储"是同一类"依赖本地文件系统授权"的
复杂度，只是不强制、失败时静默降级；而 REQ-043 顺带新增的"数据导出/
导入"（下载/读取一个 JSON 文件，所有浏览器都能用）已经覆盖了同样的手动
备份诉求，这个实验性功能因此失去存在必要性。

`src/state/fileMirror.js` 整个删除（唯一职责就是这个功能）。
`src/state/db.js` 撤回专为它加的 `exportDbBytes()`/`closeDb()`/导出的
`OPFS_FILENAME`，回到 REQ-024 时只有 `readStateJson`/`writeStateJson`
两个接口的形态，核心 OPFS SQLite 存储不受影响。`src/state/store.js`
撤回 `initStore()` 里的 `hydrateFromDirectory()` 调用、自动保存链路里的
`mirrorNow()` 触发、以及只服务这个功能的 `reloadFromDisk()` 导出。
`SettingsPanel.vue` 删除整个"数据库镜像到本地文件夹"分区（六个 `ref` +
六个处理函数 + 对应模板），连带清理了变成未使用的 `onMounted` 导入和
`useI18n()` 的 `d`（日期格式化，只有这个分区用过）；REQ-043 的"数据
导出/导入"分区不受影响，是现在唯一的手动备份手段。三个语言文件删除 24
个 `settingsView.fileSync*` key。

`.gitignore` 新增 `lifespark-backup-*.json` 规则：排查时发现项目目录下
已经有一个用户用"导出全部数据"功能生成的真实备份文件
（`data/lifespark-backup-2026-08-22.json`，含真实个人数据），按 REQ-040
定下的"数据库数据不要上传"原则预防性排除，和已有的 `*.sqlite3` 规则同
一类考虑，文件本身没有被删除/移动，只是不会被 git 追踪。

**验证**（REQ-044）
`node --input-type=module --check` 校验了 `db.js`/`store.js`/
`persistence.js` 和三个 locale 文件；用 `@vue/compiler-sfc` 实际编译
`SettingsPanel.vue` 的 script/template 均通过。Grep 确认
`fileMirror`/`fileSync`/`mirrorNow`/`hydrateFromDirectory`/
`pickProjectDirectory`/`exportDbBytes`/`closeDb`/`OPFS_FILENAME`/
`reloadFromDisk` 在 `src/` 下已经没有任何残留引用；三个 locale 文件的
`dataBackup`/`dataExport`/`dataImport` 系列 key 数量保持一致（各 7 个，
这次删的是 `fileSync` 系列，不涉及这几个）。按 AGENTS.md P2-2，未代为
执行 `npm run dev`；真实浏览器里应用能否正常启动/保存需要用户本地确认。

---

## 2026-08-22（第三十九次追加）

**REQ-043：全量数据导出/导入按钮（撤销此前未提交的"文件夹作为唯一存储"实验）**

用户反馈"现在要选择数据文件夹才能进入系统，很奇怪，原来采用浏览器的
存储方式没了吗"。排查发现工作区里存在一批**未提交、未记入文档**的改动：
把持久化架构从 REQ-024~042 的浏览器内 OPFS SQLite（自动运行，用户无感知）
整体替换成"必须先手动选一个真实文件夹、这个文件夹里的 JSON 文件是唯一
权威数据源，选之前应用直接进不去"（`src/state/fileStore.js`、
`src/components/DataFolderGate.vue`、`src/state/legacyOpfsMigration.js`
这几个未提交的新文件，以及对 `App.vue`/`store.js`/`persistence.js`/
`SettingsPanel.vue` 的改写）。代码注释显示这是此前某次会话里用户通过
AskUserQuestion 确认过的方向，但这批改动只完成了写代码——`git status`
显示从未 commit，`docs/REQUESTS.md`/`MODULES.md` 里也完全没有 REQ-043
这一条，按项目自己的 AGENTS.md P1-4，这个任务没有真正走完流程。

用 AskUserQuestion 请用户在"保留新方案补文档"/"回退到 REQ-042 浏览器
自动存储"/"折中成可选镜像、不强制门禁"之间选择，用户选择**回退**，并
追加要求：设置页需要有全量数据导出按钮，且支持导入数据。

**回退**：`git stash push -u` 把这批未提交改动整体收进
`stash@{0}`（`REQ-043 folder-only storage experiment (reverted per user
request 2026-08-22)`），工作区回到 REQ-042 提交后的干净状态——不是
`git checkout --`/`clean -f` 那种永久丢弃，是可逆的，以后想找回这个方向
可以从 stash 里取。

**新增导出/导入**：`src/state/persistence.js` 新增
`serializeStateForExport(state)`（`JSON.stringify(state, null, 2)`）和
`parseImportedState(json)`（复用已有的内部 `fillMissingDefaults()` 校验/
补齐字段，解析失败或内容不是对象都返回 `null`，不抛异常）。
`SettingsPanel.vue` 新增"数据导出 / 导入"分区：导出用 `Blob` + 临时
`<a download>` 触发浏览器下载 `lifespark-backup-<日期>.json`；导入按钮
包一层 `<n-popconfirm>` 二次确认（确认放在触发隐藏的
`<input type="file">` 之前，具体文件内容是否有效要等选完文件才知道，
校验在 `handleImportFile()` 里做，无效文件不会碰到当前数据），和
`RewardPanel.vue`/`handleLoadFromFolder` 是同一套"危险操作二次确认"模式。
这个新功能不依赖 File System Access API，所有浏览器都能用，是和
REQ-041/042"镜像到文件夹"（Chromium 专属、持续目录授权）平行的另一种
备份手段，两者互不冲突，都保留在设置页里。

**验证**（REQ-043）
`node --input-type=module --check` 校验了改动的 `persistence.js` 和三个
locale 文件；Grep 确认三个 locale 文件的 `dataBackup`/`dataExport`/
`dataImport` 系列 key 数量一致（各 7 个）；用 `@vue/compiler-sfc` 实际
编译（`parse`+`compileScript`+`compileTemplate`）`SettingsPanel.vue` 通过，
不是仅静态阅读。Grep 确认回退后 `DataFolderGate`/`fileStore.js`/
`legacyOpfsMigration` 在 `src/` 下已经没有任何残留引用，`git status`
确认工作区改动只剩这次新增的导出/导入相关文件。按 AGENTS.md P2-2，未
代为执行 `npm run dev`；导出下载、导入后界面观感等真实浏览器行为需要
用户本地确认。

---

## 2026-07-30（第三十八次追加）

**REQ-042：数据库镜像补上反方向——启动时/手动从本地文件夹读回数据**

REQ-041 只做了"OPFS → 真实文件夹"这一个方向（写出去），用户追问"为什么
不能启动时读文件、改了就写回文件"，指出这应该是个双向的事，不该只有
镜像备份。排查确认技术上完全可行，只是需要换一个思路：sqlite-wasm 的
`sqlite3Worker1Promiser` 简化协议不支持直接拿一段已有字节"打开"数据库
（没有 `import` 命令，见 `docs/KNOWLEDGE.md` 新增知识），真正的
`sqlite3_deserialize()` 只能在自己写的 worker 脚本里用，等于要重写整套
worker 基础设施——对这份数据量很小（一整份状态就是一个 JSON 对象）的
应用来说没必要。改成："先释放 OPFS 的独占锁，把文件夹里的字节整个覆盖
写进 OPFS 文件，让 SQLite 下次打开时看到的就是新内容"，不需要 SQLite
理解"外部导入"这件事。

`src/state/db.js` 新增 `closeDb()`（worker1 的 `close` 命令 + 清空内部
`openDbPromise` 缓存，下次任何读写调用会自动重新 `openDb()`；这次会话
还没打开过连接时空操作返回）和导出的 `OPFS_FILENAME` 常量（避免和
`fileMirror.js` 两处硬编码同一个文件名产生潜在不一致）。

`src/state/fileMirror.js` 新增 `hydrateFromDirectory()`：目录里没有
镜像文件时返回 `{ok:false,reason:'no-mirror-file'}`（不算错误）；有的话
读出字节，`closeDb()` 释放锁后用 `navigator.storage.getDirectory()` 把
这份字节整个覆盖写进 OPFS 里的同名文件。`getMirrorMeta()` 把原来单一的
`lastSyncedAt` 拆成 `lastMirroredAt`（写出去）/`lastLoadedAt`（读回来）
两个方向分开记录。

`src/state/store.js`：`initStore()` 开头新增
`await hydrateFromDirectory()`——如果用户之前选过文件夹、这次会话权限
还有效（大概率只在同一浏览器会话内刷新页面时成立，完整重启浏览器后
权限通常会回到 `'prompt'`，见 `docs/KNOWLEDGE.md` 新增知识），启动时会
先把文件夹里的内容拉回 OPFS 再正常读取——这样如果文件夹是被云盘同步
工具在其它设备上更新过的，启动时就能读到最新数据。新增
`reloadFromDisk()`：重新读一次 OPFS、覆盖当前 reactive state，配合
`hydrateFromDirectory()` 用于设置页的手动"读回"操作。

`SettingsPanel.vue` 新增"从文件夹读取最新数据"按钮（`type="warning"` +
`<n-popconfirm>` 二次确认，这个方向会覆盖当前正在使用的数据，和
`RewardPanel.vue` 兑换奖励是同一个"危险操作二次确认"模式），点击后依次
调用 `hydrateFromDirectory()` + `reloadFromDisk()`；状态展示区分"上次
写出时间"和"上次读入时间"两行。三个 locale 文件新增 6 个
`settingsView.fileSync*` key（`fileSyncLastLoaded`/
`fileSyncLoadFromFolder`/`fileSyncLoadConfirm`/`fileSyncNoMirrorFile`/
`fileSyncLoadFailed`/`fileSyncLoaded`）。

**验证**（REQ-042）
`node --check` 对全部改动 `.js` 文件校验通过；`@vue/compiler-sfc` 静态
编译校验 `SettingsPanel.vue` 通过；Grep 确认三个 locale 文件的
`fileSync` 系列 key 数量一致（各 24 个）。`promiser('close', {dbId})`
的请求/响应格式用 WebFetch 核对了官方 `api-worker1.md` 文档（不是凭
训练记忆猜的）。延续 REQ-040/041 记录过的偏离 AGENTS.md P2-2 的理由，
实际跑了一次 `npx vite build` 确认新增的
`closeDb`/`OPFS_FILENAME`/`hydrateFromDirectory`/`reloadFromDisk` 整条
调用链模块解析和打包都不报错。真实浏览器里"关闭连接→覆盖 OPFS 文件→
重新打开→界面刷新成文件夹里的数据"这条链路的实际效果，以及"刷新页面
内静默生效、重启浏览器后需要点击重新授权"这个权限行为差异，都需要
用户在 Chrome/Edge 里本地确认——无法在这个环境里模拟真实的浏览器权限
状态和用户手势。

---

## 2026-07-28（第三十七次追加）

**REQ-041：数据库镜像到本地文件夹（File System Access API，实验性）**

用户问"我想让数据库文件保存在项目目录里，有什么实现方式吗"。这是一次
真正的项目专属架构决策（P0-3），先梳理清楚技术现实再用 AskUserQuestion
让用户选：①File System Access API（浏览器原生，Chromium 系支持，需要
用户手动授权一次目录）；②加一个本地后端进程真正写文件（会推翻 REQ-024
"不加后端"的明确决定）；③保留 OPFS，只加手动导出快照按钮。用户选了①。

技术调研（WebSearch/WebFetch，见 `docs/KNOWLEDGE.md` 两条新增知识）确认
了两个关键约束，决定了最终实现形态：
1. `FileSystemFileHandle.createSyncAccessHandle()`（sqlite-wasm 的 OPFS
   VFS 依赖的高性能同步写入方式）**只对 OPFS 内部文件生效**，不能对
   `showDirectoryPicker()` 选出来的普通真实目录句柄使用——所以不可能让
   sqlite-wasm 直接把这个真实文件夹当成数据库的存储后端，只能保留 OPFS
   作为唯一权威数据源，另外做单向镜像。
2. sqlite-wasm 的 worker1 协议有一个 `export` 命令
   （`sqlite3_js_db_export()` 的封装），能拿到当前数据库完整字节，不用
   自己拼 SQL。也确认了不能反过来从主线程直接读 OPFS 里那个文件的字节——
   OPFS 同步访问句柄是独占锁，这份数据库连接从应用启动就一直持有着，
   只有握着这把锁的 worker 自己导出才行。

**新增 `src/state/fileMirror.js`**：`isFileSystemAccessSupported()` 特性
检测；`pickProjectDirectory()` 弹出目录选择器 + 把
`FileSystemDirectoryHandle` 存进 IndexedDB（`lifespark-fs-handles`
数据库，handle 本身可结构化克隆，跨浏览器会话保留"选的是哪个文件夹"，
但读写权限不跨会话保留，重开浏览器后需要重新走
`requestPermissionForSavedDirectory()`——这两个函数都必须由用户点击
事件直接触发，浏览器的 user activation 要求）；`mirrorNow()` 是核心：
没选目录/权限失效/浏览器不支持时直接返回 `{ok:false,reason}`（不算
错误），权限就绪时调用新增的 `state/db.js` `exportDbBytes()`（薄封装
`export` 命令）拿到字节，整份覆盖写进目录里的 `lifespark.sqlite3`
文件——所有异常内部捕获记进 `lastError`，不向上抛。

`state/store.js` 的自动保存链路（`saveState(state).then(() =>
mirrorNow())`）在每次 OPFS 写入完成后顺带触发一次镜像尝试，非阻塞、
静默失败，不影响 OPFS 才是权威存储这个事实。`SettingsPanel.vue` 新增
"数据库镜像到本地文件夹（实验性）"分区（页面最底部，即时生效不进
draft）：不支持的浏览器只显示一句提示；支持时显示当前文件夹名/权限
过期提示/上次同步时间或失败原因，配"选择/更换文件夹"「重新授权」「立即
同步一次」「停止同步」四个按钮。三个 locale 文件新增 18 个
`settingsView.fileSync*` key。

**验证**（REQ-041）
`node --check` 对全部改动/新增 `.js` 文件校验通过；`@vue/compiler-sfc`
静态编译校验 `SettingsPanel.vue` 通过；Grep 确认三个 locale 文件的
`fileSync` 系列 key 数量一致（各 18 个）。这次实际执行了
`npx vite build`（改动前后各一次）做真实验证——延续 REQ-040 时记录过的
偏离 AGENTS.md P2-2 的理由，新写的浏览器 API 调用链路（IndexedDB +
File System Access + sqlite-wasm export 命令）互相拼接是否正确，只有
真构建（至少验证模块解析和打包不报错）才能有基本把握，纯静态阅读不够。
真实浏览器里的目录选择器授权流程、权限过期后的重新授权提示、镜像文件
在系统文件管理器里能否正常打开，都需要用户在 Chrome/Edge 里本地确认——
这部分依赖真实的浏览器权限弹窗和文件系统交互，无法在这个环境里模拟。

---

## 2026-07-27（第三十六次追加）

**REQ-040：上线前置准备——git 仓库初始化 + 依赖安全漏洞修复**

用户要求"准备做第一版上线"，并明确"数据库数据不要进行上传"，随后追加
"各种包的问题帮我处理一下，如果需要调整版本就调整版本，警告不影响编译
生成和运行的话不处理"。

**数据边界确认**：项目里从来没有任何 `.sqlite3`/导出数据文件——真实用户
数据只存在浏览器的 OPFS（Origin Private File System）私有存储里，不落在
项目目录、也不经过任何服务器，`git` 版本控制天然不会碰到它。这次新增
`.gitignore`（排除 `node_modules/`、`dist/`、`*.sqlite3`、`.env` 等）是
预防性措施，防止以后本地调试/导出产生的文件被误提交，不是修复已发生的
泄露。

**git 初始化**：项目此前不是 git 仓库，`git init` + 首次提交（60 个
文件，仅本地仓库，未配置/未推送远程）。

**依赖安全漏洞（`npm audit`，用官方 registry 而非本地配置的国内镜像，
因为镜像不支持 `/-/npm/v1/security/*` 审计接口）**：
1. `vue-i18n`/`@intlify/core-base` 中危 DOM XSS（`escapeParameterHtml`
   不能防住 tag 属性场景，GHSA-x8qp-wqqm-57ph）：`npm audit fix` 直接把
   `vue-i18n` 从 9.14.4 打到 9.14.5，`package.json` 里的 `^9.13.0` 范围
   本身覆盖这个版本，非破坏性。项目里也没有用到触发这个漏洞的富文本
   插值组件（`<i18n-t>`/组件插值），实际影响面本来就有限。
2. `vite`（高危，`server.fs.deny` 在 Windows 上可绕过，
   GHSA-fx2h-pf6j-xcff，影响范围"<=6.4.2"）+ `esbuild`（中危，开发服务器
   任意来源可读响应，GHSA-67mh-4wv8-2f99，只影响 `vite`/`vite preview`
   开发态，不影响生产构建产物本身）：`npm audit fix --force` 默认会跳到
   `vite@8.1.5`，但那个大版本要求 Node `^20.19.0 || >=22.12.0`，而本地
   实际 Node 是 v18.20.4，直接跳大版本会让 `npm run dev`/`npm run build`
   在当前环境跑不起来。改为手动定位到 `vite@6.4.3`——这是 6.x 分支修完
   上面两个漏洞的第一个版本（依赖的 `esbuild` 已经是 `^0.25.0`，漏洞
   范围要求的下限），同时 `vite@6.x` 的 Node 要求是
   `^18.0.0 || ^20.0.0 || >=22.0.0`，覆盖本地 Node 18。配套把
   `@vitejs/plugin-vue` 从 `^5.0.0` 提到 `^5.2.4`（同一大版本内的最新
   补丁，peerDependencies 明确支持 `vite ^6.0.0`，Node 要求
   `^18.0.0 || >=20.0.0`，同样不影响本地环境）。`vite.config.js` 的
   COOP/COEP 头 + `optimizeDeps.exclude` 配置项在 vite 6 下没有变化，
   不需要改。

**EBADENGINE 警告不处理**：`npm install` 一直会警告
`@sqlite.org/sqlite-wasm`（要求 Node >=22）和 `naive-ui`（要求 Node
>=20）在本地 Node 18.20.4 下版本不匹配，但这两个包本身没有变化（不是
这次调整的对象），且警告不影响实际编译产出和运行——`npx vite build`
在改动前后都能成功产出 `dist/`，按用户"警告不影响编译生成和运行的话
不处理"的明确指示，保留现状不动，不去单独升级 Node 或降级这两个包。

**验证**（REQ-040）
这次任务性质是依赖/环境维护，不是纯代码逻辑改动，且用户本轮明确要求
"处理"（隐含需要真实验证安装/构建结果），所以没有沿用 AGENTS.md P2-2
一贯的"只给步骤说明"，而是实际执行了 `npm install`（官方 registry）
和 `npx vite build` 两次（改动前、改动后各一次）做真实验证：`npm audit`
从 4 个漏洞（3 中 1 高）降到 0；`vite build` 两次都成功产出
`dist/`（产物体积/结构基本一致，只有内容哈希和 `index.html` 里 vite
6 新增的极少量运行时代码有差异），验证完删除了本地临时 `dist/` 目录
（不提交进 git）。这是相对已有开发风格的一次偏离，记录在此供后续
参考：本项目里的 AI 协作者具备真实执行 shell 命令的能力，遇到"调整
依赖版本"这类必须靠真实安装/构建才能确认对不对的任务时，倾向于实际
跑一遍验证，而不是仅做静态分析。

---

## 2026-07-27（第三十五次追加）

**REQ-039：删除重置点数的功能**

用户追加要求"删除重置点数的功能"，指的是 REQ-034 加、REQ-036 修过
bug 的"重置点数"按钮。判断方式和 REQ-029 删"数据恢复"按钮时一样：
理解为用户能看到点到的手动按钮，不包括 `App.vue` 挂载时静默的自动
一次性迁移（REQ-028），后者没有 UI，不构成用户能感知的"功能"，继续
保留。删除 `RewardPanel.vue` 的按钮/`handleResetPoints`/相关 import，
删除三个 locale 文件的对应 i18n key；`domain/rewards.js` 的
`resetPointsFromMonday`/`settlePastDays` 函数本身不动。

**验证**（REQ-039）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check`/`@vue/compiler-sfc` 校验通过。Grep 确认删除的函数名/i18n key
在 `src/` 下没有任何残留引用。

---

## 2026-07-27（第三十四次追加）

**REQ-038：去掉删除计划的功能，改成废止计划**

用户要求"去掉删除计划的功能，改成废止计划，只是显示变成不能操作而
已"。`domain/plans.js` 的 `deletePlan` 删除，新增 `abolishPlan` 只翻
一个 `abolished` 标记位，计划数据（标题/关键事件/完成进度）原样保留；
`updatePlan`/`updateKeyEvent`/`removeKeyEvent`/`completeKeyEvent`/
`uncompleteLastKeyEvent` 这几个会改计划内容的函数都加了 `!p.abolished`
拦截，domain 层和 UI 层双重防护。`PlanPanel.vue` 把"删除计划"按钮换成
"废止计划"（`type="warning"`），废止后卡片整体调暗、标题/关键事件的
编辑按钮直接不渲染（"显示变成不能操作"的字面实现），进度标签旁加
"已废止"标签，折叠/展开这个纯查看功能不受影响。`EventModal.vue` 的
"从计划添加"下拉框排除已废止的计划。没有"恢复"入口，用户没有要求
可撤销。

**验证**（REQ-038）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check`/`@vue/compiler-sfc` 校验通过，CSS 大括号配对一致。Node 直接
跑 `domain/plans.js` 真实源码测试：废止前正常操作、废止后
`updatePlan`/`updateKeyEvent`/`removeKeyEvent`/`completeKeyEvent`/
`uncompleteLastKeyEvent` 全部正确无操作、重复废止安全、进度计算不受
影响，全部通过，验证完删除临时脚本。

---

## 2026-07-26（第三十三次追加）

**REQ-037：删除"添加关键事件"功能，改成整张计划卡片可折叠**

用户对 REQ-036 进一步反馈："添加关键事件的功能不需要，主要是要能
修改计划中事件的时间，然后计划通过点击可以折叠计划"。删除
`domain/plans.js` 的 `addKeyEvent`（连同 REQ-036 刚加的
`insertBeforeId` 参数）和 `PlanPanel.vue` 里配套的"追加关键事件"
表单/状态/CSS/i18n key——一份计划的关键事件清单现在只在创建时定好，
之后只能编辑/删除，不能再追加。"修改事件时长"这个能力（REQ-032 的
`updateKeyEvent`）确认没受影响，继续保留。新增整张计划卡片的折叠/
展开：卡片头部一个 chevron 图标按钮，点击折叠/展开进度条+关键事件
列表+"当前待完成"提示，标题和进度标签折叠状态下始终可见——这是一个
新的"折叠整张卡片"交互，和 REQ-036 删掉的"关键事件列表单独展开/收起"
范围不同。

**验证**（REQ-037）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check`/`@vue/compiler-sfc` 校验通过，CSS 大括号配对一致。Node 直接
跑 `domain/plans.js` 真实源码确认删除 `addKeyEvent` 后其余函数不受
影响。Grep 确认项目里不再有被删函数/状态的活代码引用。

---

## 2026-07-26（第三十二次追加）

**REQ-036：修复计划编辑体验 + 重置点数按钮的真实 bug**

用户跟进反馈五点，全部按"不要问细节，按推荐执行"处理。（1）"还是
修改不了计划里的时间设置"+"设置没有进行事件的修改时不能修改"：排查
发现 REQ-032 的编辑功能本身没问题，但同时把关键事件列表默认收起，
编辑入口就在被折叠的区域里，用户没点开过所以以为"改不了"，根因是
可发现性问题。（2）"现在显示得不太自然，不需要点击展开的提示"：印证
了上面的根因，明确要求去掉折叠交互——`PlanPanel.vue` 删除
`expandedPlans`/折叠按钮，关键事件列表改回始终显示，编辑功能保留。
（3）"只能在最后添加事件的限制也不太好"：`domain/plans.addKeyEvent`
新增可选的 `insertBeforeId` 参数，可以插到任意未完成关键事件前面
（不传则退化为原来的追加到末尾，向后兼容），`PlanPanel.vue` 加了
对应的"插入位置"下拉框。（4）"点数还是没有帮我重置吗，每小时点数
明明已经设置成 100"：排查发现这是一个**真实 bug**——REQ-034 加的
"重置点数"按钮只调了 `resetPointsFromMonday`，漏调了紧接着必须调用
的 `settlePastDays`（前者只标记待重新结算+清零余额，后者才真正按
当前比率算出点数写回余额），导致点击后余额停在 0，补上遗漏的调用
修复。

**验证**（REQ-036）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check`/`@vue/compiler-sfc` 校验通过，CSS 大括号配对一致。
`domain/plans.js` 不依赖 Vue/db，直接用 Node 跑真实源码测试了
`addKeyEvent` 插入行为（追加末尾/指定位置插入/目标已完成或不存在时
正确退化）全部通过；`domain/rewards.js` 因间接依赖 db.js 没法直接
import（已知的 Node/浏览器包解析差异），手抄算法复现了这个 bug 场景：
验证"两个函数都调用"时余额正确按新比率算出，并且验证了"只调前一个"
这个对照组确实会复现 bug 前"停在 0"的现象，两组结果共同证明修复正确。
验证完删除临时脚本。

---

## 2026-07-26（第三十一次追加）

**REQ-035：体验库改成带图片的卡片**

用户要求"做成卡片的类型并设置一下图片，不然就设置成列表"，把取舍交给
AI 决定。排查发现体验库本来就已经是卡片网格布局，缺的只是图片，所以
选"卡片+图片"。新增可选字段 `activity.imageUrl`（和背景图设置同一个
模式，粘贴 URL 不是本地上传），`ActivityCard.vue` 顶部加封面区，有图
铺满、没图显示按类别色渐变+按类型选的 emoji 占位。没有为 12 项内置
种子活动硬编码真实图片链接（外部 URL 有失效/授权风险），用户自己想配
图随时可以在编辑表单里粘贴。

**验证**（REQ-035）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check`/`@vue/compiler-sfc` 校验通过，CSS 大括号配对一致。真实浏览器
视觉效果需要用户本地确认。

---

## 2026-07-26（第三十次追加）

**REQ-034：奖励页新增手动"重置点数"按钮**

用户又提了一次"清空点数从本周开始重新计算"，和 REQ-028 是同一个需求，
但那次是靠幂等标记的一次性自动迁移，已经执行过就不会再自动触发。用户
重复提出说明这类需求可能反复出现，加了一个随时可点的按钮（外层
`<n-popconfirm>` 二次确认），直接复用 REQ-028 已写好并测试过的
`resetPointsFromMonday`，不看 `meta.pointsResetAt`，没有新增 domain
层代码。

**验证**（REQ-034）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`@vue/compiler-sfc` 校验
`RewardPanel.vue` 通过，复用函数本身在 REQ-028 时已测试过内部逻辑。

---

## 2026-07-26（第二十九次追加）

**REQ-033：奖励页面清空已兑换数据**

用户要求"已兑换数据帮我清理掉"。`deleteReward` 原本保护已兑换条目不让
删（历史记录），这次用户明确要求绕开这层保护批量清空。新增
`domain/rewards.clearClaimedRewards(store)`，过滤掉 `claimed:true` 的
条目，待兑换的不受影响，和 REQ-028/031 一样是一次性操作，用
`meta.claimedRewardsClearedAt` 做幂等标记，`App.vue` 挂载时按需自动
执行。

**验证**（REQ-033）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验通过，逻辑是单行 `filter`，代码审查确认和 `deleteReward`
反向保护条件互为镜像。

---

## 2026-07-26（第二十八次追加）

**REQ-032：计划支持编辑，关键事件列表加展开/收起**

用户反馈"计划设置可以进行修改，现在修改不了"+"计划分成很多事件，
现在是直接显示出来的，我要通过点击可以展开列表和关闭列表，通过某种
方式显示当前进度"。`domain/plans.js` 新增 `updatePlan`/`updateKeyEvent`
（后者只对未完成的关键事件生效，已完成的静默忽略，保护历史记录不被
改写）。`PlanPanel.vue` 加了计划标题和未完成关键事件的行内编辑（铅笔
图标点开变输入框）；关键事件列表默认收起，进度条下方加展开/收起按钮
（纯界面状态，不写进 store），进度条和"当前待完成"提示留在收起状态下
依然可见，满足"显示当前进度"的要求，复用已有元素没新增组件。

**验证**（REQ-032）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`domain/plans.js` 不依赖
Vue/store/db，直接用 Node 跑真实源码测试：创建计划、编辑标题、编辑
未完成关键事件、完成后再编辑被正确拒绝、进度计算不受影响，全部通过，
验证完删除临时脚本。`@vue/compiler-sfc` 校验 `PlanPanel.vue` 通过。

---

## 2026-07-26（第二十七次追加）

**REQ-031：奖励名单点数价格换成最新日元参考价**

用户要求"我的奖励名单的点数价格帮我换成日元的价格点数"。用
AskUserQuestion 确认是"数值本身改成最新日元参考价"，不是仅换显示单位。
奖励名单数值从一开始就是按日元参考价定的，REQ-023 刷新过一次到最新
价格，但用户实际在用的是 REQ-026 从旧备份恢复回来的真实数据，
`fillMissingDefaults()` 只在全新用户时才会种入种子数据，已有条目不会
自动跟着刷新，停留在更早的数值。新增
`domain/rewards.refreshRewardValuesFromSeedPrices(store)`：按标题在
`SEED_REWARDS`（`persistence.js` 现在导出）里查最新价格覆盖
`reward.value`，查不到的自定义条目不动。`App.vue` 挂载时按需调用一次，
用 `meta.rewardValuesRefreshedAt` 做幂等标记。界面上仍然只说"点数"，
不加货币符号。

**验证**（REQ-031）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`domain/rewards.js` 现在
经 `persistence.js` 间接依赖 `state/db.js` -> `@sqlite.org/sqlite-wasm`，
这个包 Node 环境下解析到只有 default 导出的 `dist/node.mjs`（Vite 实际
走 browser 条件不受影响），没法直接跑通完整 import 链路，改用手抄真实
`SEED_REWARDS` 数据 + 相同算法单独验证：标题匹配更新、自定义条目不受
影响、边界项正确处理、幂等标记正确写入，全部通过，验证完删除临时脚本。

---

## 2026-07-26（第二十六次追加）

**REQ-030：页面刷新加载状态加个动效过渡，不要直接黑屏**

用户反馈原来的加载占位是纯黑底+文字，静态无动效，"直接黑屏"体验生硬，
而且嵌套在 `#app` 内部导致 Vue 挂载时整个被硬切掉，没机会做退场过渡。
`index.html` 把 `#app-loading` 改成 `#app` 的兄弟节点，内容换成 CSS
旋转 spinner + 入场淡入动画，颜色手抄一份 `variables.css` 深色主题
默认值（不直接引用变量，避免样式生效时机的竞态风险）。`main.js` 新增
`fadeOutLoadingScreen()`，Vue 挂载完成后给加载层加淡出 class，
`setTimeout` 等过渡结束后再移除，效果是黑色加载层平滑淡出、露出下面
已经渲染好的界面。

**验证**（REQ-030）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验 `main.js` 通过，`index.html` 人工核对标签配对和 CSS
大括号数量一致。真实浏览器动效观感需要用户本地确认。

---

## 2026-07-26（第二十五次追加）

**REQ-029：删除数据恢复功能**

用户要求"数据恢复功能帮我删除掉"——REQ-026 加的手动恢复按钮已经完成
使命（用户确认真实数据已经用这个按钮成功恢复），留着只是设置页里一个
容易手滑造成"整体替换当前数据库内容"的危险按钮。删除 `SettingsPanel.vue`
的"数据恢复"分区（说明文字+按钮+二次确认）、`state/store.js` 的
`restoreFromLegacyBackup()`、三个 locale 文件的 `dataRecovery*` 共 6 个
key；`persistence.js` 的 `readLegacyLocalStorageState()` 改回不导出的
内部函数。REQ-025 那套完全静默、无 UI 的自动恢复安全网没有一并删除——
两者服务目的不同，自动恢复不构成用户能感知到的"功能"，删掉反而会削弱
对 OPFS 迁移极端情况的兜底能力。

**验证**（REQ-029）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check`/`@vue/compiler-sfc` 静态编译校验通过；Grep 确认
`restoreFromLegacyBackup`/`handleRestoreLegacy`/`dataRecovery` 在
`src/` 下只剩历史说明性注释，没有任何活代码或 i18n key 引用。

---

## 2026-07-26（第二十四次追加）

**REQ-028：重置奖励点数，从本周一开始重新计算**

用户要求"奖励点数帮我重置一下，从这周一开始计算"。用户已经有 REQ-024
迁移之后跑起来的真实 OPFS 数据库，改一下 `createDefaultState()` 的默认
起始点数不影响这份已存在的数据，需要一次真正作用在实际数据上的操作，
而 AI 没法直接连进用户浏览器改 OPFS 内容，只能写成代码在用户下次打开
应用时自动执行一次。

新增 `domain/rewards.resetPointsFromMonday(store)`：用
`getWeekStart(new Date())` 算出"本周一"，本周一之前的块（跳过 Google
来源/已跳过的）不管有没有结算过一律标记 `pointsSettled:true,
pointsAwarded:0`，确保以后不会再计入余额；本周一到昨天之间已经结算过
的块反过来撤销结算标记，交给紧接着的 `settlePastDays` 重新结算，点数
计入清零后的新余额——这样本周已完成的事件不会跟着清零一起丢。不动
计划完成进度（`completeKeyEvent` 对已完成的关键事件本身是幂等的）。
`App.vue` 的 `onMounted` 在 `settlePastDays` 之前新增
`if (!state.meta.pointsResetAt) resetPointsFromMonday(store)` 触发一次，
`meta.pointsResetAt` 是"只执行一次"的幂等标记（`createDefaultState()`
默认给 `null`）。

**验证**（REQ-028）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`domain/rewards.js` 这条
依赖链（`utils/id.js`/`utils/dateUtils.js`/`domain/plans.js`，不依赖
Vue）直接用 Node 跑了真实源码测试：模拟 store + 四种块场景（上周一
未结算/上周一已跳过/上周一 Google 来源/本周已结算），验证
`resetPointsFromMonday` 后各自状态符合预期、余额清零、`pointsResetAt`
写入；紧接着调用 `settlePastDays` 验证本周的块被正确重新结算、余额
变成本周点数总和、上周一的块不再计入。`@vue/compiler-sfc` 额外校验
了 `App.vue` 语法正确。验证完删除临时测试脚本。真实浏览器效果需要
用户本地刷新页面确认。

---

## 2026-07-25（第二十三次追加）

**REQ-027：响应式适配——兼容平板和小屏笔记本**

用户要求"兼容一下各种设备的显示"。排查发现全项目 CSS 此前没有一处
`@media` 查询，是纯桌面宽屏布局（固定 248px 侧边栏、周视图 7 列横向
等分、`height:100vh` 的 flex 外壳）。用 AskUserQuestion 确认了三个
产品决策（设备范围/侧边栏窄屏交互/周视图窄屏处理属于项目专属取舍，
按 AGENTS.md P0-3 不能只凭"行业惯例"自己决定）：目标定在平板+小屏
笔记本（断点 900px，不单独做手机竖屏布局）；侧边栏窄屏下改汉堡菜单
抽屉；周视图窄屏下横向滚动保留 7 列，不压缩不改单日视图。

`App.vue`/`SidebarNav.vue` 加了 `uiState.sidebarOpen` + 汉堡按钮 +
遮罩层，`css/layout.css` 加了对应断点下的抽屉滑入动画；
`css/timeline.css` 给周视图加横向滚动 + 小时刻度列 sticky 固定；
`css/components.css` 给月视图窄屏下收紧行高，新增通用
`.table-scroll` 包住设置页配额表和奖励页两个表格防止内容被截断。
新增 i18n key `nav.toggleSidebar`。宽屏（>900px）下视觉和交互完全
不变，纯增量式改动。

**验证**（REQ-027）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。i18n 改动的 `.js` 文件
`node --input-type=module --check` 通过；CSS 大括号配对人工核对一致；
用项目里已装好的 `@vue/compiler-sfc`（说明用户本地已 `npm install`
过）临时写了一个一次性脚本对改动的 4 个 `.vue` 文件做静态编译校验，
全部通过，验证完删除临时脚本。真实浏览器窄屏视觉效果需要用户本地
用设备模拟器或真机确认。

---

## 2026-07-25（第二十二次追加）

**REQ-026：REQ-025 自动恢复错过窗口——加一个手动恢复按钮**

用户按 REQ-025 的方案跑了 `npm install && npm run dev`，反馈"数据还是
没恢复"。排查确认 REQ-025 的自动恢复只在数据库确实"从来没写过"这一次
机会窗口内生效——用户大概率在这次自动恢复实现之前就已经打开过一次
REQ-024 之后的新版本，新数据库已经被写入过一行状态，窗口已经关闭。
用户随后贴出了自己 localStorage 里保存的真实旧数据作为佐证，确认数据
确实还在，只是错过了那次一次性窗口。

中途一度尝试再加一条"粘贴 JSON 手动导入"的恢复路径（`persistence.js`
导出 `parseImportedState`、`store.js` 加 `importState`、
`SettingsPanel.vue` 加文本框），被用户明确叫停："不需要实现数据恢复的
功能 帮我吧我给你的数据恢复进去就行"——已全部回退。

最终方案：`persistence.js` 把原来的内部函数拆成
`readLegacyLocalStorageState()`（导出，纯读取 localStorage 旧数据，不
关心数据库当前状态）+ `autoRecoverFromLegacyLocalStorage()`（内部，
`loadState()` 用，保留 REQ-025 原有的自动恢复行为）。`store.js` 新增
`restoreFromLegacyBackup()`，直接调用导出的读取函数，无视数据库当前
内容强制覆盖。`SettingsPanel.vue` 新增"数据恢复"分区（紧跟"语言"分区
之后），按钮 + `<n-popconfirm>` 二次确认；i18n key 加进 zh/en/ja。

**验证**（REQ-026）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验通过。复用 REQ-025 的模拟 sqlite-wasm + 模拟 localStorage，
验证了 `restoreFromLegacyBackup()` 在数据库已有"无关"数据的情况下仍能
正确用 localStorage 里的数据强制覆盖并写回，验证完删除临时代码。Grep
确认 `importState`/`parseImportedState`/`dataImport` 相关代码和 i18n
key 在回退后没有残留。真实浏览器里点击按钮的实际恢复效果需要用户本地
确认。

---

## 2026-07-22（第二十一次追加）

**REQ-025：修复 REQ-024 升级后旧数据"消失"——自动从 localStorage 恢复**

用户反馈"之前的数据不见了"。这是 REQ-024 的预期副作用：那次改动只是
让应用不再读/写 localStorage（改成读写 OPFS 数据库），完全没有清空或
迁移旧数据——数据其实还在浏览器里，只是新数据库是空的，启动时看到的
是全新默认状态。

`persistence.js` 的 `loadState()` 新增自动恢复：只在
`readStateJson()` 返回 `null`（新数据库确实从来没写过）时，才去看
`localStorage` 里 `lifespark:v1` 这个旧 key 还在不在；找到就当真实
数据用起来（过一遍 `fillMissingDefaults()`），立刻写回新数据库，下次
启动不再需要这个分支。数据库已经有数据时永远不会再看 localStorage，
避免旧数据覆盖掉之后的修改。整个过程自动、静默（`console.info` 留一条
日志），不需要用户点任何确认——这不是重新引入 REQ-024 时被否决的"手动
迁移入口"，是直接把已经发生的数据丢失问题修掉。

**验证**（REQ-025）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验通过；用 `node -e` 在模拟 sqlite-wasm 包基础上又模拟了
`window.localStorage`，端到端验证了：预置旧数据 → 首次加载正确恢复
且写回新数据库 → 之后再改 localStorage 内容不会覆盖已恢复的数据，
全部符合预期，验证完删除了临时模拟代码。真实浏览器效果需要用户本地
确认。

---

## 2026-07-22（第二十次追加）

**REQ-024：数据层从 localStorage 改为文件型数据库（浏览器内 SQLite + OPFS）**

用户要求把数据层从 localStorage 换成文件型数据库，同时兼容 MySQL 或
其它数据库。用 AskUserQuestion 分三轮确认：要同时支持文件数据库和
MySQL 唯一可行的路子是加一个 Node.js 后端（浏览器没法直接连 MySQL），
但用户明确表示"只需要文件型 SQLite，不增加后端"——放弃 MySQL 兼容这个
范围；技术栈指定为官方 `@sqlite.org/sqlite-wasm` + OPFS；现有
localStorage 数据不需要迁移入口，直接开始用新数据库即可。

新增 `src/state/db.js`：用 `sqlite3Worker1Promiser`（官方 Worker +
Promise 封装）在 Worker 线程里跑 SQLite，`vfs=opfs` 把数据持久化成
浏览器私有文件系统里一个真实的 `lifespark.sqlite3` 文件。只建一张
单行表存整份状态的 JSON（不做关系型多表拆分——`domain/*.js` 几十个
函数都是照着"读写同一个内存里的响应式 state 对象"这个模型写的，拆表
需要重写这些函数，超出这次任务范围）。`persistence.js` 的
`loadState`/`saveState` 从同步改成异步，`createDefaultState`/
`fillMissingDefaults` 不变。`store.js` 用"先同步创建占位默认状态、
再异步覆盖真实数据"策略吸收异步化：新增 `initStore()`，`getState()`/
`setState()` 签名完全不变，`domain/*.js`/`calendar/*.js` 零改动。
`main.js` 改成 async `bootstrap()`，挂载前 `await initStore()`；
`index.html` 加了纯内联样式的加载占位。`vite.config.js` 按官方文档
要求加了 COOP/COEP 响应头和 `optimizeDeps.exclude`；`package.json`
新增依赖；`README.md` 补充了持久化方式、部署要求、已知局限的说明。

**验证**（REQ-024）
按 AGENTS.md P2-2，未代为执行 `npm install`/`npm run dev`（新依赖还
没真的装进 `node_modules`）。用 WebSearch + WebFetch 核对了官方仓库
README 和一篇 Vue 3 集成教程，确认了 `sqlite3Worker1Promiser` 调用
方式、`vfs=opfs` 文件名语法、COOP/COEP 和 `optimizeDeps.exclude` 这两处
Vite 配置要求，都是第一次用到的新技术，不是凭训练记忆编的。额外在本地
临时搭了一个基于内存 Map 的模拟 `@sqlite.org/sqlite-wasm` 包，端到端
验证了 `db.js`/`persistence.js`/`store.js` 三层的调用链路和 Promise
时序：空数据库返回 null、写入读回一致、`loadState()` 空库返回默认
状态、`saveState`+`loadState` 往返正确保留自定义数据不被重新播种、
`initStore()` 正确把占位状态换成真实数据、防抖自动保存正确工作——全部
通过，验证完已删除临时模拟包和脚本。真实浏览器环境的 OPFS 行为需要
用户本地 `npm install && npm run dev` 后确认。

---

## 2026-07-22（第十九次追加）

**REQ-023：起始点数清零 + 刷新 17 项奖励的参考价格**

用户要求"清空目前账户的点数，和更新奖励的点数"。用 AskUserQuestion
确认：只能改代码默认值（没法直接改用户浏览器里已有的实际数据）；
"更新"是重新搜一遍现在的参考价格刷新数字，不是整体缩放比例。

`createDefaultState()` 的 `rewardPoints` 从 REQ-022 定的 2000 改回 0。
`SEED_REWARDS` 17 项数值重新查了一遍：佳能 EOS R6 Mark III 从官方
发布价 429000 改成当前市场实际流通价 386000（发布近 9 个月后市场价
已经低于官方价，取当前实际能买到的价格更贴近"参考价"本意）；RF45mm
镜头/AirPods Pro/MacBook Air 官方定价没变，数字不动；索尼耳机
59400→60000、Apple Watch 64800→65800（查到了更明确的数字）；旅行/
西服/运动装备这几项按同样的人民币预算，用当天最新汇率（约 1 CNY ≈
23.97 JPY）重新换算，数字小幅上调。

**验证**（REQ-023）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验通过；用 `node -e` 确认 `createDefaultState()` 的
`rewardPoints` 为 0、17 项奖励数值符合预期；用 WebSearch 核对了佳能
相机当前市场价、索尼耳机/Apple Watch/AirPods Pro/MacBook Air 日本
现价及当天人民币兑日元汇率，来源可追溯。界面实际呈现需要用户本地
确认。

---

## 2026-07-22（第十八次追加）

**REQ-022：起始点数改为 2000 + 平日/周末点数比率拆分 + 兑换二次确认 + 界面去除货币标识**

用户一次提了四件事：初始点数改成 2000；点数比率按"1 小时≈1000 点"的
手感调整，并且要能在设置页分别设"平日"和"周末"两档每小时点数；兑换
奖励要有确认框，不能点一下就直接扣点数；奖励金额继续按日元参考价定，
但界面上不能出现任何货币标识，都只说"点数"。

`persistence.js`：`rewardPoints` 默认值从 0 改成 2000；`settings.
pointsPerHour`（单一比率）拆成 `pointsPerHourWeekday`/
`pointsPerHourWeekend` 两个字段，默认都是 1000（用户给的是统一的
"感觉"，没有分别指定两档具体数值，所以两个默认值先保持一致，用户自己
在设置页调整）。旧的单一字段不再写入，老数据里如果还带着会变成死数据，
和 REQ-016 处理 `phaseWeeks` 是同一个模式，不需要专门迁移。

`domain/rewards.js` 新增 `isWeekend(dateKey)`（用 `weekdayIndex()`
判断周六/周日），`settlePastDays()` 结算每天时按这天是不是周末选用
对应比率。这个"周末"判断刻意不和 `settings.workHours.days`（自动排程
默认工作日）共用配置——前者是用户的个人激励尺度，后者是排程业务规则，
语义不同。`SettingsPanel.vue` 的"奖励点数"分区拆成两个输入框。
`RewardPanel.vue` 兑换按钮外面包了 `<n-popconfirm>`，`@positive-click`
才真正调用 `redeemReward`，按钮点击不再直接触发兑换。

三语言文案里所有"日元"/"円"/"¥"/"JPY"都改掉了：奖励数值单位从"日元"
改成"点"，"所需点数（日元）"这类表头简化成"所需点数"。`reward.value`
数字本身没变（仍然是当初按日元参考价定的数值），只是不再用"日元"这个
词称呼它，对用户来说这就是纯粹的"点数"概念。

**验证**（REQ-022）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 全部通过；用 `node -e` 验证了默认起始点数（2000）、默认比率
（1000/1000），并用真实的过去某平日/周末日期分别设不同比率
（300/700）跑 `settlePastDays()`，确认点数增量和每个块的
`pointsAwarded` 按对应档位正确计算，没有混用；Grep 确认全部源码和
三个语言文件里已经没有货币用词残留，`pointsPerHourWeekday`/
`pointsPerHourWeekend` 在各文件间引用一致。`<n-popconfirm>` 弹出交互
和界面视觉效果需要用户本地确认。

---

## 2026-07-22（第十七次追加）

**REQ-021：修复"8:00-9:00 与 8:30-9:00 重叠"场景下短事件显示异常**

用户反馈"8 到 9 点的事件和 8 点半到 9 点的事件同时存在时，后者显示得
很奇怪"。用 `node -e` 实际算出两个块的渲染像素坐标定位根因：REQ-017/
REQ-020 给短时长块设的"可读性最小高度"（20px 日视图/18px 周视图）用
`min()`/`max()` 钳制在"到下一个不重叠的块之前还剩多少空间"以内，但
`nextBlock` 判断只找时间上不重叠的下一个块——8:00-9:00 和 8:30-9:00
互相重叠（左右分栏各占一列），彼此都不会被对方算作 `nextBlock`。于是
8:30-9:00 这个自然高度本来就不到 20px 的块，在没有 `nextBlock` 兜底的
情况下被 20px 下限直接撑高，撑出来的部分越过它自己真实的结束时间
（9:00），显示得比同一竖排的 8:00-9:00 更晚结束——两个块明明同一时刻
结束，读起来却不一致。像素验证：修复前该块下边缘超出真实结束位置约
6px。

修复：`blockStyle()` 加一层"不能超过自己真实高度"的上限，**只在这个块
确实和别的块左右分栏（`columns>1`）时才生效**——孤立块
（`columns===1`）不受影响，仍然可以为了可读性撑得比真实比例高（这是
REQ-010 的原始设计意图，这次修复特意保留，不连带削弱）。
`DayTimeline.vue`/`WeekBoard.vue` 两处改法对称。

**验证**（REQ-021）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。用 `node -e` 精确模拟了
800px 高容器下的像素坐标计算，对比修复前后：8:30-9:00 块的下边缘超出
误差从约 6px 降到浮点精度范围内（约 0）；同时验证了三个不应受影响的
场景（孤立短块仍撑到可读性下限、REQ-020 验证过的"紧邻不重叠"场景、
普通不分栏时长块）行为都不变。`node --input-type=module --check` 对
项目全部 `.js` 文件语法校验通过，本次改动的 `.vue` 文件人工核对了完整
函数逻辑。实际视觉效果需要用户本地 `npm run dev` 后确认。

---

## 2026-07-22（第十六次追加）

**REQ-020：修复 N 路事件重叠显示 + 默认完成（跳过才不计分）+ 点数一天延迟结算**

用户一次提了三件事：一个长事件时间跨度内有两个短事件时显示有问题；
事件不需要点击就算完成，只有点跳过才不算；点数累积改成有一天延迟。

**N 路重叠分栏**：`utils/blockOverlap.js` 整个重写，从"只处理两个块
互相唯一重叠的特例、3+ 直接放弃维持整行"改成标准区间调度算法：按开始
时间分簇（簇内块通过直接或传递重叠连在一起），簇内贪心分配列（找一个
已经空出来的列放，找不到就开新列）。验证了用户描述的场景：长事件（如
9-17 工作）包住两个不重叠的短事件（10-11 开会、13-14 午休）——长事件
独占一列，两个短事件共享另一列，不再是三个块整行宽度叠成一坨。新增
`columnBoxStyle(column, columns)` 把布局结果换算成 CSS left/right，
`DayTimeline.vue`/`WeekBoard.vue` 的 `blockStyle()` 直接复用，替代原来
只处理两列的写法。周期事件优先靠左从"绝对保证"收窄为"开始时间相同时
优先"——通用算法必须严格按时间处理才正确，这是诚实的取舍。

**默认完成 + 一天延迟结算**：`DayTimeline.vue` 里 REQ-019 才加的"标记
完成"按钮整个删掉，用户不再需要点任何东西来"完成"一个事件——只剩跳过
和删除两个手动操作。新增 `domain/rewards.settlePastDays(store)`：只
结算"今天之前"的日期（今天永远不结算，这就是"延迟一天"），扫描每个不是
Google 来源、没被跳过、还没结算过的块，按时长 × `pointsPerHour` 算点数
累加到余额，关联了计划的块同时推进计划进度；函数本身靠
`block.pointsSettled` 标记天然幂等，不需要额外的"结算到哪天"游标。
`App.vue` 挂载时结算一次，并 `watch` `useNow()` 的日期变化，跨天时
（应用开着过夜）再结算一次。`toggleSkip()` 改成：标记跳过时如果这个块
已经结算过，把已发的点数和已推进的计划进度都退回去——跳过在任何时候
都是有效的反悔；取消跳过不主动补发，交给下一次结算自然处理。

**验证**（REQ-020）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 全部通过；`node -e` 完整验证了 `computeBlockLayout()`（6 种
重叠场景）和 `settlePastDays()`（正常结算/跳过不计分/Google 块不计分/
今天不结算/幂等/计划联动，全部符合预期），以及跳过时的退点数/退计划
进度/重新结算完整链路；Grep 确认已删除的函数名/CSS class/文案 key 没有
残留引用。视觉效果和跨天自动结算的实际体验需要用户本地确认。

---

## 2026-07-21（第十五次追加）

**REQ-019：奖励改为日元点数经济（完成任意事件按时长攒点数兑换）**

用户要求把 REQ-018 那套"完成整份计划才能直接领取奖励"整个换掉，改成
"日常完成任意事件按时长攒点数、点数够了兑换奖励"的点数经济，奖励改用
日元计价。用 AskUserQuestion 确认三点：点数机制**完全替代**（不是和
原来的机制并行）；**任意**时间轴事件标记完成都攒点数（不限于计划关键
事件）；点数按**时长**换算，换算比率做成用户可调的设置项（没有一个
"标准答案"，不该由 AI 替用户硬编码）。

`domain/rewards.js` 重写：`reward` 去掉了 `claimedByPlanId`（兑换不再
绑定某份计划）；新增顶层 `state.rewardPoints`（简单余额数字）；
`computePointsForDuration`/`addPoints`/`redeemReward` 三个新函数分别
负责算点数、增减余额（钳制不能为负）、兑换时校验余额是否足够。

`DayTimeline.vue` 的"标记完成"按钮从"只有关联了计划关键事件的块才
显示"改成对所有非 Google 来源的块都显示——点击时按块的真实时长算点数，
快照存进 `block.pointsAwarded`（不是每次现算，避免之后改了比率或拖拽
改了时长导致撤销时数字对不上）；如果块恰好关联了计划关键事件，同一个
"完成"动作还会顺带推进那份计划（两件事共用一个动作，语义一致）。
"完成"和"跳过"两个状态互斥，切换时会把另一个状态连带的点数/计划进度
先退回去。删除一个已完成的块会退回它的点数，但不会联动撤销计划进度
（简化取舍，写在代码注释里）。

`PlanPanel.vue` 删掉了 REQ-018 新增的"领取奖励"整个区域——计划到达
终点后只显示"已到达终点"标签，不再直接触发奖励发放，奖励完全由点数
经济驱动，和某一份具体计划完成与否脱钩。`RewardPanel.vue` 顶部新增
点数余额展示，"待兑换"表格每行加了"兑换"按钮（余额不够时置灰并显示
差多少），去掉了"兑换自哪份计划"这一列。`SettingsPanel.vue` 新增"奖励
点数"分区，即时生效地调整 `settings.pointsPerHour`（默认 500）。

奖励清单价值从人民币改成日元：佳能 EOS R6 Mark III（¥429,000）和
RF45mm F1.2 STM（¥66,000）用 WebSearch 核对了日本官方发布的确切零售价；
索尼 WH-1000XM6（¥59,400）/AirPods Pro（¥39,800）/MacBook Air
（¥224,800）也查到了日本官网确切价格；Apple Watch（¥64,800）没查到
当前确切数字，按历史价位估的参考值；西服/六国旅行/自行车/滑雪/游泳/
潜水这几项按 REQ-018 定的人民币参考预算乘当前汇率（约 1 CNY ≈ 23.8
JPY）换算取整。

**验证**（REQ-019）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动文件做了语法校验；用 WebSearch 核对了佳能两款产品、
索尼耳机、AirPods Pro、MacBook Air 的日本官方零售价及人民币兑日元汇率；
用 `node -e` 完整跑了运行时验证（种子数据日元价格正确、按时长算点数
正确、正常兑换扣点数、点数不够时兑换被拒绝且余额不变、已兑换奖励
删不掉未兑换的能删、计划进度推进不依赖奖励兑换）；用 Grep 确认
`claimedByPlanId`/`hasClaimedRewardForPlan`/旧版"领取奖励"相关的函数名
和文案 key 已经清理干净。界面实际交互观感需要用户本地确认。

---

## 2026-07-21（第十四次追加）

**REQ-018：奖励名单（完成计划可领取，含参考价值）**

用户直接给了一份清单（佳能 EOS R6 Mark III + RF 45mm F1.2、索尼耳机、
苹果手表/耳机/电脑、西服、马来西亚/印尼/泰国/越南/新加坡/韩国旅行、
公路车、滑雪装备、游泳、潜水），要求"把价值写上"。用 AskUserQuestion
确认两点：奖励名单和 REQ-017 的"计划"是配对关系（完成计划才能领取
奖励），"价值"由 AI 帮忙搜参考市价填上（人民币，可编辑）。

新增 `src/domain/rewards.js`：`reward = {id, title, value, claimed,
claimedAt, claimedByPlanId, createdAt}`。核心约束在写入函数里做防御：
`claimReward` 只对未领取的奖励生效，`hasClaimedRewardForPlan` 保证一份
计划只能兑换一次，`deleteReward` 只允许删还没被领取的（已兑现的是领取
记录，删了会丢失"这份计划换到了什么"的历史）。

`state.rewards` 种子数据就是用户给的 17 项，价格来源分两类：佳能 EOS
R6 Mark III（¥16999）和 RF45mm F1.2 STM（¥2949）是 2025-11-06 官方发布
的确切零售价，用 WebSearch 核对过；索尼耳机/苹果手表/耳机/电脑这几项
用户没写具体型号，查了大致价格区间取参考值；西服、六国旅行、自行车、
滑雪/游泳/潜水这几项没有固定牌价，按常见预算估的参考值。种子数据只在
全新用户（`state.rewards` 字段完全不存在）时写入，和 `activityPool` 的
`SEED_ACTIVITIES` 是同一个模式，不会覆盖用户已经改过/清空过的数据。

新增导航视图"奖励"（`RewardPanel.vue`，图标 `CardGiftcardRound`）：
待领取/已兑现两个分区，待领取的可改价值/可删除，已兑现的显示来自哪份
计划、兑现时间；顶部有添加新奖励的小表单。`PlanPanel.vue` 计划卡片新增
"领取奖励"区域（图标 `RedeemRound`），只在计划到达终点且没兑换过时
出现，下拉框只列未领取的奖励，选好点击后标记兑现，卡片相应显示"已用
这份计划领取奖励：xxx"。

**验证**（REQ-018）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动/新增文件做了语法校验；用 WebSearch 核对了佳能两款
产品的官方发布价（精确），其余电子产品查了大致价格区间（参考值）；用
WebFetch 核对了 `CardGiftcardRound`/`RedeemRound` 两个图标真实存在；用
`node -e` 完整跑了运行时验证：种子数据正确加载 17 条、正常领取流程、
重复领取同一奖励被拒绝、已兑现奖励删不掉、未兑现的能删掉，全部符合
预期。界面实际交互观感需要用户本地确认。

---

## 2026-07-21（第十三次追加）

**REQ-017：导入"计划"功能（取代长期目标）+ 修复相邻事件间隔显示 bug**

用户提了两件事：新增"计划"功能（一份计划包含一串有先后顺序的关键事件，
严格按顺序完成才能推进到终点，支持多个计划，关键事件有预计时长，新建
日程事件时能从计划的关键事件列表直接添加），以及一个显示 bug（"时间上
紧邻的两个事件之间，第二个事件没有间隔显示"）。用 AskUserQuestion 确认
了四个关键决策点后实现。

**计划功能**：新增 `src/domain/plans.js`——`plan = {id, title, createdAt,
keyEvents}`，`keyEvents = [{id, title, estimatedHours, completedAt}]`。
关键的设计选择是"数组顺序即完成顺序"：不单独存排序字段，`completeKeyEvent`
只允许标记 `keyEvents` 里第一个 `completedAt` 为空的那个（`getActiveKeyEvent`
返回的"当前解锁"项），`removeKeyEvent` 只允许删除还没完成的，这样"严格
按顺序"这个约束是数据结构层面天然满足的，不需要额外校验代码。新增
`src/components/PlanPanel.vue`（新的导航视图，图标 `FlagRound`，已用
WebFetch 核对存在）：新建计划表单（标题 + 动态增减的关键事件行）、
计划卡片列表（进度条 `n-progress`、关键事件列表按 已完成/当前解锁/
还锁着 三种状态区分样式、删除计划、追加关键事件）。

**用户明确要求"计划取代长期目标"**：删除了 `SettingsPanel.vue` 的"长期
目标"分区（REQ-016 新增的那部分），但 `domain/goals.js`/`state.goals`/
`computePhaseWeeksFromGoals()` 本身没有删除——`SidebarNav.vue`/
`WeekBoard.vue`/`scheduler.js` 三处调用链继续用这个函数算阶段周数，只是
往后 `state.goals` 永远是空数组，阶段周数会一直落回
`DEFAULT_PHASE_WEEKS_FALLBACK`（13 周）。这是预期内的结果：用户要拿掉的
是"长期目标"这个 UI 概念，不是"阶段还要不要有周数"这个更底层的机制，
和 REQ-015"只删按钮、domain 函数保留"是同一个处理模式。

**从计划添加到时间轴**：`EventModal.vue` 新建事件表单顶部新增"从计划
添加（可选）"下拉框，只列出每个计划当前解锁的关键事件（"计划标题 ·
关键事件标题"），选中后自动把标题、结束时间（开始时间+预计时长）填进
草稿，并记下 `planId`/`keyEventId`，保存时写进新建的 block。这两个字段
只是"这个 block 对应哪个计划的哪个关键事件"的引用，不复制/不影响
`plans` 数据本身。

**标记完成，推进计划**：`DayTimeline.vue` 新增"标记完成"按钮（图标
`CheckCircleRound`，已用 WebFetch 核对存在），只在 block 关联了计划关键
事件、且该关键事件还没完成时显示；点击调用 `completeKeyEvent`，成功后
计划进度前进一步，下一个关键事件解锁。完成状态存在 `state.plans` 里，
不是 block 自己的字段，`day.planKeyEventDoneToggle`/`Toast` 两条新文案。

**bug 修复：相邻事件间隔被吃掉**——用 AskUserQuestion 让用户从三个候选
描述里选出真正命中的场景："紧邻但看不出缝隙"（不是"重叠时完全不分栏"，
那个是 REQ-014 已经做了的功能，也不是"分栏但间隙太窄"）。根因排查：
`DayTimeline.vue`/`WeekBoard.vue` 的 `blockStyle()` 原来给 `.timeline-block`
设了固定的 `minHeight:'20px'`/`'18px'`（保证短时长块至少露出一行字），
但 CSS `min-height` 的优先级高于百分比算出来的 `height`，块自然高度
（真实时长换算的百分比）小于这个值时会被强行撑高——`top` 是固定的，
撑高只会往下扩张，如果这个块后面紧跟着另一个时间上不重叠的块（比如
9:00-9:15 后面接 9:15 开始的下一个事件），撑高部分会正好越过自己的真实
结束时间，一路啃到下一个块的起点，把两者之间该有的 5px/4px 间隔吃掉。
修复：不再用固定 CSS `minHeight`，改成在 JS 里找到当天排在这个块结束
之后、且不与它重叠的下一个块（区别于 `blockOverlap.js` 那种左右分栏的
"重叠"），算出到它为止还有多少可用空间，用 CSS `min()`/`max()` 函数
把"保证可读性的最小高度"钳制在这个空间以内——不需要在 JS 里现算容器的
实际像素高度，把最终决定权交给浏览器渲染时用真实像素计算。没有下一个
块（或下一个块离得还很远）时行为和原来一致。`DayTimeline.vue`/
`WeekBoard.vue` 两处改法完全对称。

**验证**（REQ-017）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动/新增的 `.js` 文件做了语法校验（全部通过）；用
WebFetch 核对了 `FlagRound`/`CheckCircleRound` 这两个新用到的
`@vicons/material` 图标真实存在；用 Grep 确认删除的 `settingsView.goals*`
系列文案 key 在三个语言文件和代码里都清理干净了，`createGoal`/
`updateGoal`/`deleteGoal` 目前没有调用方但完整保留在 `domain/goals.js`
没有被误删。CSS `min()`/`max()` 函数嵌套的实际渲染效果、短时长事件的
可视间隔、计划功能的整体交互观感（新建/标记完成/进度条/多计划并存），
都需要用户本地 `npm run dev` 后实际确认。

---

## 2026-07-21（第十二次追加）

**REQ-016：阶段周数改由长期目标累计控制**

延续更早"年度级别的大目标怎么处理"那次没聊完的话题，用户这次提了具体
方向，但消息在"1通过设定长期计划进行控制..."处断掉了。用
AskUserQuestion 请用户补充目标和现有四阶段（探索/筛选/进阶/记忆）的
关系，给了三个选项：目标独立于阶段（阶段照旧）、阶段周数由目标累计
决定（替换固定周数）、目标进一步影响每周自动排程的活动权重。用户选了
**第二个**：阶段周数由目标累计决定，替换现在的固定周数。

新增 `src/domain/goals.js`：`goal = {id, title, phase, weekBudget,
createdAt}`，`createGoal`/`updateGoal`/`deleteGoal` 三个 CRUD 函数（和
`recurringEvents.js` 一样的 `store.setState` 惯例），核心是
`computePhaseWeeksFromGoals(goals)`——把目标列表汇总成
`domain/yearPhases.js` 需要的 `{explore,filter,advance,memory}` 周数
结构：阶段长度 = 该阶段所有目标 `weekBudget` 之和，没有目标的阶段用
`DEFAULT_PHASE_WEEKS_FALLBACK = 13`（原来的默认值）兜底，避免出现长度
为 0 的阶段把后面的阶段全部挤乱。

`state.goals`（顶层新数组，默认空）取代了 `settings.phaseWeeks`（整个
删除）——目标是"计划数据"不是"配置项"，和 `activityPool`/
`dayTimelines` 是一类东西，不该塞进 `settings`。`persistence.js` 的
`fillMissingDefaults()` 相应更新。三处原来读 `settings.phaseWeeks` 的
地方（`SidebarNav.vue` 阶段进度条、`WeekBoard.vue` 阶段标签、
`domain/scheduler.js` 的 `generateWeeklyPlan`）都改成现算
`computePhaseWeeksFromGoals(state.goals)`；`scheduler.js` 那处虽然在
REQ-015 里已经没有 UI 入口调用了，但为了模块本身逻辑自洽还是一起改了。

`SettingsPanel.vue`"年度与阶段"分区里原来手填每阶段周数的
`n-input-number` 网格删掉，新增"长期目标"分区：按阶段显示当前汇总出的
周数（只读、实时）、目标列表（标题/阶段/可编辑的预算周数/删除）、新增
目标表单（标题+阶段选择+预算周数+添加按钮）。目标增删改和"语言"分区
一样即时生效，不走这个页面其余字段的 draft/保存流程。

**验证**（REQ-016）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部改动文件做了语法校验；用 `node -e` 验证了
`computePhaseWeeksFromGoals()` + `getPhaseSchedule()` 组合起来"有目标的
阶段用累加值、没有目标的阶段用兜底 13"这个核心行为；用 Grep 确认
`settings.phaseWeeks`/`phaseWeeksLabel` 在代码里已经没有实际引用。设置
页新分区的交互效果和阶段进度条/标签的联动需要用户本地确认。

---

## 2026-07-21（第十一次追加）

**REQ-014：时间重叠事件左右分栏显示 + REQ-015：去掉周计划生成/清空/周期快捷按钮**

**REQ-014**：用户问"如果遇到会时间重复的事件怎么处理呀"，并给出明确
要求：两个重叠的事件都要留下、更多就不处理、不能覆盖、周期事件优先
显示。先排查了一遍数据层——`recurringEvents.js`/`EventModal.vue` 里所有
新建/更新块的逻辑都是纯追加或原地更新对应 id，从来不会因为新建/移动到
某个时间点就删掉原本在那的块，"不能覆盖"这条在数据层面本来就是满足的。
真正的问题是视觉上：两个块都是整行宽度、绝对定位，时间重叠时后画的会
盖住先画的，看着像丢了。新增 `src/utils/blockOverlap.js` 的
`computeBlockLayout(blocks)`：两两互相唯一重叠时分左右两栏各半宽；一个
块同时和 2 个以上其他块重叠时不处理，维持整行宽度；两两分栏时周期事件
固定排左边。`DayTimeline.vue`/`WeekBoard.vue` 的 `blockStyle()` 接入
这个函数，用内联 `left`/`right` 样式把块限制在半宽范围内。

**REQ-015**：用户要求去掉周视图头部的"生成本周计划"（含"重新生成"）、
"清空本周安排"、"新建周期计划"快捷入口三个按钮。`WeekBoard.vue` 删掉了
`handleGenerate`/`handleClearWeek`/`openRecurringShortcut`/
`translateWarning` 四个函数和只被它们用到的 `weekKey`/`plan`，连带清理
了变成未使用的 import 和三个语言文件里对应的文案 key（顺手还清理掉一个
更早就已经没人引用的 `week.emptyDay` 死文案，和这次改动本身无关）。
**只删了 UI 入口**：`domain/scheduler.js`/`domain/dayPlanner.js`/
`domain/activityPool.js` 里被这些按钮调用的函数本身完全没动，用户要的
是"按钮"不是"功能"，这几个函数暂时没有调用方，但逻辑还在，以后要恢复
不需要重新实现。

**验证**（REQ-014/REQ-015）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了新增的 `blockOverlap.js` 和改动的三个 locale 文件；用
`node -e` 实际跑了四组用例验证 `computeBlockLayout()` 的分栏/优先级/
兜底排序逻辑；用 Grep 确认 `WeekBoard.vue` 里已删除的四个函数和相关
import 没有残留引用，`getBusyMap`/`markScheduled`/`planWeekDays`/
`generateWeeklyPlan` 在 domain/calendar 层仍然存在（`getBusyMap` 还被
`GoogleSyncPanel.vue` 独立使用）。视觉呈现（左右分栏的实际观感）需要
用户本地 `npm run dev` 后确认。

---

## 2026-07-21（第十次追加）

**REQ-013：日视图事件块去掉"周期事件"标注**

用户反馈"周期事件 不需要在底下进行标注"。`DayTimeline.vue` 里带
`recurringId` 的块，标题下面一直多显示一行"🔁 周期事件"
（`.timeline-block__recurring-tag`，`RepeatRound` 图标 + `day.recurringTag`
文案），和更早删掉的"类型"标注是同一类问题——占用块本就紧张的高度，
用户觉得不需要，删掉：

- `DayTimeline.vue` 模板删掉这一整块 `v-if="block.recurringId"` 的
  `.timeline-block__recurring-tag`；`RepeatRound` 图标 import 一并删除
  （这个文件里只有这一处用到）。
- `css/timeline.css` 删掉对应的 `.timeline-block__recurring-tag` 规则。
- 三个语言文件的 `day.recurringTag` key 一起删掉，避免留死文案。
- 周期事件本身的创建/编辑单次/删除单次或整个系列这些行为完全没变，
  只是时间轴上不再单独标出"这是个周期事件"。

**验证**（REQ-013）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了三个改动的 locale 文件；用 Grep 确认
`recurringTag`/`recurring-tag`/`RepeatRound` 在 `src/` 下已无残留引用。

---

## 2026-07-21（第九次追加）

**REQ-012：事件时间标注恢复显示真实时间**

用户反馈 REQ-011 的"起点留白"效果同时影响了块的时间文字标注（比如
16:00 的事件写成"16:05-17:00"），实际用起来感觉奇怪——点进详情弹层看到
的是真实的 16:00，块上标注却是错开后的 16:05，两边对不上。用户明确
只要保留块的**渲染位置**这个视觉效果，**文字标注**要改回真实时间。

- `DayTimeline.vue` 的 `displayTimeLabel(block)` 改回直接读
  `block.start`/`block.end`，不再经过 `displayStartHour()`。
- `blockStyle()` 里块的 `top`/`height` 位置计算继续用
  `displayStartHour()`——这部分视觉效果用户没有要求撤销，保留。
- `constants/timelineRange.js` 里这两个导出上方的注释相应更新，明确
  "只用于位置计算，不要再用于生成时间文字"，避免以后又被拿去用在
  标签上。
- 确认过 `EventModal.vue`（点进事件看到的详情/编辑弹层）本来就一直读
  `modal.block.start`/`end` 的真实值，没有引入过留白效果，这次不需要
  改动，专门在 REQUESTS.md 里记了一笔确认过的结论。

**验证**（REQ-012）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 校验了 `timelineRange.js`；用 Grep 确认 `displayStartHour`
现在只在 `blockStyle()` 里被调用，`displayTimeLabel()` 和
`EventModal.vue` 都不再涉及。视觉效果需要用户本地确认。

---

## 2026-07-21（第八次追加）

**REQ-011：去掉块内类型文字 + 按钮重叠修复 + 外观/地区设置 + 节假日展示 + 事件展示性微调**

用户一次性反馈了六件事，分两组处理。

**A 组：延续 REQ-010 的时间轴细节**

1. 事件块类型文字（"体验"/"工作"这类）删掉了——`DayTimeline.vue` 的
   `.timeline-block__type` 那一行和对应的 `blockTypeLabel()` 函数整个
   移除，类型只靠块左边框颜色区分。用户原话："这类分类有颜色就足够了
   不要标注"。
2. `.timeline-block__title-row`（标题+时间合并行）加了
   `padding-right: 42px`，给右上角绝对定位的跳过/删除按钮让出空间——
   之前时间文字会写到按钮底下去，重叠。
3. 块间间隙从 REQ-010 定的 3px/2px（日/周视图）调大到 5px/4px。
4. 新增"起点留白"这个纯展示层面的微调（`constants/timelineRange.js`
   新增 `DISPLAY_START_HOUR`/`displayStartHour(block)`）：块的渲染
   位置和时间标签都用 `block.start` 往后错开最多 5 分钟的值（时长
   短于 10 分钟的事件按一半时长错开，避免错位值超过 `block.end`），
   例如 16 点整开始的事件会显示成"16:05"，但 `block.start` 本身完全
   不变，拖拽/排序/冲突判断这些业务逻辑一律读真实值。用户原话："事件
   不一定要根据时间完美匹配，只要知道在那个区块，稍微留点间隔也是
   可以的……实际内容里面当然这还是16点的事件，只是显示的时候为了好看
   一点"。

**B 组：新功能——外观/地区设置 + 节假日展示**

**外观设置**（`SettingsPanel.vue` 新增"外观"分区，`App.vue` 接入生效）
- 字体：新增 `src/constants/fontStacks.js`，5 个纯系统字体拼栈选项
  （默认 Roboto、系统默认、圆润、衬线、等宽），不引入新的 Web Font
  依赖，没有网络也能正常显示。
- 主题色：`n-color-picker` 选一个强调色，覆盖掉 REQ-007 定的 Google
  蓝默认色；留空代表"跟随主题默认"。没有自动生成 hover/pressed 深浅
  变体的能力（需要颜色处理库），自定义色下 Naive UI 的四个交互状态色
  统一用同一个颜色，是简化后的取舍。`App.vue` 里还额外用
  `document.documentElement.style.setProperty` 同步覆盖了
  `--font-sans`/`--accent`/`--accent-strong` 这几个自定义 CSS 变量，
  不然会出现"Naive UI 组件换了颜色、自己写的日历网格没换"这种两套
  视觉不一致的情况。
- 背景图片：URL 输入框 + 透明度滑块（5%-60%）。`App.vue` 新增一个
  `position:fixed` 的 `.app-background` 图层铺在 `.app-shell` 后面，
  只调图层自身的 `opacity`，不影响正文——侧边栏/卡片这些不透明背景色
  的元素照样清晰可读，图片只在它们之间的空隙露出来，类似"桌面壁纸"
  的效果。

这三项（字体/主题色/背景图）和 REQ-008 的语言切换一样是即时生效，不走
这个页面其余字段（年度/工作时间/配额/冷却期）的 draft + 保存流程。

**地区设置 + 节假日展示**
新增 `src/domain/holidays.js`：`settings.region`（新增字段，默认
`'CN'`）驱动的静态节假日数据，覆盖中国大陆/美国/日本三个地区的 2026
年节假日，写入前用 WebSearch 核对过官方或权威公开信息（中国大陆核对了
国务院办公厅《关于2026年部分节假日安排的通知》原文，不是凭记忆编的
日期）。`MonthBoard.vue`（格子里的假日名）、`WeekBoard.vue`（日期头
标红/标灰 + title 悬浮提示完整假日名）、`DayTimeline.vue`（标题旁的
`n-tag`）三个日历视图都接入了这份数据。

**范围取舍**：这份数据只做"日历上看得见"，没有接入
`domain/scheduler.js`/`domain/dayPlanner.js` 的自动排程逻辑——自动
排程判断"是不是工作日"依然只看 `settings.workHours.days` 这个每周
固定的星期几集合，不知道"今年这天调休上班"这种年度例外。

**已知局限**：`holidays.js` 是纯手工维护的静态表，只覆盖 2026 年，
没有联网获取最新数据的机制（浏览器端也不适合引入不受控的外部节假日
API），往后每年都需要照当年官方通知手动补一份新的数据进去，写在了
文件顶部注释里。

`src/state/persistence.js` 新增 `settings.region`/`settings.appearance`
默认值，`fillMissingDefaults()` 对 `appearance` 做了嵌套合并（不是简单
浅展开），保证旧数据升级时不会因为 `appearance` 只存了部分字段就整个
覆盖掉新增字段的默认值。

**验证**（REQ-011）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`node --input-type=module
--check` 对全部 `src/**/*.js` 文件（含新增的 `holidays.js`/
`fontStacks.js`）做了语法校验，全部通过；用 `node -e` 实际调用
`getHolidayInfo()` 核对了几个已知日期（国庆节/国庆调休/美国独立日/
日本儿童节）返回结果正确。`n-color-picker`/`n-slider` 这两个新用到的
Naive UI 组件，官方文档页请求 404，退而用 GitHub 源码
`src/components.ts` 确认了 `color-picker`/`slider` 是这个包里真实存在
的组件目录——这类通过 `app.use(naive)` 全局注册的模板标签，就算标签名
写错了也只是控制台报"组件未解析"的警告，不会像 REQ-005/007 里验证过的
具名 JS 导入错误那样导致整个应用直接起不来，风险明显更低，因此没有
再进一步核实每个具体 prop 名称。外观设置的实际生效效果、背景图叠加
观感、节假日标记的视觉呈现，都需要用户本地 `npm run dev` 后自行确认。

---

## 2026-07-21（第七次追加）

**REQ-010：事件块小尺寸下字体不可见 + 块间分隔 + 一天从 6 点开始 + 详情弹层按钮换行**

REQ-009 之后用户继续反馈四点，逐一处理：

**时间段过小、标题整个看不见**
根因排查：`.timeline-block` 原来是"时间+类型一行、标题另起一行"的两行
结构，配合 `padding:4px 8px`，两行文字加上下内边距需要的高度比当时设的
`min-height:18px` 还要高，短时长块（比如 15 分钟）的标题会被
`overflow:hidden` 整个裁掉——这才是"字体看不到"的真正原因，不是字号
问题。按用户建议的方案改：标题和时间合并成一行
（`.timeline-block__title-row`，标题在前、时间跟在后面，时间字号更小
颜色更淡）；"类型"这个次要信息退到下面单独一行，块太矮时随它被自然
裁掉（类型本来就能靠块左边框的颜色区分，不是必须看到的信息）。同时
`padding` 收紧到 `2px 7px`，`min-height` 调到 20px（日视图）/18px
（周视图），保证这一行文字在最小高度下也能完整露出来，不会被自己的
padding 挤没。

**块间分隔（无缝衔接的连续计划也要看出分界）**
`blockStyle()` 算出来的 `height` 从整百分比改成 `calc(X% - 3px)`
（周视图 2px），把每个块的底边往上收几像素——不管上一个块的结束时间
是不是正好等于下一个块的开始时间，两者之间都会留出一条固定的视觉间隙，
不会因为排得严丝合缝就糊成一整块颜色。减去的是固定像素而不是百分比，
所以短块和长块之间的间隙观感一致。

**一天从 6 点开始（`src/constants/timelineRange.js` 新增）**
新增 `DISPLAY_START_HOUR = 6` 和两个换算函数 `toDisplayOffset(hour)`/
`fromDisplayRatio(ratio, totalHours)`。时间轴的小时刻度改成按
6、7...23、0、1...5 这个顺序显示（凌晨时段排在最后而不是最前面，更
符合"一天从早上开始"的直觉）；块的渲染位置、"现在"横线、点击/拖拽建
事件的像素→小时换算，全部从"直接用真实小时数"改成"先转成显示偏移量
（`toDisplayOffset`）再算百分比位置，反向操作用
`fromDisplayRatio`"。块本身的存储范围（`TIMELINE_RANGE`，真实 0-24
点）和拖拽/缩放的钳制边界完全没变，只是"从哪个小时开始画"这个纯展示
层面的选择变了。**已知局限**（写在了 `timelineRange.js` 的注释里）：
真实起止时间跨过 6 点这条分界线的块（比如 4:00-8:00，对应现实里"熬夜
到早上"这种安排），会显示得比实际时长短——单个绝对定位的 div 没法在
视觉上"从网格底部绕回顶部"拆成两段渲染，超出网格底部的部分会被裁掉。
这种跨 6 点的块比较少见（多数活动排程默认窗口是 7-23 点），暂不做拆分
渲染这种更复杂的处理。

**事件块字体再调小**
`.timeline-block__title` 从 REQ-009 定的 12px/500 字重调到 11px；新增
的 `.timeline-block__time`（时间）/`.timeline-block__type`（类型）都是
9px、颜色 `--text-muted`，比标题更淡更小，主次更清楚。

**详情弹层（`EventModal.vue`）按钮行换行**
用户明确要求详情弹层的字体不用跟着变小，所以没有改任何字号——问题是
布局，不是字号：`.settings-actions`（`css/components.css`）原来只有
`display:flex;gap:10px`，没有 `flex-wrap`，编辑一个周期事件时这里最多
有 4 个按钮（保存修改/取消/删除此次/删除整个系列），中文场景下勉强能
放下，切到英文/日文或者窗口稍窄一点就容易溢出，这才是用户说的"详情
画面也有字体一行显示不完的问题"（其实是按钮放不下，不是字体本身的
问题）。加了 `flex-wrap: wrap`，放不下自动换到第二行，不裁切不溢出。

**验证**（REQ-010）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。用 `node --input-type=module
--check` 对全部 `src/**/*.js` 文件做了语法校验（全部通过）；用 Grep
确认没有遗留对旧版 `.timeline-block__row` class 的引用。时间轴旋转
显示起点、块间距、CSS `calc()` 高度这几处涉及真实渲染效果，无法在不
运行的情况下确认视觉观感，需要用户本地打开日/周视图确认：最上面一行
是不是 6:00、短时长事件的标题是否完整可见、相邻无缝事件之间是否能
看出分隔线、编辑周期事件时弹层按钮是否正常换行不溢出。

---

## 2026-07-21（第六次追加）

**REQ-009：事件字体调轻调小 + 时间轴改全天 24 小时 + 铺满页面高度**

用户反馈"事件的字体颜色太深了 大小也有点大 然后为什么只有7到22的时间
我需要全时间 然后日程表的长度铺满页面就好"，三个问题分别处理：

**全天 24 小时（`src/constants/timelineRange.js` 新增）**
日/周时间轴之前直接拿 `domain/dayPlanner.js` 的 `DAY_RANGE`（7-23 点）
当显示范围用，但 `DAY_RANGE` 其实是"自动生成周计划时默认把活动排在哪
个清醒时段"这条业务规则，跟"时间轴上能看到/能手动放事件的范围"是两回
事，混用导致手动创建、拖拽事件也被夹在 7-22 点之间出不来。新增
`TIMELINE_RANGE = {start:0, end:24}` 专门给 UI 层用，`DayTimeline.vue`
/`WeekBoard.vue` 的小时刻度、格线、事件块定位、点击建事件、拖拽移动/
拉伸的范围钳制全部换成这个新常量；`dayPlanner.js` 的 `DAY_RANGE` 本身
没有改，自动排程默认窗口不受影响。

**铺满页面高度（`css/layout.css` / `css/timeline.css`）**
时间轴高度原来是 JS 里"每小时 40/56px × 小时数"算出来的固定像素值，
跟浏览器窗口高度没关系，会出现底部留白或者要整页滚动。改成纯 CSS
flex 铺满：`.main-content` 加 `display:flex;flex-direction:column`；
`.day-view`/`.week-board` 用 `height:100%` + `flex:1` 吃满
`.main-content` 分给它的可视高度；`.day-timeline`/`.week-timeline` 再用
`flex:1` 吃掉视图内 `.view-header` 之外的剩余高度。小时格线和事件块的
位置/高度全部从像素改成百分比（相对 24 小时），彻底不需要任何 JS 算出
来的"每小时多少像素"常量了。唯一还需要现算像素的地方是拖拽移动/拖拽
拉伸这类要把鼠标 Y 坐标换算成小时数的交互——这些地方改成交互发生的
那一刻用 `getBoundingClientRect().height` 现场算比例，而不是套一个写死
的值，这样不管窗口多高、缩放比例多少，换算都是准的。

**事件字体（`css/timeline.css`）**
`.timeline-block__title`（事件标题）原来是 `font-weight:600 /
font-size:13px`，颜色继承页面正文的 `--text-primary`（浅色主题下是
`#202124` 接近纯黑，配 600 字重在紧凑的小方块里显得又粗又占地方）——
改成 `font-weight:500 / font-size:12px / 颜色 --text-secondary`，视觉上
更轻更协调；时间+类型那一行 `.timeline-block__row` 顺手从 11px 降到
10px（颜色本来就是更淡的 `--text-muted`，不是"太深"的问题，缩小是为了
和标题的字号梯度拉开）。

**验证**（REQ-009）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。用 `node --input-type=module
--check` 校验了新增的 `timelineRange.js`；用 Grep 确认
`DayTimeline.vue`/`WeekBoard.vue` 里旧的 `DAY_RANGE`/`PX_PER_HOUR`/
`gridHeight` 全部清理干净，没有残留。CSS flex 铺满、百分比定位、拖拽/
拉伸换算这几处涉及真实渲染尺寸和鼠标交互，没法在不运行的情况下确认，
需要用户本地实际打开日/周视图，试一下点击建事件、拖拽移动、拖拽拉伸
这几个操作是否还准确对应鼠标位置，以及时间轴视觉上是否真的铺满了。

---

## 2026-07-21（第五次追加）

**REQ-008：语言切换从右上角悬浮按钮挪到设置页**

用户反馈"语言切换功能放到设置里面吧"。改动很小，纯挂载位置调整，
`LanguageSwitcher.vue` 组件本身逻辑（三个缩写按钮 + `store.setState`
写 `settings.locale`）完全没动：

- `src/App.vue`：删掉了全局挂载的 `<LanguageSwitcher :state="state" />`
  （原来和 `app-shell`/`EventModal` 平级，任何页面都能看到）及对应
  import。
- `src/components/SettingsPanel.vue`：新增"语言"分区（复用已有的
  `settings-section` 分区样式，标题用已存在的 `language.label` 文案
  key，三语言文件里都已经有这个 key，不用新增翻译），分区内挂载
  `<LanguageSwitcher :state="state" />`。这个分区不走本页其余字段的
  "改草稿、点保存才生效"流程，是即时生效的（组件内部点击即写 store），
  记进了 `docs/MODULES.md` 供以后往这个分区加类似设置时参考。
- `css/layout.css`：`.language-switcher` 从 `position:fixed` 固定右上角
  的悬浮胶囊，改成 `display:inline-flex` 的普通行内胶囊，跟随设置页
  分区正常排版；边框/圆角/阴影视觉样式本身没变，只是不再脱离文档流。

**验证**（REQ-008）
按 AGENTS.md P2-2，未代为执行 `npm run dev`。`App.vue`/
`SettingsPanel.vue` 改动后人工核对了 import/挂载/CSS 类名的一致性；
`.vue` 文件仍无免构建语法校验手段，实际视觉效果（设置页新分区排版、
胶囊按钮在分区里是否贴合）需要用户本地确认。

---

## 2026-07-21（第四次追加）

**REQ-007：UI 视觉整体向 Google 风格靠拢**

用户反馈"太古老了"，要求学 Google 风格；确认不换组件库，在 Naive UI
基础上换皮肤。排查认定"显老"主要来自三点，逐一处理：

**图标（`@vicons/material` 新增依赖）**
大量功能性 UI 用 emoji 当图标（🗓️📅✨⚙️🔗☀️🌙➕🔁🚫 等），不同操作
系统渲染不一致，是最直接的"过时感"来源。换成 Material Design 图标
（`@vicons/material`，Round 风格）：侧边栏导航 5 个图标、主题切换
太阳/月亮、所有"添加"类按钮（新建周期计划/添加活动/添加事件）、日
时间轴的删除/跳过/周期标签、活动卡片的编辑/删除按钮。**这次用到的
每一个具名图标导出都先用 WebFetch 核对了
`unpkg.com/@vicons/material@0.12.0/es/<Name>.js` 确认文件真实存在**
（`ViewWeekRound`/`CalendarMonthRound`/`ExploreRound`/`SettingsRound`/
`SyncRound`/`LightModeRound`/`DarkModeRound`/`AddRound`/`CloseRound`/
`BlockRound`/`RepeatRound`/`EditRound`/`DeleteOutlineRound`，共 13 个）
——第三方包里拼错一个具名导出会让整个应用直接起不来，这和 REQ-005
验证 `naive-ui` 的 `jaJP` 是同一类"错了就是全灭"的风险，值得花这个
验证成本。评价按钮的 💖😐⏭️👎（表达"喜欢/一般/跳过/不喜欢"的情绪化
表情）和侧边栏品牌 🌱 保留不换——前者是表现力而不是"老气"，Google
风格里没有对应物可学；后者是 LifeSpark 自己的标识。

**配色（`css/variables.css` / `src/App.vue`）**
强调色换成 Google 蓝：浅色主题 `#1a73e8`（Gmail/Calendar 同款），深色
主题 `#8ab4f8`（Google 自家暗色界面同款，比之前用的天蓝色更"正宗"）；
错误/警告/成功色也对齐 Google 调色板。`App.vue` 的 Naive UI
`theme-overrides` 从写死一个颜色改成 `computed`，按明暗主题分别给这套
色板（含 hover/pressed 状态）。深色主题背景**继续保持纯黑**
（`--bg-primary` 不变，这是 REQ-002 时用户明确要求过的，这次没有改
回去），但卡片/侧栏这类更高层级的深色表面改用 Google 暗色界面实际用的
偏蓝灰黑（`#202124`/`#292a2d` 一档），不再是单纯的灰阶，深色模式下也能
看出"这是 Google 风格"而不只是"纯黑加灰边框"。

**字体（`index.html`）**
引入 Google Fonts 的 Roboto（`--font-sans` 字体栈第一位），没有网络时
自动退回系统无衬线字体，不影响可用性。

**阴影分层代替边框（`css/components.css` / `css/timeline.css`）**
`.activity-card`/`.activity-form`/`.settings-section`/`.month-grid`/
`.day-timeline`/`.week-timeline` 这几个卡片类容器去掉了 `border: 1px
solid`，改用新增的 `--shadow-elevation-1`（悬浮态 `--shadow-elevation-2`）
两级 Material 阴影变量做层次分隔——这是 Material Design 用"阴影表达浮起
的层级"而不是"用线画格子"的核心视觉语言。侧边栏的 `border-right`（和
Gmail/Calendar 自己的侧栏分隔线一致）、右上角浮动语言切换胶囊的边框
（浮动元素在任意背景内容上都需要边框兜底可读性）保留没动，不是漏改，
是判断这两处的边框本身就是合理的。

**验证**（REQ-007）
按 AGENTS.md P2-2，未代为执行 `npm install`/`npm run dev`。用
`node --input-type=module --check` 对全部 23 个 `.js` 文件做了语法
校验（全部通过），人工核对了每个 `.vue` 文件里 `@vicons/material` 的
import 名和模板里实际使用的图标标签是否一一对应（没有手误改名）。
`.vue` 文件仍然没有免构建的语法校验手段，颜色/阴影/字体这类纯视觉效果
更是完全没法在不运行的情况下确认观感，需要用户本地 `npm run dev`
实际看一眼是否达到预期的"Google 感"。

---

## 2026-07-21（第三次追加）

**REQ-006：阶段周数文案澄清 + 周视图时间轴化 + 现在横线 + 语言切换挪到
右上角 + 周期计划快捷入口 + 事件跳过**

**src/i18n/locales/{zh,en,ja}.js**
`sidebar.phaseCurrent`/`week.phaseTag` 原来是"当前阶段：{phase} · 第
{week}/{total} 周"这种写法，用户反馈看不出这个 "{week}/{total}" 到底是
阶段内的第几周还是全年第几周。改成"当前阶段：{phase}阶段（第 {week} 周
/ 阶段共 {total} 周）"这类显式写出"阶段内"的表述，三语言同步改。

**src/composables/useNow.js**（新增）
模块级单例的"当前时间"（每 30 秒刷新），按调用方组件的挂载数量管理
一个共享定时器，供日/周视图画"现在"横线，避免每个视图各开一个定时器。

**src/components/WeekBoard.vue**（重写）
用户要求"日历需要有时间线表示"，确认后是两件事都要：(a) 现在时间横线，
(b) 周视图从"每天一列卡片堆叠"改成按小时定位的时间轴网格。后者是这次
改动量最大的部分——不再用 `BlockCard.vue` 渲染卡片列表，改成和
`DayTimeline.vue` 共用同一套 `.timeline-block` 视觉的 7 天并排时间轴
网格（新增 `.week-timeline*` 系列 CSS）。顺带的效果：拖拽现在除了换天
也会按放下位置换算新的开始时间（包括同一天内拖拽改时间，原来是空操作，
现在块有了时间位置这个操作才有意义）；新增点击网格空白处直接开建事件
表单（复用 `DayTimeline.vue` 的写法）；今天那一列显示"现在"横线；头部
新增"+ 新建周期计划"快捷按钮（不用先点某一天再开事件弹层，直接带
`recurrenceEnabled:true` 打开创建表单）。

**src/components/BlockCard.vue（删除）**
`WeekBoard.vue` 重写后不再需要单独的紧凑卡片组件，时间块直接内联渲染，
`BlockCard.vue` 变成死代码，整个删除；相关的 `.block-card*`/
`.week-column`/`.week-board__grid`/`.week-column__body`/
`.week-column__empty` 等 CSS 规则一并从 `css/components.css` 清理
（`.week-column__weekday`/`.week-column__date` 还在用，保留）。

**src/components/DayTimeline.vue**
新增 `toggleSkip(block)`：给块加/去掉 `status:'skipped'`（不删除），
配 `.timeline-block--skipped` 样式（变淡 + 标题划线）。用户原话是"事件
的话，可以进行跳过之类的操作"——排查发现现有的"评价"按钮行（含
skipped 选项）只在块关联了活动库条目（`activityId` 存在）时才显示，
手动/周期事件（没有关联活动库条目）完全没有类似操作，这是这次要补的
真实缺口。新的跳过标记对所有块都生效，和"活动评价"是两个独立概念
（评价影响活动未来的排程权重，跳过只是记录"这一次没做"），按钮图标用
🚫 而不是复用评价行已经在用的 ⏭️，避免两个相邻但含义不同的按钮长得
一样。

**src/components/EventModal.vue**
`buildDraft()` 的 `recurrenceEnabled` 初始值改为读取
`modal.recurrenceEnabled ?? false`（增量：多一个可选来源，不改变默认
行为），配合 `WeekBoard.vue` 的"新建周期计划"快捷按钮。

**src/components/LanguageSwitcher.vue**（新增）+ **SidebarNav.vue**
语言切换从侧边栏挪到右上角固定位置，缩写显示（中/EN/日，`title` 属性
放完整语言名）。`App.vue` 里挂在 `<n-message-provider>` 内、
`app-shell` 之外，`position:fixed` 固定在视口右上角，任何视图下都能
看到；`SidebarNav.vue` 移除原来的 `<n-select>` 语言选择器和相关
`.locale-select` CSS。

**验证**（REQ-006）
按 AGENTS.md P2-2，未代为执行 `npm install`/`npm run dev`。用
`node --input-type=module --check` 对全部 23 个 `.js` 文件做了语法
校验（全部通过），人工核对了 `WeekBoard.vue`/`DayTimeline.vue` 里
`@click.self` 配合子元素点击不冒泡触发误建事件的逻辑、拖拽事件的
payload 结构一致性、`BlockCard.vue` 删除后确认没有残留引用（含 CSS）。
`.vue` 文件仍然没有免构建的语法校验手段，最终效果需要用户本地
`npm run dev` 确认。

---

## 2026-07-21（再追加）

**REQ-005：UI 打磨 + 日视图占满宽度 + 三语言支持**

用户反馈整体 UI"生硬"、怀疑 Naive UI 有没有真的生效，日视图没占满页面，
要求支持中/英/日三语言。逐条排查后处理如下。

**css/base.css / css/components.css**
删掉了 `input, select {...}` 这条裸元素选择器规则（项目里已经没有裸
`<input>`/`<select>` 了，全部走 Naive UI 组件，留着这条规则只有风险
没有收益——它会连带影响 Naive UI 组件内部自己渲染的 `<input>`）；
`label {...}` 改成具名的 `.field-label` class，同样是为了不影响 Naive
UI 内部（比如 checkbox/radio）渲染出来的 `<label>` 元素。`#app` 补了
`height:100%`。这是这次"生硬感"排查里查到的实际根因之一，不是主观猜测。

**css/timeline.css**
`.day-view { max-width: 900px; }` 删掉，改成 `width: 100%`——这就是"日历
没占满页面"的直接原因，日时间轴之前被硬限制在 900px 宽。

**src/components/SidebarNav.vue**
导航从手写的 `<button class="nav-item">` 循环换成 Naive UI 的
`<n-menu>`（这是"有没有真的用上 Naive UI"里最明显的一处名不副实，之前
只有主题切换按钮是真正的 `n-button`，导航整个是手写的）；新增语言选择器
`<n-select>`。

**src/App.vue**
视图切换（`<component :is>`）原来是硬切，加了
`<transition name="view-fade" mode="out-in">` 做淡入淡出；新增
`<n-config-provider :locale :date-locale>` 跟着语言切换 Naive UI 组件
自己的内部文案；`watchEffect` 同步 `i18n.global.locale.value`。

**css/components.css（补充）**
`.block-card`/`.activity-card`/`.month-cell`/`.week-column` 补了 hover
过渡动效（位移/阴影/背景色的 transition），这是"生硬"感里视觉反馈缺失
的部分——原来这些元素在 CSS 层面基本没有交互反馈。

**多语言（vue-i18n + Naive UI 自带 locale）**
新增 `src/i18n/`（`index.js` + `locales/{zh,en,ja}.js`），`main.js` 里
`app.use(i18n)`。`domain/yearPhases.js`/`activityPool.js`/
`dayPlanner.js` 里的 `PHASE_LABELS`/`CATEGORY_LABELS`/
`BLOCK_TYPE_LABELS`、`utils/dateUtils.js` 的 `WEEKDAY_LABELS` 这几个
写死中文的映射表整体删除并在同一次改动里更新了全部调用方（不是破坏
对外接口，是内部一致的重构），显示文案改到 i18n 的
`domain.phase.*`/`domain.category.*`/`domain.blockType.*`/
`domain.weekdayShort`/`weekdayFull` 下。`scheduler.js` 的
`generateWeeklyPlan` 返回的 `warnings` 从拼好的中文字符串改成
`{key, params}` 结构化对象，`WeekBoard.vue` 负责按当前语言翻译展示——
domain 层不应该直接产出某一种语言的文案。十个组件全部接入
`useI18n()`。`state.settings` 新增 `locale` 字段（默认 `'zh'`），
`persistence.js` 的 `fillMissingDefaults` 已有的兼容逻辑自动覆盖旧数据
缺字段的情况，不需要额外处理。

**验证**（REQ-005）
按 AGENTS.md P2-2，未代为执行 `npm install`/`npm run dev`。用
`node --input-type=module --check` 对全部 22 个 `.js` 文件做了语法
校验（全部通过）。`App.vue` 里 `import { jaJP, dateJaJP } from
'naive-ui'` 这个此前没有把握的具名导入，用 WebFetch 直接核对了
naive-ui 的 GitHub 源码（`src/locales/index.ts` 和 `src/index.ts`），
确认 `jaJP`/`dateJaJP` 确实存在且通过 `export * from './locales'`
从包根导出——没有凭猜测下这个判断，因为一旦导入了不存在的具名导出，
整个应用会直接起不来，风险和普通文案错误不是一个量级。除此之外，
`.vue` 文件本身仍然没有免构建的语法校验手段，最终效果需要用户本地
`npm run dev` 确认。

---

## 2026-07-21（追加）

**src/domain/dayPlanner.js / src/components/WeekBoard.vue**（REQ-004）
用户反馈自由时间不应该被当成一个"事件"设置出来。`planWeekDays` 删掉了
排完活动后对剩余空闲区间自动生成 `type:'free'` 占位块的那段逻辑——网格
上留白就是自由时间，不需要一个标题叫"自由时间"的块来表示它；`free`
仍然是 `BLOCK_TYPES` 里合法的一员，用户在事件弹层里手动选它照样能建
free 类型的事件，只是自动排程不再主动拿它填满空档。同时在
`WeekBoard.vue` 头部加了"清空本周安排"按钮（`<n-popconfirm>` 二次确认），
把当前周的 `dayTimelines` 全部清空、移除对应的 `weeklyPlans` 记录，
方便用户重新排一周。

---

## 2026-07-21

**css/variables.css**（REQ-002）
深色主题背景改为纯黑系配色（`--bg-primary` 从 `#0f1115` 改为 `#000000`，
其余 `--bg-*`/`--border-color` 同步调深）；新增
`:root[data-theme="light"]` 浅色主题覆盖块。新增 `--accent-contrast`
变量，因为浅色主题下 `--accent-strong` 换成了深蓝色，`.btn--primary`
原来写死的深色文字（`#06131b`）在浅色主题下会和深蓝背景对比度过低，
一并改为按主题取值（深色主题深文字/浅色主题白文字）——这是实现"新增
浅色主题"过程中顺带发现并修的一个可读性问题，不是单独需求。

**src/ui/renderApp.js / sidebar.js**（REQ-002）
`uiState` 新增 `modal`（事件弹层状态）与 `selectedMonth`（月视图当前
月份）；`render()` 每次渲染都把 `document.documentElement.dataset.theme`
设为 `state.settings.theme`，驱动 CSS 主题切换；`uiState.modal` 非空时
追加渲染 `ui/eventModal.js` 的遮罩层。侧边栏新增主题切换按钮（🌙/☀️）和
"月度视图"导航项。

**src/state/persistence.js**（REQ-002）
`settings` 新增 `theme: 'dark'|'light'`（默认 `'dark'`），顶层新增
`recurringEvents: []`。因为这是在已有 `SCHEMA_VERSION` 不变的情况下加
字段，`loadState()` 原本"版本号匹配就直接原样返回解析结果"的逻辑会让
REQ-001 时期保存的旧数据缺失这两个新字段（导致 `state.settings.theme`
为 `undefined`、`state.recurringEvents.find(...)` 抛错）——重构为
`fillMissingDefaults()`，无论版本号是否匹配都用当前默认值补齐缺失的
顶层/`settings`/`googleSync` 子字段，属于本次改动直接暴露的一个前置
缺陷，顺带修复，非静默修复（记录于此）。

**src/domain/recurringEvents.js**（新增，REQ-002）
周期事件（每天/每周固定星期几可多选/每月固定日期）数据模型 +
"创建时一次性物化未来实例"策略：计算出的每个发生日期直接写入
`dayTimelines` 里一个 `source:'manual'` 的 block（带 `recurringId`），
复用 `dayPlanner.js` 已有的"保留 manual 块、当作已占用区间避让"逻辑，
不需要改动 `dayPlanner.js`。设了 `MAX_HORIZON_DAYS=366`/
`MAX_INSTANCES=200` 安全上限（工具是"年度"规划工具，一年足够，避免
localStorage 无限增长）。

**src/ui/eventModal.js**（新增，REQ-002）
点击建事件/编辑事件的弹层表单，支持在创建时勾选周期事件并配置重复
规则与结束条件（永不/到某天/重复N次）；编辑模式下可"删除此次"或（若
属于某个周期系列）"删除整个系列"。沿用 `settingsPanel.js` 等已验证过的
"模块级局部草稿 + 显式提交"模式，避免整树重渲染导致输入框失焦。

**src/ui/dayTimeline.js**（REQ-002）
头部新增"+ 添加事件"按钮；网格空白处点击、已有（非 Google）块点击分别
打开创建/编辑弹层；周期事件生成的块显示 🔁 标记。

**src/ui/monthBoard.js**（新增，REQ-002）
月历卡片视图：42 格网格（`utils/dateUtils.getMonthGridDates` 新增函数
产出，周一起始，补齐月首/月末），每格用类型圆点展示当天事件数量，点击
跳转日视图。`utils/dateUtils.js` 新增 `getMonthStart`/`addMonths`/
`getMonthGridDates` 三个函数支撑。

**验证**（REQ-002）
按 AGENTS.md P2-2，未代为执行 `node server.js`；用
`node --input-type=module --check` 对全部 30 个 `.js` 文件重新做了语法
校验（全部通过），人工核对了新增模块与既有模块（尤其 `dayPlanner.js`
对 `source:'manual'` 块的既有处理逻辑是否真的不需要改、`renderApp.js`
的 uiState/navigate 契约在新增 `modal`/`selectedMonth` 后各面板调用是否
一致）之间的接口对应关系。

---

**REQ-003：UI 层迁移到 Vue 3 + Vite + Naive UI**

用户反馈原生 JS 手写 DOM 全量重渲染架构（`store.setState` 就整树
`clear()` 重建，见 REQ-002 changelog）不够流畅，明确同意引入前端框架；
追问 UI 组件库选择后确认用 Naive UI。架构与取舍见 2026-07-21 会话确认
的 plan，摘要如下。

**src/state/store.js**（重写，接口不变）
用 Vue `reactive()` + `watch(...,{deep:true})` 替代手写的订阅/通知模型；
`getState`/`setState` 签名不变，`domain/*.js`、`calendar/*.js` 零改动
即可继续工作。`saveState` 改为 150ms 防抖，顺带解决了 REQ-002 时期就
存在的一个性能问题：生成周计划时循环调用 `markScheduled` 会连续触发
多次 `setState`，旧版每次都整树重渲染 + 整个 state 序列化写
localStorage；现在 Vue 的响应式调度会把同步任务里的多次写入合并成一次
渲染，防抖也把多次 `saveState` 合并成一次写入，不需要改
`weekBoard.js`/`WeekBoard.vue` 的循环逻辑本身。

**src/ui/*.js（10 个文件，删除）→ src/components/*.vue + src/App.vue（新增）**
`renderApp.js` → `App.vue`：`<n-config-provider>`（明暗主题，
`theme-overrides` 对齐 `--accent-strong`）+ `<n-message-provider>` 包裹，
`uiState` 用 `reactive()`，`<component :is>` 按 `activeView` 切视图。
其余 9 个文件按旧文件名一一对应改写成组件（详见
`docs/MODULES.md`），核心调度/日历渲染逻辑照搬，只是从"手动拼 DOM
节点"改成"模板 + 响应式数据"。`dragDrop.js` 拆掉，拖拽移动改模板原生
事件（`@dragstart`/`@dragover.prevent`/`@drop`），拖拽悬停高亮
（`.drop-target`）用组件内一个 `ref` 手动维护，是本次迁移里为数不多的
"补回而非照搬"的地方——旧版这个视觉反馈是 `dragDrop.js` 直接操作
classList 实现的，改成模板事件后需要显式加回来，否则会是一个静默的
体验倒退。拉伸交互整合进 `DayTimeline.vue` 内部，仍然是"拖拽中直接改
`el.style`、`mouseup` 才提交 store"的写法（不经 Vue 响应式，避免每像素
一次组件更新）。`toast.js` 整体删除，改用 Naive UI 的 `useMessage()`。

`ui/activityCard.js` 里的纯配色数据 `CATEGORY_COLORS`/`BLOCK_TYPE_COLORS`
拆到新增的 `src/constants/colors.js`，供 `BlockCard.vue`/
`ActivityCard.vue`/`DayTimeline.vue`/`MonthBoard.vue` 共用。

各表单组件（`ActivityLibraryPanel.vue`/`SettingsPanel.vue`/
`GoogleSyncPanel.vue`/`EventModal.vue`）改用组件内 `reactive` 草稿 +
Naive UI 表单控件（`n-input`/`n-select`/`n-input-number`/
`n-date-picker`/`n-time-picker`/`n-checkbox(-group)`/`n-radio-group`）+
`v-model`，去掉了旧版因为"整树重渲染会致输入框失焦"而不得不用的"模块级
草稿变量 + 手动 onInput 赋值"变通写法——`v-model` 天然不会因为同组件
内部状态变化而销毁重建输入框，这个问题在 Vue 组件模型下根本不存在。
`EventModal.vue` 同理，还额外去掉了旧版手动比对"modal 身份决定要不要
重置草稿"的逻辑，因为组件现在由 `App.vue` 用 `v-if="uiState.modal"`
控制挂载/卸载，每次打开新弹层都是全新的组件实例，草稿天然不会串。

**server.js（删除）+ package.json / vite.config.js（新增）+ index.html（改写）**
Vite 自带的 `npm run dev`/`build`/`preview` 取代手写的零依赖静态服务器；
`index.html` 改为 Vite 入口约定（`/src/main.js`），CSS 改由 `main.js`
用 `import` 引入而不是 `<link>` 标签，GIS/gapi 两个外部 `<script>` 标签
保留不变。这是用户本轮明确接受的"从零构建换成构建工具链"的代价，README
的运行方式一并更新。

**css/components.css**
按钮/徽章/表单输入控件相关样式（`.btn*`/`.badge*`/`.input*`/
`.checkbox-inline`/`.toast*`/`.modal-overlay`/`.modal-box`/
`.recurrence-fields`）删除，改由 Naive UI 组件自带样式覆盖；日历核心 UI
的自定义样式（周视图卡片列/日时间轴网格/月历网格/活动卡片等，Naive UI
没有对应现成组件）保留。顺带删除了一条从未被任何 JS 触发过的死代码
`.block-card.dragging`（旧版设计但实际没有代码调用 `classList.add`）。

**验证**（REQ-003）
按 AGENTS.md P2-2，未代为执行 `npm install`/`npm run dev`/`npm run
build`。`.vue` 单文件组件没有等价于 `node --check` 的免构建语法校验
手段，只做了人工逐文件核对：`<script setup>` 里的 import/export 是否
和目标模块的实际导出一一对应、`defineProps`/`defineEmits` 在父子组件间
的名字是否匹配、Naive UI 组件名和 API（`v-model:value` 等）是否是文档
里实际存在的用法。**这次迁移的验证确信度低于此前的纯 JS 版本**，需要
用户本地 `npm install && npm run dev` 后把控制台报错反馈回来，可能需要
1-2 轮修正。

---

## 2026-07-20

**docs/**（REQ-000）
新建 `AGENTS.md`（原文写入）、`REQUESTS.md`、`MODULES.md`、`KNOWLEDGE.md`、
`CHANGELOG.md`。项目文件夹名 `LifeSpark`、运行方式（ES Modules + 本地零
依赖静态服务器）已与用户在 plan 阶段确认。

**server.js / index.html**（REQ-001）
新增零依赖 Node 静态服务器（仅用内置 `http`/`fs`/`path`），提供 http:// 源
以支持原生 ES Modules 与 Google OAuth（两者都不支持 `file://` 源）。
`index.html` 搭建深色 app shell，引入 GIS 与 gapi 两个 Google 官方脚本
（async，加载失败不影响本地排程功能）。

**src/utils/**（REQ-001）
`dateUtils.js` 提供 ISO 周/日期/小时的纯函数工具；`id.js` 提供简单唯一
id 生成；`random.js` 提供加权随机抽取（约束随机的核心）；`dom.js` 提供
无框架 DOM 创建/事件绑定小工具（整个 UI 层都基于它手写渲染，不用任何
模板引擎）。

**src/state/**（REQ-001）
`persistence.js` 定义 localStorage schema（key `lifespark:v1`）、默认
设置（阶段周数、类别配额、工作时间、冷却周期）与 12 条种子活动数据；
`store.js` 提供内存状态 + 订阅通知 + 自动持久化的最简 store。

**src/domain/**（REQ-001）
实现调度算法核心：`yearPhases.js`（四阶段日期计算）、`activityPool.js`
（活动 CRUD）、`noveltyEngine.js`（新鲜感评分，按阶段调整类别权重实现
"探索期偏新体验、筛选期偏认可内容、进阶期深化兴趣、记忆期偏重温"）、
`scheduler.js`（阶段配额 + 加权随机 + 冷却期防重复，生成周计划）、
`dayPlanner.js`（把周计划 + 固定工作块 + Google 忙碌块编排为每日小时级
时间块，含区间减法/时段偏好匹配）、`feedbackAdjuster.js`（用户评价通过
指数滑动平均调整活动权重，实现动态调整，避免单次评价过度摆动）。
活动数据结构新增 `blockType` 字段（区别于驱动生成算法的 `category`），
决定该活动落在时间轴的哪一类小时块，为增量设计决策（不算破坏性变更）。

**src/calendar/**（REQ-001）
`googleAuthClient.js` 封装 GIS token client（access token 仅存内存，不
落 localStorage）；`googleCalendarService.js` 封装 gapi.client 对
Calendar API v3 的读取/写入，写入时打 `extendedProperties` 标记避免
重复同步；`conflictMapper.js` 把 Google 事件转换成 dayPlanner 可用的
占用区间（跳过全天事件，跨天事件按天切分）；新增 `sessionState.js`
保存登录状态和忙碌时段缓存（会话内存态，未在最初 plan 文件列表中列出，
但仍在 `calendar/` 模块边界内，属于实现过程中的合理拆分）。

**src/ui/**（REQ-001）
`renderApp.js` 作为顶层渲染入口，采用"store 变化 → 全量重渲染"的简单
模型（应用规模小，不需要虚拟 DOM diff）；`sidebar.js` 渲染四阶段进度条
+ 导航；`weekBoard.js` 实现 Notion 风格周视图，「生成本周计划」按钮串联
`scheduler` + `dayPlanner`，卡片支持跨天原生拖拽；`dayTimeline.js` 实现
小时级竖向时间轴，支持拖拽移动、拖拽拉伸时长、活动评价打分、Google 导入
事件只读展示；`dragDrop.js` 封装原生 HTML5 Drag & Drop 及自制的纵向拉伸
交互；`activityCard.js` / `activityLibraryPanel.js` / `settingsPanel.js`
/ `googleSyncPanel.js` / `toast.js` 分别实现卡片渲染、活动库管理、设置
表单、Google 登录与同步面板、轻量通知。为避免"整树重渲染导致输入框失焦"
这个无框架方案的典型坑，多字段表单（设置面板、活动增改表单、Client ID
输入）统一采用「模块级局部草稿状态 + 显式保存按钮」而不是逐字符提交到
全局 store。

**css/**（REQ-001）
深色主题 + Notion 卡片 + Google Calendar 时间轴风格的样式，拆分为
variables/base/layout/components/timeline 五个文件。

**验证**（REQ-001）
按 AGENTS.md P2-2（不代为执行项目启动命令），未实际运行 `node server.js`；
已用 `node --input-type=module --check` 对全部 28 个 `.js` 文件做语法
校验（全部通过），并人工核对了模块间 import/export 是否一一对应、核心
调度算法的区间计算与阶段映射逻辑、CSS 类名与 JS 引用是否一致。浏览器内
的实际交互验证需要用户按 README 步骤本地运行后确认。
