import { StatsCards } from "@/components/admin/StatsCards";

export default function AdminOverviewPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pipeline overview</h1>
      <StatsCards />
    </main>
  );
}
