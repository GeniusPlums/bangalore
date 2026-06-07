"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/use-store";
import { computeChangesSinceReview } from "@/store/selectors";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

const severityStyles = {
  critical: "border-red-900/30 bg-red-950/10 text-red-300",
  warning: "border-amber-900/30 bg-amber-950/10 text-amber-300",
  positive: "border-emerald-900/30 bg-emerald-950/10 text-emerald-300",
  neutral: "border-zinc-800 bg-zinc-900/30 text-zinc-400",
};

export function ChangesSinceReview() {
  const issues = useStore((s) => s.issues);
  const decisions = useStore((s) => s.decisions);
  const decisionRequests = useStore((s) => s.decisionRequests);
  const lastReviewSnapshot = useStore((s) => s.lastReviewSnapshot);
  const recordReviewSnapshot = useStore((s) => s.recordReviewSnapshot);

  const changes = computeChangesSinceReview(lastReviewSnapshot, issues, decisions, decisionRequests);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            What Changed Since Last Review
          </h2>
          {lastReviewSnapshot && (
            <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last review: {formatDate(lastReviewSnapshot.timestamp.split("T")[0])}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={recordReviewSnapshot}
          className="border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200"
        >
          Mark Review Complete
        </Button>
      </div>

      <div className="space-y-2">
        {changes.map((change, i) => (
          <motion.div
            key={change.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
              severityStyles[change.severity]
            )}
          >
            <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            {change.message}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
