/* ============================================================================
   Analytics. `track()` logs to the console — nothing leaves the browser.

   This is the backbone of the "how I'd validate" story: every event carries the
   step id, the path and the device width, so results can be split by step and
   by mobile/desktop (where completion differs most). In production `track()`
   would forward to the real analytics sink; the event shape stays the same.
   ============================================================================ */

import type { Path, StepId } from "./flow/types";

export type AnalyticsEvent =
  | "rfi_start" // owner answers the first question
  | "rfi_step_view" // a step is shown
  | "rfi_step_complete" // a step is answered and advanced
  | "rfi_exit_ineligible" // owner hits the ineligible exit
  | "rfi_estimate_view" // the earnings range is shown
  | "rfi_submit" // contact details submitted (the lead)
  | "rfi_call_booked"; // optional call slot chosen on confirmation

export interface BaseProps {
  step?: StepId;
  path?: Path;
  deviceWidth?: number;
  [key: string]: unknown;
}

function deviceWidth(): number | undefined {
  return typeof window === "undefined" ? undefined : window.innerWidth;
}

export function track(event: AnalyticsEvent, props: BaseProps = {}): void {
  const payload: BaseProps = {
    deviceWidth: deviceWidth(),
    ...props,
  };
  // Grouped, readable console output for the demo. Swap for a real sink later.
  // eslint-disable-next-line no-console
  console.log(`%c[analytics] ${event}`, "color:#9342b8;font-weight:600", payload);
}
