@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [JIZURA Desktop] 展開版パッケージ（.exe）をビルドして起動します...

if exist "node_modules\electron-builder" goto :build_pkg

echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
call npm install
if errorlevel 1 goto :install_error

:build_pkg
echo [INFO] パッケージングを実行中 (npm run package)...
call npm run package
if errorlevel 1 goto :pkg_error

if exist "dist\win-unpacked\lyricfx-jizura.exe" (
  echo [INFO] 起動中: dist\win-unpacked\lyricfx-jizura.exe
  start "" "dist\win-unpacked\lyricfx-jizura.exe"
  exit /b 0
) else (
  echo [ERROR] 実行ファイルが見つかりません: dist\win-unpacked\lyricfx-jizura.exe
  pause
  exit /b 1
)

:install_error
echo.
echo [ERROR] npm install に失敗しました。
pause
exit /b 1

:pkg_error
echo.
echo [ERROR] パッケージングに失敗しました。
pause
exit /b 1
