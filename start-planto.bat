@echo off
REM 一键启动脚本（REQ-046，REQ-055 修复编码问题；REQ-084 项目改名同步改成 start-planto.bat）：桌面快捷方式指向这个
REM 文件，双击后自动切到项目目录、首次运行时自动装依赖、启动 Vite 开发
REM 服务器并用 --open 让浏览器自动打开。REQ-063 起端口在 vite.config.js
REM 里固定成 6060（strictPort:true，Google OAuth 授权来源要求端口不能
REM 漂移），端口被占用时 npm run dev 会直接报错退出，不会像以前那样
REM 静默换成 5174 等其它端口。
REM
REM 这个文件必须保存成 ANSI/GBK 编码，不能是 UTF-8：中文 Windows 的
REM cmd.exe 按系统默认代码页（GBK/936）逐字节解析 .bat 文件，UTF-8 的
REM 多字节中文和 UTF-8 混用在按 GBK 做双字节配对时会错位，偶然拼出
REM ASCII 范围的字节被当成命令分隔符，导致脚本从注释或中文提示语句
REM 中间断开，报"不是内部或外部命令"。用 VS Code /记事本重新编辑这个
REM 文件时另存为「ANSI」，不要选「UTF-8」。
title Planto
cd /d "%~dp0"

if not exist "node_modules" (
  echo 首次运行，正在安装依赖，请稍候...
  call npm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查上面的报错信息。
    pause
    exit /b 1
  )
)

call npm run dev -- --open

echo.
echo 开发服务器已停止。
pause