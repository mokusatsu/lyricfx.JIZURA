@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [JIZURA Desktop] 展開版パッケージ（.exe）をビルドして起動します...

if not exist "node_modules" (
    echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install に失敗しました。
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] パッケージングを実行中 (npm run package)...
call npm run package
if errorlevel 1 (
    echo [ERROR] パッケージングに失敗しました。
    pause
    exit /b %errorlevel%
)

if exist "dist\win-unpacked\lyricfx-jizura.exe" (
    echo [INFO] 起動中: dist\win-unpacked\lyricfx-jizura.exe
    start "" "dist\win-unpacked\lyricfx-jizura.exe"
) else (
    echo [ERROR] 実行ファイルが見つかりません: dist\win-unpacked\lyricfx-jizura.exe
    pause
)
