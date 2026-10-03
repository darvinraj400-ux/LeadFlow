import { LeadForm } from "@/components/form/LeadForm";

export default function MarketingHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
      <section className="flex flex-col gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          Relay — a fictional CRM product
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Turn every inquiry into a qualified lead
        </h1>
        <p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">
          Relay scores and routes inbound leads with AI-assisted
          qualification. This demo page hosts the public lead form (Layer 1
          stub — no logic yet).
        </p>
      </section>
      <section className="max-w-xl">
        <LeadForm />
      </section>
    </main>
  );
}
