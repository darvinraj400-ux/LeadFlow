import { LeadDetail } from "@/components/admin/LeadDetail";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Lead detail</h1>
      <LeadDetail id={id} />
    </main>
  );
}
