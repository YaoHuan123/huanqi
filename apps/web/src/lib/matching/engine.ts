import { MATCH_THRESHOLD } from "@huanqi/shared";
import { prisma } from "@/lib/prisma";
import { bytesToEmbedding, cosineSimilarity, embedText, embeddingToBytes } from "@/lib/openai/embeddings";
import { useLlmSimilarity, scoreBidirectionalSimilarity } from "@/lib/openai/similarity";
import { isVolcengineArk } from "@/lib/openai/config";

type PublishedSensation = {
  id: string;
  userId: string;
  body: string;
};

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

async function getBlockedUserIds(userId: string): Promise<Set<string>> {
  const blocks = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: { blockerId: true, blockedId: true },
  });

  const ids = new Set<string>();
  for (const block of blocks) {
    ids.add(block.blockerId === userId ? block.blockedId : block.blockerId);
  }
  return ids;
}

async function getLatestCandidates(excludeUserId: string, blocked: Set<string>) {
  const sensations = await prisma.sensation.findMany({
    where: {
      isPublic: true,
      moderatedOk: true,
      userId: { notIn: [excludeUserId, ...Array.from(blocked)] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      body: true,
      embedding: true,
      createdAt: true,
    },
  });

  const latestByUser = new Map<string, (typeof sensations)[number]>();
  for (const sensation of sensations) {
    if (!latestByUser.has(sensation.userId)) {
      latestByUser.set(sensation.userId, sensation);
    }
  }
  return Array.from(latestByUser.values());
}

async function computeSimilarity(
  sourceBody: string,
  candidate: { body: string; embedding: Uint8Array | Buffer | null }
) {
  if (useLlmSimilarity()) {
    return scoreBidirectionalSimilarity(sourceBody, candidate.body);
  }

  const sourceEmbedding = await embedText(sourceBody);
  if (!candidate.embedding) {
    return { forward: 0, reverse: 0, average: 0 };
  }

  const targetEmbedding = bytesToEmbedding(new Uint8Array(candidate.embedding));
  const forward = cosineSimilarity(sourceEmbedding, targetEmbedding);
  const reverse = cosineSimilarity(targetEmbedding, sourceEmbedding);
  return { forward, reverse, average: (forward + reverse) / 2 };
}

export async function runMatchingForSensation(published: PublishedSensation) {
  if (!useLlmSimilarity()) {
    const sourceEmbedding = await embedText(published.body);
    await prisma.sensation.update({
      where: { id: published.id },
      data: { embedding: new Uint8Array(embeddingToBytes(sourceEmbedding)) },
    });
  } else if (isVolcengineArk()) {
    console.info(JSON.stringify({ event: "matching_mode", mode: "llm", provider: "volcengine" }));
  }

  const blocked = await getBlockedUserIds(published.userId);
  const candidates = await getLatestCandidates(published.userId, blocked);
  const createdMatches: string[] = [];

  for (const candidate of candidates) {
    if (candidate.id === published.id) continue;

    const { forward, reverse, average: score } = await computeSimilarity(
      published.body,
      candidate
    );

    if (forward < MATCH_THRESHOLD || reverse < MATCH_THRESHOLD) {
      continue;
    }

    const [userAId, userBId] = orderedPair(published.userId, candidate.userId);
    const sensationAId = userAId === published.userId ? published.id : candidate.id;
    const sensationBId = userBId === published.userId ? published.id : candidate.id;

    const existing = await prisma.match.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: { similarityScore: score, sensationAId, sensationBId },
      });
      continue;
    }

    const match = await prisma.match.create({
      data: {
        userAId,
        userBId,
        sensationAId,
        sensationBId,
        similarityScore: score,
      },
    });

    createdMatches.push(match.id);
    const scorePct = Math.round(score * 100);

    await prisma.notification.createMany({
      data: [
        {
          userId: published.userId,
          type: "match",
          title: "New resonance match",
          body: `Someone else's sensation resonated at ${scorePct}%. Open Matches to unlock contact.`,
          matchId: match.id,
        },
        {
          userId: candidate.userId,
          type: "match",
          title: "New resonance match",
          body: `A new sensation resonated with yours at ${scorePct}%. Open Matches to unlock contact.`,
          matchId: match.id,
        },
      ],
    });
  }

  return { matchesCreated: createdMatches.length };
}
