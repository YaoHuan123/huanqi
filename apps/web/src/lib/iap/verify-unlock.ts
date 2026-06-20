import { APP_BUNDLE_ID, IAP_PRODUCTS } from "@huanqi/shared";
import { prisma } from "@/lib/prisma";
import { lookupAppleTransaction } from "@/lib/iap/app-store-api";

export type IosUnlockProof = {
  transactionId: string;
  productId: string;
};

function isIapDevMockEnabled(): boolean {
  const v = (process.env.IAP_DEV_MOCK ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export async function assertIosUnlockPurchase(input: IosUnlockProof) {
  const existing = await prisma.order.findUnique({
    where: { appleTransactionId: input.transactionId },
  });
  if (existing) {
    throw new Error("IAP_TRANSACTION_ALREADY_USED");
  }

  if (
    isIapDevMockEnabled() &&
    process.env.NODE_ENV !== "production" &&
    input.transactionId.startsWith("dev-iap-")
  ) {
    if (input.productId !== IAP_PRODUCTS.unlock) {
      throw new Error("IAP_INVALID_PRODUCT");
    }
    return;
  }

  let payload;
  try {
    payload = await lookupAppleTransaction(input.transactionId);
  } catch (error) {
    if (error instanceof Error && error.message === "APPLE_IAP_KEYS_NOT_CONFIGURED") {
      throw new Error("APPLE_IAP_KEYS_NOT_CONFIGURED");
    }
    throw error;
  }

  const productId = payload.productId;
  const bundleId = payload.bundleId;
  const txId = payload.transactionId ?? payload.originalTransactionId;

  if (productId !== IAP_PRODUCTS.unlock || input.productId !== IAP_PRODUCTS.unlock) {
    throw new Error("IAP_INVALID_PRODUCT");
  }

  if (bundleId && bundleId !== APP_BUNDLE_ID) {
    throw new Error("IAP_INVALID_BUNDLE");
  }

  if (txId && txId !== input.transactionId) {
    throw new Error("IAP_TRANSACTION_MISMATCH");
  }
}

export async function recordIosUnlockOrder(input: {
  userId: string;
  matchId: string;
  transactionId: string;
  productId: string;
}) {
  return prisma.order.create({
    data: {
      userId: input.userId,
      matchId: input.matchId,
      productId: input.productId,
      appleTransactionId: input.transactionId,
      status: "completed",
    },
  });
}
