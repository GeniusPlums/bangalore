"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: number;
  index: number;
  accent?: "red" | "amber" | "blue" | "zinc";
}

const accentStyles = {
  red: "border-red-900/40 bg-red-950/20 text-red-400",
  amber: "border-amber-900/40 bg-amber-950/20 text-amber-400",
  blue: "border-blue-900/40 bg-blue-950/20 text-blue-400",
  zinc: "border-zinc-800/60 bg-zinc-900/40 text-zinc-300",
};

export function SummaryCard({ label, value, index, accent = "zinc" }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        "rounded-lg border p-4",
        accentStyles[accent]
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-widest opacity-70 mb-1">
        {label}
      </p>
      <p className="text-3xl font-semibold font-mono tabular-nums">{value}</p>
    </motion.div>
  );
}
