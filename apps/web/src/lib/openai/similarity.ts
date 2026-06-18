import { createHash } from "crypto";
import {
  getOpenAiApiKey,
  getOpenAiBaseUrl,
  getOpenAiChatModel,
  isVolcengineArk,
} from "@/lib/openai/config";

const pairCache = new Map<string, number>();

function pairKey(a: string, b: string): string {
  const ha = createHash("sha256").update(a.trim()).digest("hex");
  const hb = createHash("sha256").update(b.trim()).digest("hex");
  return ha < hb ? `${ha}:${hb}` : `${hb}:${ha}`;
}

export function useLlmSimilarity(): boolean {
  return (
    process.env.HUANQI_SIMILARITY_MODE === "llm" ||
    (process.env.HUANQI_SIMILARITY_MODE !== "embedding" && isVolcengineArk())
  );
}

/** Semantic similarity 0..1 via chat model (Volcengine Ark fallback). */
export async function scoreSimilarityWithLlm(textA: string, textB: string): Promise<number> {
  const cacheKey = pairKey(textA, textB);
  const cached = pairCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const apiKey = getOpenAiApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch(`${getOpenAiBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAiChatModel(),
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Compare two first-person surreal bodily/perceptual sensation texts. Return JSON only: {"score":0.0} where score is semantic similarity from 0.0 to 1.0. Ignore writing quality; focus on experiential resonance.',
        },
        {
          role: "user",
          content: JSON.stringify({ textA, textB }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LLM similarity failed: ${response.status} ${detail.slice(0, 200)}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM similarity response");

  const parsed = JSON.parse(content) as { score?: number };
  const score = Math.min(1, Math.max(0, Number(parsed.score)));
  if (Number.isNaN(score)) throw new Error("Invalid LLM similarity score");

  pairCache.set(cacheKey, score);
  return score;
}

export async function scoreBidirectionalSimilarity(
  textA: string,
  textB: string
): Promise<{ forward: number; reverse: number; average: number }> {
  const forward = await scoreSimilarityWithLlm(textA, textB);
  const reverse = await scoreSimilarityWithLlm(textB, textA);
  return { forward, reverse, average: (forward + reverse) / 2 };
}
