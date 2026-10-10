// Ambient hero background — pure CSS. Three radial cyan washes drift on
// 20–40s loops behind the content. No WebGL, no canvas, no libraries.
export function HeroAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.35]"
    >
      <div
        className="animate-drift-a absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, rgba(34,211,238,0.15), transparent 60%)',
        }}
      />
      <div
        className="animate-drift-b absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 82% 30%, rgba(34,211,238,0.15), transparent 60%)',
        }}
      />
      <div
        className="animate-drift-c absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 85%, rgba(34,211,238,0.15), transparent 60%)',
        }}
      />
    </div>
  );
}
