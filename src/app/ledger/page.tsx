"use client";

import { DecisionLedger } from "@/components/ledger/decision-ledger";

export default function LedgerPage() {
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Decision Ledger</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Complete record of ministerial decisions — institutional memory of governance actions.
        </p>
      </div>
      <DecisionLedger />
    </div>
  );
}
