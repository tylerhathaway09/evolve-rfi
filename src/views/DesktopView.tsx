/* ============================================================================
   Desktop: the real Evolve RFI page (start.evolve.com) — a full-bleed vacation
   home photo with the brand/promise over it and the form card floating on the
   right. The photo grounds it as a genuine Evolve experience; the form (our
   redesign) is the focus.

   Photo: Unsplash (free license). Credited in the README.
   ============================================================================ */

import { Check } from "lucide-react";
import heroUrl from "../assets/hero.jpg";
import { Wordmark } from "../components/Wordmark";
import { RfiForm } from "../form/RfiForm";
import type { UseFlow } from "../hooks/useFlow";

const TRUST = ["No account needed", "Free, and no obligation", "Takes about a minute"];

export function DesktopView({ flow }: { flow: UseFlow }) {
  return (
    <section className="relative min-h-[calc(100vh-34px)] w-full overflow-hidden">
      {/* Full-bleed photo */}
      <img
        src={heroUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Scrim: plum-tinted, darker on the left for the headline, opening up
          toward the right so the photo breathes around the floating card. */}
      <div className="absolute inset-0 bg-gradient-to-r from-plum/85 via-plum/55 to-plum/15" />

      <div className="relative mx-auto flex min-h-[calc(100vh-34px)] w-full max-w-7xl flex-col items-start gap-10 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        {/* Brand + promise over the photo */}
        <div className="max-w-xl text-white">
          <Wordmark light />
          <h1 className="mt-10 text-[42px] leading-[1.06] font-extrabold text-white drop-shadow-sm sm:text-[52px] xl:text-[58px]">
            See what your vacation home could earn.
          </h1>
          <p className="mt-5 max-w-md text-[18px] leading-relaxed text-white/85 sm:text-[20px]">
            Answer six quick questions and get an earnings range for your
            property — before you ever talk to anyone.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2 text-[15px] text-white/90">
                <Check size={16} className="flex-none text-lime" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Floating form card */}
        <div className="w-full max-w-[460px] shrink-0 lg:ml-auto">
          <RfiForm flow={flow} mode="desktop" />
        </div>
      </div>
    </section>
  );
}
