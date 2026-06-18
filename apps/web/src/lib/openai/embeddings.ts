import { createHash } from "crypto";
import {
  getOpenAiApiKey,
  getOpenAiBaseUrl,
  getOpenAiEmbeddingModel,
} from "@/lib/openai/config";

const embeddingCache = new Map<string, number[]>();

function cacheKey(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex");
}

export function embeddingToBytes(values: number[]): Buffer {
  return Buffer.from(new Float32Array(values).buffer);
}

export function bytesToEmbedding(bytes: Uint8Array | Buffer): number[] {
  const buffer = bytes instanceof Buffer ? bytes : Buffer.from(bytes);
  const array = new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength / 4
  );
  return Array.from(array);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function embedText(text: string): Promise<number[]> {
  const key = cacheKey(text);
  const cached = embeddingCache.get(key);
  if (cached) return cached;

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(`${getOpenAiBaseUrl()}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAiEmbeddingModel(),
      input: text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to generate embedding: ${response.status} ${detail}`);
  }

  const json = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };

  const embedding = json.data[0]?.embedding;
  if (!embedding) {
    throw new Error("Empty embedding response");
  }

  embeddingCache.set(key, embedding);
  return embedding;
}
