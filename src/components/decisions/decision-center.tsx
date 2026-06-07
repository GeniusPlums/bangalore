"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Building2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/use-store";
import type { DecisionRequest, DecisionOption } from "@/types";
import { useRouter } from "next/navigation";

interface DecisionCenterProps {
  request: DecisionRequest;
}

const riskColors: Record<string, string> = {
  low: "text-emerald-400 border-emerald-800/50 bg-emerald-950/30",
  medium: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  high: "text-red-400 border-red-800/50 bg-red-950/30",
  critical: "text-red-400 border-red-800/50 bg-red-950/30",
};

export function DecisionCenterPanel({ request }: DecisionCenterProps) {
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const createDecision = useStore((s) => s.createDecision);
  const router = useRouter();

  if (request.status === "resolved") {
    return (
      <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-200">Decision recorded for this request</p>
        <p className="text-xs text-zinc-500 mt-1">View execution status in the Decision Ledger.</p>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!selectedOption) return;
    const decision = createDecision(request.id, selectedOption);
    setConfirmOpen(false);
    setCreated(true);
    setTimeout(() => {
      router.push(`/actions/${decision.id}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-800/30 bg-amber-950/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-600 mb-1">
              Decision Required
            </p>
            <h2 className="text-xl font-semibold text-zinc-100">{request.title}</h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{request.description}</p>
          </div>
          <Badge variant="outline" className="text-red-400 border-red-800/50 bg-red-950/30 uppercase text-[10px]">
            {request.urgency}
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Related issue: <span className="text-zinc-300">{request.issueName}</span>
        </p>
      </div>

      <div className="grid gap-4">
        {request.options.map((option, i) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => {
              setSelectedOption(option);
              setConfirmOpen(true);
            }}
            className={cn(
              "cursor-pointer rounded-lg border border-zinc-800 bg-[#0d1117] p-5 transition-all hover:border-zinc-600 hover:bg-[#111827]",
              selectedOption?.id === option.id && "border-amber-700/50"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 text-xs font-mono text-zinc-400">
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-100">{option.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 ml-9 mb-4">{option.description}</p>

                <div className="ml-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Expected Impact</p>
                    <p className="text-xs text-zinc-300">{option.expectedImpact}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Resolution
                    </p>
                    <p className="text-xs font-mono text-zinc-300">{option.estimatedResolution}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Ownership
                    </p>
                    <p className="text-xs text-zinc-300">{option.affectedAgencies.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Risk
                    </p>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", riskColors[option.riskLevel])}>
                      {option.riskLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-[#0d1117] border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Confirm Ministerial Decision</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will record a ministerial decision, assign action items with ownership, update issue status, and add entries to the activity timeline and decision ledger.
            </DialogDescription>
          </DialogHeader>
          {selectedOption && (
            <div className="rounded border border-zinc-800 bg-zinc-900/50 p-4 my-2">
              <p className="text-sm font-semibold text-amber-400">{selectedOption.title}</p>
              <p className="text-xs text-zinc-400 mt-2">{selectedOption.description}</p>
              <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                <span>Resolution: {selectedOption.estimatedResolution}</span>
                <span>Risk: {selectedOption.riskLevel}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-amber-700 hover:bg-amber-600 text-white">
              Record Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {created && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="rounded-lg border border-emerald-800/50 bg-[#0d1117] p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-zinc-100">Ministerial Decision Recorded</p>
            <p className="text-sm text-zinc-400 mt-2">Action items assigned. Redirecting to execution tracking...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
