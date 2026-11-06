@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [JIZURA Desktop] 配布用インストーラー（Setup.exe）を生成します...

if exist "node_modules\electron-builder" goto :build_dist

echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
call npm install
if errorlevel 1 goto :install_error

:build_dist
echo [INFO] インストーラー作成を実行中 (npm run dist)...
call npm run dist
if errorlevel 1 goto :dist_error

echo.
echo [SUCCESS] インストーラーが desktop\dist 配下に生成されました。
if exist "dist" (
  explorer dist
)
pause
exit /b 0

:install_error
echo.
echo [ERROR] npm install に失敗しました。
pause
exit /b 1

:dist_error
echo.
echo [ERROR] インストーラーの生成に失敗しました。
pause
exit /b 1
