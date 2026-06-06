"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertTriangle, Building2, Gavel, FolderKanban, GitBranch } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { issues, projects, agencies, ministerialDecisions } from "@/data/mock-data";
import { useStore } from "@/store/use-store";
import type { SearchResult } from "@/types";

const typeIcons = {
  issue: AlertTriangle,
  project: FolderKanban,
  decision: Gavel,
  agency: Building2,
  blocker: GitBranch,
};

const typeLabels = {
  issue: "Issues",
  project: "Projects",
  decision: "Decisions",
  agency: "Agencies",
  blocker: "Blockers",
};

function buildSearchIndex(storeDecisions: typeof ministerialDecisions): SearchResult[] {
  const results: SearchResult[] = [];

  issues.forEach((issue) => {
    results.push({
      id: issue.id,
      type: "issue",
      title: issue.name,
      subtitle: `${issue.status} · ${issue.agencies.join(", ")}`,
      href: `/issues/${issue.id}`,
    });
    issue.blockers.forEach((b) => {
      results.push({
        id: b.id,
        type: "blocker",
        title: b.title,
        subtitle: `${b.agency} · ${b.daysWaiting} days waiting`,
        href: `/issues/${issue.id}`,
      });
    });
  });

  projects.forEach((p) => {
    results.push({
      id: p.id,
      type: "project",
      title: p.name,
      subtitle: `${p.owner} · ${p.progress}% complete`,
      href: `/issues/${p.id === "orr-metro-phase" ? "orr-utility-relocation" : p.id === "bellandur-drain-upgrade" ? "bellandur-flooding" : "orr-congestion"}`,
    });
  });

  storeDecisions.forEach((d) => {
    results.push({
      id: d.id,
      type: "decision",
      title: d.title,
      subtitle: `Decision ${d.decisionNumber} · ${d.owner}`,
      href: `/actions/${d.id}`,
    });
  });

  agencies.forEach((a) => {
    results.push({
      id: a.id,
      type: "agency",
      title: a.shortName,
      subtitle: a.name,
      href: `/search?q=${a.shortName}`,
    });
  });

  return results;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const storeDecisions = useStore((s) => s.decisions);

  const index = useMemo(() => buildSearchIndex(storeDecisions), [storeDecisions]);

  const filtered = useMemo(() => {
    if (!query) return index.slice(0, 8);
    const q = query.toLowerCase();
    return index.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.type.includes(q)
    );
  }, [index, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filtered.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search everything...</span>
        <kbd className="ml-4 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search issues, projects, decisions, agencies..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = typeIcons[type as keyof typeof typeIcons];
            return (
              <CommandGroup key={type} heading={typeLabels[type as keyof typeof typeLabels]}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-3"
                  >
                    <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.title}</p>
                      <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function SearchPage({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const router = useRouter();
  const storeDecisions = useStore((s) => s.decisions);

  const index = useMemo(() => buildSearchIndex(storeDecisions), [storeDecisions]);

  const filtered = useMemo(() => {
    if (!query) return index;
    const q = query.toLowerCase();
    return index.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
  }, [index, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filtered.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [filtered]);

  const suggestions = ["ORR", "Bellandur", "Metro", "Water Leakage", "BESCOM", "BBMP", "Decision 2026-14"];

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search institutional memory..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-4 pl-12 pr-4 text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          autoFocus
        />
      </div>

      {!query && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500 mr-2">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => {
        const Icon = typeIcons[type as keyof typeof typeIcons];
        return (
          <section key={type}>
            <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
              <Icon className="h-3.5 w-3.5" />
              {typeLabels[type as keyof typeof typeLabels]} ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center gap-4 rounded-lg border border-zinc-800 bg-[#0d1117] p-4 text-left hover:border-zinc-700 hover:bg-[#111827] transition-all"
                >
                  <Icon className="h-5 w-5 text-zinc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {query && filtered.length === 0 && (
        <p className="text-center text-sm text-zinc-500 py-12">
          No results for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
