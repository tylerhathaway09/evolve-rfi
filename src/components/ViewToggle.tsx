/* ============================================================================
   Reviewer control: preview the Desktop vs Mobile layout without a phone. Shown
   only on desktop viewports. A clearly-floating panel (labelled "Preview",
   strong elevation) so it reads as reviewer tooling sitting ABOVE the product,
   not as part of the Evolve chrome. Setting "Mobile" forces the mobile layout
   inside a phone frame.
   ============================================================================ */

import type { ReactNode } from "react";
import { Monitor, Smartphone } from "lucide-react";

export function ViewToggle({
  mode,
  onChange,
}: {
  mode: "desktop" | "mobile";
  onChange: (m: "desktop" | "mobile") => void;
}) {
  return (
    <div
      role="group"
      aria-label="Preview layout"
      className="fixed right-4 top-4 z-50 w-44 rounded-2xl border border-line bg-surface p-2 shadow-pop"
    >
      <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        Preview
      </p>
      <div className="flex flex-col gap-1">
        <Btn active={mode === "desktop"} onClick={() => onChange("desktop")} label="Desktop">
          <Monitor size={16} aria-hidden="true" />
          Desktop
        </Btn>
        <Btn active={mode === "mobile"} onClick={() => onChange("mobile")} label="Mobile">
          <Smartphone size={16} aria-hidden="true" />
          Mobile
        </Btn>
      </div>
    </div>
  );
}

function Btn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={[
        "flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold transition-colors",
        active ? "bg-ink text-white" : "text-muted hover:bg-tint hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
