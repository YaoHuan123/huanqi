# HuanQi

**Find people who share the same surreal sensation.**

V1 is **English-only** and **iOS-only**: Sign in with Apple in the native app. This web project is the API backend plus Privacy Policy / Terms.

## Monorepo

```
apps/web      Next.js API + marketing site (port 3001)
apps/mobile   iOS native SPA (Vite + Capacitor)
packages/shared  English copy, constants, shared types
prisma/       Database schema
```

See `apps/mobile/README.md` for iOS build and Sign in with Apple setup.

## Requirements

- Node.js 20+
- pnpm 9+
- PostgreSQL (local or Supabase)

## iOS app flow

| Screen | Path |
|--------|------|
| Sign in with Apple | `/login` |
| Write sensation | `/write` |
| My sensations | `/library` |
| Matches | `/matches` |
| Match detail + IAP unlock | `/matches/:id` |
| Settings / delete account | `/settings` |

Unlock uses **Apple IAP** on iOS (`$0.99` consumable). Web API supports a free-unlock beta flag for development only.

## Auth

- **Production (iOS)**: Sign in with Apple only → `POST /api/auth/apple`
- **Web browser**: marketing home + legal pages; app routes redirect to login (iOS-only message)
- Email OTP API remains for local dev tooling but is not exposed in the iOS UI

## Local setup (SQLite + Volcengine Ark)

```bash
npm install
cp .env.example .env
# Copy OPENAI_* from hello chat backend/.env
npm run db:push
npm run dev --workspace=web
# → http://localhost:3001
```

### iOS app (Capacitor — requires Mac + Xcode)

```bash
npm run dev --workspace=web          # keep running on :3001
cd apps/mobile && npm install
cp .env.ios.example .env.ios.local
npm run ios                          # from repo root: npm run ios
npm run ios:open                     # Xcode → Run on Simulator
```

See [`apps/mobile/README.md`](apps/mobile/README.md) for Sign in with Apple setup.

- **Database**: local SQLite at `prisma/dev.db` (no Docker/Postgres needed)
- **AI**: uses `OPENAI_BASE_URL` + `OPENAI_API_KEY` from hello chat (Volcengine Ark)
- **Matching on Volcengine**: `HUANQI_SIMILARITY_MODE=llm` (chat model scores similarity; embedding endpoint not required)
- **Email OTP**: leave `RESEND_API_KEY` empty — code prints in terminal

### Generate secrets

```bash
openssl rand -base64 32   # SESSION_SECRET, CRON_SECRET
openssl rand -hex 32      # CONTACT_ENCRYPTION_KEY
```

## V1 scope

| In scope | Deferred (V2) |
|----------|----------------|
| English UI & sensations | Chinese UI |
| iOS app + Sign in with Apple | Email OTP login, Web app UI |
| OpenAI embeddings + moderation | Tongyi / cross-language matching |
| Apple IAP | Stripe, WeChat Pay |
| Apple account email contact | Instagram, Discord handles |

See `幻契：超现实体感同频匹配工具 产品定位+Cursor开发TODO文档.md` for the full product spec.

## Deploy API (production)

See [`docs/deploy-aliyun.md`](docs/deploy-aliyun.md) for deploying the HTTPS API on Alibaba Cloud (Hong Kong / Singapore, Nginx, PM2, SSL).
