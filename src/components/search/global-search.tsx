"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  AlertTriangle,
  Building2,
  Gavel,
  FolderKanban,
  GitBranch,
  ListChecks,
  Link2,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStore } from "@/store/use-store";
import { buildSearchIndex, searchWithRelations } from "@/store/selectors";
import type { SearchResult } from "@/types";

const typeIcons = {
  issue: AlertTriangle,
  project: FolderKanban,
  decision: Gavel,
  agency: Building2,
  blocker: GitBranch,
  action_item: ListChecks,
};

const typeLabels = {
  issue: "Issues",
  project: "Projects",
  decision: "Decisions",
  agency: "Agencies",
  blocker: "Blockers",
  action_item: "Action Items",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const issues = useStore((s) => s.issues);
  const projects = useStore((s) => s.projects);
  const decisions = useStore((s) => s.decisions);
  const decisionRequests = useStore((s) => s.decisionRequests);
  const graphNodes = useStore((s) => s.graphNodes);

  const index = useMemo(
    () => buildSearchIndex(issues, projects, decisions, decisionRequests, graphNodes),
    [issues, projects, decisions, decisionRequests, graphNodes]
  );

  const { primary, related } = useMemo(
    () => searchWithRelations(query, index),
    [index, query]
  );

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    primary.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [primary]);

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
        <span>Search governance records...</span>
        <kbd className="ml-4 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search issues, decisions, agencies, blockers..."
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
          {related.length > 0 && (
            <CommandGroup heading="Related">
              {related.slice(0, 5).map((item) => {
                const Icon = typeIcons[item.type as keyof typeof typeIcons];
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-3 opacity-80"
                  >
                    <Link2 className="h-3 w-3 text-zinc-600 shrink-0" />
                    <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.title}</p>
                      <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function KnowledgeGraphResult({
  item,
  onSelect,
  isRelated,
}: {
  item: SearchResult;
  onSelect: () => void;
  isRelated?: boolean;
}) {
  const Icon = typeIcons[item.type as keyof typeof typeIcons];
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
        isRelated
          ? "border-zinc-800/50 bg-zinc-900/20 hover:border-zinc-700 ml-6"
          : "border-zinc-800 bg-[#0d1117] hover:border-zinc-700 hover:bg-[#111827]"
      }`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border ${isRelated ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-700 bg-zinc-900"}`}>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-200">{item.title}</p>
          <span className="text-[9px] uppercase tracking-wider text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded">
            {item.type.replace("_", " ")}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">{item.subtitle}</p>
        {item.relatedTo && item.relatedTo.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.relatedTo.slice(0, 4).map((rel) => (
              <span key={rel} className="text-[9px] text-zinc-600 border border-zinc-800/80 rounded px-1.5 py-0.5">
                {rel}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

export function SearchPage({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const router = useRouter();
  const issues = useStore((s) => s.issues);
  const projects = useStore((s) => s.projects);
  const decisions = useStore((s) => s.decisions);
  const decisionRequests = useStore((s) => s.decisionRequests);
  const graphNodes = useStore((s) => s.graphNodes);

  const index = useMemo(
    () => buildSearchIndex(issues, projects, decisions, decisionRequests, graphNodes),
    [issues, projects, decisions, decisionRequests, graphNodes]
  );

  const { primary, related } = useMemo(
    () => searchWithRelations(query, index),
    [index, query]
  );

  const suggestions = ["ORR", "Bellandur", "Metro", "Water Leakage", "BESCOM", "BBMP", "Decision 2026-14"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1">
          Institutional Memory
        </h2>
        <p className="text-sm text-zinc-600">
          Cross-linked governance records — issues, decisions, agencies, and execution status.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search across governance records..."
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

      {query && primary.length > 0 && (
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">
            Direct Matches ({primary.length})
          </h3>
          <div className="space-y-2">
            {primary.map((item) => (
              <KnowledgeGraphResult
                key={item.id}
                item={item}
                onSelect={() => router.push(item.href)}
              />
            ))}
          </div>
        </section>
      )}

      {query && related.length > 0 && (
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5" />
            Connected Records ({related.length})
          </h3>
          <div className="space-y-2">
            {related.map((item) => (
              <KnowledgeGraphResult
                key={item.id}
                item={item}
                isRelated
                onSelect={() => router.push(item.href)}
              />
            ))}
          </div>
        </section>
      )}

      {query && primary.length === 0 && related.length === 0 && (
        <p className="text-center text-sm text-zinc-500 py-12">
          No governance records found for &ldquo;{query}&rdquo;
        </p>
      )}

      {!query && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-4">
          {index.slice(0, 9).map((item) => (
            <KnowledgeGraphResult
              key={item.id}
              item={item}
              onSelect={() => router.push(item.href)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
