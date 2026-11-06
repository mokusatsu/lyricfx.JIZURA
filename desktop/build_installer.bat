@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [JIZURA Desktop] 配布用インストーラー（Setup.exe）を生成します...

if not exist "node_modules" (
    echo [INFO] 初回セットアップ: 依存パッケージをインストール中 (npm install)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install に失敗しました。
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] インストーラー作成を実行中 (npm run dist)...
call npm run dist
if errorlevel 1 (
    echo [ERROR] インストーラーの生成に失敗しました。
    pause
    exit /b %errorlevel%
)

echo.
echo [SUCCESS] インストーラーが desktop\dist 配下に生成されました。
if exist "dist" (
    explorer dist
)
pause
