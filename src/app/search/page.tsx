import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { PassageCard } from "@/components/passage-card";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let passages: Array<{
    id: number;
    year: number;
    examType: string;
    number: number;
    category: string;
    subject: string;
    content: string | null;
  }> = [];

  if (query.length > 0) {
    passages = await prisma.passages.findMany({
      where: {
        OR: [
          { subject: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ year: "desc" }, { examType: "asc" }, { number: "asc" }],
    });
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-12">
        <form
          action="/search"
          method="GET"
          className="mb-8 flex gap-3"
        >
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="검색어를 입력하세요..."
            className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.98]"
          >
            검색
          </button>
        </form>

        {query && (
          <p className="mb-6 text-sm text-muted-foreground">
            &ldquo;{query}&rdquo; 검색 결과 {passages.length}건
          </p>
        )}

        {query && passages.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="grid gap-4">
            {passages.map((passage) => (
              <PassageCard key={passage.id} passage={passage} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
