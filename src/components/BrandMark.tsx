export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="1" y="1" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="24" r="2.5" fill="var(--accent)" />
      <circle cx="24" cy="8" r="2" stroke="var(--accent2)" strokeWidth="1.5" />
      <path
        d="M8 24 L14 18 L20 14 L24 8"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M14 18 L14 10 L20 14"
        stroke="var(--accent2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="10" r="1.75" fill="var(--text-muted)" />
    </svg>
  );
}
