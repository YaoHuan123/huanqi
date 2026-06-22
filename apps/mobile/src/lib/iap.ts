import { IAP_PRODUCTS } from "@huanqi/shared";
import { NativePurchases, PURCHASE_TYPE } from "@capgo/native-purchases";
import { isIosNative } from "./platform";

export type UnlockProduct = {
  productId: string;
  title: string;
  priceString: string;
};

export type UnlockPurchaseResult = {
  transactionId: string;
  productId: string;
};

function isIapDevMockEnabled(): boolean {
  return import.meta.env.VITE_IAP_DEV_MOCK === "1";
}

export async function getUnlockProduct(): Promise<UnlockProduct | null> {
  if (!isIosNative() || isIapDevMockEnabled()) {
    return {
      productId: IAP_PRODUCTS.unlock,
      title: "Unlock Match",
      priceString: "$0.99",
    };
  }

  try {
    const billing = await NativePurchases.isBillingSupported();
    if (!billing.isBillingSupported) return null;

    const { product } = await NativePurchases.getProduct({
      productIdentifier: IAP_PRODUCTS.unlock,
      productType: PURCHASE_TYPE.INAPP,
    });

    return {
      productId: product.identifier,
      title: product.title,
      priceString: product.priceString,
    };
  } catch {
    return {
      productId: IAP_PRODUCTS.unlock,
      title: "Unlock Match",
      priceString: "$0.99",
    };
  }
}

export async function purchaseUnlockProduct(): Promise<UnlockPurchaseResult> {
  if (!isIosNative()) {
    throw new Error("In-App Purchase is only available on iOS");
  }

  if (isIapDevMockEnabled()) {
    return {
      transactionId: `dev-iap-${crypto.randomUUID()}`,
      productId: IAP_PRODUCTS.unlock,
    };
  }

  const billing = await NativePurchases.isBillingSupported();
  if (!billing.isBillingSupported) {
    throw new Error("In-App Purchases are not available on this device");
  }

  const transaction = await NativePurchases.purchaseProduct({
    productIdentifier: IAP_PRODUCTS.unlock,
    productType: PURCHASE_TYPE.INAPP,
    quantity: 1,
  });

  if (!transaction.transactionId) {
    throw new Error("Purchase completed but no transaction ID was returned");
  }

  return {
    transactionId: transaction.transactionId,
    productId: transaction.productIdentifier || IAP_PRODUCTS.unlock,
  };
}
