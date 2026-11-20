/* ============================================================================
   Top-level orchestration. Picks the desktop or mobile layout from a view-mode
   (actual viewport, or the reviewer's Desktop/Mobile toggle), renders the
   mobile preview inside a phone frame on desktop, and owns the cross-cutting
   reviewer affordances (Design notes, view toggle).
   ============================================================================ */

import { useState } from "react";
import { CaseStudyBar } from "./components/CaseStudyBar";
import { PhoneFrame } from "./components/PhoneFrame";
import { ViewToggle } from "./components/ViewToggle";
import { useFlow } from "./hooks/useFlow";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { DesktopView } from "./views/DesktopView";
import { MobileView } from "./views/MobileView";

export function Site() {
  const flow = useFlow();

  const isNarrow = useMediaQuery("(max-width: 1023px)");
  const [override, setOverride] = useState<"desktop" | "mobile" | null>(null);
  const mode = override ?? (isNarrow ? "mobile" : "desktop");
  // Previewing mobile on a desktop screen → render inside a phone frame.
  const framed = mode === "mobile" && !isNarrow;

  const body =
    mode === "desktop" ? (
      <DesktopView flow={flow} />
    ) : framed ? (
      <PhoneFrame>
        <MobileView flow={flow} framed />
      </PhoneFrame>
    ) : (
      <MobileView flow={flow} />
    );

  return (
    <div id="top" className="min-h-screen bg-paper">
      <CaseStudyBar />

      {/* Desktop/Mobile preview control - desktop viewport only. */}
      {!isNarrow && <ViewToggle mode={mode} onChange={setOverride} />}

      {framed ? <div className="bg-ink/5">{body}</div> : body}
    </div>
  );
}
