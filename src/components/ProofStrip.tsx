/* ============================================================================
   Proof strip: "Proven profits. Less pressure." plus the three live-page stats.
   ============================================================================ */

const STATS = [
  { value: "18%", label: "more revenue than the market average" },
  { value: "30,000+", label: "owners with thriving properties" },
  { value: "4.8★", label: "earned from guests on average" },
];

export function ProofStrip({ mobile = false }: { mobile?: boolean }) {
  return (
    <section className="border-y border-line bg-surface">
      <div
        className={[
          "mx-auto max-w-6xl py-9",
          mobile ? "px-5" : "px-4 sm:px-6",
        ].join(" ")}
      >
        <h2 className="text-[22px] font-extrabold text-ink sm:text-[26px]">
          Proven profits. Less pressure.
        </h2>
        <dl
          className={[
            "mt-6 grid gap-6",
            mobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3",
          ].join(" ")}
        >
          {STATS.map((s) => (
            <div key={s.value} className="flex flex-col gap-1">
              <dt className="font-heading text-[34px] font-extrabold leading-none text-action sm:text-[40px]">
                {s.value}
              </dt>
              <dd className="text-[16px] leading-snug text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
