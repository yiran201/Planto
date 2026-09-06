import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// REQ-024：数据层从 localStorage 换成浏览器内的文件型数据库
// （@sqlite.org/sqlite-wasm，OPFS 持久化，见 src/state/db.js）。这个包
// 官方文档明确要求两件事：① 开发/预览服务器要带上 COOP/COEP 这两个
// 响应头（OPFS 的同步文件访问 API 依赖跨源隔离环境，浏览器只有在页面
// 处于"跨源隔离"状态时才会开放这个能力）；② 把这个包排除在 Vite 的预构建
// （esbuild optimizeDeps）之外，因为它内部动态加载自己的 .wasm/worker
// 文件，预构建会打乱这些文件的相对路径引用，导致加载失败。生产环境
// （`vite build` 产物）部署到静态服务器时，同样需要服务器给这两个响应
// 头，不然 OPFS 相关代码会在运行时报错——这一点写进了 README 的部署
// 说明里。
// REQ-063：port 固定 + strictPort:true——Google OAuth 的「已获授权的
// JavaScript 来源」要求逐字符匹配当前页面的源（协议+域名+端口），原来
// Vite 默认端口 5173 被占用时会静默换成 5174/5175 等，导致 Google 登录
// 报 401 invalid_client（"no registered origin"）。strictPort:true 让
// 端口被占用时直接报错退出，不再静默换端口。dev/preview 两个服务器
// 统一用同一个端口（不会同时跑），保持只需要登记一个来源。
// REQ-064：加 host:true，让 Vite 同时监听本机所有 IPv4/IPv6 地址——
// 不显式指定 host 时，Node 在部分环境下只绑定 IPv6 loopback（[::1]），
// 127.0.0.1 连不上，"localhost" 能不能访问就取决于浏览器/系统当时解析
// 成哪个地址族，不稳定。代价是开发服务器也能从局域网内其它设备访问到
// （这个纯前端 SPA 的真实数据只存在各自浏览器的 OPFS 里，不经过开发
// 服务器，本地单人开发场景可以接受）。
// REQ-065：端口从 6000 改成 6060——6000 是 Chrome/Firefox 等主流浏览器
// 内置的"不安全端口"黑名单成员之一（历史上是 X11 window server 的
// 保留端口），浏览器会直接拒绝对这个端口发起 HTTP 请求，报
// ERR_UNSAFE_PORT，服务器怎么配置都没用，必须换一个不在黑名单里的
// 端口。中间试过 8080，但实测发现本机当时已经有另一个无关的 node 进程
// 占着 8080（跟本项目无关，是这台开发机上别的项目留下的），
// strictPort:true 会导致启动直接失败；最终选定 6060——不在任何主流
// 浏览器黑名单里，实测确认这台机器上当时空闲，数字上也贴近原来
// 5173/6000 这条选择路径，比较好记。
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 6060,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    host: true,
    port: 6060,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
});
