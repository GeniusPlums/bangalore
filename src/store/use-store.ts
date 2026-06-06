import { create } from "zustand";
import type { MinisterialDecision, DecisionOption } from "@/types";
import { ministerialDecisions as initialDecisions } from "@/data/mock-data";

interface AppState {
  decisions: MinisterialDecision[];
  selectedIssueId: string | null;
  searchOpen: boolean;
  setSelectedIssueId: (id: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  createDecision: (
    issueId: string,
    issueName: string,
    option: DecisionOption,
    decisionRequestTitle: string
  ) => MinisterialDecision;
}

export const useStore = create<AppState>((set, get) => ({
  decisions: initialDecisions,
  selectedIssueId: null,
  searchOpen: false,
  setSelectedIssueId: (id) => set({ selectedIssueId: id }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  createDecision: (issueId, issueName, option, decisionRequestTitle) => {
    const existing = get().decisions;
    const nextNumber = 15 + existing.filter((d) => d.decisionNumber.startsWith("2026")).length;
    const newDecision: MinisterialDecision = {
      id: `md-${Date.now()}`,
      decisionNumber: `2026-${nextNumber}`,
      title: decisionRequestTitle,
      date: new Date().toISOString().split("T")[0],
      owner: option.affectedAgencies[0] ?? "UDD",
      status: "in_progress",
      progress: 5,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      issueId,
      selectedOption: option.title,
      expectedOutcome: option.expectedImpact,
      blockers: [],
      actionItems: option.affectedAgencies.map((agency, i) => ({
        id: `ai-new-${Date.now()}-${i}`,
        title: `Execute: ${option.title} — ${agency}`,
        agency,
        status: "pending" as const,
        progress: 0,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })),
      evidence: [
        {
          id: `ev-new-${Date.now()}`,
          title: `Ministerial Directive MD-2026-${nextNumber}`,
          type: "document" as const,
          date: new Date().toISOString().split("T")[0],
        },
      ],
      updates: [
        {
          id: `u-new-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          agency: "UDD",
          message: `Ministerial decision recorded: ${option.title}. Directives issued to ${option.affectedAgencies.join(", ")}.`,
        },
      ],
    };
    set({ decisions: [newDecision, ...existing] });
    return newDecision;
  },
}));
