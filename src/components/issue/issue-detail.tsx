"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Users,
  IndianRupee,
  AlertTriangle,
  Clock,
  Gavel,
  FolderKanban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getStatusColor, getImpactColor, formatDate, formatCitizens } from "@/lib/format";
import { projects } from "@/data/mock-data";
import type { Issue } from "@/types";

interface IssueDetailProps {
  issue: Issue;
}

export function IssueDetailView({ issue }: IssueDetailProps) {
  const relatedProjects = projects.filter((p) => issue.relatedProjects.includes(p.id));

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Minister Brief
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">{issue.name}</h1>
            {issue.location && (
              <p className="flex items-center gap-1.5 text-sm text-zinc-500 mt-2">
                <MapPin className="h-3.5 w-3.5" />
                {issue.location}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={cn("text-[10px] uppercase", getStatusColor(issue.status))}>
              {issue.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] uppercase", getImpactColor(issue.impactLevel))}>
              {issue.impactLevel} impact
            </Badge>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mt-4 max-w-3xl leading-relaxed">{issue.description}</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-[#0d1117] p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1.5">
            <IndianRupee className="h-3 w-3" /> Economic Impact Range
          </p>
          <p className="text-lg font-mono text-zinc-200">
            ₹{issue.economicImpact.low}–{issue.economicImpact.high} {issue.economicImpact.unit}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Base estimate: ₹{issue.economicImpact.base} {issue.economicImpact.unit}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-[#0d1117] p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1.5">
            <Users className="h-3 w-3" /> Affected Citizens
          </p>
          <p className="text-lg font-mono text-zinc-200">{formatCitizens(issue.affectedCitizens)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-[#0d1117] p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Days Waiting
          </p>
          <p className="text-lg font-mono text-red-400">{issue.daysWaiting}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Blockers */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Open Blockers ({issue.blockers.length})
          </h3>
          <div className="space-y-3">
            {issue.blockers.map((blocker) => (
              <div
                key={blocker.id}
                className="rounded-lg border border-red-900/20 bg-red-950/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-200">{blocker.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{blocker.agency}</p>
                  </div>
                  <span className="text-xs font-mono text-red-400 shrink-0">{blocker.daysWaiting}d</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Decisions */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <Gavel className="h-3.5 w-3.5" />
            Pending Decisions ({issue.pendingDecisions.length})
          </h3>
          {issue.pendingDecisions.length > 0 ? (
            <div className="space-y-3">
              {issue.pendingDecisions.map((pd) => (
                <Link
                  key={pd.id}
                  href="/decisions"
                  className="block rounded-lg border border-amber-900/20 bg-amber-950/10 p-4 hover:border-amber-800/40 transition-colors"
                >
                  <p className="text-sm font-medium text-amber-400">{pd.title}</p>
                  <p className="text-xs text-zinc-400 mt-1">{pd.description}</p>
                  <p className="text-[10px] text-zinc-500 mt-2">Required by {formatDate(pd.requiredBy)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No pending decisions for this issue.</p>
          )}
        </section>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <FolderKanban className="h-3.5 w-3.5" />
            Related Projects
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedProjects.map((project) => (
              <div key={project.id} className="rounded-lg border border-zinc-800 bg-[#0d1117] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-zinc-200">{project.name}</p>
                  <Badge variant="outline" className={cn("text-[10px]", getStatusColor(project.status))}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{project.owner}</span>
                  <span className="font-mono">{project.progress}%</span>
                  <span>{project.budget}</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-600"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Separator className="bg-zinc-800" />

      {/* Timeline */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">
          Recent Activity Timeline
        </h3>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />
          <div className="space-y-6">
            {issue.timeline.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative pl-8"
              >
                <div className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-zinc-700 bg-[#0d1117]" />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-zinc-500">{formatDate(event.date)}</span>
                    {event.agency && (
                      <span className="text-[10px] text-zinc-600">{event.agency}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-200">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-zinc-500 mt-1">{event.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex gap-4 pt-4">
        <Link
          href="/graph"
          className="rounded border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          View Dependency Graph
        </Link>
        <Link
          href="/decisions"
          className="rounded bg-amber-700 px-4 py-2 text-xs text-white hover:bg-amber-600 transition-colors"
        >
          Go to Decision Center
        </Link>
      </div>
    </div>
  );
}
