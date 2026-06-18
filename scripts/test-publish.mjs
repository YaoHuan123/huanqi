import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sample =
  "Sometimes I wake with the taste of copper and the certainty that my body is one inch to the left of where it should be. " +
  "Rooms feel borrowed. Light arrives late, as if apologizing. I walk through conversations already half-finished in my chest.";

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user — sign in first");
    return;
  }

  const sensation = await prisma.sensation.create({
    data: {
      userId: user.id,
      body: sample,
      language: "en",
      wordCount: sample.split(/\s+/).length,
      contentHash: `test-${Date.now()}`,
      moderatedOk: true,
      isPublic: true,
    },
  });

  console.log("OK", sensation.id);
}

main()
  .catch((e) => console.error("FAIL", e))
  .finally(() => prisma.$disconnect());
