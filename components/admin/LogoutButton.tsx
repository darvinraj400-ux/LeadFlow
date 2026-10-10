"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={logout}
      disabled={busy}
      className="rounded-[8px] border-border-strong bg-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground"
    >
      Logout
    </Button>
  );
}
