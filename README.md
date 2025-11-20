# Smart Pixels

一款 AI 肖像生成器和编辑器，只需一键即可将日常照片转化为影棚级专业肖像。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS + Shadcn UI
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: Better Auth
- **国际化**: next-intl
- **支付**: Stripe / PayPal / Creem
- **AI**: Replicate + AI SDK

## 快速开始

1. **克隆并安装依赖**

```bash
git clone <your-repo-url>
cd smart-pixels
pnpm install
```

2. **配置环境变量**

创建 `.env` 文件并配置必要的环境变量（数据库连接、认证密钥等）。

3. **初始化数据库**

```bash
pnpm db:generate
pnpm db:migrate
```

4. **启动开发服务器**

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

5. **部署到 Vercel**

将代码推送到 GitHub，然后在 Vercel 中导入项目即可完成部署。

## 其他命令

```bash
pnpm build          # 构建生产版本
pnpm start          # 启动生产服务器
pnpm lint           # 运行代码检查
pnpm db:studio      # 打开数据库管理界面
pnpm rbac:init      # 初始化权限系统
```

## License

MIT
