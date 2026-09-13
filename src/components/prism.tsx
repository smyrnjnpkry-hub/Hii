export function PrismMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="16" fill="var(--color-fg)" />
      <polygon points="32,10 54,50 10,50" fill="none" stroke="var(--color-bg)" strokeWidth="2.2" />
      <path d="M32 18 L46 46 H18 Z" fill="color-mix(in oklab, var(--color-bg) 12%, transparent)" />
      <g strokeWidth="2.4" strokeLinecap="round">
        <line x1="32" y1="22" x2="32" y2="44" stroke="var(--color-spiritual)" />
        <line x1="28" y1="26" x2="24" y2="44" stroke="var(--color-physical)" />
        <line x1="36" y1="26" x2="40" y2="44" stroke="var(--color-intellectual)" />
        <line x1="24" y1="30" x2="16" y2="44" stroke="var(--color-relational)" />
        <line x1="40" y1="30" x2="48" y2="44" stroke="var(--color-emotional)" />
      </g>
    </svg>
  );
}
