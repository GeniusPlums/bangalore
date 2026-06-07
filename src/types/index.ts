export type ImpactLevel = "critical" | "high" | "medium" | "low";
export type IssueStatus = "blocked" | "delayed" | "in_progress" | "resolved" | "monitoring";
export type NodeStatus = "blocker" | "delayed" | "completed" | "pending";
export type DecisionStatus = "pending" | "in_progress" | "completed" | "deferred" | "overdue";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TimelineEventType =
  | "decision_created"
  | "action_assigned"
  | "escalation_raised"
  | "blocker_reported"
  | "status_changed";

export interface Agency {
  id: string;
  name: string;
  shortName: string;
  jurisdiction: "state" | "city" | "parastatal";
  head: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  agency?: string;
  type: TimelineEventType;
  relatedEntityId?: string;
}

export interface Blocker {
  id: string;
  title: string;
  agency: string;
  issueId: string;
  daysWaiting: number;
  status: IssueStatus;
}

export interface PendingDecision {
  id: string;
  title: string;
  description: string;
  requiredBy: string;
  urgency: ImpactLevel;
  requestId?: string;
}

export interface Issue {
  id: string;
  name: string;
  status: IssueStatus;
  impactLevel: ImpactLevel;
  daysWaiting: number;
  agencies: string[];
  recommendation: string;
  description: string;
  economicImpact: { low: number; base: number; high: number; unit: string };
  affectedCitizens: number;
  relatedProjects: string[];
  relatedGraphNodes: string[];
  blockers: Blocker[];
  pendingDecisions: PendingDecision[];
  timeline: TimelineEvent[];
  location?: string;
}

export interface Project {
  id: string;
  name: string;
  status: IssueStatus;
  owner: string;
  progress: number;
  dueDate: string;
  budget: string;
  relatedIssues: string[];
}

export interface Dependency {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: "blocks" | "depends_on" | "impacts";
}

export interface GraphNode {
  id: string;
  label: string;
  status: NodeStatus;
  agency: string;
  owner: string;
  description: string;
  daysWaiting?: number;
  issueId?: string;
  dependencies: string[];
  blockedBy: string[];
  blocking: string[];
  impacts: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  estimatedResolution: string;
  affectedAgencies: string[];
  riskLevel: RiskLevel;
}

export interface DecisionRequest {
  id: string;
  title: string;
  issueId: string;
  issueName: string;
  description: string;
  options: DecisionOption[];
  requestedDate: string;
  urgency: ImpactLevel;
  status: "pending" | "resolved";
}

export interface ActionItem {
  id: string;
  title: string;
  agency: string;
  owner: string;
  issueId: string;
  decisionId: string;
  status: DecisionStatus;
  progress: number;
  dueDate: string;
  blockers?: string[];
}

export interface Evidence {
  id: string;
  title: string;
  type: "document" | "photo" | "report" | "meeting_minutes";
  date: string;
}

export interface Update {
  id: string;
  date: string;
  agency: string;
  message: string;
}

export interface Decision {
  id: string;
  decisionNumber: string;
  title: string;
  date: string;
  owner: string;
  status: DecisionStatus;
  progress: number;
  dueDate: string;
  issueId: string;
  issueName: string;
  selectedOption: string;
  actionItems: ActionItem[];
  expectedOutcome: string;
  evidence: Evidence[];
  updates: Update[];
  blockers: string[];
}

/** @deprecated Use Decision — kept for gradual migration */
export type MinisterialDecision = Decision;

export interface SearchResult {
  id: string;
  type: "issue" | "project" | "decision" | "agency" | "blocker" | "action_item";
  title: string;
  subtitle: string;
  href: string;
  relatedTo?: string[];
  agency?: string;
}

export interface BriefSummary {
  decisionsPending: number;
  highImpactBottlenecks: number;
  escalationsWaiting: number;
  projectsAtRisk: number;
}

export interface ReviewSnapshot {
  timestamp: string;
  issueDaysWaiting: Record<string, number>;
  issueStatuses: Record<string, IssueStatus>;
  decisionCount: number;
  completedActionItems: number;
  openBlockerCount: number;
  pendingRequestCount: number;
}

export interface ChangeItem {
  id: string;
  message: string;
  severity: "critical" | "warning" | "positive" | "neutral";
  timestamp?: string;
}

export interface MinisterBrief {
  greeting: string;
  attentionCount: number;
  issues: Array<{
    id: string;
    name: string;
    bullets: string[];
    status: IssueStatus;
    daysWaiting: number;
  }>;
  recommendedDecision: {
    issueName: string;
    action: string;
    issueId: string;
  } | null;
  generatedAt: string;
}
