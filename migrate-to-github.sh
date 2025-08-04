#!/bin/bash

# GitHub 迁移脚本
# 使用方法: ./migrate-to-github.sh YOUR_GITHUB_USERNAME

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${RED}错误: 请提供 GitHub 用户名${NC}"
    echo "使用方法: $0 YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="xchat-tg-chat"
GITHUB_REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo -e "${BLUE}开始迁移到 GitHub...${NC}"
echo -e "${YELLOW}GitHub 用户名: $GITHUB_USERNAME${NC}"
echo -e "${YELLOW}仓库名称: $REPO_NAME${NC}"
echo ""

# 检查当前 Git 状态
echo -e "${BLUE}1. 检查当前 Git 状态...${NC}"
if ! git status --porcelain | grep -q .; then
    echo -e "${GREEN}✓ 工作目录干净${NC}"
else
    echo -e "${YELLOW}⚠ 工作目录有未提交的更改，请先提交或暂存${NC}"
    git status --short
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查当前远程仓库
echo -e "${BLUE}2. 检查当前远程仓库...${NC}"
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "无远程仓库")
echo -e "${YELLOW}当前远程仓库: $CURRENT_REMOTE${NC}"

# 备份当前远程仓库
if [[ $CURRENT_REMOTE != "无远程仓库" ]]; then
    echo -e "${BLUE}3. 备份当前远程仓库...${NC}"
    git remote rename origin gitee-backup
    echo -e "${GREEN}✓ 已将原远程仓库重命名为 gitee-backup${NC}"
fi

# 添加 GitHub 远程仓库
echo -e "${BLUE}4. 添加 GitHub 远程仓库...${NC}"
git remote add origin "$GITHUB_REPO_URL"
echo -e "${GREEN}✓ 已添加 GitHub 远程仓库${NC}"

# 验证远程仓库
echo -e "${BLUE}5. 验证远程仓库配置...${NC}"
git remote -v

# 推送代码到 GitHub
echo -e "${BLUE}6. 推送代码到 GitHub...${NC}"
echo -e "${YELLOW}注意: 请确保已在 GitHub 上创建了仓库: $GITHUB_REPO_URL${NC}"
read -p "是否继续推送? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}已取消推送${NC}"
    exit 0
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}当前分支: $CURRENT_BRANCH${NC}"

# 推送当前分支
echo -e "${BLUE}推送当前分支 ($CURRENT_BRANCH)...${NC}"
git push -u origin "$CURRENT_BRANCH"

# 推送所有分支
echo -e "${BLUE}推送所有分支...${NC}"
git push --all origin

# 推送所有标签
echo -e "${BLUE}推送所有标签...${NC}"
git push --tags origin

echo ""
echo -e "${GREEN}✓ 迁移完成!${NC}"
echo ""
echo -e "${BLUE}后续步骤:${NC}"
echo "1. 访问 $GITHUB_REPO_URL 确认代码已推送"
echo "2. 在 GitHub 仓库设置中配置 GitHub Actions Secrets"
echo "3. 更新项目文档中的链接"
echo "4. 通知团队成员更新远程仓库地址"
echo ""
echo -e "${YELLOW}如果需要恢复原远程仓库:${NC}"
echo "git remote remove origin"
echo "git remote rename gitee-backup origin" 