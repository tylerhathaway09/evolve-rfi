/* ============================================================================
   Stub of the next section, so the form visibly sits inside a longer page.
   Placeholder cards only - nothing here is interactive.
   ============================================================================ */

const PLANS = [
  {
    name: "Core",
    blurb: "Full-service management with a 10% fee charged only after guests check in.",
  },
  {
    name: "Plus",
    blurb: "Everything in Core plus dedicated revenue strategy and premium placement.",
  },
  {
    name: "Build",
    blurb: "For owners getting a new property guest-ready, from setup to first booking.",
  },
];

export function NextSection({ mobile = false }: { mobile?: boolean }) {
  return (
    <section
      className={[
        "mx-auto max-w-6xl py-14",
        mobile ? "px-5" : "px-4 sm:px-6",
      ].join(" ")}
    >
      <h2 className="text-[26px] font-extrabold text-ink sm:text-[32px]">
        Plans built for your needs
      </h2>
      <div
        className={[
          "mt-8 grid gap-5",
          mobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3",
        ].join(" ")}
      >
        {PLANS.map((p) => (
          <div
            key={p.name}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-6"
          >
            <span className="font-heading text-[20px] font-bold text-ink">
              {p.name}
            </span>
            <p className="text-[15px] leading-relaxed text-muted">{p.blurb}</p>
            <span className="mt-2 text-[14px] font-semibold text-muted/70">
              Placeholder - outside the case study scope
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
