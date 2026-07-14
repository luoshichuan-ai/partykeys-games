#!/bin/zsh
cd "$(dirname "$0")"
PORT=5173
URL="http://localhost:${PORT}/"

echo "正在启动《疯狂追追追》..."
echo "如果浏览器没有自动打开，请手动访问：${URL}"

python3 -m http.server "${PORT}" >/tmp/crazy-chase-server.log 2>&1 &
SERVER_PID=$!

sleep 1
open "${URL}"

echo ""
echo "游戏已启动：${URL}"
echo "关闭这个窗口会停止本地服务。"
echo ""

wait "${SERVER_PID}"
