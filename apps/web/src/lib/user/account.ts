import { prisma } from "@/lib/prisma";

/** Permanently delete user and all related data (cascade). */
export async function deleteUserAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
