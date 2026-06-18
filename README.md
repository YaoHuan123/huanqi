# HuanQi

**Find people who share the same surreal sensation.**

V1 is **English-only**: UI, sensation records, matching pool, Privacy Policy, and App Store listing.

## Monorepo

```
apps/web      Next.js API + web UI (port 3001)
apps/mobile   Capacitor Android/iOS shell (loads web app)
packages/shared  English copy, constants, shared types
prisma/       Database schema
```

`apps/mobile` wraps the web app in a native shell (same pattern as hello story2). See `apps/mobile/README.md`.

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

## Web app shell

The web UI uses a **mobile app-style shell** (centered phone frame on desktop, bottom tab bar when signed in). Native Capacitor builds (`apps/mobile`) are deferred until the web shell is finalized.

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
| Sign in with Apple + Email OTP | Phone SMS login |
| OpenAI embeddings + moderation | Tongyi / cross-language matching |
| Apple IAP | Stripe, WeChat Pay |
| Email / Instagram / Discord contacts | WeChat, Xiaohongshu |

See `幻契：超现实体感同频匹配工具 产品定位+Cursor开发TODO文档.md` for the full product spec.
