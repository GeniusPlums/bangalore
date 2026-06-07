import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Issue,
  Project,
  Decision,
  DecisionRequest,
  DecisionOption,
  GraphNode,
  GraphEdge,
  ReviewSnapshot,
  TimelineEvent,
  IssueStatus,
  NodeStatus,
} from "@/types";
import {
  issues as initialIssues,
  projects as initialProjects,
  ministerialDecisions as initialDecisions,
  decisionRequests as initialRequests,
  graphNodes as initialGraphNodes,
  graphEdges as initialGraphEdges,
} from "@/data/mock-data";
import { createReviewSnapshot, getAgencyHead } from "@/store/selectors";

interface AppState {
  issues: Issue[];
  projects: Project[];
  decisions: Decision[];
  decisionRequests: DecisionRequest[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  lastReviewSnapshot: ReviewSnapshot | null;
  activeDecisionRequestId: string | null;
  hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  setActiveDecisionRequestId: (id: string | null) => void;
  recordReviewSnapshot: () => void;
  getIssueById: (id: string) => Issue | undefined;
  createDecision: (
    requestId: string,
    option: DecisionOption
  ) => Decision;
}

function resolveDaysFromOption(optionTitle: string): number {
  if (optionTitle.includes("Defer")) return 14;
  if (optionTitle.includes("Emergency Budget") || optionTitle.includes("Allocate")) return 10;
  if (optionTitle.includes("Task Force")) return 21;
  return 14;
}

function resolveIssueStatus(optionTitle: string): IssueStatus {
  if (optionTitle.includes("Defer")) return "monitoring";
  if (optionTitle.includes("Legal Review")) return "monitoring";
  return "in_progress";
}

function resolveDecisionStatus(optionTitle: string): Decision["status"] {
  if (optionTitle.includes("Defer")) return "deferred";
  return "in_progress";
}

function resolveGraphNodeUpdates(
  issueId: string,
  optionTitle: string,
  nodes: GraphNode[]
): GraphNode[] {
  return nodes.map((node) => {
    if (node.issueId !== issueId && !issueId.includes("orr") && !node.id.includes("utility") && !node.id.includes("bescom")) {
      return node;
    }

    const isORR = issueId === "orr-utility-relocation";
    const isBellandur = issueId === "bellandur-flooding";

    if (isORR) {
      if (optionTitle.includes("Defer")) return node;
      if (node.id === "bescom-approval" || node.id === "utility-relocation") {
        const newStatus: NodeStatus = optionTitle.includes("Emergency Budget") ? "delayed" : "delayed";
        return { ...node, status: newStatus, daysWaiting: Math.max(0, (node.daysWaiting ?? 0) - 7) };
      }
      if (node.id === "metro-construction" && !optionTitle.includes("Defer")) {
        return { ...node, status: "delayed", daysWaiting: Math.max(0, (node.daysWaiting ?? 0) - 5) };
      }
    }

    if (isBellandur && optionTitle.includes("Partial Desilting")) {
      return node;
    }

    return node;
  });
}

function resolveProjectUpdates(issueId: string, optionTitle: string, projects: Project[]): Project[] {
  if (optionTitle.includes("Defer")) return projects;

  return projects.map((p) => {
    if (!p.relatedIssues.includes(issueId)) return p;
    if (p.status === "blocked" && !optionTitle.includes("Defer")) {
      return { ...p, status: "in_progress" as IssueStatus, progress: Math.min(p.progress + 5, 100) };
    }
    return p;
  });
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      issues: initialIssues,
      projects: initialProjects,
      decisions: initialDecisions,
      decisionRequests: initialRequests,
      graphNodes: initialGraphNodes,
      graphEdges: initialGraphEdges,
      lastReviewSnapshot: null,
      activeDecisionRequestId: initialRequests.find((r) => r.status === "pending")?.id ?? null,
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setActiveDecisionRequestId: (id) => set({ activeDecisionRequestId: id }),

      getIssueById: (id) => get().issues.find((i) => i.id === id),

      recordReviewSnapshot: () => {
        const { issues, decisions, decisionRequests } = get();
        set({ lastReviewSnapshot: createReviewSnapshot(issues, decisions, decisionRequests) });
      },

      createDecision: (requestId, option) => {
        const state = get();
        const request = state.decisionRequests.find((r) => r.id === requestId);
        if (!request) throw new Error(`Decision request ${requestId} not found`);

        const issue = state.issues.find((i) => i.id === request.issueId);
        if (!issue) throw new Error(`Issue ${request.issueId} not found`);

        const existing = state.decisions;
        const nextNumber = 15 + existing.filter((d) => d.decisionNumber.startsWith("2026")).length;
        const today = new Date().toISOString().split("T")[0];
        const decisionId = `md-${Date.now()}`;
        const dueDays = resolveDaysFromOption(option.title);

        const actionItems = option.affectedAgencies.map((agency, i) => ({
          id: `ai-new-${Date.now()}-${i}`,
          title:
            option.title === "Escalate To Agency Heads"
              ? `Execute escalation directive — ${agency}`
              : option.title === "Form Joint Task Force"
                ? `Task force participation — ${agency}`
                : option.title === "Allocate Emergency Budget"
                  ? `Emergency budget deployment — ${agency}`
                  : option.title === "Defer"
                    ? `Internal resolution report — ${agency}`
                    : `Execute: ${option.title} — ${agency}`,
          agency,
          owner: getAgencyHead(agency),
          issueId: request.issueId,
          decisionId,
          status: (option.title.includes("Defer") ? "pending" : "pending") as Decision["status"],
          progress: 0,
          dueDate: new Date(Date.now() + (7 + i * 3) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }));

        const newDecision: Decision = {
          id: decisionId,
          decisionNumber: `2026-${nextNumber}`,
          title: request.title,
          date: today,
          owner: option.affectedAgencies[0] ?? "UDD",
          status: resolveDecisionStatus(option.title),
          progress: option.title.includes("Defer") ? 0 : 5,
          dueDate: new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          issueId: request.issueId,
          issueName: request.issueName,
          selectedOption: option.title,
          expectedOutcome: option.expectedImpact,
          blockers: option.title.includes("Defer") ? [`Deferred for ${dueDays} days — agencies to resolve internally`] : [],
          actionItems,
          evidence: [
            {
              id: `ev-new-${Date.now()}`,
              title: `Ministerial Directive MD-2026-${nextNumber}`,
              type: "document" as const,
              date: today,
            },
          ],
          updates: [
            {
              id: `u-new-${Date.now()}`,
              date: today,
              agency: "UDD",
              message: `Ministerial decision recorded: ${option.title}. Directives issued to ${option.affectedAgencies.join(", ")}.`,
            },
          ],
        };

        const timelineEvents: TimelineEvent[] = [
          {
            id: `te-decision-${Date.now()}`,
            date: today,
            title: `Decision recorded: ${option.title}`,
            description: `Ministerial directive ${newDecision.decisionNumber} issued. Owner: ${newDecision.owner}.`,
            agency: "UDD",
            type: "decision_created",
            relatedEntityId: decisionId,
          },
          ...actionItems.map((ai, i) => ({
            id: `te-action-${Date.now()}-${i}`,
            date: today,
            title: `Action assigned: ${ai.title}`,
            description: `Assigned to ${ai.owner} (${ai.agency}). Due ${ai.dueDate}.`,
            agency: ai.agency,
            type: "action_assigned" as const,
            relatedEntityId: ai.id,
          })),
        ];

        if (option.title.includes("Escalate")) {
          timelineEvents.push({
            id: `te-escalation-${Date.now()}`,
            date: today,
            title: "Escalation raised to agency heads",
            description: `Formal escalation issued to ${option.affectedAgencies.join(", ")} with 7-day resolution deadline.`,
            agency: "UDD",
            type: "escalation_raised",
            relatedEntityId: decisionId,
          });
        }

        const newIssueStatus = resolveIssueStatus(option.title);
        timelineEvents.push({
          id: `te-status-${Date.now()}`,
          date: today,
          title: `Issue status changed to ${newIssueStatus.replace("_", " ")}`,
          description: `Following ministerial decision: ${option.title}`,
          agency: "UDD",
          type: "status_changed",
          relatedEntityId: request.issueId,
        });

        const updatedIssues = state.issues.map((i) => {
          if (i.id !== request.issueId) return i;
          return {
            ...i,
            status: newIssueStatus,
            recommendation: option.title.includes("Defer") ? "Under internal review" : "Decision recorded — execution underway",
            pendingDecisions: i.pendingDecisions.filter((pd) => pd.requestId !== requestId),
            timeline: [...timelineEvents, ...i.timeline],
          };
        });

        const updatedRequests = state.decisionRequests.map((r) =>
          r.id === requestId ? { ...r, status: "resolved" as const } : r
        );

        const updatedGraphNodes = resolveGraphNodeUpdates(request.issueId, option.title, state.graphNodes);
        const updatedProjects = resolveProjectUpdates(request.issueId, option.title, state.projects);

        const nextActiveRequest = updatedRequests.find((r) => r.status === "pending");

        set({
          decisions: [newDecision, ...existing],
          issues: updatedIssues,
          decisionRequests: updatedRequests,
          graphNodes: updatedGraphNodes,
          projects: updatedProjects,
          activeDecisionRequestId: nextActiveRequest?.id ?? null,
        });

        return newDecision;
      },
    }),
    {
      name: "bee-governance-store",
      partialize: (state) => ({
        issues: state.issues,
        projects: state.projects,
        decisions: state.decisions,
        decisionRequests: state.decisionRequests,
        graphNodes: state.graphNodes,
        graphEdges: state.graphEdges,
        lastReviewSnapshot: state.lastReviewSnapshot,
        activeDecisionRequestId: state.activeDecisionRequestId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useHydration() {
  const hasHydrated = useStore((s) => s.hasHydrated);
  return hasHydrated;
}
