# 生产环境构建指南

## 概述

本项目已经配置了完整的生产环境构建流程，包括 Webpack 构建和静态文件复制。

## 构建命令

### 生产环境构建
```bash
npm run build:production
```

这个命令会：
1. 使用 Webpack 构建生产版本的 JavaScript 和 CSS 文件
2. 自动复制所有必要的静态文件到 `dist` 目录

### 开发环境构建
```bash
npm run build:dev
```

### 其他构建选项
```bash
# 测试环境构建
npm run build:mocked

# 预发布环境构建
npm run build:staging
```

## 构建输出

构建完成后，`dist` 目录将包含：

### 核心文件
- `index.html` - 主页面文件
- `main.*.js` - 主 JavaScript bundle
- `main.*.css` - 主 CSS bundle
- 各种按需加载的 chunk 文件

### 静态资源
- `public/` 目录下的所有文件（图标、图片、音频等）
- `src/lib/` 目录下的 WASM 文件：
  - `rlottie-wasm.wasm` - 动画渲染引擎
  - `fasttext-wasm.wasm` - 文本处理引擎
- `node_modules/opus-recorder/dist/decoderWorker.min.wasm` - 音频解码器
- `node_modules/emoji-data-ios/` 下的 emoji 图片

### 字体文件
- 各种 Web 字体文件（.woff, .woff2）

## 构建脚本说明

### 主要脚本文件
- `deploy/copy_to_dist.js` - Node.js 跨平台静态文件复制脚本
- `deploy/copy_to_dist.sh` - Unix/Linux 系统的 bash 脚本
- `deploy/copy_to_dist.bat` - Windows 系统的批处理脚本

### 脚本功能
1. **复制 public 目录**：所有静态资源文件
2. **复制 WASM 文件**：lib 目录下的 WebAssembly 文件
3. **复制音频解码器**：opus-recorder 的 WASM 文件
4. **复制 emoji 数据**：表情符号图片文件

## 部署

构建完成后，`dist` 目录可以直接部署到任何静态文件服务器：

### 本地测试
```bash
# 使用 Python 简单服务器
python -m http.server 8080

# 或使用 Node.js serve
npx serve dist
```

### 生产部署
- 将 `dist` 目录内容上传到 CDN 或静态文件服务器
- 配置服务器支持 SPA 路由（所有路由都返回 index.html）

## 故障排除

### 常见问题

1. **WASM 文件缺失**
   - 确保 `src/lib/` 目录下的 WASM 文件存在
   - 检查 `node_modules/opus-recorder/dist/` 目录

2. **构建失败**
   - 检查 Node.js 版本（建议 16+）
   - 确保所有依赖已安装：`npm install`

3. **静态文件未复制**
   - 检查 `deploy/copy_to_dist.js` 脚本是否有执行权限
   - 在 Windows 上确保使用 Node.js 脚本而不是 bash 脚本

### 手动复制文件
如果自动复制失败，可以手动复制：

```bash
# 复制 public 目录
xcopy /E /I /Y public\* dist\

# 复制 WASM 文件
copy src\lib\rlottie\rlottie-wasm.wasm dist\
copy src\lib\fasttextweb\fasttext-wasm.wasm dist\
copy node_modules\opus-recorder\dist\decoderWorker.min.wasm dist\

# 复制 emoji 数据
xcopy /E /I /Y node_modules\emoji-data-ios\img-apple-64 dist\img-apple-64\
xcopy /E /I /Y node_modules\emoji-data-ios\img-apple-160 dist\img-apple-160\
```

## 版本控制

构建脚本已经配置在 `package.json` 中，支持跨平台使用。主要改进：

1. **跨平台兼容**：使用 Node.js 脚本替代 bash 脚本
2. **错误处理**：添加了详细的错误日志
3. **文件验证**：检查文件是否存在再复制
4. **进度显示**：显示复制进度和结果

## 注意事项

1. **文件大小**：生产构建包含大量优化后的文件，总大小可能较大
2. **缓存策略**：文件名包含 hash，支持长期缓存
3. **兼容性**：确保目标环境支持现代浏览器特性
4. **HTTPS**：生产环境建议使用 HTTPS，特别是 WASM 文件加载 