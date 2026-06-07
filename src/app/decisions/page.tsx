"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { DecisionCenterPanel } from "@/components/decisions/decision-center";
import { useStore } from "@/store/use-store";

export default function DecisionsPage() {
  const decisionRequests = useStore((s) => s.decisionRequests);
  const activeDecisionRequestId = useStore((s) => s.activeDecisionRequestId);
  const setActiveDecisionRequestId = useStore((s) => s.setActiveDecisionRequestId);

  const pendingRequests = decisionRequests.filter((r) => r.status === "pending");
  const activeRequest =
    decisionRequests.find((r) => r.id === activeDecisionRequestId) ??
    pendingRequests[0] ??
    decisionRequests[0];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Decision Center</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review pending decisions and record ministerial directives with assigned ownership.
        </p>
      </div>

      {decisionRequests.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {decisionRequests.map((dr) => (
            <button
              key={dr.id}
              onClick={() => setActiveDecisionRequestId(dr.id)}
              className={cn(
                "rounded border px-3 py-1 text-xs transition-colors",
                dr.id === activeRequest?.id
                  ? "border-amber-700/50 bg-amber-950/20 text-amber-400"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-700",
                dr.status === "resolved" && "opacity-50"
              )}
            >
              {dr.title}
              {dr.status === "resolved" && " ✓"}
            </button>
          ))}
        </div>
      )}

      {activeRequest && <DecisionCenterPanel request={activeRequest} />}

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 mb-3">Other decision requests:</p>
        {decisionRequests
          .filter((dr) => dr.id !== activeRequest?.id)
          .map((dr) => (
            <div
              key={dr.id}
              className="rounded border border-zinc-800 bg-zinc-900/30 p-4 mb-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-300">{dr.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{dr.issueName}</p>
                </div>
                <Badge status={dr.status} />
              </div>
              <div className="flex gap-3 mt-2">
                {dr.status === "pending" && (
                  <button
                    onClick={() => setActiveDecisionRequestId(dr.id)}
                    className="text-xs text-amber-500 hover:text-amber-400"
                  >
                    Review →
                  </button>
                )}
                <Link href={`/issues/${dr.issueId}`} className="text-xs text-zinc-500 hover:text-zinc-300">
                  View issue →
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "text-[10px] uppercase px-2 py-0.5 rounded border",
        status === "pending"
          ? "border-amber-800/50 text-amber-400 bg-amber-950/20"
          : "border-emerald-800/50 text-emerald-400 bg-emerald-950/20"
      )}
    >
      {status}
    </span>
  );
}
