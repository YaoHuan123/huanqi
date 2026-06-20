/** V1 English-only product constants */
export const APP_NAME = "HuanQi";
export const APP_TAGLINE = "Find people who share the same surreal sensation";
export const APP_STORE_SUBTITLE = "Semantic sensation matching";
/** iOS App ID / Sign in with Apple client ID (audience for identity tokens) */
export const APP_BUNDLE_ID = "io.github.YaoHuan123.huanqi";

export const SUPPORTED_LOCALE = "en" as const;
export const SUPPORTED_CONTENT_LANGUAGE = "en" as const;

export const SENSATION_MIN_WORDS = 40;
export const SENSATION_MAX_WORDS = 500;
export const MATCH_THRESHOLD = 0.72;

export const DAILY_SENSATION_LIMIT = 2;
export const DAILY_MATCH_VIEW_LIMIT = 3;

export const IAP_PRODUCTS = {
  unlock: "com.huanqi.unlock.single",
  membership: "com.huanqi.membership.monthly",
} as const;
