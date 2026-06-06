"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";
import { useStore } from "@/store/use-store";
import { ActionTracking } from "@/components/actions/action-tracking";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ActionTrackingPage({ params }: PageProps) {
  const { id } = use(params);
  const decision = useStore((s) => s.decisions.find((d) => d.id === id));

  if (!decision) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Decision not found.</p>
        <Link href="/ledger" className="text-amber-500 text-sm mt-4 inline-block">
          Back to Decision Ledger
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/ledger"
        className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Decision Ledger
      </Link>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Action Tracking</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor execution of ministerial directives across responsible agencies.
        </p>
      </div>
      <ActionTracking decision={decision} />
    </div>
  );
}
