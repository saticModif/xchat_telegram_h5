# GitHub 迁移指南

本指南将帮助您将 Telegram Web 应用项目从 Gitee 迁移到 GitHub。

## 📋 迁移前准备

### 1. 创建 GitHub 账户
- 访问 [GitHub.com](https://github.com) 注册账户
- 配置 SSH 密钥（推荐）或使用 HTTPS 认证

### 2. 在 GitHub 上创建仓库
1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   ```
   Repository name: xchat-tg-chat
   Description: Telegram Web Chat Application
   Visibility: Public 或 Private
   ```
4. **重要**: 不要初始化 README、.gitignore 或 license
5. 点击 "Create repository"

## 🚀 自动迁移（推荐）

### 使用迁移脚本

#### Linux/macOS 用户
```bash
# 给脚本执行权限
chmod +x migrate-to-github.sh

# 运行迁移脚本
./migrate-to-github.sh YOUR_GITHUB_USERNAME
```

#### Windows 用户
```cmd
# 运行迁移脚本
migrate-to-github.bat YOUR_GITHUB_USERNAME
```

## 🔧 手动迁移步骤

### 1. 检查当前状态
```bash
# 查看当前远程仓库
git remote -v

# 检查工作目录状态
git status
```

### 2. 备份当前远程仓库
```bash
# 将原远程仓库重命名为备份
git remote rename origin gitee-backup
```

### 3. 添加 GitHub 远程仓库
```bash
# 添加 GitHub 作为新的 origin
git remote add origin https://github.com/YOUR_USERNAME/xchat-tg-chat.git

# 验证配置
git remote -v
```

### 4. 推送代码到 GitHub
```bash
# 推送当前分支
git push -u origin main

# 推送所有分支
git push --all origin

# 推送所有标签
git push --tags origin
```

## ⚙️ GitHub Actions 配置

### 1. 设置 Secrets

在 GitHub 仓库页面：
1. 进入 `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`
3. 添加以下 Secrets：

#### 必需的 Secrets
```
# Telegram API 配置
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash

# GitHub Token (通常自动提供)
GITHUB_TOKEN=auto_provided
```

#### 可选的 Secrets（用于 Electron 构建）
```
# Apple 签名证书
APPLE_CERTIFICATE_BASE64=your_certificate_base64
APPLE_CERTIFICATE_PASSWORD=your_certificate_password
APPLE_ID=your_apple_id
APPLE_APP_SPECIFIC_PASSWORD=your_app_specific_password

# Windows 签名
SM_HOST=your_signing_manager_host
SM_API_KEY=your_signing_manager_api_key
SM_CLIENT_CERT_FILE_B64=your_client_cert_base64
SM_CLIENT_CERT_PASSWORD=your_client_cert_password
KEYPAIR_ALIAS=your_keypair_alias
```

### 2. 设置 Variables

在 `Settings` → `Secrets and variables` → `Actions` → `Variables` 中添加：

```
NODE_VERSION=20
PUBLISH_REPO=your_username/xchat-tg-chat
BASE_URL=https://your-domain.com
```

## 📝 更新项目文档

### 1. 更新 README.md
- 更新仓库链接
- 更新贡献指南
- 更新部署说明

### 2. 更新 CI/CD 配置
- 检查 `.github/workflows/` 中的工作流配置
- 确保分支名称正确（main/master）
- 验证触发条件

### 3. 更新包管理器配置
```json
// package.json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/xchat-tg-chat.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/xchat-tg-chat/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/xchat-tg-chat#readme"
}
```

## 🔍 验证迁移

### 1. 检查代码完整性
```bash
# 克隆到新目录验证
git clone https://github.com/YOUR_USERNAME/xchat-tg-chat.git test-clone
cd test-clone
npm install
npm run build:production
```

### 2. 测试 GitHub Actions
1. 推送一个测试提交
2. 检查 Actions 页面是否正常运行
3. 验证测试结果

### 3. 检查功能完整性
- 确认所有分支都已推送
- 确认所有标签都已推送
- 确认 Issues 和 Pull Requests 状态

## 🛠️ 故障排除

### 常见问题

#### 1. 推送失败
```bash
# 错误: 远程仓库不存在
# 解决: 确保已在 GitHub 上创建仓库

# 错误: 认证失败
# 解决: 配置 SSH 密钥或使用 Personal Access Token
```

#### 2. GitHub Actions 失败
```bash
# 检查 Secrets 配置
# 检查分支名称是否正确
# 检查工作流文件语法
```

#### 3. 依赖问题
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 恢复原远程仓库
```bash
# 如果需要恢复 Gitee 作为主要远程仓库
git remote remove origin
git remote rename gitee-backup origin
```

## 📊 迁移后检查清单

- [ ] 代码已成功推送到 GitHub
- [ ] 所有分支和标签已推送
- [ ] GitHub Actions 配置完成
- [ ] Secrets 和 Variables 已设置
- [ ] 项目文档已更新
- [ ] 团队成员已通知
- [ ] 功能测试通过
- [ ] CI/CD 流程正常

## 🔄 团队协作更新

### 通知团队成员
1. 发送迁移通知邮件
2. 更新团队文档
3. 提供新的克隆命令

### 更新本地仓库
团队成员需要执行：
```bash
# 方法1: 更新远程仓库地址
git remote set-url origin https://github.com/YOUR_USERNAME/xchat-tg-chat.git

# 方法2: 重新克隆
git clone https://github.com/YOUR_USERNAME/xchat-tg-chat.git
```

## 📞 获取帮助

如果遇到问题：
1. 查看 GitHub 官方文档
2. 检查项目 Issues
3. 联系项目维护者
4. 参考 GitHub 社区支持

## 🎉 迁移完成

恭喜！您的项目已成功迁移到 GitHub。现在您可以享受：
- 更强大的 CI/CD 功能
- 更好的社区协作
- 更丰富的第三方集成
- 更完善的代码审查流程 