/* ============================================================================
   Type-set wordmark. Deliberately NOT Evolve's logo file — a recognisable
   lowercase teal wordmark with a simple drawn mark, per the brief.
   ============================================================================ */

export function Wordmark({
  className = "",
  light = false,
}: {
  className?: string;
  /** Light treatment for dark backgrounds (white wordmark, lime mark). */
  light?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        aria-hidden="true"
        className="flex-none"
      >
        {/* A simple two-arc loop echoing Evolve's swirl, drawn from scratch. */}
        <path
          d="M13 3a10 10 0 1 0 9.2 6"
          fill="none"
          stroke={light ? "#ffffff" : "var(--color-teal)"}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M13 8a5 5 0 1 0 4.6 3"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-heading text-[23px] font-extrabold lowercase tracking-tight"
        style={{ color: light ? "#ffffff" : "var(--color-teal)" }}
      >
        evolve
      </span>
    </span>
  );
}
