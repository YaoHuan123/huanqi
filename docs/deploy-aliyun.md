# HuanQi API — 阿里云公网 HTTPS 部署指南

面向 **App Store 上架** 的生产部署：把 `apps/web`（Next.js API + 隐私/条款页）部署到阿里云，供 iOS App 通过 HTTPS 访问。

**推荐区域：** 香港或新加坡（全球 iOS 用户、无需 ICP 备案）  
**推荐规格：** 轻量应用服务器 2 核 2G 起  
**预计耗时：** 2–4 小时（含域名解析生效）

---

## 架构概览

```
iPhone App
    │  HTTPS
    ▼
api.yourdomain.com  (443)
    │
    ▼
Nginx  ──反向代理──▶  Next.js (127.0.0.1:3001)
                           │
                           ▼
                     SQLite 或 RDS PostgreSQL
```

| 组件 | 说明 |
|------|------|
| 域名 | 例如 `yourdomain.com`，API 用子域名 `api.yourdomain.com` |
| SSL | Let's Encrypt 免费证书（Certbot）或阿里云 DV 证书 |
| 进程守护 | PM2 保持 Next.js 常驻 |
| 数据库 | **V1 快速上线**：服务器本地 SQLite；**长期**：阿里云 RDS PostgreSQL |

---

## 一、购买与初始化

### 1.1 阿里云资源

1. 登录 [阿里云国际站](https://www.alibabacloud.com/) 或国内站（国内站大陆节点需 ICP 备案）
2. 购买 **轻量应用服务器**
   - 地域：**中国香港** 或 **新加坡**
   - 镜像：**Ubuntu 22.04**
   - 带宽：3–5 Mbps 起步即可
3. 记录：**公网 IP**、**root 密码**（或 SSH 密钥）

### 1.2 安全组 / 防火墙

在控制台放行：

| 端口 | 用途 |
|------|------|
| 22 | SSH |
| 80 | HTTP（Certbot 验证 + 跳转 HTTPS） |
| 443 | HTTPS |

### 1.3 域名解析

在域名服务商（阿里云万网、Cloudflare 等）添加 A 记录：

```
api.yourdomain.com  →  服务器公网 IP
```

若隐私/条款与 API 同域，可再加：

```
yourdomain.com      →  同一 IP（可选，用于 marketing 首页）
```

等待 DNS 生效（通常 5–30 分钟，可用 `ping api.yourdomain.com` 检查）。

---

## 二、服务器环境

SSH 登录：

```bash
ssh root@你的公网IP
```

### 2.1 系统更新与基础工具

```bash
apt update && apt upgrade -y
apt install -y git curl nginx certbot python3-certbot-nginx ufw
```

### 2.2 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # 应显示 v20.x
npm -v
```

### 2.3 安装 PM2

```bash
npm install -g pm2
```

### 2.4 防火墙（可选）

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 三、部署代码

### 3.1 创建部署用户（推荐）

```bash
adduser huanqi
usermod -aG sudo huanqi
su - huanqi
```

### 3.2 克隆仓库

```bash
cd ~
git clone https://github.com/你的用户名/huanqi.git
cd huanqi
```

若仓库私有，配置 Deploy Key 或 Personal Access Token。

### 3.3 安装依赖并构建

```bash
npm ci
npm run build --workspace=web
```

构建成功后会在 `apps/web/.next` 生成生产产物。

### 3.4 初始化数据库（SQLite 方案 — 无需改代码）

当前项目 Prisma 默认 SQLite，生产可先使用服务器本地文件库：

```bash
mkdir -p prisma
# 在仓库根目录创建 .env（见下一节）
npm run db:push
```

数据库文件位于 `prisma/dev.db`（可在 `.env` 里改成 `prisma/prod.db`）。

> **后期升级 PostgreSQL：** 见本文末尾「附录 A」。

---

## 四、生产环境变量

在 **仓库根目录** 创建 `.env`（不要提交到 Git）：

```bash
nano ~/huanqi/.env
```

### 4.1 生产 `.env` 模板

```env
# ── Database ──────────────────────────────────────────
# SQLite（V1 快速上线）
DATABASE_URL="file:./prisma/prod.db"

# ── Security ──────────────────────────────────────────
SESSION_SECRET="粘贴 openssl rand -base64 32 的输出"
CRON_SECRET="粘贴 openssl rand -base64 32 的输出"
CONTACT_ENCRYPTION_KEY="粘贴 openssl rand -hex 32 的输出"

# ── Public URLs ───────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://api.yourdomain.com"
NEXT_PUBLIC_APPLE_BUNDLE_ID="io.github.YaoHuan123.huanqi"
NEXT_PUBLIC_APPLE_DEV_MOCK=0

# ── AI / Matching ─────────────────────────────────────
OPENAI_API_KEY="你的密钥"
OPENAI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
OPENAI_MODEL=doubao-seed-2-0-pro-260215
OPENAI_EMBEDDING_MODEL=doubao-embedding-large-text-240915
HUANQI_SIMILARITY_MODE=llm

# ── Apple Sign In ─────────────────────────────────────
APPLE_CLIENT_ID="io.github.YaoHuan123.huanqi"
APPLE_AUTH_DEV_MOCK=0

# ── Apple IAP（App Store Connect API Key）──────────────
APPLE_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
APPLE_KEY_ID="XXXXXXXXXX"
APPLE_TEAM_ID="XXXXXXXXXX"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----"
IAP_DEV_MOCK=0

# ── Production flags ──────────────────────────────────
WEB_BETA_FREE_UNLOCK="false"
WEB_BETA_UNLIMITED_SENSATIONS="false"
EMAIL_OTP_DEV_MOCK=0
RESEND_API_KEY=""

# ── Runtime ───────────────────────────────────────────
NODE_ENV=production
PORT=3001
```

### 4.2 生成密钥

在服务器上执行：

```bash
openssl rand -base64 32   # SESSION_SECRET、CRON_SECRET
openssl rand -hex 32      # CONTACT_ENCRYPTION_KEY
```

### 4.3 Apple IAP 私钥注意

`APPLE_PRIVATE_KEY` 在 `.env` 里需把换行写成 `\n`，例如：

```
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEA...\n-----END PRIVATE KEY-----"
```

保存后初始化库：

```bash
cd ~/huanqi
npm run db:push
```

---

## 五、PM2 常驻进程

在仓库根目录创建 `ecosystem.config.cjs`：

```javascript
module.exports = {
  apps: [
    {
      name: "huanqi-api",
      cwd: "/home/huanqi/huanqi",
      script: "npm",
      args: "run start --workspace=web -- -p 3001 -H 127.0.0.1",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "512M",
      autorestart: true,
    },
  ],
};
```

> 把 `cwd` 改成你的实际路径。

启动并设置开机自启：

```bash
cd ~/huanqi
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # 按提示执行它输出的 sudo 命令
```

验证本地可访问：

```bash
curl -s http://127.0.0.1:3001/ | head
```

应返回 HTML（营销首页）。

---

## 六、Nginx + HTTPS

### 6.1 Nginx 站点配置

```bash
sudo nano /etc/nginx/sites-available/huanqi
```

写入：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/huanqi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6.2 申请 Let's Encrypt 证书

```bash
sudo certbot --nginx -d api.yourdomain.com
```

按提示输入邮箱、同意条款。成功后 Certbot 会自动把 80 跳转到 443。

证书自动续期：

```bash
sudo certbot renew --dry-run
```

### 6.3 验证 HTTPS

```bash
curl -I https://api.yourdomain.com/
curl -s https://api.yourdomain.com/privacy | head
curl -s https://api.yourdomain.com/terms | head
```

浏览器访问应显示绿色锁标志。

---

## 七、对接 iOS App

### 7.1 更新移动端 API 地址

`apps/mobile/.env.ios.local`（本地）或 Codemagic / Xcode 构建变量：

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APPLE_BUNDLE_ID=io.github.YaoHuan123.huanqi
VITE_IAP_DEV_MOCK=0
```

重新打包：

```bash
npm run ios --workspace=mobile
```

### 7.2 修复登录页法律链接（上架前必做）

iOS 登录页的 `/privacy`、`/terms` 相对链接在原生 App 内无法打开。应改为：

```
https://api.yourdomain.com/privacy
https://api.yourdomain.com/terms
```

App Store Connect 填写：

| 字段 | 值 |
|------|-----|
| Privacy Policy URL | `https://api.yourdomain.com/privacy` |
| Support URL | `https://api.yourdomain.com` 或专用 support 页 |

---

## 八、上线检查清单

在提交 App Store 前，逐项确认：

- [ ] `https://api.yourdomain.com` 可访问，证书有效
- [ ] `POST https://api.yourdomain.com/api/auth/apple` 可用（真机 Sign in with Apple）
- [ ] iOS 请求头含 `X-Client-Platform: ios`（项目已内置）
- [ ] `IAP_DEV_MOCK=0`，沙盒购买能解锁
- [ ] `APPLE_AUTH_DEV_MOCK=0`
- [ ] 隐私/条款页无 “Placeholder for legal review” 文案（需正式版）
- [ ] `.env` 未泄露到 Git
- [ ] 安全组仅开放 22/80/443

### 快速 API 冒烟测试

```bash
# 首页
curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/

# 未登录访问 matches 应返回 401
curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/api/matches
```

---

## 九、更新部署

代码更新后：

```bash
cd ~/huanqi
git pull
npm ci
npm run db:push          # schema 有变更时
npm run build --workspace=web
pm2 restart huanqi-api
```

查看日志：

```bash
pm2 logs huanqi-api
pm2 status
```

---

## 十、常见问题

### Q: iPhone 连不上 API

1. 确认 `VITE_API_BASE_URL` 是 **https://** 而不是 `http://192.168.x.x`
2. 确认域名 DNS 已指向正确 IP
3. 确认安全组放行 443
4. `pm2 logs huanqi-api` 看是否有 crash

### Q: Apple 登录报 503 / not configured

服务器 `.env` 检查：

- `APPLE_CLIENT_ID=io.github.YaoHuan123.huanqi`
- `APPLE_AUTH_DEV_MOCK=0`
- 改完后 `pm2 restart huanqi-api`

### Q: IAP 解锁失败

- `IAP_DEV_MOCK=0`
- `APPLE_ISSUER_ID`、`APPLE_KEY_ID`、`APPLE_PRIVATE_KEY` 正确
- App Store Connect 已创建 `com.huanqi.unlock.single`
- 使用 **沙盒测试账号** 在 TestFlight / 开发包测试

### Q: 火山引擎 API 从香港服务器访问慢或失败

- 检查 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL` 是否正确
- 若长期服务海外用户，可换 OpenAI 等海外 endpoint，并改 `OPENAI_BASE_URL`

### Q: 要不要备案？

- **香港 / 新加坡节点 + 国际域名**：一般 **不需要** ICP 备案
- **中国大陆节点 + 国内访问**：需要备案，周期约 1–2 周

---

## 附录 A：升级到 RDS PostgreSQL（可选）

用户量上来后，建议从 SQLite 迁到阿里云 RDS PostgreSQL。

### A.1 购买 RDS

- 引擎：PostgreSQL 15+
- 地域：与 ECS **相同**
- 白名单：加入 ECS 内网 IP

### A.2 修改 Prisma

`prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

`.env`：

```env
DATABASE_URL="postgresql://user:password@rm-xxx.pg.rds.aliyuncs.com:5432/huanqi?sslmode=require"
```

### A.3 迁移

```bash
npm run db:push
pm2 restart huanqi-api
```

> SQLite 历史数据需单独导出/import；新环境可直接空库启动。

---

## 附录 B：成本参考（小流量）

| 项目 | 约 |
|------|-----|
| 轻量服务器 2C2G（香港） | ¥30–60/月 |
| 域名 .com | ¥60–80/年 |
| SSL（Let's Encrypt） | 免费 |
| RDS（可选） | ¥50+/月 |

---

## 附录 C：相关文件

| 文件 | 作用 |
|------|------|
| `apps/web` | Next.js API + `/privacy` `/terms` |
| `.env.example` | 本地开发变量参考 |
| `apps/mobile/.env.ios.example` | iOS 构建变量参考 |
| `codemagic.yaml` | CI 构建时需改 `VITE_API_BASE_URL` |

---

*Last updated: June 2026 · HuanQi V1 iOS*
