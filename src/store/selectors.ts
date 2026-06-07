import type {
  Issue,
  Project,
  Decision,
  DecisionRequest,
  BriefSummary,
  ReviewSnapshot,
  ChangeItem,
  MinisterBrief,
  SearchResult,
  GraphNode,
  Agency,
} from "@/types";
import { agencies } from "@/data/mock-data";

export function computeBriefSummary(
  issues: Issue[],
  decisionRequests: DecisionRequest[],
  projects: Project[]
): BriefSummary {
  return {
    decisionsPending: decisionRequests.filter((r) => r.status === "pending").length,
    highImpactBottlenecks: issues.filter(
      (i) => i.blockers.length > 0 && (i.impactLevel === "critical" || i.impactLevel === "high")
    ).length,
    escalationsWaiting: issues.filter(
      (i) => i.status === "blocked" && i.daysWaiting >= 14
    ).length,
    projectsAtRisk: projects.filter(
      (p) => p.status === "blocked" || p.status === "delayed"
    ).length,
  };
}

export function createReviewSnapshot(
  issues: Issue[],
  decisions: Decision[],
  decisionRequests: DecisionRequest[]
): ReviewSnapshot {
  const issueDaysWaiting: Record<string, number> = {};
  const issueStatuses: Record<string, IssueStatus> = {};
  issues.forEach((i) => {
    issueDaysWaiting[i.id] = i.daysWaiting;
    issueStatuses[i.id] = i.status;
  });

  return {
    timestamp: new Date().toISOString(),
    issueDaysWaiting,
    issueStatuses,
    decisionCount: decisions.length,
    completedActionItems: decisions.flatMap((d) => d.actionItems).filter((a) => a.status === "completed").length,
    openBlockerCount: issues.flatMap((i) => i.blockers).length,
    pendingRequestCount: decisionRequests.filter((r) => r.status === "pending").length,
  };
}

type IssueStatus = import("@/types").IssueStatus;

export function computeChangesSinceReview(
  snapshot: ReviewSnapshot | null,
  issues: Issue[],
  decisions: Decision[],
  decisionRequests: DecisionRequest[]
): ChangeItem[] {
  if (!snapshot) {
    return [
      {
        id: "no-snapshot",
        message: "No prior review recorded. Mark review complete to track changes from this point.",
        severity: "neutral",
      },
    ];
  }

  const changes: ChangeItem[] = [];

  issues.forEach((issue) => {
    const prevDays = snapshot.issueDaysWaiting[issue.id];
    if (prevDays !== undefined && issue.daysWaiting > prevDays) {
      const delta = issue.daysWaiting - prevDays;
      changes.push({
        id: `delay-${issue.id}`,
        message: `${issue.name.split("—")[0].trim()} delay increased by ${delta} day${delta > 1 ? "s" : ""}`,
        severity: "critical",
      });
    }
    const prevStatus = snapshot.issueStatuses[issue.id];
    if (prevStatus && prevStatus !== issue.status) {
      changes.push({
        id: `status-${issue.id}`,
        message: `${issue.name.split("—")[0].trim()} status changed from ${prevStatus.replace("_", " ")} to ${issue.status.replace("_", " ")}`,
        severity: issue.status === "resolved" || issue.status === "in_progress" ? "positive" : "warning",
      });
    }
  });

  const currentCompleted = decisions.flatMap((d) => d.actionItems).filter((a) => a.status === "completed").length;
  const completedDelta = currentCompleted - snapshot.completedActionItems;
  if (completedDelta > 0) {
    changes.push({
      id: "actions-completed",
      message: `${completedDelta} action item${completedDelta > 1 ? "s" : ""} completed`,
      severity: "positive",
    });
  }

  const newDecisions = decisions.length - snapshot.decisionCount;
  if (newDecisions > 0) {
    const recent = decisions.slice(0, newDecisions);
    recent.forEach((d) => {
      changes.push({
        id: `decision-${d.id}`,
        message: `New decision recorded: ${d.title}`,
        severity: "neutral",
        timestamp: d.date,
      });
    });
  }

  const blockerDelta = issues.flatMap((i) => i.blockers).length - snapshot.openBlockerCount;
  if (blockerDelta < 0) {
    changes.push({
      id: "blockers-resolved",
      message: `${Math.abs(blockerDelta)} blocker${Math.abs(blockerDelta) > 1 ? "s" : ""} resolved`,
      severity: "positive",
    });
  } else if (blockerDelta > 0) {
    changes.push({
      id: "blockers-new",
      message: `${blockerDelta} new blocker${blockerDelta > 1 ? "s" : ""} reported`,
      severity: "warning",
    });
  }

  const requestDelta = snapshot.pendingRequestCount - decisionRequests.filter((r) => r.status === "pending").length;
  if (requestDelta > 0) {
    changes.push({
      id: "decisions-resolved",
      message: `${requestDelta} pending decision${requestDelta > 1 ? "s" : ""} resolved`,
      severity: "positive",
    });
  }

  const bellandur = issues.find((i) => i.id === "bellandur-flooding");
  if (bellandur && bellandur.status === "in_progress" && bellandur.timeline.some((t) => t.type === "decision_created")) {
    const hasRiskReduction = changes.some((c) => c.id.includes("bellandur"));
    if (!hasRiskReduction && snapshot.issueStatuses["bellandur-flooding"] === "blocked") {
      changes.push({
        id: "bellandur-risk",
        message: "Bellandur flooding risk reduced following desilting authorization",
        severity: "positive",
      });
    }
  }

  if (changes.length === 1 && changes[0].id === "no-snapshot") return changes;
  if (changes.length === 0) {
    changes.push({
      id: "no-changes",
      message: "No material changes since last review",
      severity: "neutral",
    });
  }

  return changes;
}

export function generateMinisterBrief(
  issues: Issue[],
  decisionRequests: DecisionRequest[]
): MinisterBrief {
  const attentionIssues = issues
    .filter(
      (i) =>
        i.status === "blocked" ||
        i.status === "delayed" ||
        i.pendingDecisions.length > 0
    )
    .sort((a, b) => {
      const priority = { critical: 0, high: 1, medium: 2, low: 3 };
      const statusPriority = { blocked: 0, delayed: 1, in_progress: 2, monitoring: 3, resolved: 4 };
      const aScore = priority[a.impactLevel] + statusPriority[a.status];
      const bScore = priority[b.impactLevel] + statusPriority[b.status];
      return aScore - bScore;
    })
    .slice(0, 5);

  const topThree = attentionIssues.slice(0, 3);

  const issueBullets = topThree.map((issue) => {
    const bullets: string[] = [];
    if (issue.daysWaiting > 0) {
      bullets.push(`Waiting ${issue.daysWaiting} days`);
    }
    const topBlocker = issue.blockers[0];
    if (topBlocker) {
      bullets.push(`${topBlocker.agency} response overdue`);
    }
    if (issue.blockers.length === 0 && issue.status === "in_progress") {
      const project = issue.name.includes("Bellandur") ? "Desilting program underway" : "Execution in progress";
      bullets.push(project);
    }
    if (issue.id === "water-leakage" && issue.status === "blocked") {
      bullets.push("1.2 lakh households affected");
    }
    if (issue.id === "building-approval-delays") {
      bullets.push("4,200 applications pending");
    }
    if (bullets.length === 0) {
      bullets.push(issue.description.slice(0, 80) + "...");
    }
    return { id: issue.id, name: issue.name, bullets, status: issue.status, daysWaiting: issue.daysWaiting };
  });

  const topPending = decisionRequests.find((r) => r.status === "pending");
  const topIssue = attentionIssues[0];

  let recommendedDecision: MinisterBrief["recommendedDecision"] = null;
  if (topPending) {
    recommendedDecision = {
      issueName: topPending.issueName,
      action: topPending.options[0]?.title ?? topPending.title,
      issueId: topPending.issueId,
    };
  } else if (topIssue) {
    recommendedDecision = {
      issueName: topIssue.name,
      action: topIssue.recommendation,
      issueId: topIssue.id,
    };
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning Minister." : hour < 17 ? "Good Afternoon Minister." : "Good Evening Minister.";

  return {
    greeting,
    attentionCount: attentionIssues.length,
    issues: issueBullets,
    recommendedDecision,
    generatedAt: new Date().toISOString(),
  };
}

export function buildSearchIndex(
  issues: Issue[],
  projects: Project[],
  decisions: Decision[],
  decisionRequests: DecisionRequest[],
  graphNodes: GraphNode[]
): SearchResult[] {
  const results: SearchResult[] = [];

  issues.forEach((issue) => {
    results.push({
      id: issue.id,
      type: "issue",
      title: issue.name,
      subtitle: `${issue.status.replace("_", " ")} · ${issue.agencies.join(", ")}`,
      href: `/issues/${issue.id}`,
      relatedTo: [...issue.relatedProjects, ...issue.agencies],
      agency: issue.agencies[0],
    });
    issue.blockers.forEach((b) => {
      results.push({
        id: b.id,
        type: "blocker",
        title: b.title,
        subtitle: `${b.agency} · ${b.daysWaiting} days waiting · ${issue.name}`,
        href: `/issues/${issue.id}`,
        relatedTo: [issue.id, b.agency],
        agency: b.agency,
      });
    });
  });

  projects.forEach((p) => {
    const relatedIssue = p.relatedIssues[0];
    results.push({
      id: p.id,
      type: "project",
      title: p.name,
      subtitle: `${p.owner} · ${p.progress}% complete · ${p.status.replace("_", " ")}`,
      href: relatedIssue ? `/issues/${relatedIssue}` : `/search?q=${encodeURIComponent(p.name)}`,
      relatedTo: p.relatedIssues,
      agency: p.owner,
    });
  });

  decisions.forEach((d) => {
    results.push({
      id: d.id,
      type: "decision",
      title: d.title,
      subtitle: `Decision ${d.decisionNumber} · ${d.owner} · ${d.status.replace("_", " ")}`,
      href: `/actions/${d.id}`,
      relatedTo: [d.issueId, d.owner],
      agency: d.owner,
    });
    d.actionItems.forEach((ai) => {
      results.push({
        id: ai.id,
        type: "action_item",
        title: ai.title,
        subtitle: `${ai.agency} · ${ai.status.replace("_", " ")} · Due ${ai.dueDate}`,
        href: `/actions/${d.id}`,
        relatedTo: [d.issueId, ai.agency, d.id],
        agency: ai.agency,
      });
    });
  });

  decisionRequests.filter((r) => r.status === "pending").forEach((r) => {
    results.push({
      id: r.id,
      type: "decision",
      title: r.title,
      subtitle: `Pending · ${r.issueName} · ${r.urgency} urgency`,
      href: `/decisions`,
      relatedTo: [r.issueId],
    });
  });

  agencies.forEach((a) => {
    results.push({
      id: a.id,
      type: "agency",
      title: a.shortName,
      subtitle: a.name,
      href: `/search?q=${encodeURIComponent(a.shortName)}`,
      relatedTo: issues.filter((i) => i.agencies.includes(a.shortName)).map((i) => i.id),
      agency: a.shortName,
    });
  });

  graphNodes.forEach((n) => {
    if (n.issueId) {
      results.push({
        id: `gn-${n.id}`,
        type: "blocker",
        title: n.label,
        subtitle: `${n.agency} · ${n.status} · Dependency node`,
        href: n.issueId ? `/issues/${n.issueId}` : `/graph`,
        relatedTo: [n.issueId ?? "", ...n.blocking, ...n.blockedBy].filter(Boolean),
        agency: n.agency,
      });
    }
  });

  return results;
}

export function searchWithRelations(
  query: string,
  index: SearchResult[]
): { primary: SearchResult[]; related: SearchResult[]; query: string } {
  if (!query.trim()) {
    return { primary: index.slice(0, 8), related: [], query };
  }

  const q = query.toLowerCase();
  const primary = index.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.agency?.toLowerCase().includes(q) ||
      r.relatedTo?.some((rel) => rel.toLowerCase().includes(q))
  );

  const primaryIds = new Set(primary.map((r) => r.id));
  const relatedIds = new Set<string>();

  primary.forEach((r) => {
    r.relatedTo?.forEach((rel) => {
      index.forEach((item) => {
        if (
          !primaryIds.has(item.id) &&
          (item.id === rel ||
            item.title.toLowerCase().includes(rel.toLowerCase()) ||
            item.relatedTo?.includes(r.id))
        ) {
          relatedIds.add(item.id);
        }
      });
    });
  });

  const related = index.filter((r) => relatedIds.has(r.id) && !primaryIds.has(r.id));

  return { primary, related, query };
}

export function getAgencyHead(agencyShortName: string): string {
  const agency = agencies.find(
    (a: Agency) => a.shortName === agencyShortName || a.name.includes(agencyShortName)
  );
  return agency?.head ?? `${agencyShortName} Head`;
}

export function sortTimeline<T extends { date: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
