"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Gavel,
  BookOpen,
  Search,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/search/global-search";

const navItems = [
  { href: "/", label: "Minister Brief", icon: LayoutDashboard },
  { href: "/graph", label: "Dependency Graph", icon: GitBranch },
  { href: "/decisions", label: "Decision Center", icon: Gavel },
  { href: "/ledger", label: "Decision Ledger", icon: BookOpen },
  { href: "/search", label: "Search", icon: Search },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#080b12]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800/80 bg-[#0a0e17]">
        <div className="border-b border-zinc-800/80 px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-amber-700/40 bg-amber-950/30">
              <Shield className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                GoK · UDD
              </p>
              <p className="text-xs font-semibold text-zinc-200">BEE</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-zinc-800/60 text-amber-400"
                    : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
              KG
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-200">Krishna Byre Gowda</p>
              <p className="text-[10px] text-zinc-500">Minister, UDD</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0a0e17]/80 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="font-mono">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
