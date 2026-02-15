import { TilesDemo } from "@/components/background/tiles";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0">
        <TilesDemo />
      </div>
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Guka
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          기출 주제, 유형, 핵심 키워드를 한번에 찾아보세요.
        </p>

        <form action="/search" method="GET" className="mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <label htmlFor="main-search" className="sr-only">
            Search
          </label>
          <input
            id="main-search"
            name="q"
            type="text"
            required
            placeholder="브레턴우즈 체제..."
            className="h-14 flex-1 rounded-full border border-border bg-background px-6 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20" />
          <button
            type="submit"
            className="h-14 rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.98]"
          >
            검색
          </button>
        </form>
      </main>
    </div>
  );
}
