import { prisma } from "@/lib/prisma";

type UpsertUserInput = {
  email: string;
  appleSub?: string;
  emailVerified?: boolean;
};

export async function upsertUserWithConsent(input: UpsertUserInput) {
  const now = new Date();
  const email = input.email.toLowerCase();

  if (input.appleSub) {
    const existingByApple = await prisma.user.findUnique({
      where: { appleSub: input.appleSub },
    });

    if (existingByApple) {
      return prisma.user.update({
        where: { id: existingByApple.id },
        data: {
          email,
          emailVerified: input.emailVerified ? now : existingByApple.emailVerified,
          termsAcceptedAt: now,
          privacyAcceptedAt: now,
        },
      });
    }
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email } });

  if (existingByEmail) {
    if (input.appleSub && existingByEmail.appleSub && existingByEmail.appleSub !== input.appleSub) {
      throw new Error("EMAIL_BOUND_TO_OTHER_APPLE_ID");
    }

    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        appleSub: input.appleSub ?? existingByEmail.appleSub,
        emailVerified: input.emailVerified ? now : existingByEmail.emailVerified,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
      },
    });
  }

  if (input.appleSub) {
    return prisma.user.create({
      data: {
        email,
        appleSub: input.appleSub,
        emailVerified: input.emailVerified ? now : null,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      emailVerified: now,
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      locale: true,
      emailVerified: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
      createdAt: true,
    },
  });
}
