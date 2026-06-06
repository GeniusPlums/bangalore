export type ImpactLevel = "critical" | "high" | "medium" | "low";
export type IssueStatus = "blocked" | "delayed" | "in_progress" | "resolved" | "monitoring";
export type NodeStatus = "blocker" | "delayed" | "completed" | "pending";
export type DecisionStatus = "pending" | "in_progress" | "completed" | "deferred" | "overdue";
export type RiskLevel = "low" | "medium" | "high" | "critical";

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
}

export interface Blocker {
  id: string;
  title: string;
  agency: string;
  daysWaiting: number;
  status: IssueStatus;
}

export interface PendingDecision {
  id: string;
  title: string;
  description: string;
  requiredBy: string;
  urgency: ImpactLevel;
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
}

export interface GraphNode {
  id: string;
  label: string;
  status: NodeStatus;
  agency: string;
  description: string;
  daysWaiting?: number;
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
}

export interface ActionItem {
  id: string;
  title: string;
  agency: string;
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

export interface MinisterialDecision {
  id: string;
  decisionNumber: string;
  title: string;
  date: string;
  owner: string;
  status: DecisionStatus;
  progress: number;
  dueDate: string;
  issueId: string;
  selectedOption: string;
  actionItems: ActionItem[];
  expectedOutcome: string;
  evidence: Evidence[];
  updates: Update[];
  blockers: string[];
}

export interface SearchResult {
  id: string;
  type: "issue" | "project" | "decision" | "agency" | "blocker";
  title: string;
  subtitle: string;
  href: string;
}

export interface BriefSummary {
  decisionsPending: number;
  highImpactBottlenecks: number;
  escalationsWaiting: number;
  projectsAtRisk: number;
}
