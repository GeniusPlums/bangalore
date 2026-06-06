"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  FileText,
  Image,
  FileBarChart,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getStatusColor, getProgressColor, formatDate, formatShortDate } from "@/lib/format";
import type { MinisterialDecision } from "@/types";

const evidenceIcons = {
  document: FileText,
  photo: Image,
  report: FileBarChart,
  meeting_minutes: MessageSquare,
};

interface ActionTrackingProps {
  decision: MinisterialDecision;
}

export function ActionTracking({ decision }: ActionTrackingProps) {
  return (
    <div className="space-y-8">
      {/* Decision Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-zinc-800 bg-[#0d1117] p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
              Decision {decision.decisionNumber}
            </p>
            <h2 className="text-xl font-semibold text-zinc-100">{decision.title}</h2>
            <p className="text-sm text-zinc-400 mt-2">
              Selected action: <span className="text-amber-400">{decision.selectedOption}</span>
            </p>
          </div>
          <Badge variant="outline" className={cn("text-[10px] uppercase", getStatusColor(decision.status))}>
            {decision.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Overall Progress</span>
            <span className="text-sm font-mono text-zinc-300">{decision.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${decision.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full", getProgressColor(decision.progress))}
            />
          </div>
        </div>
      </motion.div>

      {/* Flow: Decision → Actions → Agencies → Progress → Outcome */}
      <div className="flex flex-col items-center gap-2 text-zinc-600">
        <ArrowDown className="h-4 w-4" />
      </div>

      {/* Action Items */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
          Action Items
        </h3>
        <div className="space-y-3">
          {decision.actionItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg border border-zinc-800 bg-[#0d1117] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", getStatusColor(item.status))}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Agency: <span className="text-zinc-300">{item.agency}</span></span>
                    <span>Due: <span className="font-mono text-zinc-300">{formatShortDate(item.dueDate)}</span></span>
                  </div>
                  {item.blockers && item.blockers.length > 0 && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-red-400">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                      {item.blockers.join("; ")}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-mono text-zinc-400">{item.progress}%</span>
                  <Progress value={item.progress} className="w-24 h-1.5 mt-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-center gap-2 text-zinc-600">
        <ArrowDown className="h-4 w-4" />
      </div>

      {/* Expected Outcome */}
      <section className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-5">
        <h3 className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-2">
          Expected Outcome
        </h3>
        <p className="text-sm text-zinc-300">{decision.expectedOutcome}</p>
      </section>

      {/* Blockers */}
      {decision.blockers.length > 0 && (
        <section className="rounded-lg border border-red-900/30 bg-red-950/10 p-5">
          <h3 className="text-xs font-medium uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Active Blockers
          </h3>
          <ul className="space-y-2">
            {decision.blockers.map((b, i) => (
              <li key={i} className="text-sm text-red-300/80 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Evidence */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
            Evidence Attachments
          </h3>
          <div className="space-y-2">
            {decision.evidence.map((ev) => {
              const Icon = evidenceIcons[ev.type];
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-4 py-3 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-zinc-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{ev.title}</p>
                    <p className="text-[10px] text-zinc-600">{formatDate(ev.date)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Latest Updates */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
            Latest Updates
          </h3>
          <div className="space-y-3">
            {decision.updates.map((update) => (
              <div key={update.id} className="border-l-2 border-zinc-700 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-zinc-500">{formatDate(update.date)}</span>
                  <span className="text-[10px] text-zinc-600">·</span>
                  <span className="text-[10px] font-medium text-zinc-400">{update.agency}</span>
                </div>
                <p className="text-sm text-zinc-300">{update.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pt-4">
        <Link
          href={`/issues/${decision.issueId}`}
          className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
        >
          View related issue →
        </Link>
      </div>
    </div>
  );
}
