import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.passages.count();
  console.log("Passages count:", count);

  const sample = await prisma.passages.findFirst();
  console.log("Sample row:", sample);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
