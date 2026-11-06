@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [JIZURA Desktop] アプリケーションを起動しています...

if not exist "node_modules" (
    echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install に失敗しました。Node.js がインストールされているか確認してください。
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] Electron アプリを起動中 (npm start)...
call npm start
if errorlevel 1 (
    echo [ERROR] アプリケーションの終了時にエラーが発生しました。
    pause
    exit /b %errorlevel%
)
