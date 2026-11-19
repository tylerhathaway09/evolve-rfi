/* ============================================================================
   The flow, as data. Read this file to understand the whole journey:
   - FLOWS:        the linear sequence of each path (drives the progress bar)
   - STEP_LABELS:  short names for the flow map
   - nextAfterPick / nextStep: the branching rules
   - progress():   the front-loaded progress curve
   ============================================================================ */

import type { Answers, Intent, Path, StepId } from "./types";

/** Linear order of each path. Exits (ineligible, buy) are deliberately absent:
 *  they hide the progress bar. */
export const FLOWS: Record<Path, StepId[]> = {
  single: [
    "intent",
    "type",
    "beds",
    "location",
    "renting",
    "furnished",
    "estimate",
    "street",
    "contact",
    "done",
  ],
  multi: ["intent", "count", "market", "rentingMulti", "contact", "done"],
};

export const STEP_LABELS: Record<StepId, string> = {
  intent: "What brings you here",
  type: "Property type",
  beds: "Bedrooms",
  location: "Location",
  renting: "Renting today",
  furnished: "Furnished",
  estimate: "Earnings range",
  street: "Street address",
  contact: "Contact details",
  done: "Confirmation",
  count: "How many properties",
  market: "Main market",
  rentingMulti: "Renting today",
  ineligible: "Not a fit",
  buy: "Buying a property",
};

/** The first non-exit step of a path. */
export const START: StepId = "intent";

/** Which linear flow are we in, given the intent choice. */
export function pathOf(answers: Answers): Path {
  return answers.path === "multi" ? "multi" : "single";
}

/** The exit screens hide the progress bar and sit off every path. */
export function isExit(id: StepId): boolean {
  return id === "ineligible" || id === "buy";
}

/**
 * Branching for single-choice screens that auto-advance on tap.
 * Typed screens (location, market, contact) resolve their own next step in the
 * reducer because the destination depends on the submitted value.
 */
export function nextAfterPick(
  key: "path" | "type" | "beds" | "renting" | "furnished" | "count" | "rentingMulti",
  answers: Answers,
): StepId {
  switch (key) {
    case "path": {
      const intent = answers.path as Intent;
      return intent === "single" ? "type" : intent === "multi" ? "count" : "buy";
    }
    case "type":
      return answers.type === "Whole home or condo" ? "beds" : "ineligible";
    case "beds":
      return "location";
    case "renting":
      return "furnished";
    case "furnished":
      return "estimate";
    case "count":
      return "market";
    case "rentingMulti":
      return "contact";
  }
}

/**
 * Front-loaded progress: moves quickly early, slows near the end, so the bar
 * never feels stuck at the start. Villar et al. (2013): fast-start bars reduce
 * drop-off; slow-start bars increase it.
 * Returns an integer 0–100.
 */
export function progress(id: StepId, path: Path): number {
  const flow = FLOWS[path];
  const i = flow.indexOf(id);
  if (i < 0) return 0; // exit screens — bar is hidden anyway
  const t = id === "done" ? 1 : (i + 1) / flow.length;
  return Math.round((1 - Math.pow(1 - t, 1.6)) * 100);
}
