@echo off
cd /d "%~dp0"
if not exist node_modules\http-proxy-agent (
	echo 正在安装依赖...
	npm install
	if errorlevel 1 pause & exit /b 1
)
node server.js
pause
