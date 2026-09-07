<p align="center"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License: Apache-2.0"></p>

<p align="center"><a href="README.md">简体中文</a> · <a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a></p>

# 🌱 Planto

*种下计划，让时间管理它的成长。*

**写给"做计划总是低效率"的人的日历化计划执行工具。**

把目标拆成一串**必须按顺序推进**的关键事件，做完一个才解锁下一个；每完成一段
时间就实时拿到奖励点数，攒够了去兑换自己定的奖励。用"框架 + 即时反馈"取代
"一堆待办事项 + 三天热度"，特别适合不想被死板计划束缚、但又需要一点推力的人。



## ✨ 核心功能

- 🗓️ **日程管理** —— 日 / 周 / 月 / 年视图，支持拖拽、周期事件、重叠事件自动分栏
- 📋 **计划**：把目标拆成有先后顺序的关键事件，必须按顺序解锁完成，一次只推进一件事
- 🎯 **兴趣活动库**：手动维护的个人参考资料（链接/图片/笔记），供你自己挑选安排，不会自动填进日程
- 🏆 **奖励点数**：完成时间块实时结算点数，攒够兑换自定义奖励清单
- 🔁 **每周计划自动生成**（可选）：四阶段年度节奏 + 智能调度
- 🔗 **Google Calendar 联动**（可选）：读取忙碌时段、同步计划回日历
- 🌍 **中 / 英 / 日 三语言**



## 🔒 数据与隐私

- 本地优先：数据存在浏览器 OPFS 里的一份 SQLite 文件，不需要账号、不需要后端
- 支持一键导出 / 导入 JSON 备份
- 清除浏览器数据会导致本地记录全部丢失，请先导出备份；换设备需手动导入迁移
- 唯一联网的地方是可选的 Google Calendar 联动，不开启不会有任何网络请求



## 📸 界面预览

**日历页**：以周为单位排布每小时的日程，早起洗漱、通勤健身这类每天都要做的事设成周期事件后一次配置、自动重复出现，不用每周手动重排；侧边栏常驻年度进度条，背景图和主题色都能自定义。

![日历页](img/image-20260907163058452.png)

**计划页**：一份计划下挂任意数量的关键事件，按顺序逐个解锁完成，页面上直接显示"N / M 已完成"的进度；关键事件可以随时增删改，在日历上新建事件时能直接从某个计划里选一条关键事件填进去，不用来回切页面对照。

![计划页](img/image-20260907163143697.png)

**奖励页**：日程里的时间块完成后自动结算点数（平日/周末费率在设置里分别调），自己列一张心愿单——从一顶球鞋到一趟旅行都行——每项还差多少点数会实时显示，攒够了当场兑换，把"用什么犒赏自己"变成一件看得见进度的事。

![奖励页](img/image-20260907163201268.png)

**设置页**：中 / 英 / 日界面语言一键切换；地区只影响日历上的节假日标注（不影响排程逻辑）；点数换算比率、字体、主题强调色、背景图（支持本地文件）都在这一页统一管理。

![设置页](img/image-20260907163405936.png)

在线体验：[yiran201.github.io/Planto](https://yiran201.github.io/Planto/) ——
数据完全存在你本地浏览器里，不会上传到任何服务器，不用担心泄露；日常重度使用还是建议按 [`DEPLOYMENT.md`](DEPLOYMENT.md) 本地部署。

项目目前处于第一轮发布阶段，遇到问题欢迎 DM 联系我。



## 🛠️ 技术栈

[Vue 3](https://vuejs.org) + [Vite](https://vitejs.dev) · [Naive UI](https://www.naiveui.com) ·
[vue-i18n](https://vue-i18n.intlify.dev) · [sqlite-wasm](https://github.com/sqlite/sqlite-wasm)（浏览器内 SQLite / OPFS，无后端）



## 🚀 快速开始

```bash
git clone https://github.com/yiran201/Planto.git
cd Planto
npm install
npm run dev      # 本地开发，固定 http://localhost:6060
npm run build    # 生产构建，产物在 dist/
```

Windows 双击 [`start-planto.bat`](start-planto.bat)，macOS / Linux 执行
`chmod +x start-planto.sh && ./start-planto.sh`，都会自动装依赖并拉起开发服务器。

> 部署到静态服务器时需要带上 COOP/COEP/CORP 响应头（OPFS 数据库依赖），见[`vite.config.js`](vite.config.js)。[Releases](../../releases) 页面提供了打包好的`dist/` 构建产物，配一个零依赖的 [`serve-dist.cjs`](serve-dist.cjs)（已经带上这几个响应头），下载解压后 `node serve-dist.cjs` 即可直接运行，不需要装 Node 依赖或跑构建。仓库也配了 GitHub Pages 自动部署（`.github/workflows/deploy-pages.yml`）——纯静态托管没法配自定义响应头，改用一个 Service Worker 垫片（`coi-serviceworker.js`）在浏览器端补上这几个头，效果和自己配服务器一致；仓库 Settings → Pages 选一次"GitHub Actions"来源后，推送到 master 分支即可自动构建部署。部署到自己的Nginx/Apache/Tomcat/Node 服务器的具体配置示例见 [`DEPLOYMENT.md`](DEPLOYMENT.md)。



## 🔗 Google Calendar 集成（可选）

1. 在 [Google Cloud Console](https://console.cloud.google.com/) 创建项目并启用 **Calendar API**
2. 创建 OAuth 客户端 ID（Web 应用），授权来源填本地运行地址
3. 把 Client ID 粘进 Planto「设置 → Google 同步」面板，登录即可

应用内该面板有同样的分步引导和一键复制，不用跳出应用查文档。



## 📖 文档

模块结构见 [`docs/MODULES.md`](docs/MODULES.md)；开发规则、任务记录、变更历史见[`docs/AGENTS.md`](docs/AGENTS.md) / [`docs/REQUESTS.md`](docs/REQUESTS.md) /
[`docs/CHANGELOG.md`](docs/CHANGELOG.md)。



## 📄 许可证

[Apache License 2.0](LICENSE)



## 🤝 贡献

欢迎提交 Issue 和 Pull Request，好用的话别忘了点个 ⭐️。
