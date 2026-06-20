import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import {
  buildEncryptedShareFromEmail,
  getMatchSide,
  isConfirmed,
  isContactShared,
  isUnlocked,
  sharedAtField,
  sharedContactField,
} from "@/lib/match/state";
import { getLoginEmailContact } from "@/lib/user/contact-store";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("POST", `/api/matches/${id}/share-contact`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const match = await prisma.match.findFirst({
    where: {
      id,
      OR: [{ userAId: auth.session.sub }, { userBId: auth.session.sub }],
    },
  });

  if (!match) return jsonError("Match not found", 404);

  const side = getMatchSide(match, auth.session.sub);
  if (!side) return jsonError("Match not found", 404);

  if (!isUnlocked(match, side)) {
    return jsonError("Unlock this match first.", 400);
  }

  if (!isConfirmed(match, side)) {
    return jsonError("Confirm this match before sharing contact.", 400);
  }

  if (isContactShared(match, side)) {
    return jsonOk({ message: "Contact already shared in this match" });
  }

  const contact = await getLoginEmailContact(auth.session.sub);
  if (!contact?.email) {
    return jsonError("No login email found for your account.", 400);
  }

  const encrypted = buildEncryptedShareFromEmail(contact.email);

  await prisma.match.update({
    where: { id: match.id },
    data: {
      [sharedAtField(side)]: new Date(),
      [sharedContactField(side)]: encrypted,
    },
  });

  return jsonOk({
    message: "Your login email is now shared for this match. You will see theirs once they share too.",
    sharedEmail: contact.email,
  });
}
