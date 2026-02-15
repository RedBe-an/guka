import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  const textsDir = join(process.cwd(), "public", "kice", "texts");
  const files = await readdir(textsDir);
  const txtFiles = files.filter((f) => f.endsWith(".txt"));

  console.log(`Found ${txtFiles.length} text files`);

  let updated = 0;
  let skipped = 0;

  for (const file of txtFiles) {
    const id = Number.parseInt(file.replace(".txt", ""), 10);
    if (Number.isNaN(id)) {
      console.warn(`Skipping invalid filename: ${file}`);
      skipped++;
      continue;
    }

    const content = await readFile(join(textsDir, file), "utf-8");

    try {
      await prisma.passages.update({
        where: { id },
        data: { content: content.trim() },
      });
      updated++;
    } catch {
      console.warn(`No DB row for id ${id}, skipping`);
      skipped++;
    }
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
