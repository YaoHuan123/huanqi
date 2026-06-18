import { resolveApiUrl } from "../lib/apiBase";
import { authTokenStore } from "../lib/authToken";
import { clientPlatformHeader } from "../lib/platform";

type ApiPayload = {
  ok?: boolean;
  error?: string;
  data?: unknown;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Client-Platform", clientPlatformHeader());

  if (auth) {
    const token = authTokenStore.get();
    if (!token) throw new ApiError("Not authenticated", 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveApiUrl(path), { ...init, headers });
  const json = (await response.json()) as ApiPayload & T;

  if (!response.ok || json.ok === false) {
    throw new ApiError(json.error ?? `HTTP ${response.status}`, response.status);
  }

  return json as T;
}

export type AuthUser = { id: string; email: string };

export type AuthResponse = {
  ok: true;
  data: { user: AuthUser; token?: string };
};

export async function getMe() {
  return apiRequest<{ ok: true; data: { user: AuthUser & { createdAt?: string } } }>(
    "/api/auth/me",
    {},
    true,
  );
}

export async function appleLogin(identityToken: string) {
  return apiRequest<AuthResponse>("/api/auth/apple", {
    method: "POST",
    body: JSON.stringify({
      identityToken,
      acceptTerms: true,
      acceptPrivacy: true,
    }),
  });
}

export async function sendEmailCode(email: string) {
  return apiRequest<{ ok: true; data?: { devCode?: string; devHint?: string } }>(
    "/api/auth/email/send-code",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export async function verifyEmailCode(email: string, code: string) {
  return apiRequest<AuthResponse>("/api/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({
      email,
      code,
      acceptTerms: true,
      acceptPrivacy: true,
    }),
  });
}

export async function logoutApi() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" }, true);
  } catch {
    // ignore
  }
  authTokenStore.clear();
}

export async function deleteAccountApi() {
  await apiRequest("/api/auth/account", { method: "DELETE" }, true);
  authTokenStore.clear();
}
