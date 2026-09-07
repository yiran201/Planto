# 部署指南

## 核心前提：为什么不能直接当普通静态网站部署

本地数据库（`@sqlite.org/sqlite-wasm`，OPFS 持久化，见 `src/state/db.js`）
只能在浏览器处于"跨源隔离"（cross-origin isolated）状态下工作。要达成这个
状态，**服务器必须在每一个响应上都带上以下三个 HTTP 响应头**：

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

前两个头缺一个，页面能打开但整个应用会卡在加载动画（`window.
crossOriginIsolated` 是 `false`）；第三个头缺失，页面能进去，但 OPFS
异步代理这个嵌套 Worker 会被浏览器拦截（`net::ERR_BLOCKED_BY_RESPONSE`），
数据库同样无法初始化——控制台会看到 "Error initializing OPFS asyncer"。
两种情况下界面本身通常还是能正常渲染，容易被误以为"看起来没问题"，实际上
数据完全没有落盘，刷新页面就会丢失（这个项目 REQ-090 就是一次这样的
真实事故，见 `docs/REQUESTS.md`）。

**任何一种部署方式，判断标准都是同一句话：这台服务器有没有在响应里带上
这三个头。** 下面按不同部署目标分别说明怎么配。

---

## 方式一：本地测试构建产物

不部署到任何地方，只是想在自己电脑上验证 `npm run build` 出来的东西
对不对：

```bash
npm run build        # 生成 dist/
npm run preview       # 或者：npm run serve:dist
```

- `npm run preview`：Vite 自带命令，`vite.config.js` 里已经配好了这三个
  头（跟 `npm run dev` 用同一份 `headers` 配置）。需要项目装好
  `node_modules`。
- `npm run serve:dist`：跑 `serve-dist.cjs`，零依赖，同样带这三个头。
  脱离项目单独解压一份 `dist/` + `serve-dist.cjs` 也能跑（详见下面
  "GitHub Release"一节），本地测试两者选一个都行。

访问 `http://localhost:6060/`，新建点内容、刷新页面确认还在，就算测试
通过。

---

## 方式二：GitHub Pages（当前项目实际采用的线上部署方式）

GitHub Pages 是纯静态托管，**不支持配置任何自定义响应头**——这是平台
本身的限制，没有配置项可以绕开。这个项目的解法是用一个 Service Worker
在浏览器端"伪造"这三个头（`public/coi-serviceworker.js`，原理见
https://github.com/gzuidhof/coi-serviceworker ），已经接好了自动部署：

1. 仓库 Settings → Pages → Source 选 **"GitHub Actions"**（一次性设置，
   已经完成的话可以跳过）
2. push 代码到 `master` 分支，`.github/workflows/deploy-pages.yml` 会
   自动触发：`npm ci` → `npm run build --base=/Planto/` → 部署到 Pages
3. 几分钟后访问 `https://yiran201.github.io/Planto/`

不需要手动做任何响应头配置——Service Worker 那部分已经写好在代码里了。

---

## 方式三：GitHub Release（下载到本地自己跑）

不是一个"网址"，是仓库 Releases 页面上一个可下载的 zip 包，别人下载后
在自己电脑上运行：

1. `npm run build` 生成 `dist/`
2. 把 `dist/`、`serve-dist.cjs`、一份使用说明打包成 zip
3. 仓库页面 → Releases → Create a new release → 填版本号 → 把 zip
   拖进"Attach binaries"→ Publish

`serve-dist.cjs` 已经带好了这三个头，下载的人解压后 `node
serve-dist.cjs` 就能直接用，不需要额外配置。

---

## 方式四：自己的服务器（Tomcat / Nginx / Apache / Node 等）

**通用思路**：`npm run build` 生成 `dist/`，把这个文件夹的内容部署到
服务器上，然后让服务器给所有响应都带上前面那三个头。具体配置方式因
服务器而异：

### Nginx

```nginx
location / {
  root /path/to/dist;
  try_files $uri $uri/ /index.html;
  add_header Cross-Origin-Opener-Policy "same-origin" always;
  add_header Cross-Origin-Embedder-Policy "require-corp" always;
  add_header Cross-Origin-Resource-Policy "same-origin" always;
}
```

### Apache（`.htaccess` 或虚拟主机配置里）

```apache
<IfModule mod_headers.c>
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Cross-Origin-Embedder-Policy "require-corp"
  Header always set Cross-Origin-Resource-Policy "same-origin"
</IfModule>
```

### Tomcat（`web.xml` 加一个 Filter）

```xml
<filter>
  <filter-name>CoopCoepFilter</filter-name>
  <filter-class>org.apache.catalina.filters.HttpHeaderSecurityFilter</filter-class>
</filter>
```

Tomcat 内置的 `HttpHeaderSecurityFilter` 不直接支持这三个非标准头，
更简单的办法是自己写一个几行的 `Filter`（`javax.servlet.Filter`），在
`doFilter` 里对 `HttpServletResponse` 调用三次 `setHeader(...)`，然后在
`web.xml` 里注册这个 Filter、映射到 `/*`。需要具体代码的话告诉我，我可以
现写一份。

### Node.js / Express

```js
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
});
app.use(express.static('dist'));
```

### `npx serve`

在 `dist/` 目录里放一个 `serve.json`：

```json
{
  "headers": [
    {
      "source": "**/*",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

---

## 部署前自查清单

不管用上面哪种方式，部署完之后用浏览器打开、按 F12 开开发者工具，在
Console 里执行：

```js
window.crossOriginIsolated
```

返回 `true` 才说明响应头配置对了。如果是 `false`，或者控制台能看到
"Error initializing OPFS asyncer"/"Failed to execute 'compile' on
'WebAssembly'"，说明响应头没配对，回去检查服务器配置。

也可以直接测功能：新建一条活动/计划，**整页刷新**（不是页面内局部
操作），确认数据还在。
