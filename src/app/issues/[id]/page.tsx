import { IssueDetailPageClient } from "@/components/issue/issue-detail-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="p-8 max-w-5xl">
      <IssueDetailPageClient id={id} />
    </div>
  );
}
