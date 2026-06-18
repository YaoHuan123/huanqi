import type { CapacitorConfig } from "@capacitor/cli";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

const platform = process.env.CAPACITOR_PLATFORM ?? "android";
for (const file of [`.env.${platform}`, `.env.${platform}.local`, ".env"]) {
  const path = resolve(__dirname, file);
  if (existsSync(path)) loadEnv({ path, override: true });
}

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "io.github.YaoHuan123.huanqi",
  appName: "HuanQi",
  webDir: "dist",
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: "automatic",
    limitsNavigationsToAppBoundDomains: false,
  },
  server: {
    androidScheme: "https",
    iosScheme: "https",
    ...(serverUrl
      ? {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
          allowNavigation: [
            new URL(serverUrl).host,
            serverUrl.replace(/\/$/, ""),
          ],
        }
      : {}),
  },
};

export default config;
