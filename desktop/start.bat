@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [JIZURA Desktop] アプリケーションを起動しています...

if exist "node_modules\electron" goto :run_app

echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
call npm install
if errorlevel 1 goto :install_error

:run_app
echo [INFO] Electron アプリを起動中 (npm start)...
call npm start
if errorlevel 1 goto :start_error
exit /b 0

:install_error
echo.
echo [ERROR] npm install に失敗しました。Node.js がインストールされているか確認してください。
pause
exit /b 1

:start_error
echo.
echo [ERROR] アプリケーションの終了時にエラーが発生しました。
pause
exit /b 1
