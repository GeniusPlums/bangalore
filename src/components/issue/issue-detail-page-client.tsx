"use client";

import { notFound } from "next/navigation";
import { IssueDetailView } from "@/components/issue/issue-detail";
import { useStore } from "@/store/use-store";

export function IssueDetailPageClient({ id }: { id: string }) {
  const issue = useStore((s) => s.issues.find((i) => i.id === id));
  const projects = useStore((s) => s.projects);

  if (!issue) notFound();

  return <IssueDetailView issue={issue} projects={projects} />;
}
