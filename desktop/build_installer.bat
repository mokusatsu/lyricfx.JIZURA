@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "TARGET_BACKEND=%~1"
if "%TARGET_BACKEND%"=="" set "TARGET_BACKEND=openvino"

echo [JIZURA Desktop] 配布用インストーラー（Setup.exe）を生成します...
echo [JIZURA Desktop] 対象バックエンド: %TARGET_BACKEND%
echo   (変更例: build_installer.bat directml / cuda / cpu)
echo.

if exist "node_modules\electron-builder" goto :build_worker

echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
call npm install
if errorlevel 1 goto :install_error

:build_worker
echo [INFO] ネイティブワーカーをビルド中 (npm run build:worker -- --backend=%TARGET_BACKEND% --install)...
call npm run build:worker -- --backend=%TARGET_BACKEND% --install
if errorlevel 1 goto :worker_error

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

:worker_error
echo.
echo [ERROR] ネイティブワーカーのビルドに失敗しました。
pause
exit /b 1

:dist_error
echo.
echo [ERROR] インストーラーの生成に失敗しました。
pause
exit /b 1
