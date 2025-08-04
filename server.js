const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 处理静态资源缓存
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.wasm'].includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年缓存
  } else if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

// 安全头
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

// 处理所有路由 - 这是关键配置
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// HTTP 服务器
app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

// HTTPS 服务器（可选）
if (process.env.NODE_ENV === 'production') {
  try {
    const privateKey = fs.readFileSync('./cert/private-key.pem', 'utf8');
    const certificate = fs.readFileSync('./cert/certificate.pem', 'utf8');
    
    const httpsServer = https.createServer({
      key: privateKey,
      cert: certificate
    }, app);
    
    httpsServer.listen(443, () => {
      console.log('HTTPS Server running on port 443');
    });
  } catch (error) {
    console.log('HTTPS server not started - SSL certificates not found');
  }
} 