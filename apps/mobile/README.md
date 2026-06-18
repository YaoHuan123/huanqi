# HuanQi iOS App (Capacitor)

Native iOS shell that loads the **Next.js web app** (`apps/web`) in a WebView. Same UI as web — full-screen on device, no duplicate frontend.

## Architecture

```
iOS App (Capacitor)
  └── WebView → http://127.0.0.1:3001 (simulator) or your deployed URL
        └── Next.js app (apps/web) with app shell + Sign in with Apple
```

## Requirements

- **Mac** with Xcode 15+ (build & run on Simulator / device)
- Node.js 20+
- Apple Developer account (TestFlight / App Store; optional for Simulator with dev mock)

## First-time setup (Mac)

```bash
# 1. Start the web API + UI
npm run dev --workspace=web
# → http://localhost:3001

# 2. Install iOS deps
cd apps/mobile
npm install

# 3. Copy env (simulator uses host localhost)
cp .env.ios.example .env.ios.local

# 4. Generate / sync iOS project
npm run ios

# 5. Open Xcode
npm run cap:open:ios
```

In Xcode: select **App** target → **Signing & Capabilities** → add **Sign in with Apple**.

Run on **iPhone Simulator**. The app loads your local Next.js server.

### Physical device (same Wi‑Fi)

Edit `.env.ios.local`:

```
CAPACITOR_SERVER_URL=http://192.168.x.x:3001
```

Use your Mac/PC LAN IP where `npm run dev --workspace=web` runs. Dev server listens on `0.0.0.0:3001` so the phone can reach it.

### Black screen after install?

The iOS shell is an empty WebView — it loads **`CAPACITOR_SERVER_URL`** (Codemagic debug: `http://192.168.137.1:3001`). A black screen means that URL did not load.

1. **Start the backend on your PC** (must bind all interfaces):
   ```bash
   npm run dev --workspace=web
   ```
2. **Same network** — phone and PC on the same Wi‑Fi, *or* USB tethering if you use `192.168.137.1` (Windows USB 网卡地址).
3. **Correct IP** — on PC run `ipconfig`, use the IPv4 of the adapter the phone can reach (often `192.168.1.x`, not always `192.168.137.1`).
4. **Firewall** — allow inbound TCP **3001** on Windows.
5. **iOS permission** — first launch may ask for **Local Network** access; tap Allow.
6. **Safari test** — on the iPhone open `http://<your-pc-ip>:3001` in Safari. If Safari is blank, the app will be too.

Reinstall the IPA after changing `CAPACITOR_SERVER_URL` in Codemagic and rebuilding.


- **Production:** Sign in with Apple (`Continue with Apple` on login screen)
- **Local dev mock** (no Apple Developer keys): set in `.env`:

```
APPLE_AUTH_DEV_MOCK=1
NEXT_PUBLIC_APPLE_DEV_MOCK=1
```

Uses token `dev-apple-mock-token` → logs in as `dev@example.com`.

## Production build

1. Deploy `apps/web` to HTTPS (e.g. `https://app.huanqi.com`)
2. Set in `.env.ios.local`:

```
CAPACITOR_SERVER_URL=https://app.huanqi.com
```

3. Configure Apple Sign In in Apple Developer + `.env`:

```
APPLE_CLIENT_ID=io.github.YaoHuan123.huanqi
NEXT_PUBLIC_APPLE_BUNDLE_ID=io.github.YaoHuan123.huanqi
```

4. `npm run ios` → archive in Xcode

## Windows note

`cap add ios` / `cap sync ios` can prepare files on Windows, but **you must open and build in Xcode on a Mac**.
