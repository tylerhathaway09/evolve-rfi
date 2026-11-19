/* ============================================================================
   Desktop: the dedicated RFI page (the model Evolve actually ships at
   start.evolve.com). A focused split — a brand/promise panel on the left and
   the form on the right — with no marketing sections below. One focused screen;
   the fixed-height form card absorbs step-to-step height changes.
   ============================================================================ */

import { Check } from "lucide-react";
import { Wordmark } from "../components/Wordmark";
import { RfiForm } from "../form/RfiForm";
import type { UseFlow } from "../hooks/useFlow";

const STATS = [
  { value: "18%", label: "more revenue than the market average" },
  { value: "30,000+", label: "owners with thriving properties" },
  { value: "4.8★", label: "earned from guests on average" },
];

const TRUST = ["No account needed", "Free, and no obligation", "Takes about a minute"];

export function DesktopView({ flow }: { flow: UseFlow }) {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:min-h-[calc(100vh-34px)] lg:grid-cols-[1fr_minmax(0,600px)]">
      {/* Brand / promise panel */}
      <div className="flex flex-col justify-center gap-9 bg-plum px-8 py-14 text-plum-ink lg:px-14 xl:px-20">
        <Wordmark light />

        <div>
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.1em] text-lime">
            Vacation rental management
          </p>
          <h1 className="text-[38px] leading-[1.08] font-extrabold text-white sm:text-[46px] xl:text-[52px]">
            See what your vacation home could earn.
          </h1>
          <p className="mt-4 max-w-md text-[18px] leading-relaxed text-plum-ink/80">
            Answer six quick questions and get an earnings range for your
            property — before you ever talk to anyone.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-5 border-t border-white/15 pt-7">
          {STATS.map((s) => (
            <div key={s.value} className="flex flex-col gap-1">
              <dt className="font-heading text-[30px] font-extrabold leading-none text-lime xl:text-[34px]">
                {s.value}
              </dt>
              <dd className="text-[13.5px] leading-snug text-plum-ink/75">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-2 text-[15px] text-plum-ink/90">
              <Check size={16} className="flex-none text-lime" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-paper px-6 py-6 lg:px-10">
        <div className="w-full max-w-[480px]">
          <RfiForm flow={flow} mode="desktop" />
        </div>
      </div>
    </div>
  );
}
