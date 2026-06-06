"use client";

import Link from "next/link";
import { decisionRequests } from "@/data/mock-data";
import { DecisionCenterPanel } from "@/components/decisions/decision-center";

export default function DecisionsPage() {
  const primaryRequest = decisionRequests[0];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Decision Center</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review pending decisions and record ministerial directives.
        </p>
      </div>

      {decisionRequests.length > 1 && (
        <div className="flex gap-2 mb-6">
          {decisionRequests.map((dr, i) => (
            <span
              key={dr.id}
              className={`rounded border px-3 py-1 text-xs ${
                i === 0
                  ? "border-amber-700/50 bg-amber-950/20 text-amber-400"
                  : "border-zinc-800 text-zinc-500"
              }`}
            >
              {dr.title}
            </span>
          ))}
        </div>
      )}

      <DecisionCenterPanel request={primaryRequest} />

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 mb-3">Other pending decisions:</p>
        {decisionRequests.slice(1).map((dr) => (
          <div
            key={dr.id}
            className="rounded border border-zinc-800 bg-zinc-900/30 p-4 mb-3"
          >
            <p className="text-sm font-medium text-zinc-300">{dr.title}</p>
            <p className="text-xs text-zinc-500 mt-1">{dr.issueName}</p>
            <Link href={`/issues/${dr.issueId}`} className="text-xs text-amber-500 mt-2 inline-block">
              View issue →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
