import type { CapacitorConfig } from "@capacitor/cli";

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
  },
};

export default config;
