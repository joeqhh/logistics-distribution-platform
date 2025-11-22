# 物流配送平台后端

基于 Express + TypeScript 的后端服务

## 快速开始

### 安装依赖
\`\`\`bash
pnpm install
\`\`\`

### 环境配置
复制 \`.env.example\` 为 \`.env\` 并配置相关环境变量：

\`\`\`bash
cp .env.example .env
\`\`\`

### 开发模式
\`\`\`bash
pnpm dev
\`\`\`

### 构建生产版本
\`\`\`bash
pnpm build
\`\`\`

### 启动生产服务
\`\`\`bash
pnpm start
\`\`\`

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取用户信息 (需要认证)

### 健康检查

- `GET /health` - 服务健康状态

## 项目结构

\`\`\`
src/
├── app.ts              # 应用入口
├── middleware/         # 中间件
│   ├── auth.ts        # 认证中间件
│   ├── errorHandler.ts # 错误处理
│   └── notFound.ts    # 404 处理
├── routes/            # 路由
│   └── auth.ts        # 认证路由
├── controllers/       # 控制器
│   └── authController.ts # 认证控制器
├── models/            # 数据模型
├── utils/             # 工具函数
└── types/             # 类型定义
\`\`\`

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Helmet** - 安全头
- **CORS** - 跨域支持
- **Morgan** - 日志记录

## 默认账户

- 用户名: admin
- 密码: secret123

## 开发说明

1. 所有 API 接口都返回 JSON 格式
2. 使用 JWT 进行身份认证
3. 密码使用 bcrypt 加密存储
4. 支持热重载开发模式