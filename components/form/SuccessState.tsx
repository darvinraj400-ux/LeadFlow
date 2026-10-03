import { Button } from '@/components/ui/button';

// Fixed success copy — not AI-generated.
export function SuccessState({
  name,
  referenceCode,
  onReset,
}: {
  name: string;
  referenceCode: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-zinc-50">Thanks, {name}.</p>
      <p className="text-sm leading-relaxed text-zinc-400">
        Your reference number is{' '}
        <span className="font-mono font-medium text-zinc-100">{referenceCode}</span>.
        <br />
        We&apos;ll be in touch within one business day.
      </p>
      <Button type="button" variant="link" onClick={onReset} className="self-start px-0">
        Submit another
      </Button>
    </div>
  );
}
