import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatCitizens(count: number): string {
  if (count >= 10000000) return `${(count / 10000000).toFixed(1)} Cr`;
  if (count >= 100000) return `${(count / 100000).toFixed(1)} L`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "blocked":
    case "blocker":
    case "overdue":
    case "critical":
      return "text-red-400 bg-red-950/50 border-red-800/50";
    case "delayed":
    case "pending":
    case "medium":
    case "high":
      return "text-amber-400 bg-amber-950/50 border-amber-800/50";
    case "completed":
    case "resolved":
    case "low":
      return "text-emerald-400 bg-emerald-950/50 border-emerald-800/50";
    case "in_progress":
    case "monitoring":
      return "text-blue-400 bg-blue-950/50 border-blue-800/50";
    default:
      return "text-zinc-400 bg-zinc-900/50 border-zinc-700/50";
  }
}

export function getImpactColor(level: string): string {
  switch (level) {
    case "critical":
      return "text-red-400";
    case "high":
      return "text-amber-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-emerald-400";
    default:
      return "text-zinc-400";
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-amber-500";
  if (progress >= 25) return "bg-orange-500";
  return "bg-red-500";
}
