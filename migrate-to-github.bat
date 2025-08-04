@echo off
setlocal enabledelayedexpansion

REM GitHub 迁移脚本 (Windows 版本)
REM 使用方法: migrate-to-github.bat YOUR_GITHUB_USERNAME

if "%~1"=="" (
    echo 错误: 请提供 GitHub 用户名
    echo 使用方法: %0 YOUR_GITHUB_USERNAME
    exit /b 1
)

set GITHUB_USERNAME=%~1
set REPO_NAME=xchat-tg-chat
set GITHUB_REPO_URL=https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo 开始迁移到 GitHub...
echo GitHub 用户名: %GITHUB_USERNAME%
echo 仓库名称: %REPO_NAME%
echo.

REM 检查当前 Git 状态
echo 1. 检查当前 Git 状态...
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 工作目录干净
) else (
    echo ⚠ 工作目录有未提交的更改，请先提交或暂存
    git status --short
    set /p CONTINUE="是否继续? (y/N): "
    if /i not "!CONTINUE!"=="y" exit /b 1
)

REM 检查当前远程仓库
echo 2. 检查当前远程仓库...
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set CURRENT_REMOTE=%%i
if "!CURRENT_REMOTE!"=="" set CURRENT_REMOTE=无远程仓库
echo 当前远程仓库: !CURRENT_REMOTE!

REM 备份当前远程仓库
if not "!CURRENT_REMOTE!"=="无远程仓库" (
    echo 3. 备份当前远程仓库...
    git remote rename origin gitee-backup
    echo ✓ 已将原远程仓库重命名为 gitee-backup
)

REM 添加 GitHub 远程仓库
echo 4. 添加 GitHub 远程仓库...
git remote add origin "%GITHUB_REPO_URL%"
echo ✓ 已添加 GitHub 远程仓库

REM 验证远程仓库
echo 5. 验证远程仓库配置...
git remote -v

REM 推送代码到 GitHub
echo 6. 推送代码到 GitHub...
echo 注意: 请确保已在 GitHub 上创建了仓库: %GITHUB_REPO_URL%
set /p PUSH="是否继续推送? (y/N): "
if /i not "!PUSH!"=="y" (
    echo 已取消推送
    exit /b 0
)

REM 获取当前分支
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 当前分支: !CURRENT_BRANCH!

REM 推送当前分支
echo 推送当前分支 (!CURRENT_BRANCH!)...
git push -u origin "!CURRENT_BRANCH!"

REM 推送所有分支
echo 推送所有分支...
git push --all origin

REM 推送所有标签
echo 推送所有标签...
git push --tags origin

echo.
echo ✓ 迁移完成!
echo.
echo 后续步骤:
echo 1. 访问 %GITHUB_REPO_URL% 确认代码已推送
echo 2. 在 GitHub 仓库设置中配置 GitHub Actions Secrets
echo 3. 更新项目文档中的链接
echo 4. 通知团队成员更新远程仓库地址
echo.
echo 如果需要恢复原远程仓库:
echo git remote remove origin
echo git remote rename gitee-backup origin

pause 