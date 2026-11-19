/* ============================================================================
   The form card: progress bar, Back control, the current screen, and the
   focus/scroll management the brief calls for — focus moves to the heading (or
   the first invalid field) on each step change, and the heading is brought to
   the top of the viewport.
   ============================================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, RotateCcw, X } from "lucide-react";
import type { UseFlow } from "../hooks/useFlow";
import { isExit, progress } from "../flow/steps";
import { Screen } from "./Screens";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function RfiForm({
  flow,
  mode = "desktop",
  onClose,
}: {
  flow: UseFlow;
  /** desktop = fixed-height card; fullscreen = fills its container (immersive
   *  mobile flow); mobile = natural inline flow. desktop & fullscreen both use
   *  an internal scroll region so the chrome stays pinned. */
  mode?: "desktop" | "mobile" | "fullscreen";
  /** When set, a close control is shown (used to exit the immersive flow). */
  onClose?: () => void;
}) {
  const { state, step, path, answers, errors, errorSeq, dispatch } = flow;
  // Desktop and the full-screen mobile flow both use a STABLE frame: progress
  // and controls pinned at the top, the question content vertically centred in
  // the space below (Typeform-style). The frame is a fixed height so it never
  // fluctuates step to step; content taller than the frame scrolls inside it.
  const fixed = mode === "desktop" || mode === "fullscreen";
  const cardRef = useRef<HTMLDivElement>(null);
  // The internal scroll region (fixed-height card on desktop).
  const scrollRef = useRef<HTMLDivElement>(null);
  // null until the first screen has been seen; lets us tell a real step change
  // from the initial mount (and from StrictMode's double-invoked effect).
  const prevStep = useRef<string | null>(null);

  // Fade cue at the bottom of the card when a tall screen (contact, done) has
  // more content below the fold, so the primary action is discoverable.
  const [showFade, setShowFade] = useState(false);
  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowFade(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);

  const pct = progress(step, path);
  const showTrack = !isExit(step);
  const showBack = state.history.length > 1 && step !== "done";
  const started = state.history.length > 1;

  // On a real step change (or when validation fails): move focus to the first
  // invalid field, else the heading. On step change, reset the card's internal
  // scroll and bring the card into view only if its heading isn't already
  // comfortably visible. Never scroll or steal focus on the initial page load.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const changed = prevStep.current !== null && prevStep.current !== step;
    prevStep.current = step;

    const invalid = card.querySelector<HTMLElement>('[aria-invalid="true"]');
    const heading = card.querySelector<HTMLElement>("h1");

    if (changed) {
      // A real transition: start the new screen at its top, focus the heading
      // (or a surfaced error), and only scroll the page if the card's top is
      // hidden under the header or pushed well down the viewport.
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      (invalid ?? heading)?.focus({ preventScroll: true });
      updateFade();

      const rect = card.getBoundingClientRect();
      const obscured = rect.top < 90 || rect.top > window.innerHeight * 0.6;
      if (obscured) {
        card.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }
    } else if (invalid) {
      // Same step, a submit just failed (errorSeq bumped): jump focus to the
      // first bad field. Typing only *clears* errors and never bumps errorSeq,
      // so focus is never stolen mid-input.
      invalid.focus({ preventScroll: true });
    }
    updateFade();
    // Initial mount (and StrictMode's re-invoke) do nothing: no scroll, no steal.
    // Re-run on a real screen change or a failed submit — not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, errorSeq]);

  // Recompute the fade cue when the viewport resizes (height-lock toggles at lg).
  useEffect(() => {
    window.addEventListener("resize", updateFade);
    return () => window.removeEventListener("resize", updateFade);
  }, [updateFade]);

  return (
    <div
      ref={cardRef}
      className={[
        "flex flex-col bg-surface",
        mode === "desktop"
          ? // A stable frame sized to the viewport (capped), so it fits the
            // tall contact step without scrolling and never changes height
            // between steps.
            "h-[min(760px,calc(100dvh-92px))] rounded-2xl p-7 shadow-card"
          : mode === "fullscreen"
            ? "h-full rounded-none p-5"
            : "min-h-0 rounded-none p-5 shadow-none",
      ].join(" ")}
    >
      {/* Header: full-width progress bar on top (never shifts), with a controls
          row below for Back + Start over. The bar spans the full width on every
          screen, so it never looks off-centre when Back is absent. */}
      <div className="mb-5 flex-none">
        <div
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className={[
            "h-2 w-full overflow-hidden rounded-full bg-tint",
            showTrack ? "" : "invisible",
          ].join(" ")}
        >
          <div
            className="h-full rounded-full bg-go transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>

        {(showBack || started || onClose) && (
          <div className="mt-3 flex items-center justify-between">
            {showBack ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "back" })}
                className="-ml-1 flex h-9 items-center gap-1 rounded-md px-2 text-[15px] font-semibold text-muted transition-colors hover:text-ink"
              >
                <ChevronLeft size={18} aria-hidden="true" />
                Back
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1">
              {started && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "restart" })}
                  className="flex h-9 items-center gap-1.5 rounded-md px-2 text-[14px] font-semibold text-muted transition-colors hover:text-ink"
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  Start over
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-tint hover:text-ink"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content region. On desktop the card height is fixed; content is
          top-aligned so the heading sits in the same place on every step (no
          vertical jump), and the few tall screens scroll inside. The scroll box
          has a little horizontal breathing room so focus rings aren't clipped. */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={updateFade}
          className={["-mx-2 h-full px-2", fixed ? "overflow-y-auto" : ""].join(" ")}
        >
          {/* Desktop: vertically centre the question. Immersive mobile flow
              (fill): content sits at the top and the primary action is pinned to
              the bottom. Either way, content taller than the frame scrolls. */}
          <div
            className={[
              "flex min-h-full flex-col py-2",
              mode === "fullscreen" ? "flow-fill" : "justify-center",
            ].join(" ")}
          >
            <Screen step={step} answers={answers} errors={errors} dispatch={dispatch} />
          </div>
        </div>
        {/* Fade hint that there's more below the fold. Skipped on the contact
            step, which pins its own CTA to the bottom instead. */}
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent transition-opacity",
            fixed && showFade && step !== "contact" ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
