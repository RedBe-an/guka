import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";

const EXAM_TYPE_LABELS: Record<string, string> = {
  MOCK_6: "6모",
  MOCK_9: "9모",
  CSAT: "수능",
};

const CATEGORY_LABELS: Record<string, string> = {
  THEORY: "독서론",
  SOCIETY: "사회",
  SCIENCE: "과학",
  HUMAN: "인문",
  TECH: "기술",
  ART: "예술",
  GRAMMAR: "문법",
};

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

type PassagePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PassagePage({ params }: PassagePageProps) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);

  if (Number.isNaN(numericId)) {
    notFound();
  }

  const passage = await prisma.passages.findUnique({
    where: { id: numericId },
  });

  if (!passage) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{passage.year}</Badge>
          <Badge variant="outline">
            {EXAM_TYPE_LABELS[passage.examType] ?? passage.examType}
          </Badge>
          <Badge variant="secondary">
            {CATEGORY_LABELS[passage.category] ?? passage.category}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          {passage.subject}
        </h1>

        {passage.content ? (
          <article className="mt-8 whitespace-pre-line text-foreground/90 leading-8">
            {decodeHtmlEntities(passage.content)}
          </article>
        ) : (
          <p className="mt-8 text-muted-foreground">
            본문이 등록되지 않은 지문입니다.
          </p>
        )}
      </main>
    </div>
  );
}
