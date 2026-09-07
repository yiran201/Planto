#!/usr/bin/env node
// Zero-dependency static file server for the built dist/ output (REQ-087).
//
// This app's local database (@sqlite.org/sqlite-wasm, OPFS-backed, see
// src/state/db.js) only works inside a cross-origin-isolated page, which
// requires the server to send Cross-Origin-Opener-Policy/
// Cross-Origin-Embedder-Policy/Cross-Origin-Resource-Policy response
// headers (same requirement vite.config.js already sets for the
// dev/preview servers - REQ-090 added the third one after discovering
// COEP:require-corp blocks every subresource, including the nested
// OPFS async-proxy worker, that doesn't carry it). Generic static file
// servers (npx serve, python -m http.server, a plain GitHub Pages
// deploy, opening index.html via file://, ...) do not send these
// headers, so the database silently fails to initialize. This script
// exists so a downloaded dist/ build (e.g. the zip attached to a
// GitHub Release) can be run with `node serve-dist.js` and just work,
// without requiring Vite or any dependency to be installed.
//
// Written as plain CommonJS (require, not import) and named .cjs (not
// .js) on purpose - two separate encoding problems, both confirmed by
// actually running the file rather than assuming: (1) extracted
// standalone in a release zip with no package.json nearby, a plain .js
// file using `import` fails with "Cannot use import statement outside a
// module"; (2) run from inside this repo, a plain .js file using
// `require` fails instead, because this repo's own package.json says
// "type": "module" and Node treats every .js file under it as ESM
// regardless of what syntax is inside. The .cjs extension is the one
// choice Node always treats as CommonJS no matter which package.json
// (if any) is nearby, so this script behaves identically in both
// contexts: extracted alone in a release zip, or run in place via
// `npm run serve:dist`.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, 'dist');
// REQ-088：默认端口从 4173（Vite preview 的默认值）改成 6060，跟
// vite.config.js 里 dev/preview 固定用的端口保持一致——用户反馈希望
// 两边统一，不用因为跑的是哪个服务器就记两个不同的地址。
const PORT = Number(process.env.PORT) || 6060;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!fs.existsSync(ROOT)) {
  console.error(`dist/ not found next to this script (expected at ${ROOT}).`);
  console.error('Run `npm run build` first, or make sure dist/ was extracted alongside serve-dist.js.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

  // Keep requests confined to dist/ - reject anything that escapes it
  // (e.g. "/../serve-dist.js") instead of resolving outside the root.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      // REQ-090：COEP:require-corp 要求每个子资源都带这个头，不只是
      // 顶层页面——sqlite-wasm 的 OPFS 异步代理是嵌套 Worker，漏了这个
      // 头会被浏览器直接拦截（ERR_BLOCKED_BY_RESPONSE），OPFS 初始化
      // 静默失败，数据库完全不落盘。
      'Cross-Origin-Resource-Policy': 'same-origin',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Planto is running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop.');
});
