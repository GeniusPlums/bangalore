"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/use-store";
import { generateMinisterBrief } from "@/store/selectors";
import { formatDate } from "@/lib/format";

export function MinisterBriefPanel() {
  const [visible, setVisible] = useState(false);
  const issues = useStore((s) => s.issues);
  const decisionRequests = useStore((s) => s.decisionRequests);

  const brief = generateMinisterBrief(issues, decisionRequests);

  const handleExport = () => {
    setVisible(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <>
      <div className="mb-8">
        <Button
          onClick={() => setVisible(true)}
          className="bg-amber-800 hover:bg-amber-700 text-white"
        >
          Generate Today&apos;s Brief
        </Button>
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mb-10"
          >
            <div
              id="minister-brief-export"
              className="rounded-lg border border-zinc-700 bg-[#0d1117] overflow-hidden print:border-black print:bg-white print:text-black"
            >
              <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between print:border-gray-300">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-600 print:text-gray-600">
                    Government of Karnataka · Urban Development Department
                  </p>
                  <h2 className="text-lg font-semibold text-zinc-100 print:text-black mt-1">
                    Executive Briefing
                  </h2>
                  <p className="text-xs text-zinc-500 print:text-gray-600 mt-0.5">
                    {formatDate(brief.generatedAt.split("T")[0])} · Bengaluru Execution Engine
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-zinc-700 no-print"
                >
                  <FileDown className="h-3.5 w-3.5 mr-1.5" />
                  Export PDF
                </Button>
              </div>

              <div className="px-6 py-6 space-y-6">
                <p className="text-base text-zinc-200 print:text-black font-medium">
                  {brief.greeting}
                </p>
                <p className="text-sm text-zinc-300 print:text-gray-800">
                  {brief.attentionCount} issue{brief.attentionCount !== 1 ? "s" : ""} require attention.
                </p>

                <div className="space-y-5">
                  {brief.issues.map((issue) => (
                    <div key={issue.id} className="border-l-2 border-amber-800/50 pl-4 print:border-gray-400">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="text-sm font-semibold text-zinc-100 print:text-black hover:text-amber-400 print:no-underline"
                      >
                        {issue.name}
                      </Link>
                      <ul className="mt-2 space-y-1">
                        {issue.bullets.map((bullet, i) => (
                          <li key={i} className="text-xs text-zinc-400 print:text-gray-700 flex items-start gap-2">
                            <span className="text-zinc-600 print:text-gray-500 mt-0.5">•</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {brief.recommendedDecision && (
                  <div className="rounded border border-amber-900/40 bg-amber-950/20 px-5 py-4 print:border-gray-400 print:bg-gray-50">
                    <p className="text-[10px] uppercase tracking-widest text-amber-600 print:text-gray-600 mb-2">
                      Recommended Decision
                    </p>
                    <p className="text-sm text-zinc-200 print:text-black">
                      {brief.recommendedDecision.action}{" "}
                      <span className="text-zinc-400 print:text-gray-600">—</span>{" "}
                      <Link
                        href={`/issues/${brief.recommendedDecision.issueId}`}
                        className="text-amber-400 print:text-black print:font-semibold"
                      >
                        {brief.recommendedDecision.issueName}
                      </Link>
                    </p>
                    <Link
                      href="/decisions"
                      className="inline-flex items-center gap-1 text-xs text-amber-500 mt-3 no-print hover:text-amber-400"
                    >
                      Proceed to Decision Center
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
