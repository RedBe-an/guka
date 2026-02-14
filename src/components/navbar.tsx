import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-foreground"
        >
          Guka
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-1 sm:flex">
          <NavLink href="/subjects">과목</NavLink>
          <NavLink href="/years">연도별</NavLink>
          <NavLink href="/keywords">키워드</NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-border bg-background/60 p-2 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-accent hover:text-foreground"
            aria-label="검색"
          >
            <Search className="size-4" />
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}
