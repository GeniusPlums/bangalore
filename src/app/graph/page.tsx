"use client";

import { DependencyGraph } from "@/components/graph/dependency-graph";

export default function GraphPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800/80 px-8 py-5 shrink-0">
        <h1 className="text-xl font-semibold text-zinc-100">Dependency Graph</h1>
        <p className="text-sm text-zinc-500 mt-1">
          ORR corridor dependency chain — click nodes for details. Red indicates blockers.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <DependencyGraph />
      </div>
    </div>
  );
}
