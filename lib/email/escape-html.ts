// Minimal HTML escaper for values interpolated into email HTML bodies.
// The plain-text parts stay unescaped; React escapes JSX by default, but
// Resend `html` is raw — so every lead-controlled or AI-influenced value
// must pass through here before interpolation.
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}
