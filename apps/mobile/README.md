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

## Sign in with Apple troubleshooting

**Error `AuthorizationError 1000`** means the iOS build is missing Apple Sign In entitlements or the App ID is not configured.

1. **Apple Developer** → Identifiers → `io.github.YaoHuan123.huanqi` → enable **Sign in with Apple** → Save.
2. **Xcode** → App target → **Signing & Capabilities** → **+ Capability** → **Sign in with Apple** (repo includes `App/App.entitlements`).
3. **Device** → Settings → sign in to your **Apple Account** (required even on a real iPhone).
4. **Rebuild** after changes: `npm run ios --workspace=mobile` then Run from Xcode (not an old IPA).
5. **Backend** `.env` on the machine at `VITE_API_BASE_URL`:
   ```env
   APPLE_CLIENT_ID=io.github.YaoHuan123.huanqi
   APPLE_AUTH_DEV_MOCK=0
   ```
   Restart `npm run dev --workspace=web` after editing.

**Face ID succeeded but app still errors?** Native Apple Sign In worked; the **API server** rejected the token. Fix `APPLE_CLIENT_ID` on the backend, not Xcode.

For local API testing without Apple, use `VITE_APPLE_DEV_MOCK=1` **and** `APPLE_AUTH_DEV_MOCK=1` (does not apply on native iOS).

## In-App Purchase (unlock $0.99)

Product ID: `com.huanqi.unlock.single` (consumable) — create in App Store Connect → In-App Purchases.

1. **Xcode** → Signing & Capabilities → add **In-App Purchase**
2. **App Store Connect** → create consumable IAP with ID `com.huanqi.unlock.single`
3. **Backend** `.env`:
   ```env
   IAP_DEV_MOCK=1          # local: skip Apple verification (dev-iap-* IDs)
   APPLE_ISSUER_ID=...     # production: App Store Connect API key issuer
   APPLE_KEY_ID=...
   APPLE_PRIVATE_KEY=...
   ```
4. **Mobile** `.env.ios.local`:
   ```env
   VITE_IAP_DEV_MOCK=1     # local: simulate purchase without StoreKit
   VITE_IAP_DEV_MOCK=0     # production: real StoreKit sheet
   ```

Flow: Match detail → StoreKit purchase → `POST /api/matches/:id` with `{ transactionId, productId }` → server verifies → unlock.

## Codemagic

Push to **`ios`** branch. Workflow builds bundled IPA with `VITE_API_BASE_URL` from yaml vars.
