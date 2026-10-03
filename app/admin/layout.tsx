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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="text-sm font-semibold tracking-tight text-white"
            >
              Relay Admin
            </Link>
            <nav className="flex items-center gap-5 text-sm text-zinc-400">
              <Link href="/admin" className="hover:text-white">
                Overview
              </Link>
              <Link href="/admin/leads" className="hover:text-white">
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
