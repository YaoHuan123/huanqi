import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { moderateSensation } from "@/lib/openai/moderation";
import { runMatchingForSensation } from "@/lib/matching/engine";
import { publishSensationSchema } from "@/lib/sensation/publish-schema";
import { assertDailySensationLimit, getDailySensationUsage } from "@/lib/sensation/limits";
import {
  countWords,
  DAILY_SENSATION_LIMIT,
  hashSensationBody,
  isLikelyEnglish,
  validateWordCount,
} from "@/lib/sensation/text";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  logRequest("POST", "/api/sensations");

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = publishSensationSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request");
    }

    const text = parsed.data.body.trim();
    const wordCheck = validateWordCount(text);
    if (!wordCheck.ok) return jsonError(wordCheck.message);

    if (!isLikelyEnglish(text)) {
      return jsonError("Please write your sensation in English for this version.");
    }

    await assertDailySensationLimit(auth.session.sub);

    const contentHash = hashSensationBody(text);
    const duplicate = await prisma.sensation.findFirst({
      where: { contentHash },
      select: { id: true },
    });
    if (duplicate) {
      return jsonError("This sensation looks identical to an existing record.", 409);
    }

    const moderation = await moderateSensation(text);
    if (!moderation.ok) {
      return jsonError(moderation.reason);
    }

    const sensation = await prisma.sensation.create({
      data: {
        userId: auth.session.sub,
        body: text,
        language: "en",
        wordCount: countWords(text),
        contentHash,
        moderatedOk: true,
        isPublic: true,
      },
    });

    let matching = { matchesCreated: 0 };
    try {
      matching = await runMatchingForSensation({
        id: sensation.id,
        userId: sensation.userId,
        body: sensation.body,
      });
    } catch (error) {
      console.error("Matching failed:", error);
      return jsonOk({
        sensation: { id: sensation.id, wordCount: sensation.wordCount },
        matching: {
          matchesCreated: 0,
          warning: "Published, but matching is unavailable until OPENAI_API_KEY is configured.",
        },
      });
    }

    return jsonOk({
      sensation: { id: sensation.id, wordCount: sensation.wordCount },
      matching,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DAILY_SENSATION_LIMIT") {
      return jsonError(
        `You can publish up to ${DAILY_SENSATION_LIMIT} sensations per day. Try again tomorrow.`,
        429
      );
    }
    console.error(error);
    const message =
      error instanceof Error && error.message.includes("P2022")
        ? "Database schema out of date. Run: npm run db:push"
        : error instanceof Error
          ? error.message
          : "Failed to publish sensation";
    return jsonError(message, 500);
  }
}

export async function GET(request: NextRequest) {
  logRequest("GET", "/api/sensations");

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const sensations = await prisma.sensation.findMany({
    where: { userId: auth.session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      body: true,
      wordCount: true,
      createdAt: true,
      moderatedOk: true,
    },
  });

  const quota = await getDailySensationUsage(auth.session.sub);

  return jsonOk({ sensations, quota });
}
