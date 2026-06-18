import { Capacitor } from "@capacitor/core";

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function isIosNative(): boolean {
  return Capacitor.getPlatform() === "ios";
}

export function clientPlatformHeader(): string {
  if (Capacitor.getPlatform() === "ios") return "ios";
  if (Capacitor.getPlatform() === "android") return "android";
  return "web";
}
