import { SignJWT, importPKCS8, decodeJwt } from "jose";
import { APP_BUNDLE_ID } from "@huanqi/shared";

export type AppleTransactionPayload = {
  transactionId?: string;
  originalTransactionId?: string;
  productId?: string;
  bundleId?: string;
  type?: string;
  environment?: string;
};

function normalizePrivateKey(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

export async function createAppStoreApiToken(): Promise<string> {
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const issuerId = process.env.APPLE_ISSUER_ID?.trim() || process.env.APPLE_TEAM_ID?.trim();
  const privateKeyPem = process.env.APPLE_PRIVATE_KEY?.trim();

  if (!keyId || !issuerId || !privateKeyPem) {
    throw new Error("APPLE_IAP_KEYS_NOT_CONFIGURED");
  }

  const privateKey = await importPKCS8(normalizePrivateKey(privateKeyPem), "ES256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ bid: APP_BUNDLE_ID })
    .setProtectedHeader({ alg: "ES256", kid: keyId, typ: "JWT" })
    .setIssuer(issuerId)
    .setAudience("appstoreconnect-v1")
    .setIssuedAt(now)
    .setExpirationTime(now + 1200)
    .sign(privateKey);
}

async function fetchTransaction(
  transactionId: string,
  sandbox: boolean
): Promise<AppleTransactionPayload> {
  const token = await createAppStoreApiToken();
  const base = sandbox
    ? "https://api.storekit-sandbox.itunes.apple.com"
    : "https://api.storekit.itunes.apple.com";

  const response = await fetch(`${base}/inApps/v1/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Apple transaction lookup failed (${response.status}): ${text}`);
  }

  const json = (await response.json()) as { signedTransactionInfo?: string };
  if (!json.signedTransactionInfo) {
    throw new Error("Apple transaction response missing signedTransactionInfo");
  }

  return decodeJwt(json.signedTransactionInfo) as AppleTransactionPayload;
}

export async function lookupAppleTransaction(
  transactionId: string
): Promise<AppleTransactionPayload> {
  try {
    return await fetchTransaction(transactionId, false);
  } catch (productionError) {
    try {
      return await fetchTransaction(transactionId, true);
    } catch {
      throw productionError;
    }
  }
}
