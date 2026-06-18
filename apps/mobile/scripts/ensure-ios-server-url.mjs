#!/usr/bin/env node
/**
 * After cap sync, force the embedded iOS config to use CAPACITOR_SERVER_URL.
 * Prevents shipping 127.0.0.1 from the committed .env.ios defaults.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(root, "ios/App/App/capacitor.config.json");

for (const file of [".env.ios.local", ".env.ios", ".env"]) {
  const path = resolve(root, file);
  if (existsSync(path)) loadEnv({ path, override: true });
}

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();
if (!serverUrl) {
  console.warn("[ios:ensure-url] CAPACITOR_SERVER_URL not set — skipping.");
  process.exit(0);
}

if (!existsSync(configPath)) {
  console.warn("[ios:ensure-url] capacitor.config.json not found.");
  process.exit(0);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
const host = new URL(serverUrl).host;

config.appId = "io.github.YaoHuan123.huanqi";
config.server = {
  ...config.server,
  url: serverUrl,
  cleartext: serverUrl.startsWith("http://"),
  allowNavigation: [host, serverUrl.replace(/\/$/, "")],
};
config.ios = {
  ...config.ios,
  limitsNavigationsToAppBoundDomains: false,
};

writeFileSync(configPath, `${JSON.stringify(config, null, "\t")}\n`);
console.log(`[ios:ensure-url] server.url = ${serverUrl}`);
