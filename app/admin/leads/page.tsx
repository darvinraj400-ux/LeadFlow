import { LeadTable } from "@/components/admin/LeadTable";

export default function AdminLeadsPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
      <LeadTable />
    </main>
  );
}
