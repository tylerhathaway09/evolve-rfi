/* ============================================================================
   useFlow — binds the reducer to React, persists to sessionStorage, and fires
   analytics as a side effect of real user transitions (not on every render, so
   React StrictMode's double-invoke never double-counts).
   ============================================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "../analytics";
import { buildLead } from "../flow/selectors";
import { pathOf } from "../flow/steps";
import {
  type Action,
  type FlowState,
  current,
  initialState,
  persist,
  reducer,
  restore,
} from "../flow/state";

export function useFlow() {
  const [state, setState] = useState<FlowState>(() => restore() ?? initialState());

  // Always-fresh snapshot for the dispatch wrapper's analytics diffing.
  const stateRef = useRef(state);
  stateRef.current = state;

  const startedRef = useRef(false);
  const viewedInitial = useRef(false);

  // Persist on every change.
  useEffect(() => {
    persist(state);
  }, [state]);

  // First screen view (guarded so StrictMode fires it once).
  useEffect(() => {
    if (viewedInitial.current) return;
    viewedInitial.current = true;
    const s = stateRef.current;
    const step = current(s);
    if (step !== "intent") startedRef.current = true;
    track("rfi_step_view", { step, path: pathOf(s.answers) });
  }, []);

  const dispatch = useCallback((action: Action) => {
    const prev = stateRef.current;
    const next = reducer(prev, action);
    if (next === prev) return; // no-op action

    const prevStep = current(prev);
    const nextStep = current(next);
    const path = pathOf(next.answers);

    // Forward movement => the step we left is complete.
    if (next.history.length > prev.history.length) {
      if (prevStep === "intent" && !startedRef.current) {
        startedRef.current = true;
        track("rfi_start", { step: "intent", path });
      }
      track("rfi_step_complete", { step: prevStep, path });
    }

    // Any change of screen is a new view.
    if (nextStep !== prevStep) {
      track("rfi_step_view", { step: nextStep, path });
      if (nextStep === "estimate") track("rfi_estimate_view", { step: nextStep, path });
      if (nextStep === "ineligible") track("rfi_exit_ineligible", { step: nextStep, path });
      if (nextStep === "done") {
        const lead = buildLead(next.answers);
        track("rfi_submit", { step: nextStep, path, lead });
        // Explicit, readable dump of what sales receives.
        // eslint-disable-next-line no-console
        console.log("%c[lead] What sales receives", "color:#1f7f8c;font-weight:600", lead);
      }
    }

    if (action.type === "setSlot") {
      track("rfi_call_booked", { step: nextStep, path, slot: action.value });
    }

    setState(next);
  }, []);

  const step = current(state);

  return {
    state,
    answers: state.answers,
    errors: state.errors,
    errorSeq: state.errorSeq,
    step,
    path: pathOf(state.answers),
    dispatch,
  };
}

export type UseFlow = ReturnType<typeof useFlow>;
