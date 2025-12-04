import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto-js';
import fetch from 'node-fetch';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:4321', 'https://mrdm86-collab.github.io', 'https://novatra-ai.github.io'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// GitHub OAuth 配置
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback';

// 生成随机字符串用于状态验证
function generateState() {
  return crypto.lib.WordArray.random(16).toString();
}

// 生成安全的令牌
function generateToken() {
  return crypto.lib.WordArray.random(32).toString();
}

// 存储临时状态（生产环境应使用Redis等）
const stateStore = new Map();
const sessionStore = new Map();

// 路由
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// GitHub OAuth 登录路由
app.get('/auth/github', (req, res) => {
  const state = generateState();
  const encodedState = Buffer.from(state).toString('base64');

  // 存储状态以便验证
  stateStore.set(encodedState, {
    timestamp: Date.now(),
    userAgent: req.headers['user-agent']
  });

  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=user:email&` +
    `state=${encodedState}`;

  res.json({ authUrl });
});

// GitHub OAuth 回调路由
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: '缺少必要的参数' });
  }

  // 验证状态
  const storedState = stateStore.get(state);
  if (!storedState) {
    return res.status(400).json({ error: '无效的状态参数' });
  }

  // 检查状态是否过期（5分钟）
  if (Date.now() - storedState.timestamp > 5 * 60 * 1000) {
    stateStore.delete(state);
    return res.status(400).json({ error: '状态已过期' });
  }

  try {
    // 交换代码获取访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    // 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // 获取用户邮箱（如果公开）
    let emailData = [];
    try {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${tokenData.access_token}`,
        },
      });
      emailData = await emailResponse.json();
    } catch (error) {
      console.error('获取邮箱失败:', error);
    }

    // 创建会话
    const sessionId = generateToken();
    const sessionData = {
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: emailData.find(e => e.primary)?.email || userData.email,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      },
      accessToken: tokenData.access_token,
      loginTime: new Date().toISOString(),
    };

    sessionStore.set(sessionId, sessionData);
    stateStore.delete(state);

    // 重定向到前端，携带会话信息
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
    res.redirect(`${frontendUrl}/auth/success?session=${sessionId}`);

  } catch (error) {
    console.error('OAuth回调错误:', error);
    res.status(500).json({ error: '认证失败', details: error.message });
  }
});

// 验证会话
app.get('/auth/verify/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessionStore.get(sessionId);

  if (!session) {
    return res.status(401).json({ error: '会话不存在或已过期' });
  }

  res.json({
    valid: true,
    user: session.user,
    loginTime: session.loginTime
  });
});

// 登出
app.post('/auth/logout/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessionStore.delete(sessionId);
  res.json({ success: true, message: '已登出' });
});

// 获取用户信息
app.get('/api/user/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessionStore.get(sessionId);

  if (!session) {
    return res.status(401).json({ error: '未授权' });
  }

  res.json({ user: session.user });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSessions: sessionStore.size
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '内部服务器错误' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Novatra 博客API服务器运行在 http://localhost:${PORT}`);
  console.log(`📚 GitHub OAuth 回调地址: ${REDIRECT_URI}`);
  console.log(`🌐 前端地址: ${process.env.FRONTEND_URL}`);
});

export default app;