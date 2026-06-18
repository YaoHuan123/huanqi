# HuanQi iOS Native App

Bundled React UI in the IPA (no remote WebView). The app talks to the HuanQi API server via `VITE_API_BASE_URL`.

## Architecture

```
iOS App (Capacitor)
  └── Bundled dist/ (Vite + React Router)
        └── fetch → VITE_API_BASE_URL/api/*  (apps/web backend)
```

## Dev setup

```bash
# Terminal 1 — API + web backend
npm run dev --workspace=web

# Terminal 2 — mobile preview in browser
npm run dev --workspace=mobile

# iOS sync (Mac)
npm run ios --workspace=mobile
npm run ios:open --workspace=mobile
```

## Env (`apps/mobile/.env.ios.local`)

```
VITE_API_BASE_URL=http://192.168.x.x:3001
VITE_APPLE_BUNDLE_ID=io.github.YaoHuan123.huanqi
VITE_APPLE_DEV_MOCK=1
```

No `CAPACITOR_SERVER_URL` — the UI ships inside the app.

## Codemagic

Push to **`ios`** branch. Workflow builds bundled IPA with `VITE_API_BASE_URL` from yaml vars.
