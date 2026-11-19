/* ============================================================================
   The flow reducer: one object holding answers + history + errors, plus the
   transitions between screens. History is a stack so Back is "pop" and earlier
   answers are always kept. Persisted to sessionStorage so a refresh mid-form
   does not lose progress (wrapped in try/catch — private mode, quota, etc.).
   ============================================================================ */

import { suggest, type AddressSuggestion } from "../services/address";
import { START, nextAfterPick } from "./steps";
import type { Answers, ContactMethod, Errors, Intent, StepId } from "./types";

export interface FlowState {
  answers: Answers;
  /** Stack of visited steps; last item is the current screen. */
  history: StepId[];
  errors: Errors;
  /** Bumps only when a submit *produces* errors. Lets the view move focus to
   *  the first invalid field on a failed submit without re-stealing focus while
   *  the owner is typing (which merely clears errors). */
  errorSeq: number;
}

export function emptyAnswers(): Answers {
  return {
    path: null,
    type: null,
    beds: null,
    loc: null,
    locText: "",
    renting: null,
    furnished: null,
    name: "",
    email: "",
    phone: "",
    method: "Call",
    street: "",
    count: null,
    market: "",
    rentingMulti: null,
    timeline: null,
    slot: null,
    exitEmail: "",
    exitSent: false,
  };
}

export function initialState(): FlowState {
  return { answers: emptyAnswers(), history: [START], errors: {}, errorSeq: 0 };
}

/** Return a state carrying freshly-raised validation errors (bumps errorSeq). */
function fail(state: FlowState, errors: Errors): FlowState {
  return { ...state, errors, errorSeq: state.errorSeq + 1 };
}

export function current(state: FlowState): StepId {
  return state.history[state.history.length - 1];
}

/* --- validation ------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

function digits(v: string): string {
  return v.replace(/\D/g, "");
}

/* --- actions --------------------------------------------------------------- */

export type Action =
  // single-choice screens that auto-advance
  | {
      type: "pick";
      key: "path" | "type" | "beds" | "renting" | "furnished" | "count" | "rentingMulti";
      value: string;
    }
  // controlled field edits (no advance)
  | { type: "setField"; key: "name" | "email" | "phone" | "street" | "market" | "exitEmail"; value: string }
  | { type: "setLocText"; value: string }
  | { type: "setMethod"; value: ContactMethod }
  | { type: "setTimeline"; value: string }
  | { type: "setSlot"; value: string }
  // location resolutions
  | { type: "selectAddress"; suggestion: AddressSuggestion }
  | { type: "selectZip"; zip: string }
  | { type: "selectFreeLoc" }
  | { type: "submitLocation" }
  // other submits / transitions
  | { type: "toContact" }
  | { type: "submitMarket" }
  | { type: "submitContact" }
  | { type: "submitExit" }
  // navigation
  | { type: "go"; id: StepId }
  | { type: "back" }
  | { type: "jump"; id: StepId }
  | { type: "restart" };

function push(state: FlowState, id: StepId): FlowState {
  return { ...state, history: [...state.history, id], errors: {} };
}

export function reducer(state: FlowState, action: Action): FlowState {
  const a = state.answers;

  switch (action.type) {
    case "pick": {
      const next: Answers = { ...a, [action.key]: action.value };
      // Changing path or type invalidates any earlier exit-email submission.
      if (action.key === "path" || action.key === "type") next.exitSent = false;
      const dest = nextAfterPick(action.key, next);
      return push({ ...state, answers: next }, dest);
    }

    case "setField": {
      // Clear this field's inline error as the owner corrects it.
      const { [action.key]: _cleared, ...errors } = state.errors;
      return { ...state, answers: { ...a, [action.key]: action.value }, errors };
    }

    case "setLocText": {
      const { locText: _cleared, ...errors } = state.errors;
      return { ...state, answers: { ...a, locText: action.value }, errors };
    }

    case "setMethod":
      return { ...state, answers: { ...a, method: action.value } };

    case "setTimeline":
      return { ...state, answers: { ...a, timeline: action.value } };

    case "setSlot":
      return { ...state, answers: { ...a, slot: action.value } };

    case "selectAddress": {
      const chosen = action.suggestion;
      const next: Answers = {
        ...a,
        loc: {
          kind: "address",
          street: chosen.street,
          city: chosen.city,
          st: chosen.st,
          zip: chosen.zip,
        },
        locText: `${chosen.street}, ${chosen.city}, ${chosen.st} ${chosen.zip}`,
        street: "",
      };
      return push({ ...state, answers: next }, "renting");
    }

    case "selectZip":
      return push(
        { ...state, answers: { ...a, loc: { kind: "zip", zip: action.zip } } },
        "renting",
      );

    case "selectFreeLoc":
      return push(
        {
          ...state,
          answers: { ...a, loc: { kind: "text", text: a.locText.trim() } },
        },
        "renting",
      );

    case "submitLocation": {
      const q = a.locText.trim();
      const matches = suggest(q, 8);
      if (/^\d{5}$/.test(q)) {
        return push(
          { ...state, answers: { ...a, loc: { kind: "zip", zip: q } } },
          "renting",
        );
      }
      if (matches.length === 1) {
        const m = matches[0];
        return push(
          {
            ...state,
            answers: {
              ...a,
              loc: { kind: "address", street: m.street, city: m.city, st: m.st, zip: m.zip },
              street: "",
            },
          },
          "renting",
        );
      }
      if (q.length >= 4) {
        return push(
          { ...state, answers: { ...a, loc: { kind: "text", text: q } } },
          "renting",
        );
      }
      return fail(state, { locText: "Enter an address or a 5-digit ZIP code." });
    }

    case "toContact":
      return push(state, "contact");

    case "submitMarket": {
      if (a.market.trim().length < 2) {
        return fail(state, { market: "Enter a city or ZIP code." });
      }
      return push(state, "rentingMulti");
    }

    case "submitContact": {
      const errors: Errors = {};
      if (a.name.trim().length < 2) errors.name = "Enter your name.";
      if (!isEmail(a.email))
        errors.email = "Enter an email address, like name@example.com.";
      if (digits(a.phone).length < 10)
        errors.phone = "Enter a 10-digit phone number.";
      const needStreet =
        a.path !== "multi" && a.loc != null && a.loc.kind !== "address";
      if (needStreet && a.street.trim().length < 4)
        errors.street = "Enter the street address of the property.";
      if (Object.keys(errors).length) return fail(state, errors);
      return push(state, "done");
    }

    case "submitExit": {
      if (!isEmail(a.exitEmail)) {
        return fail(state, {
          exitEmail: "Enter an email address, like name@example.com.",
        });
      }
      return { ...state, answers: { ...a, exitSent: true }, errors: {} };
    }

    case "go":
      return push(state, action.id);

    case "back": {
      if (state.history.length <= 1) return state;
      return {
        ...state,
        history: state.history.slice(0, -1),
        errors: {},
      };
    }

    case "jump": {
      const i = state.history.lastIndexOf(action.id);
      if (i < 0) return state;
      return { ...state, history: state.history.slice(0, i + 1), errors: {} };
    }

    case "restart":
      return initialState();

    default:
      return state;
  }
}

/* --- persistence ----------------------------------------------------------- */

const KEY = "evolve-rfi-state";

export function persist(state: FlowState): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota / disabled storage — progress just isn't saved.
  }
}

export function restore(): FlowState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlowState;
    if (!parsed || !Array.isArray(parsed.history) || !parsed.history.length) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPersisted(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Intent helper for callers that only have the answers object. */
export function intentOf(a: Answers): Intent | null {
  return a.path;
}
