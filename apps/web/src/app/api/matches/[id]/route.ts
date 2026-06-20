import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { iosUnlockSchema } from "@/lib/auth/schemas";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { excerpt } from "@/lib/sensation/text";
import {
  assertIosUnlockPurchase,
} from "@/lib/iap/verify-unlock";
import {
  getMatchSide,
  isConfirmed,
  isContactShared,
  isUnlocked,
  otherSide,
  readSharedContact,
  unlockField,
} from "@/lib/match/state";
import { getLoginEmailContact } from "@/lib/user/contact-store";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

async function loadMatch(matchId: string, userId: string) {
  return prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      sensationA: { select: { id: true, body: true, userId: true } },
      sensationB: { select: { id: true, body: true, userId: true } },
    },
  });
}

function buildMatchResponse(
  match: NonNullable<Awaited<ReturnType<typeof loadMatch>>>,
  userId: string,
  loginEmail: string | null
) {
  const side = getMatchSide(match, userId);
  if (!side) throw new Error("INVALID_SIDE");

  const other = otherSide(side);
  const otherSensation = side === "A" ? match.sensationB : match.sensationA;
  const selfSensation = side === "A" ? match.sensationA : match.sensationB;

  const unlocked = isUnlocked(match, side);
  const confirmed = isConfirmed(match, side);
  const shared = isContactShared(match, side);
  const otherShared = isContactShared(match, other);

  const bothShared = shared && otherShared;
  const otherContact = bothShared ? readSharedContact(match, other) : null;

  return {
    id: match.id,
    loginEmail,
    similarityPercent: Math.round(match.similarityScore * 100),
    otherSensation: {
      body: unlocked ? otherSensation.body : excerpt(otherSensation.body, 220),
      full: unlocked,
    },
    selfSensation: { body: selfSensation.body },
    my: {
      unlocked,
      confirmed,
      shared,
      otherShared,
      bothShared,
    },
    otherContact,
    canUnlock: !unlocked,
    canConfirm: unlocked && !confirmed,
    canShare: unlocked && confirmed && !shared,
    waitingForOther: shared && !otherShared,
  };
}

function isIosClient(request: NextRequest): boolean {
  return request.headers.get("x-client-platform") === "ios";
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("GET", `/api/matches/${id}`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const match = await loadMatch(id, auth.session.sub);
  if (!match) return jsonError("Match not found", 404);

  const contact = await getLoginEmailContact(auth.session.sub);
  return jsonOk({
    match: buildMatchResponse(match, auth.session.sub, contact?.email ?? null),
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("POST", `/api/matches/${id}/unlock`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const match = await loadMatch(id, auth.session.sub);
  if (!match) return jsonError("Match not found", 404);

  const side = getMatchSide(match, auth.session.sub);
  if (!side) return jsonError("Match not found", 404);

  const contact = await getLoginEmailContact(auth.session.sub);

  if (isUnlocked(match, side)) {
    return jsonOk({
      message: "Already unlocked",
      match: buildMatchResponse(match, auth.session.sub, contact?.email ?? null),
    });
  }

  if (isIosClient(request)) {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return jsonError("Missing IAP transaction payload", 400);
    }

    const parsed = iosUnlockSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid IAP payload", 400);
    }

    try {
      await assertIosUnlockPurchase(parsed.data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "IAP_TRANSACTION_ALREADY_USED") {
          return jsonError("This purchase was already used", 409);
        }
        if (error.message === "APPLE_IAP_KEYS_NOT_CONFIGURED") {
          return jsonError(
            "Server IAP verification is not configured. Set APPLE_KEY_ID, APPLE_ISSUER_ID, and APPLE_PRIVATE_KEY, or enable IAP_DEV_MOCK=1 for local testing.",
            503
          );
        }
        if (error.message.startsWith("IAP_")) {
          return jsonError("Invalid App Store purchase", 402);
        }
      }
      console.error(error);
      return jsonError("Could not verify App Store purchase", 402);
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          userId: auth.session.sub,
          matchId: match.id,
          productId: parsed.data.productId,
          appleTransactionId: parsed.data.transactionId,
          status: "completed",
        },
      });

      return tx.match.update({
        where: { id: match.id },
        data: { [unlockField(side)]: new Date() },
        include: {
          sensationA: { select: { id: true, body: true, userId: true } },
          sensationB: { select: { id: true, body: true, userId: true } },
        },
      });
    });

    return jsonOk({
      message: "Match unlocked via Apple In-App Purchase",
      match: buildMatchResponse(updated, auth.session.sub, contact?.email ?? null),
    });
  }

  const webBetaFree = process.env.WEB_BETA_FREE_UNLOCK !== "false";
  if (!webBetaFree) {
    return jsonError("Payment is not enabled on web yet.", 402);
  }

  const updated = await prisma.match.update({
    where: { id: match.id },
    data: { [unlockField(side)]: new Date() },
    include: {
      sensationA: { select: { id: true, body: true, userId: true } },
      sensationB: { select: { id: true, body: true, userId: true } },
    },
  });

  return jsonOk({
    message: "Match unlocked (web beta — no charge)",
    match: buildMatchResponse(updated, auth.session.sub, contact?.email ?? null),
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("DELETE", `/api/matches/${id}`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const match = await prisma.match.findFirst({
    where: {
      id,
      OR: [{ userAId: auth.session.sub }, { userBId: auth.session.sub }],
    },
    select: { id: true },
  });

  if (!match) return jsonError("Match not found", 404);

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { matchId: match.id } }),
    prisma.match.delete({ where: { id: match.id } }),
  ]);

  return jsonOk({ message: "Match removed from your list." });
}
