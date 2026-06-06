"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Building2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor, getImpactColor } from "@/lib/format";
import type { Issue } from "@/types";

interface IssueCardProps {
  issue: Issue;
  index: number;
}

export function IssueCard({ issue, index }: IssueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Link href={`/issues/${issue.id}`}>
        <div className="group cursor-pointer rounded-lg border border-zinc-800/80 bg-[#0d1117] p-5 transition-all hover:border-zinc-700 hover:bg-[#111827]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                  {issue.name}
                </h3>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] uppercase tracking-wider shrink-0", getStatusColor(issue.status))}
                >
                  {issue.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" />
                  {issue.agencies.join(", ")}
                </span>
                <span className={cn("flex items-center gap-1.5 font-medium", getImpactColor(issue.impactLevel))}>
                  <AlertTriangle className="h-3 w-3" />
                  {issue.impactLevel.toUpperCase()} IMPACT
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {issue.daysWaiting} days waiting
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="rounded border border-amber-800/30 bg-amber-950/20 px-3 py-1.5">
                <p className="text-[10px] uppercase tracking-wider text-amber-600 mb-0.5">Recommendation</p>
                <p className="text-xs font-medium text-amber-400">{issue.recommendation}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
