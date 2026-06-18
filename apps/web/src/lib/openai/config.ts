const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export function getOpenAiBaseUrl(): string {
  return (process.env.OPENAI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function getOpenAiApiKey(): string {
  return process.env.OPENAI_API_KEY?.trim() ?? "";
}

export function getOpenAiChatModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function getOpenAiEmbeddingModel(): string {
  return (
    process.env.OPENAI_EMBEDDING_MODEL?.trim() ||
    "doubao-embedding-large-text-240915"
  );
}

export function isVolcengineArk(): boolean {
  return getOpenAiBaseUrl().includes("volces.com");
}

export function isOpenAiConfigured(): boolean {
  return getOpenAiApiKey().length > 0;
}
