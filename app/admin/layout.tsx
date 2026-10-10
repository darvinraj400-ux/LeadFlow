import Link from 'next/link';
import { LogoutButton } from '@/components/admin/LogoutButton';

// Note: /admin access control is enforced in middleware.ts (layouts cannot
// read the request path, so gating there would redirect-loop /admin/login).
// This layout renders the dark admin shell + header.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="glass-nav sticky top-0 z-10">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="font-display text-sm font-semibold tracking-tight"
            >
              Relay Admin
            </Link>
            <nav className="flex items-center gap-5 text-sm text-foreground-muted">
              <Link href="/admin" className="hover:text-foreground">
                Overview
              </Link>
              <Link href="/admin/leads" className="hover:text-foreground">
                Leads
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
