#!/usr/bin/env bash
# 一键启动脚本（REQ-056，start-lifespark.bat 的 Linux/macOS 对应版本；
# REQ-084 项目改名，文件同步改名为 start-planto.sh）：
# cd 到脚本自身所在目录 -> 首次运行自动 npm install -> 启动 Vite 开发
# 服务器并用 --open 让浏览器自动打开。REQ-063 起端口在 vite.config.js
# 里固定成 6060（strictPort:true，Google OAuth 授权来源要求端口不能
# 漂移），端口被占用时 `npm run dev` 会直接报错退出，不会像以前那样
# 静默换成 5174 等其它端口。首次使用前需要 `chmod +x
# start-planto.sh` 加执行权限（git 是否保留这个权限位取决于提交时
# 的文件模式，克隆下来发现不能直接执行是正常情况，见 README）。
set -euo pipefail

# 用 BASH_SOURCE 而不是 $0，双击/软链接/被其它脚本 source 时也能正确
# 定位到脚本真实所在目录，跟 .bat 版本里的 "%~dp0" 是同一个目的。
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "node_modules" ]; then
  echo "首次运行，正在安装依赖，请稍候..."
  if ! npm install; then
    echo "依赖安装失败，请检查上面的报错信息。"
    exit 1
  fi
fi

npm run dev -- --open

echo
echo "开发服务器已停止。"
