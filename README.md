# Novatra 博客管理 API

现代化的博客管理系统后端服务，提供完整的GitHub OAuth认证和用户管理功能。

## 🚀 功能特色

### 🔐 GitHub OAuth 认证
- 完整的OAuth 2.0流程
- 安全的状态验证
- 用户信息获取
- 会话管理

### 📊 API 端点
- `GET /` - 登录页面
- `GET /health` - 健康检查
- `GET /auth/github` - GitHub OAuth授权
- `GET /auth/callback` - OAuth回调处理
- `GET /auth/verify/:sessionId` - 验证会话
- `POST /auth/logout/:sessionId` - 用户登出
- `GET /api/user/:sessionId` - 获取用户信息

### 🎨 设计特点
- 现代化玻璃拟态界面
- 响应式设计
- 青色主题配色
- 流畅动画效果
- 与前端完美匹配

## 🛠️ 技术栈

- **Node.js** - 服务器运行环境
- **Express.js** - Web框架
- **TypeScript** - 类型安全（ES6模块）
- **ES6 Modules** - 现代JavaScript模块系统
- **CORS** - 跨域资源共享
- **crypto-js** - 加密和安全
- **dotenv** - 环境变量管理

## 📦 安装和运行

### 1. 克隆项目
```bash
git clone https://github.com/mrdm86-collab/novatra-blogs-api.git
cd novatra-blogs-api
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 到 `.env` 并配置以下变量：

```env
# GitHub OAuth 配置
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# 应用配置
APP_URL=http://localhost:3001
REDIRECT_URI=http://localhost:3001/auth/callback
FRONTEND_URL=http://localhost:4321

# 会话密钥
SESSION_SECRET=your_session_secret_here

# 开发模式
NODE_ENV=development
```

### 4. 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动

### 5. 生产环境部署
```bash
npm run build
npm start
```

## 🔧 GitHub OAuth 设置

### 1. 创建 GitHub OAuth App
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: Novatra 博客管理
   - **Homepage URL**: `https://mrdm86-collab.github.io/novatra-blogs-api/`
   - **Authorization callback URL**: `https://mrdm86-collab.github.io/novatra-blogs-api/auth/callback`

### 2. 获取客户端凭据
- **Client ID**: 公开可见，用于客户端
- **Client Secret**: 保密，仅用于服务端

## 📱 使用方法

### 前端集成
```javascript
// 获取GitHub授权URL
const response = await fetch('http://localhost:3001/auth/github');
const { authUrl } = await response.json();

// 跳转到GitHub授权
window.location.href = authUrl;

// 授权后，GitHub会重定向到您的回调页面
// 并携带session参数
```

### 会话验证
```javascript
// 验证会话有效性
const response = await fetch(`http://localhost:3001/auth/verify/${sessionId}`);
const { valid, user } = await response.json();
```

### 获取用户信息
```javascript
// 获取当前登录用户信息
const response = await fetch(`http://localhost:3001/api/user/${sessionId}`);
const { user } = await response.json();
```

## 🔒 安全特性

- **状态验证**: 防止CSRF攻击
- **会话管理**: 安全的会话令牌
- **令牌过期**: 自动清理过期会话
- **CORS配置**: 限制跨域访问
- **环境变量**: 敏感信息安全存储

## 🌐 部署到 GitHub Pages

### 1. 构建静态文件
```bash
npm run build
```

### 2. 推送到GitHub
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 3. 配置GitHub Pages
1. 进入仓库设置
2. 找到Pages选项
3. 选择源分支和目录
4. 启用GitHub Pages

## 📊 API 响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应
```json
{
  "error": "错误类型",
  "message": "详细错误信息"
}
```

## 🔍 监控和日志

### 健康检查
```bash
curl http://localhost:3001/health
```

### 活动会话监控
响应包含当前活动会话数量：
```json
{
  "status": "ok",
  "timestamp": "2024-12-04T14:19:46.901Z",
  "activeSessions": 0
}
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到问题或有疑问：

1. 查看 [Issues](https://github.com/mrdm86-collab/novatra-blogs-api/issues)
2. 创建新的Issue
3. 联系维护者: mrdm86-collab@users.noreply.github.com

---

**构建于 ❤️ 使用现代Web技术**