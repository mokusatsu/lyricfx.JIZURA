@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "TARGET_BACKEND=%~1"
if "%TARGET_BACKEND%"=="" set "TARGET_BACKEND=openvino"

echo [JIZURA Desktop] 配布用インストーラー（Setup.exe）を生成します...
echo [JIZURA Desktop] 対象バックエンド: %TARGET_BACKEND%
echo   (変更例: build_installer.bat directml / cuda / cpu)
echo.

if not exist "node_modules\electron-builder" (
  echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
  call npm install
  if errorlevel 1 goto :install_error
)

echo [INFO] クリーンビルドパイプラインを実行中...
call node scripts\build-all.cjs --backend=%TARGET_BACKEND% --dist
if errorlevel 1 goto :build_error

echo.
echo [SUCCESS] 配布パッケージが desktop\dist 配下に生成されました。
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

:build_error
echo.
echo [ERROR] ビルドパイプラインでエラーが発生しました。
pause
exit /b 1
