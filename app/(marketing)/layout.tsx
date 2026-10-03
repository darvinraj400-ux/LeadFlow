// Thin wrapper — the Relay landing owns its own nav and footer, and there
// is no chat surface on this product.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
