# 快速迁移到 GitHub

## 🚀 一键迁移命令

### Windows 用户
```cmd
# 替换 YOUR_GITHUB_USERNAME 为您的 GitHub 用户名
migrate-to-github.bat YOUR_GITHUB_USERNAME
```

### Linux/macOS 用户
```bash
# 给脚本执行权限
chmod +x migrate-to-github.sh

# 替换 YOUR_GITHUB_USERNAME 为您的 GitHub 用户名
./migrate-to-github.sh YOUR_GITHUB_USERNAME
```

## 📋 迁移前检查清单

- [ ] 已在 GitHub 上创建仓库 `xchat-tg-chat`
- [ ] 本地代码已提交（无未提交的更改）
- [ ] 准备好 GitHub 用户名

## 🔧 手动迁移命令

如果您不想使用脚本，可以手动执行以下命令：

```bash
# 1. 备份当前远程仓库
git remote rename origin gitee-backup

# 2. 添加 GitHub 远程仓库
git remote add origin https://github.com/YOUR_USERNAME/xchat-tg-chat.git

# 3. 推送代码
git push -u origin main
git push --all origin
git push --tags origin
```

## ⚡ 验证迁移

```bash
# 检查远程仓库
git remote -v

# 应该显示：
# origin  https://github.com/YOUR_USERNAME/xchat-tg-chat.git (fetch)
# origin  https://github.com/YOUR_USERNAME/xchat-tg-chat.git (push)
```

## 🆘 如果出现问题

1. **推送失败**: 确保已在 GitHub 上创建仓库
2. **认证失败**: 配置 SSH 密钥或使用 Personal Access Token
3. **分支问题**: 检查当前分支名称（main/master）

## 📞 需要帮助？

查看详细指南：`GITHUB_MIGRATION_GUIDE.md` 