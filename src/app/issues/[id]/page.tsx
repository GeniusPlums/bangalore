import { notFound } from "next/navigation";
import { issues } from "@/data/mock-data";
import { IssueDetailView } from "@/components/issue/issue-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const issue = issues.find((i) => i.id === id);
  if (!issue) notFound();

  return (
    <div className="p-8 max-w-5xl">
      <IssueDetailView issue={issue} />
    </div>
  );
}
