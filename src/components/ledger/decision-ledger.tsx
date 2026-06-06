"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor, getProgressColor, formatShortDate } from "@/lib/format";
import { useStore } from "@/store/use-store";

export function DecisionLedger() {
  const decisions = useStore((s) => s.decisions);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return decisions;
    const q = filter.toLowerCase();
    return decisions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.decisionNumber.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q)
    );
  }, [decisions, filter]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Filter decisions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9 bg-zinc-900/50 border-zinc-800"
        />
      </div>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              {["Decision", "Date", "Owner", "Status", "Progress", "Due Date"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-zinc-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr
                key={d.id}
                className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
              >
                <td className="px-4 py-4">
                  <Link href={`/actions/${d.id}`} className="group">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {d.title}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-600 mt-0.5">
                      {d.decisionNumber}
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-4 text-xs font-mono text-zinc-400">
                  {formatShortDate(d.date)}
                </td>
                <td className="px-4 py-4 text-xs text-zinc-300">{d.owner}</td>
                <td className="px-4 py-4">
                  <Badge variant="outline" className={cn("text-[10px] uppercase", getStatusColor(d.status))}>
                    {d.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", getProgressColor(d.progress))}
                        style={{ width: `${d.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-400">{d.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs font-mono text-zinc-400">
                  {formatShortDate(d.dueDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
