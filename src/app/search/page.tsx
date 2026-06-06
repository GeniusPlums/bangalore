"use client";

import { use } from "react";
import { SearchPage } from "@/components/search/global-search";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function SearchRoutePage({ searchParams }: PageProps) {
  const { q } = use(searchParams);

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Search Everything</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Government institutional memory — issues, projects, decisions, agencies, and blockers.
        </p>
      </div>
      <SearchPage initialQuery={q} />
    </div>
  );
}
