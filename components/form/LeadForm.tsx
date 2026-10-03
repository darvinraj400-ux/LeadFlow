'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { leadFormSchema, toFieldErrors } from '@/lib/leads/schema';
import { SuccessState } from '@/components/form/SuccessState';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; name: string; referenceCode: string };

const EMPTY_FIELDS = { name: '', email: '', company: '', role: '', message: '' };

export function LeadForm() {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  function setField<K extends keyof typeof EMPTY_FIELDS>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setFields(EMPTY_FIELDS);
    setFieldErrors({});
    setStatus({ kind: 'idle' });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === 'submitting') return;

    // Client pre-check with the shared schema; the server re-validates.
    const checked = leadFormSchema.safeParse(fields);
    if (!checked.success) {
      setFieldErrors(toFieldErrors(checked.error));
      setStatus({ kind: 'error', message: 'Please fix the highlighted fields.' });
      return;
    }
    setFieldErrors({});
    setStatus({ kind: 'submitting' });

    let res: Response;
    try {
      res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checked.data),
      });
    } catch {
      setStatus({ kind: 'error', message: 'Could not reach the server. Try again.' });
      return;
    }

    let data: {
      ok?: boolean;
      reference_code?: string;
      error?: string;
      fields?: Record<string, string>;
    } | null = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok && data?.ok && data.reference_code) {
      setStatus({ kind: 'success', name: checked.data.name, referenceCode: data.reference_code });
      return;
    }
    if (res.status === 400 && data?.fields) {
      setFieldErrors(data.fields);
    }
    setStatus({
      kind: 'error',
      message:
        data?.error ??
        (res.status === 429
          ? 'Too many submissions. Please try again later.'
          : 'Something went wrong. Try again.'),
    });
  }

  if (status.kind === 'success') {
    return (
      <SuccessState
        name={status.name}
        referenceCode={status.referenceCode}
        onReset={reset}
      />
    );
  }

  const submitting = status.kind === 'submitting';
  const err = (key: string) => fieldErrors[key];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-name">Name</Label>
        <Input
          id="lead-name"
          value={fields.name}
          onChange={(e) => setField('name', e.target.value)}
          disabled={submitting}
          autoComplete="name"
        />
        {err('name') ? <p className="text-xs text-red-400">{err('name')}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-email">Work email</Label>
        <Input
          id="lead-email"
          type="email"
          value={fields.email}
          onChange={(e) => setField('email', e.target.value)}
          disabled={submitting}
          autoComplete="email"
        />
        {err('email') ? <p className="text-xs text-red-400">{err('email')}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-company">Company (optional)</Label>
          <Input
            id="lead-company"
            value={fields.company}
            onChange={(e) => setField('company', e.target.value)}
            disabled={submitting}
            autoComplete="organization"
          />
          {err('company') ? <p className="text-xs text-red-400">{err('company')}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-role">Role (optional)</Label>
          <Input
            id="lead-role"
            value={fields.role}
            onChange={(e) => setField('role', e.target.value)}
            disabled={submitting}
            autoComplete="organization-title"
          />
          {err('role') ? <p className="text-xs text-red-400">{err('role')}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-message">What are you looking for?</Label>
        <Textarea
          id="lead-message"
          rows={4}
          value={fields.message}
          onChange={(e) => setField('message', e.target.value)}
          disabled={submitting}
        />
        {err('message') ? <p className="text-xs text-red-400">{err('message')}</p> : null}
      </div>
      {status.kind === 'error' ? (
        <p role="alert" className="text-sm text-red-400">
          {status.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Get a demo'}
      </Button>
    </form>
  );
}
