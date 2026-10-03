export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-semibold">Relay</span>
          <span className="text-sm text-muted-foreground">Fictional CRM demo</span>
        </div>
      </header>
      {children}
      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-xs text-muted-foreground">
          Relay is a fictional product built as a portfolio piece.
        </div>
      </footer>
    </div>
  );
}
