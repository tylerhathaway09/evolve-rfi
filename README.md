# Evolve Owner RFI — redesign prototype

A redesign of Evolve's owner **Request-for-Information (RFI)** flow — the short
form a property owner completes before talking to sales. Built as a case study
for a Senior Product Designer, Growth interview by Tyler Hathaway.

> **This is not an Evolve website and collects no data.** Every figure and
> address is sample data. Nothing is submitted anywhere — on completion the lead
> object is logged to the browser console (open DevTools to see it).

**Live link:** _add your Vercel URL here after deploying_

---

## The problem

About two in three owners who start the RFI don't finish. The brief fixes two
drop-off points as the targets:

- **35% leave at the contact step**
- **30% leave at the address step**

The audience skews older (the prototype assumes ~50+) and is **heavily mobile**.

## The bet

Show the owner an **earnings range before asking for contact details**, screen
out ineligible properties early, and reframe the contact ask so it feels like a
next step rather than a gate. Success is measured as **sales-qualified leads per
starter**, not raw completions — so "someone takes the number and leaves" is a
tracked outcome, not a silent loss.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # typecheck + production build to dist/
npm run preview  # serve the production build
```

Node 20+ recommended. No environment variables, no backend.

### Two views, one flow

- **Desktop** is the **dedicated RFI page** (the model Evolve ships at
  start.evolve.com): a focused split — a brand/promise panel on the left, the
  form on the right — with no marketing page around it. The form card is a fixed
  height so step-to-step content changes never shift the layout.
- **Mobile** (the primary audience) is a compact **invitation** → a **full-screen
  immersive flow**: one question filling the screen, progress pinned on top,
  primary action in the thumb zone, nothing competing. This is the best-practice
  pattern for a conversion-critical multi-step form and keeps focus on completion.

A floating **Desktop / Mobile** preview toggle (top-right, desktop only) renders
the mobile experience inside a phone frame — handy for the walkthrough video.

### Try these

- **Single property, full address:** rent out → whole home → 3 beds → type
  `pine` and pick the suggestion → two taps → see the range → fill contact.
- **Single property, ZIP only:** on the address step type a 5-digit ZIP (e.g.
  `37738`) and choose "Use ZIP". The street address is then asked on the contact
  step, so sales still gets it.
- **Ineligible:** choose timeshare / private room / something else → polite exit;
  "Change my answer" returns to the type question with your answer kept.
- **Buyer:** "I'm looking to buy" → buyer exit.
- **Several properties:** short portfolio path to a specialist.
- Open the console to watch the analytics events and the final lead object.

---

## Key decisions (and the reasoning)

| Decision | Why |
|---|---|
| **Earnings range before the contact ask** | Attacks the 35% contact drop-off — give something before asking. Competitors (Vacasa, Airbnb, Opendoor) all lead with an estimate. Largest upside, least certain → a test. |
| **Early eligibility screen** | Timeshares / private rooms / "something else" get a polite exit instead of reaching sales, protecting lead quality and the owner's time. |
| **Address: suggestions + a reason + ZIP accepted** | Attacks the 30% address drop-off: less typing, a stated reason, and a lower-commitment way in. ZIP gives an area estimate now; the street address is collected at the contact step. |
| **One "Full name" field, split to first/last on submit** | Fewer fields = less mobile abandonment (Baymard); the field is split on the last space so sales/CRM still gets structured first + last. |
| **Contact-method choice moved to the confirmation step** | Keeps the contact step short (the critical drop-off point); choosing how to be reached is non-blocking and enriches the lead after submit. |
| **Phone required, auto-formatted `(555) 123-4567`** | Phone stays required to protect lead quality; `type=tel` + autofill + live formatting make entry easy. (US format is an assumption for this audience.) |
| **Front-loaded progress bar** | Villar et al. (2013): fast-start progress bars reduce drop-off. |
| **Primary metric = SQLs per starter** | Guards against an optimistic estimate lifting completion but hurting close rate. |

Fuller diagnosis, evidence strength, and sources are in
[`../evolve-rfi-handoff/evolve-rfi-handoff/RESEARCH.md`](../evolve-rfi-handoff/evolve-rfi-handoff/RESEARCH.md).

---

## How it's built

Vite + React + TypeScript + Tailwind CSS v4. No backend; both external services
are mocked behind interfaces with the real seam left in a comment.

```
src/
  flow/
    types.ts        Lead + Answers + step types
    steps.ts        the flow & branching AS DATA (read this to see the journey)
    state.ts        reducer + history stack + sessionStorage persistence
    selectors.ts    derived values (place, range, the lead object, name split)
  services/
    address.ts      suggest() — mock over 8 sample addresses; Google Places seam
    estimate.ts     getRange() — mock table; revenue-API seam
  analytics.ts      track() — logs rfi_* events + the lead to the console
  hooks/
    useFlow.ts      binds the reducer to React + fires analytics on transitions
    useMediaQuery.ts
  form/
    RfiForm.tsx     progress / back / close, focus & scroll management, the card
    Screens.tsx     every screen, one question per screen
    ui.tsx          shared inputs/buttons (big targets, visible focus)
  components/        Header, Wordmark, ProofStrip, NextSection, PhoneFrame, ViewToggle
  views/
    DesktopView.tsx  dedicated split page (brand panel + form)
    MobileView.tsx   landing invitation + full-screen immersive flow
  styles/tokens.css  EVERY colour, font, radius & spacing value, in one place
  Site.tsx          picks the view from a view-mode (viewport or preview toggle)
```

**Design tokens** live in one place: `src/styles/tokens.css`. In Tailwind v4 the
`@theme` block is the token source, so changing a value there propagates to every
utility.

**Accessibility:** real `<button>`/`<label for>`, visible focus rings, inset
focus ring on inputs so it's never clipped, `aria-pressed` on choices,
`aria-invalid` + `aria-describedby` on errors, a labelled progress bar, focus
moved to the heading (or first invalid field) on each step, 48px+ tap targets,
17px+ body, and transitions that respect `prefers-reduced-motion`. Keyboard-only
completion works.

---

## What's mocked

- **Address lookup** (`services/address.ts`): eight sample addresses + ZIP /
  free-text handling. Real version → Google Places Autocomplete.
- **Earnings estimate** (`services/estimate.ts`): a base-per-bedroom table, ±18%
  rounded to the thousand, labelled as sample data in the UI. Real version →
  Evolve's revenue model.
- **Analytics** (`analytics.ts`): `track()` logs to the console. Events:
  `rfi_start`, `rfi_step_view`, `rfi_step_complete`, `rfi_exit_ineligible`,
  `rfi_estimate_view`, `rfi_submit`, `rfi_call_booked` — each with step id, path
  and device width. The lead object is logged on submit.
- **Submission**: none. The lead is logged and never sent.

---

## Expected lift (hypotheses to test)

Modelled estimates, not forecasts. Full basis and confidence levels in
`RESEARCH.md`.

| Change | Step | Estimate |
|---|---|---|
| Address suggestions, a stated reason, ZIP accepted | Address | step abandonment ~31% → 24–28% |
| Earnings range before the contact ask | Contact | step abandonment ~51% → 40–46% (largest upside, least certain) |
| Reframed, shorter contact screen | Contact | a further 3–8 points off |
| Early eligibility screen | Quality | fewer unusable leads |
| Fewer steps + front-loaded progress bar | Whole flow | 1–3 points |
| **Combined** | **End to end** | **completion ~33% → 38–47% of starters** |

### How I'd validate

Randomise at form start; split by traffic source and device. **Primary metric:
sales-qualified leads per starter.** Guardrails: valid phone/email rate, qualified
rate per lead, close rate. ~1,400 starters/arm for a 33% → 38% detection at 80%
power. Pair with 5–8 moderated mobile sessions with recent owners. If there's no
lift: check instrumentation and mobile load time, segment by source/device, test
the gate position (full estimate ungated vs range-then-gate), and test optional
phone for owners who are only exploring.

---

## Assumptions (each easy to change)

- The live flow reflects field-collection order (address step 4, contact last).
- The 35% / 30% drop-offs are shares of all starters.
- A revenue range can be shown from location + bedrooms; fallback is a
  market-level range by ZIP + bedrooms.
- Only whole homes and condos are eligible; other types get the polite exit
  (direction sourced from Evolve's FAQ; exact list unconfirmed).
- A ZIP is enough to show a range; the street address is collected at contact.
- The several-properties path, the intent question, and the optional timeline are
  additions beyond the required field list.
- US phone format; international entry would need a country-code field.
- Draft copy needing Evolve/legal sign-off: "within one business day", the three
  estimate-screen proof points, and the consent sentence.

## Out of scope

Real submission / email / SMS / CRM / scheduling, a real address or revenue API,
real Evolve assets or photography, and A/B-test tooling (described here and in
the video only).
