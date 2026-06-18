/** Client-only Capacitor platform helpers. Always dynamic-import @capacitor/core. */

export async function getCapacitorPlatform() {
  if (typeof window === "undefined") return null;
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor;
}

export async function isNativeApp(): Promise<boolean> {
  const Capacitor = await getCapacitorPlatform();
  return Capacitor?.isNativePlatform() ?? false;
}

export async function isIosNative(): Promise<boolean> {
  const Capacitor = await getCapacitorPlatform();
  return Capacitor?.getPlatform() === "ios";
}

export async function clientPlatformHeader(): Promise<string> {
  if (await isIosNative()) return "ios";
  const Capacitor = await getCapacitorPlatform();
  if (Capacitor?.getPlatform() === "android") return "android";
  return "web";
}
