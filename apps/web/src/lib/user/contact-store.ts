import { prisma } from "@/lib/prisma";
import { buildLoginEmailContact } from "@/lib/user/contact-profile";

export async function getLoginEmailContact(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) return null;
  return buildLoginEmailContact(user.email);
}
