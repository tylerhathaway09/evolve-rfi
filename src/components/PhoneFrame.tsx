/* ============================================================================
   A phone frame for previewing the mobile experience on a desktop screen.
   The inner area scrolls like a device viewport, so sticky headers and the
   sticky contact CTA behave exactly as they would on a phone.
   ============================================================================ */

import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center px-4 py-10">
      <div className="relative h-[812px] w-[390px] shrink-0 overflow-hidden rounded-[44px] border-[10px] border-ink bg-surface shadow-pop">
        {/* notch */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-ink" />
        {/* device viewport */}
        <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
