/* ============================================================================
   Mobile (the primary audience). Best practice for a conversion-critical
   multi-step lead form on a phone: the marketing page is the INVITATION, and
   once the owner starts, the flow takes over the full screen — one question at
   a time, progress pinned on top, primary action in the thumb zone, nothing
   competing. That reads unmistakably as a form and removes any "page shifting"
   as step heights change (each step owns the screen).
   ============================================================================ */

import { useState } from "react";
import { Check } from "lucide-react";
import { Header } from "../components/Header";
import { NextSection } from "../components/NextSection";
import { ProofStrip } from "../components/ProofStrip";
import { RfiForm } from "../form/RfiForm";
import type { UseFlow } from "../hooks/useFlow";

const TRUST = ["No account needed", "Free, and no obligation", "Takes about a minute"];

export function MobileView({ flow, framed = false }: { flow: UseFlow; framed?: boolean }) {
  const { step } = flow;
  // Open the immersive flow on demand; if a refresh restored a mid-flow step,
  // start opened so progress isn't hidden behind the landing.
  const [flowOpen, setFlowOpen] = useState(step !== "intent");

  if (flowOpen) {
    return <MobileFlow flow={flow} framed={framed} onClose={() => setFlowOpen(false)} />;
  }
  return <MobileLanding flow={flow} onStart={() => setFlowOpen(true)} />;
}

/* --- the immersive flow ---------------------------------------------------- */

function MobileFlow({
  flow,
  framed,
  onClose,
}: {
  flow: UseFlow;
  framed: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={[
        "z-50 flex flex-col bg-surface",
        // Contained to the phone frame in the desktop preview; true full-screen
        // on a real device.
        framed ? "absolute inset-0" : "fixed inset-0",
      ].join(" ")}
    >
      {/* On a real device the full-screen flow covers the page's disclaimer bar,
          so repeat it here. In the desktop preview the canvas bar above the
          frame already shows it — don't duplicate. */}
      {!framed && (
        <div className="flex-none bg-ink px-4 py-1.5 text-center text-[11px] leading-snug text-white/85">
          Case study prototype · Not an Evolve website · No data collected
        </div>
      )}
      <div className="min-h-0 flex-1">
        <RfiForm flow={flow} mode="fullscreen" onClose={onClose} />
      </div>
    </div>
  );
}

/* --- the landing / invitation ---------------------------------------------- */

function MobileLanding({ flow, onStart }: { flow: UseFlow; onStart: () => void }) {
  const resuming = flow.step !== "intent";
  return (
    <div className="bg-surface">
      <Header mobile />

      <section className="bg-paper px-5 pt-9 pb-8">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-go-deep">
          Vacation rental management
        </p>
        <h1 className="text-[32px] leading-[1.08] font-extrabold text-ink">
          See what your vacation home could earn.
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">
          Six quick questions, then an earnings range — before you ever talk to
          anyone.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 min-h-[56px] w-full rounded-lg bg-action px-5 text-[18px] font-bold text-action-ink shadow-pop transition-colors hover:bg-action-hover"
        >
          {resuming ? "Resume your estimate" : "See what your home could earn"}
        </button>

        <ul className="mt-6 flex flex-col gap-3">
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-[16px] text-ink">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-go text-action-ink">
                <Check size={12} aria-hidden="true" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <ProofStrip mobile />
      <NextSection mobile />

      <footer className="border-t border-line bg-surface">
        <div className="px-5 py-7 text-[13px] leading-relaxed text-muted">
          Case study prototype by Tyler Hathaway for an Evolve design interview.
          Not affiliated with Evolve. Sample data only; nothing is submitted.
        </div>
      </footer>
    </div>
  );
}
