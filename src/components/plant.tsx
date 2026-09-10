import { cn } from "@/lib/utils";

export function Plant({
  level,
  className,
  size = 88,
}: {
  level: number;
  className?: string;
  size?: number;
}) {
  const l = Math.max(0, Math.min(6, level));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <ellipse cx="44" cy="78" rx="22" ry="5" fill="currentColor" opacity="0.08" />
      <path d="M42 78 V38" stroke="#7A5A32" strokeWidth="3" strokeLinecap="round" />
      {l >= 1 && (
        <path d="M42 64 C28 60 24 50 30 44 C38 52 40 56 42 60" fill="#7BC47F" />
      )}
      {l >= 2 && (
        <path d="M43 58 C56 54 62 46 58 38 C48 44 45 50 43 56" fill="#4CAF6A" />
      )}
      {l >= 3 && (
        <>
          <circle cx="34" cy="40" r="12" fill="#3FA35A" />
          <circle cx="52" cy="36" r="13" fill="#4CAF6A" />
        </>
      )}
      {l >= 4 && (
        <>
          <circle cx="44" cy="28" r="14" fill="#2F9E6B" />
          <circle cx="28" cy="34" r="10" fill="#62C57A" />
          <circle cx="60" cy="34" r="10" fill="#3FA35A" />
        </>
      )}
      {l >= 5 && (
        <>
          <circle cx="44" cy="22" r="16" fill="#2F9E6B" />
          <circle cx="24" cy="30" r="12" fill="#4CAF6A" />
          <circle cx="64" cy="30" r="12" fill="#3FA35A" />
          <circle cx="36" cy="18" r="8" fill="#62C57A" />
        </>
      )}
      {l >= 6 && (
        <>
          <circle cx="16" cy="48" r="9" fill="#4CAF6A" />
          <circle cx="72" cy="48" r="9" fill="#3FA35A" />
          <circle cx="44" cy="14" r="8" fill="#7BC47F" />
        </>
      )}
      {l === 0 && (
        <ellipse cx="44" cy="70" rx="6" ry="8" fill="#C4A574" />
      )}
    </svg>
  );
}

export function SunMark({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden>
      <circle cx="56" cy="44" r="28" fill="#f5c400" />
    </svg>
  );
}
