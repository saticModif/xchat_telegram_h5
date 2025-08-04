# 测试指标指南

本项目包含多个GitHub Action工作流，用于全面测试应用的各项指标。

## 工作流概览

### 1. 测试指标检查 (`test-metrics.yml`)
**触发条件**: 
- 推送到 `master` 或 `develop` 分支
- 创建 Pull Request
- 手动触发（可选择测试类型）

**包含的测试**:
- ✅ 代码质量检查 (TypeScript, ESLint, Stylelint)
- ✅ 单元测试 (Jest)
- ✅ 构建测试 (开发和生产环境)
- ✅ 性能测试 (Lighthouse CI)
- ✅ 安全测试 (npm audit, 敏感信息检查)
- ✅ E2E 测试 (Playwright)
- ✅ 浏览器兼容性测试

### 2. 快速指标检查 (`quick-metrics.yml`)
**触发条件**: 
- Pull Request
- 手动触发

**特点**: 快速检查关键指标，适合PR检查
- ✅ TypeScript 类型检查
- ✅ ESLint 代码规范
- ✅ 单元测试
- ✅ 构建测试
- ✅ 安全审计
- ✅ 包大小分析

### 3. 性能监控 (`performance-monitor.yml`)
**触发条件**: 
- 每周一自动运行
- 手动触发（可选择环境）

**功能**:
- 📊 性能审计 (Lighthouse)
- 📦 包大小跟踪
- 🔍 依赖分析
- 📈 趋势报告

## 使用方法

### 手动触发测试

1. **完整测试**:
   ```bash
   # 在 GitHub 仓库页面
   Actions → 测试指标检查 → Run workflow → 选择 "all"
   ```

2. **特定测试**:
   ```bash
   # 只运行代码质量检查
   Actions → 测试指标检查 → Run workflow → 选择 "code-quality"
   
   # 只运行性能测试
   Actions → 测试指标检查 → Run workflow → 选择 "performance"
   
   # 只运行安全测试
   Actions → 测试指标检查 → Run workflow → 选择 "security"
   
   # 只运行 E2E 测试
   Actions → 测试指标检查 → Run workflow → 选择 "e2e"
   ```

3. **快速检查**:
   ```bash
   Actions → 快速指标检查 → Run workflow
   ```

4. **性能监控**:
   ```bash
   Actions → 性能监控 → Run workflow → 选择环境
   ```

### 本地运行测试

```bash
# 代码质量检查
npm run check

# 单元测试
npm test

# E2E 测试
npm run test:playwright

# 构建测试
npm run build:production

# 安全审计
npm audit
```

## 测试指标说明

### 代码质量指标
- **TypeScript 类型检查**: 确保类型安全
- **ESLint 检查**: 代码风格和潜在问题
- **Stylelint 检查**: CSS/SCSS 样式规范
- **未使用依赖检查**: 清理无用依赖

### 性能指标
- **Lighthouse 分数**: 
  - Performance: ≥ 80
  - Accessibility: ≥ 90
  - Best Practices: ≥ 80
  - SEO: ≥ 80
- **核心 Web 指标**:
  - First Contentful Paint: ≤ 2s
  - Largest Contentful Paint: ≤ 2.5s
  - Cumulative Layout Shift: ≤ 0.1
  - Total Blocking Time: ≤ 300ms

### 安全指标
- **依赖漏洞**: 无高危和中危漏洞
- **敏感信息**: 检查代码中的敏感信息泄露
- **环境变量**: 确保环境配置安全

### 构建指标
- **构建成功率**: 100%
- **包大小**: 监控 JavaScript 和 CSS 文件大小
- **文件数量**: 控制构建产物文件数量

## 报告和结果

### 测试报告位置
- **代码质量报告**: `code-quality-reports` 制品
- **测试覆盖率**: `coverage-reports` 制品
- **性能报告**: `performance-reports` 制品
- **E2E 测试报告**: `e2e-test-reports` 制品
- **构建产物**: `build-artifacts` 制品

### 查看报告
1. 在 GitHub Actions 页面找到对应的运行
2. 点击 "Artifacts" 下载报告
3. 查看详细测试结果和指标

### 性能监控报告
- 每周自动生成性能报告
- 自动创建 GitHub Issue 记录趋势
- 包大小和依赖变化跟踪

## 配置说明

### Lighthouse 配置 (`lighthouserc.json`)
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Depcheck 配置 (`.depcheckrc`)
```json
{
  "ignores": [
    "@types/*",
    "eslint-*",
    "jest-*"
  ]
}
```

## 故障排除

### 常见问题

1. **测试失败**:
   - 检查控制台输出
   - 查看详细错误信息
   - 确保本地环境与 CI 环境一致

2. **性能测试失败**:
   - 检查 Lighthouse 配置
   - 确保本地服务器正常启动
   - 查看性能指标阈值设置

3. **构建失败**:
   - 检查依赖安装
   - 查看构建日志
   - 确保环境变量配置正确

### 调试技巧

1. **本地复现**:
   ```bash
   # 使用与 CI 相同的环境
   npm ci
   npm run build:production
   ```

2. **查看详细日志**:
   - 在 GitHub Actions 中展开失败步骤
   - 查看完整的错误堆栈

3. **临时禁用测试**:
   - 在 PR 标题中添加 `[skip ci]`
   - 或使用 `[skip tests]` 跳过特定测试

## 最佳实践

1. **定期运行完整测试**: 建议每周运行一次完整测试
2. **监控性能趋势**: 关注包大小和性能指标变化
3. **及时修复问题**: 优先修复安全和高危问题
4. **保持测试更新**: 定期更新测试配置和阈值
5. **团队协作**: 在 PR 中查看测试结果，确保代码质量

## 联系支持

如有问题或建议，请：
1. 查看 GitHub Issues
2. 创建新的 Issue 描述问题
3. 联系项目维护者 