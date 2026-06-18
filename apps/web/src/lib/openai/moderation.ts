import {
  getOpenAiApiKey,
  getOpenAiBaseUrl,
  getOpenAiChatModel,
  isVolcengineArk,
} from "@/lib/openai/config";

const BLOCKED_PATTERNS = [
  /\b(kill myself|suicide|self[- ]harm|cut myself)\b/i,
  /\b(bomb|mass shooting|genocide)\b/i,
  /\b(ghost|psychic reading|tarot curse|demon possessed me)\b/i,
];

export function hitsKeywordBlocklist(text: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
}

async function moderateWithChatModel(
  text: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const apiKey = getOpenAiApiKey();
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
            'You moderate first-person "sensation" texts. Block self-harm, suicide, extremism, sexual content, occult recruitment, graphic violence. Reply JSON only: {"allow":true} or {"allow":false,"reason":"..."}',
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: "Moderation service is unavailable." };
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false, reason: "Moderation service is unavailable." };
  }

  try {
    const parsed = JSON.parse(content) as { allow?: boolean; reason?: string };
    if (parsed.allow === true) return { ok: true };
    return {
      ok: false,
      reason:
        parsed.reason?.trim() ||
        "This sensation cannot be published under our content rules.",
    };
  } catch {
    return { ok: false, reason: "Moderation service is unavailable." };
  }
}

async function moderateWithOpenAiApi(
  text: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const apiKey = getOpenAiApiKey();
  const response = await fetch(`${getOpenAiBaseUrl()}/moderations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
  });

  if (!response.ok) {
    return moderateWithChatModel(text);
  }

  const json = (await response.json()) as {
    results: Array<{ flagged: boolean }>;
  };

  const result = json.results[0];
  if (!result?.flagged) return { ok: true };

  return {
    ok: false,
    reason: "This sensation cannot be published under our content rules.",
  };
}

export async function moderateSensation(
  text: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (hitsKeywordBlocklist(text)) {
    return { ok: false, reason: "This sensation cannot be published under our content rules." };
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[dev] OPENAI_API_KEY missing — moderation uses keyword rules only");
      return { ok: true };
    }
    return { ok: false, reason: "Moderation service is unavailable." };
  }

  if (isVolcengineArk()) {
    return moderateWithChatModel(text);
  }

  return moderateWithOpenAiApi(text);
}
