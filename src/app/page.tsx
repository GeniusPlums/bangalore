"use client";

import { motion } from "framer-motion";
import { SummaryCard } from "@/components/brief/summary-card";
import { IssueCard } from "@/components/brief/issue-card";
import { briefSummary, issues } from "@/data/mock-data";

export default function MinisterBriefPage() {
  const topIssues = issues.slice(0, 5);

  return (
    <div className="p-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-600 mb-2">
          Government of Karnataka · Urban Development Department
        </p>
        <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight">
          Bengaluru Execution Engine
        </h1>
        <p className="text-lg text-zinc-400 mt-2">Today&apos;s Decision Brief</p>
        <div className="mt-6 rounded-lg border border-amber-900/30 bg-amber-950/10 px-5 py-4">
          <p className="text-sm text-amber-200/90">
            What requires your attention today?
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <SummaryCard label="Decisions Pending" value={briefSummary.decisionsPending} index={0} accent="amber" />
        <SummaryCard label="High Impact Bottlenecks" value={briefSummary.highImpactBottlenecks} index={1} accent="red" />
        <SummaryCard label="Escalations Waiting" value={briefSummary.escalationsWaiting} index={2} accent="red" />
        <SummaryCard label="Projects At Risk" value={briefSummary.projectsAtRisk} index={3} accent="blue" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Top {topIssues.length} Issues Requiring Attention
          </h2>
          <span className="text-[10px] font-mono text-zinc-600">
            Updated {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="space-y-3">
          {topIssues.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
