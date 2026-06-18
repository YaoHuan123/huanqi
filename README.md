# HuanQi

**Find people who share the same surreal sensation.**

V1 is **English-only**: UI, sensation records, matching pool, Privacy Policy, and App Store listing.

## Monorepo

```
apps/web      Next.js API + marketing / legal pages
packages/shared  English copy, constants, shared types
prisma/       Database schema
```

`apps/ios` (Expo) will be added in the next phase.

## Requirements

- Node.js 20+
- pnpm 9+
- PostgreSQL (local or Supabase)

## Web app flow

| Page | Path |
|------|------|
| Write sensation | `/write` |
| My sensations (manage / delete) | `/library` |
| Matches | `/matches` |
| Match detail + unlock | `/matches/[id]` |
| Settings / delete account | `/settings` |

Unlock is **free on web beta** (`WEB_BETA_FREE_UNLOCK=true`). iOS will use Apple IAP later.

## Phase 1 (done)

- Email OTP login (`/login` → `/api/auth/email/*`)
- Sign in with Apple API (`POST /api/auth/apple`) — configure Apple keys for iOS
- Session cookie (JWT, 30 days)
- Settings + sign out + **one-click account delete**
- AES-256-GCM contact encryption helper (`src/lib/crypto/contact.ts`)

## Local setup (SQLite + Volcengine Ark)

```bash
npm install
cp .env.example .env
# Copy OPENAI_* from hello chat backend/.env
npm run db:push
npm run dev --workspace=web
```

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
| Sign in with Apple + Email OTP | Phone SMS login |
| OpenAI embeddings + moderation | Tongyi / cross-language matching |
| Apple IAP | Stripe, WeChat Pay |
| Email / Instagram / Discord contacts | WeChat, Xiaohongshu |

See `幻契：超现实体感同频匹配工具 产品定位+Cursor开发TODO文档.md` for the full product spec.
