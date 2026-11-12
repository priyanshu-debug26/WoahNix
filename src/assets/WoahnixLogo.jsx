export function WoahnixLogo({ className = 'w-7 h-7' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        fill="var(--bg-elevated)"
        stroke="var(--border-subtle)"
        strokeWidth="1.5"
      />
      <path
        d="M8.5 11L12 21L16 13.5L20 21L23.5 11"
        stroke="var(--accent-primary)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="9" r="1.75" fill="var(--accent-primary)" />
    </svg>
  );
}

