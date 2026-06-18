#!/usr/bin/env node
/**
 * Patch iOS Info.plist after `cap sync ios` for local dev networking.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const plistPath = resolve(root, "ios/App/App/Info.plist");

if (!existsSync(plistPath)) {
  console.warn("[ios:patch] Info.plist not found — run `npm run ios` first (on Mac).");
  process.exit(0);
}

let xml = readFileSync(plistPath, "utf8");

if (!xml.includes("NSAllowsLocalNetworking")) {
  const insert = `\t<key>NSAppTransportSecurity</key>
\t<dict>
\t\t<key>NSAllowsLocalNetworking</key>
\t\t<true/>
\t</dict>
`;
  xml = xml.replace("</dict>\n</plist>", `${insert}</dict>\n</plist>`);
}

if (!xml.includes("com.apple.developer.applesignin")) {
  // Sign in with Apple capability is configured in Xcode; document in README.
}

if (!xml.includes("<string>HuanQi</string>") && xml.includes("CFBundleDisplayName")) {
  xml = xml.replace(
    /<key>CFBundleDisplayName<\/key>\s*<string>.*?<\/string>/,
    "<key>CFBundleDisplayName</key>\n\t<string>HuanQi</string>"
  );
}

writeFileSync(plistPath, xml);
console.log("[ios:patch] Updated Info.plist for local dev.");
