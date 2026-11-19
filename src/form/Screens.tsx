/* ============================================================================
   Every screen in the flow. One question per screen; single-choice answers
   auto-advance, typed screens have an explicit button. Copy is the source of
   truth from the proposed flow.
   ============================================================================ */

import type { FormEvent, ReactElement, ReactNode } from "react";
import {
  Building2,
  CalendarClock,
  ChevronRight,
  DoorOpen,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Tent,
} from "lucide-react";
import type { Action } from "../flow/state";
import type { Answers, Errors, StepId } from "../flow/types";
import { bedsLabel, firstName, locFull, place } from "../flow/selectors";
import { getRange } from "../services/estimate";
import { formatAddress, suggest } from "../services/address";
import { Choice, Chip, Cta, Field, Fine, Heading, Lede, TextButton } from "./ui";

interface Props {
  step: StepId;
  answers: Answers;
  errors: Errors;
  dispatch: (a: Action) => void;
}

const METHOD_ICONS: Record<Answers["method"], ReactNode> = {
  Call: <Phone size={16} />,
  Text: <MessageSquare size={16} />,
  Email: <Mail size={16} />,
};

/**
 * Progressive US phone formatting as the owner types: (555) 123-4567. Caps at
 * 10 digits so the field self-corrects; validation still checks the digit
 * count, so a raw paste or partial entry is handled too. (US format is an
 * assumption for this audience; international numbers would need a country code
 * field in production.)
 */
function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function Screen(props: Props) {
  const { step } = props;
  const S = SCREENS[step];
  return <div className="step-enter flex flex-col gap-4">{S(props)}</div>;
}

/* --- individual screens ---------------------------------------------------- */

const SCREENS: Record<StepId, (p: Props) => ReactElement> = {
  intent: ({ answers, dispatch }) => (
    <>
      <Heading>What brings you to Evolve?</Heading>
      <Lede>Six quick questions, then an earnings range for your property.</Lede>
      <div className="flex flex-col gap-2.5">
        <Choice
          label="I want to rent out my property"
          icon={<Home size={22} />}
          selected={answers.path === "single"}
          onClick={() => dispatch({ type: "pick", key: "path", value: "single" })}
        />
        <Choice
          label="I have several properties"
          icon={<Building2 size={22} />}
          selected={answers.path === "multi"}
          onClick={() => dispatch({ type: "pick", key: "path", value: "multi" })}
        />
        <Choice
          label="I'm looking to buy a property"
          icon={<Search size={22} />}
          selected={answers.path === "buy"}
          onClick={() => dispatch({ type: "pick", key: "path", value: "buy" })}
        />
      </div>
    </>
  ),

  type: ({ answers, dispatch }) => {
    const pick = (value: string) =>
      dispatch({ type: "pick", key: "type", value });
    return (
      <>
        <Heading>What type of property is it?</Heading>
        <div className="flex flex-col gap-2.5">
          <Choice
            label="A whole home or condo"
            sub="House, cabin, townhouse, studio, tiny home"
            icon={<Home size={22} />}
            selected={answers.type === "Whole home or condo"}
            onClick={() => pick("Whole home or condo")}
          />
          <Choice
            label="A private room"
            icon={<DoorOpen size={22} />}
            selected={answers.type === "Private room"}
            onClick={() => pick("Private room")}
          />
          <Choice
            label="A timeshare"
            icon={<CalendarClock size={22} />}
            selected={answers.type === "Timeshare"}
            onClick={() => pick("Timeshare")}
          />
          <Choice
            label="Something else"
            sub="RV, camper, tent or houseboat"
            icon={<Tent size={22} />}
            selected={answers.type === "Something else"}
            onClick={() => pick("Something else")}
          />
        </div>
      </>
    );
  },

  beds: ({ answers, dispatch }) => {
    const keys = ["Studio", "1", "2", "3", "4", "5", "6+"];
    return (
      <>
        <Heading>How many bedrooms does it have?</Heading>
        <div className="grid grid-cols-4 gap-2.5">
          {keys.map((k) => (
            <Chip
              key={k}
              label={k}
              ariaLabel={k === "Studio" ? "Studio" : `${k} bedrooms`}
              selected={answers.beds === k}
              onClick={() => dispatch({ type: "pick", key: "beds", value: k })}
            />
          ))}
        </div>
      </>
    );
  },

  location: ({ answers, errors, dispatch }) => <LocationScreen answers={answers} errors={errors} dispatch={dispatch} />,

  renting: ({ answers, dispatch }) => (
    <>
      <Heading>Are you renting it out as a vacation rental today?</Heading>
      <div className="flex flex-col gap-2.5">
        <Choice
          label="Yes"
          selected={answers.renting === "Yes"}
          onClick={() => dispatch({ type: "pick", key: "renting", value: "Yes" })}
        />
        <Choice
          label="No, not yet"
          selected={answers.renting === "No"}
          onClick={() => dispatch({ type: "pick", key: "renting", value: "No" })}
        />
      </div>
    </>
  ),

  furnished: ({ answers, dispatch }) => (
    <>
      <Heading>Is it furnished?</Heading>
      <div className="flex flex-col gap-2.5">
        <Choice
          label="Yes, it's furnished"
          selected={answers.furnished === "Furnished"}
          onClick={() => dispatch({ type: "pick", key: "furnished", value: "Furnished" })}
        />
        <Choice
          label="Not yet"
          selected={answers.furnished === "Not yet"}
          onClick={() => dispatch({ type: "pick", key: "furnished", value: "Not yet" })}
        />
      </div>
    </>
  ),

  estimate: ({ answers, dispatch }) => <EstimateScreen answers={answers} dispatch={dispatch} />,

  street: ({ answers, errors, dispatch }) => {
    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      dispatch({ type: "submitStreet" });
    };
    return (
      <>
        <Heading>What's the exact address?</Heading>
        <Lede>
          You gave us {place(answers)}. The street address lets your expert
          estimate for your specific home.
        </Lede>
        <form onSubmit={onSubmit} className="step-form flex flex-col gap-3.5" noValidate>
          <Field
            id="street"
            label="Street address"
            type="text"
            autoComplete="street-address"
            autoCorrect="off"
            placeholder="123 Main St"
            value={answers.street}
            error={errors.street}
            onChange={(e) => dispatch({ type: "setField", key: "street", value: e.target.value })}
          />
          <div className="step-cta">
            <Cta type="submit">Continue</Cta>
          </div>
        </form>
      </>
    );
  },

  contact: ({ answers, errors, dispatch }) => <ContactScreen answers={answers} errors={errors} dispatch={dispatch} />,

  done: ({ answers, dispatch }) => <DoneScreen answers={answers} dispatch={dispatch} />,

  /* --- exits --- */
  ineligible: ({ answers, dispatch }) => (
    <>
      <Heading>We can't manage this type of property yet</Heading>
      <p className="text-[17px] leading-relaxed text-ink">
        Evolve manages whole homes and condos that have a private entrance, a
        kitchen and a bathroom. A {(answers.type || "").toLowerCase()} is outside
        what we support today.
      </p>
      <Cta onClick={() => dispatch({ type: "back" })}>Change my answer</Cta>
      <ExitBox
        answers={answers}
        errors={{}}
        dispatch={dispatch}
        title="Want to hear if this changes?"
        button="Tell me if this changes"
        variant="secondary"
      />
    </>
  ),

  buy: ({ answers, errors, dispatch }) => (
    <>
      <Heading>Not an owner yet? Start with the numbers.</Heading>
      <p className="text-[17px] leading-relaxed text-ink">
        We work with owners once they have a property. Until then, we can send you
        earnings data for the markets you're considering.
      </p>
      <ExitBox
        answers={answers}
        errors={errors}
        dispatch={dispatch}
        title="Send me market earnings data"
        button="Send it"
      />
      <TextButton onClick={() => dispatch({ type: "back" })}>
        I already own a property
      </TextButton>
    </>
  ),

  /* --- multi path --- */
  count: ({ answers, dispatch }) => {
    const pick = (value: string) =>
      dispatch({ type: "pick", key: "count", value });
    return (
      <>
        <Heading>How many properties do you have?</Heading>
        <div className="flex flex-col gap-2.5">
          {["2 to 4", "5 to 10", "11 or more"].map((v) => (
            <Choice
              key={v}
              label={v}
              selected={answers.count === v}
              onClick={() => pick(v)}
            />
          ))}
        </div>
      </>
    );
  },

  market: ({ answers, errors, dispatch }) => {
    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      dispatch({ type: "submitMarket" });
    };
    return (
      <>
        <Heading>Where are most of them?</Heading>
        <Lede>A city or ZIP code is enough for now.</Lede>
        <form onSubmit={onSubmit} className="step-form flex flex-col gap-3.5" noValidate>
          <Field
            id="market"
            label="City or ZIP code"
            type="text"
            autoComplete="address-level2"
            autoCorrect="off"
            value={answers.market}
            error={errors.market}
            onChange={(e) =>
              dispatch({ type: "setField", key: "market", value: e.target.value })
            }
          />
          <div className="step-cta">
            <Cta type="submit">Next</Cta>
          </div>
        </form>
      </>
    );
  },

  rentingMulti: ({ answers, dispatch }) => (
    <>
      <Heading>Are any of them rented to guests today?</Heading>
      <div className="flex flex-col gap-2.5">
        <Choice
          label="Yes"
          selected={answers.rentingMulti === "Yes"}
          onClick={() => dispatch({ type: "pick", key: "rentingMulti", value: "Yes" })}
        />
        <Choice
          label="No, not yet"
          selected={answers.rentingMulti === "No"}
          onClick={() => dispatch({ type: "pick", key: "rentingMulti", value: "No" })}
        />
      </div>
    </>
  ),
};

/* --- composite screens ----------------------------------------------------- */

function LocationScreen({ answers, errors, dispatch }: Omit<Props, "step">) {
  const q = answers.locText.trim();
  const isZip = /^\d{5}$/.test(q);
  const matches = suggest(answers.locText, 4);
  const showFree = q.length >= 4 && !isZip;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "submitLocation" });
  };

  return (
    <>
      <Heading>Where is your property?</Heading>
      <Lede>
        We compare it with similar rentals nearby to work out what it could earn.
      </Lede>
      <form onSubmit={onSubmit} noValidate>
        <Field
          id="locText"
          label="Address or ZIP code"
          type="text"
          placeholder="Start typing"
          autoComplete="street-address"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          hint="Start typing an address, or enter a 5-digit ZIP."
          error={errors.locText}
          value={answers.locText}
          onChange={(e) =>
            dispatch({ type: "setLocText", value: e.target.value })
          }
        />
      </form>

      {(isZip || matches.length > 0 || showFree) && (
        <div
          role="listbox"
          aria-label="Address suggestions"
          className="divide-y divide-line overflow-hidden rounded-lg border border-line"
        >
          {isZip && (
            <SuggestionRow
              title={`Use ZIP ${q}`}
              sub="Area estimate now, street address later"
              onClick={() => dispatch({ type: "selectZip", zip: q })}
            />
          )}
          {matches.map((a) => (
            <SuggestionRow
              key={formatAddress(a)}
              title={a.street}
              sub={`${a.city}, ${a.st} ${a.zip}`}
              onClick={() => dispatch({ type: "selectAddress", suggestion: a })}
            />
          ))}
          {showFree && (
            <SuggestionRow
              title={`Use "${q}"`}
              sub="Continue with what I typed"
              onClick={() => dispatch({ type: "selectFreeLoc" })}
            />
          )}
        </div>
      )}

      <Fine>We never share your address or list your home without your OK.</Fine>
    </>
  );
}

/** A tappable autocomplete result — reads as a results list, not a form card. */
function SuggestionRow({
  title,
  sub,
  onClick,
}: {
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={false}
      onClick={onClick}
      className="flex w-full items-center gap-3 bg-surface px-4 py-3 text-left transition-colors hover:bg-tint"
    >
      <MapPin size={18} className="flex-none text-go" aria-hidden="true" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[16px] font-semibold text-ink">{title}</span>
        <span className="truncate text-[14px] text-muted">{sub}</span>
      </span>
      <ChevronRight size={18} className="ml-auto flex-none text-muted" aria-hidden="true" />
    </button>
  );
}

function EstimateScreen({ answers, dispatch }: { answers: Answers; dispatch: (a: Action) => void }) {
  const range = answers.beds ? getRange(answers.beds, place(answers)) : null;
  return (
    // Single wrapper so spacing is tuned for the peak (tighter than the default
    // screen rhythm) and the CTA stays in view inside the fixed-height card.
    <div className="step-form flex flex-col gap-3.5">
      <Heading>
        {bedsLabel(answers)} near {place(answers)} typically earn
      </Heading>

      {/* Payoff figure on a light, calm surface — bold but not a heavy block,
          so the purple CTA below is the brightest, most prominent element. */}
      <div className="rounded-xl border border-action/15 bg-action-soft px-5 py-5">
        <div className="text-[31px] leading-[1.05] font-extrabold tabular-nums text-plum sm:text-[36px]">
          {range?.display}
        </div>
        <div className="mt-1 text-[16px] font-semibold text-ink/80">
          a year in bookings
        </div>
        <div className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
          A range based on similar rentals nearby — not a guarantee.
        </div>
      </div>

      {answers.furnished === "Not yet" && (
        <p className="text-[14px] leading-relaxed text-muted">
          This assumes the home is furnished and guest-ready. Your expert can walk
          you through getting there.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {[
          "10% management fee, charged only when guests stay",
          "No long-term contract",
          "You stay in control of your home and calendar",
        ].map((pt) => (
          <li key={pt} className="flex items-start gap-2.5 text-[15px] text-ink">
            <CheckDot />
            <span>{pt}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => dispatch({ type: "toContact" })}
        className="step-cta mt-1 min-h-[58px] w-full rounded-lg bg-action px-5 text-[18px] font-bold text-action-ink shadow-pop transition-colors hover:bg-action-hover"
      >
        Get my detailed estimate
      </button>
    </div>
  );
}

function ContactScreen({ answers, errors, dispatch }: Omit<Props, "step">) {
  const multi = answers.path === "multi";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "submitContact" });
  };

  return (
    <>
      <Heading>
        {multi ? "Talk to our portfolio team" : "Where should we send your estimate?"}
      </Heading>
      <Lede>
        {multi
          ? "One specialist reviews your properties and gets in touch."
          : "A local expert reaches out within one business day."}
      </Lede>

      <form onSubmit={onSubmit} className="step-form flex flex-col gap-2.5" noValidate>
        <Field
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          autoCorrect="off"
          value={answers.name}
          error={errors.name}
          onChange={(e) => dispatch({ type: "setField", key: "name", value: e.target.value })}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          value={answers.email}
          error={errors.email}
          onChange={(e) => dispatch({ type: "setField", key: "email", value: e.target.value })}
        />
        <Field
          id="phone"
          label="Mobile phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(555) 123-4567"
          hint="So we can reach you about your estimate."
          value={answers.phone}
          error={errors.phone}
          onChange={(e) =>
            dispatch({ type: "setField", key: "phone", value: formatPhone(e.target.value) })
          }
        />
        {/* In the immersive mobile flow this is pushed to the bottom (thumb
            zone); on desktop it sits inline below the fields. */}
        <div className="step-cta mt-1 flex flex-col gap-2 pt-1">
          <Cta type="submit">{multi ? "Request a call" : "Send my estimate"}</Cta>
          <p className="text-[12.5px] leading-relaxed text-muted">
            By continuing you agree Evolve may call, text or email you about
            managing your property. Consent isn't a condition of purchase.
          </p>
        </div>
      </form>
    </>
  );
}

function DoneScreen({ answers, dispatch }: { answers: Answers; dispatch: (a: Action) => void }) {
  const multi = answers.path === "multi";
  const methods: Answers["method"][] = ["Call", "Text", "Email"];
  const slots = ["Tomorrow, 10:00 AM", "Tomorrow, 2:30 PM", "Friday, 11:00 AM"];
  const times = ["As soon as possible", "Within 90 days", "Within 6 months", "Just exploring"];
  const reach = answers.method === "Email" ? "email" : answers.method.toLowerCase();

  return (
    <>
      <Heading>
        Thanks, {firstName(answers)}.{" "}
        {multi ? "Our portfolio team has your details." : "Your estimate is on its way."}
      </Heading>

      <ol className="flex flex-col gap-2.5 pl-1">
        <Numbered n={1}>
          We've sent a confirmation to <strong>{answers.email}</strong>.
        </Numbered>
        <Numbered n={2}>
          {multi ? "A portfolio specialist" : "A local revenue expert"} will {reach} you
          within one business day.
        </Numbered>
        <Numbered n={3}>
          {multi
            ? "You'll get a plan and pricing for your properties."
            : `You'll get a detailed estimate for ${locFull(answers)}.`}
        </Numbered>
      </ol>

      <div className="flex flex-col gap-2">
        <span id="mlabel" className="text-[15px] font-semibold text-ink">
          How should we reach you first?
        </span>
        <div role="group" aria-labelledby="mlabel" className="grid grid-cols-3 gap-2.5">
          {methods.map((m) => (
            <Chip
              key={m}
              label={m}
              icon={METHOD_ICONS[m]}
              selected={answers.method === m}
              onClick={() => dispatch({ type: "setMethod", value: m })}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border-[1.5px] border-line p-4">
        <strong className="text-ink">Rather pick a time?</strong>
        {answers.slot ? (
          <p className="font-semibold text-go-deep">
            Booked for {answers.slot}.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {slots.map((t) => (
              <Choice key={t} label={t} onClick={() => dispatch({ type: "setSlot", value: t })} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border-[1.5px] border-line p-4">
        <strong className="text-ink">Optional: how soon would you like to start?</strong>
        <div className="flex flex-col gap-2.5">
          {times.map((t) => (
            <Choice
              key={t}
              label={t}
              selected={answers.timeline === t}
              onClick={() => dispatch({ type: "setTimeline", value: t })}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* --- small bits ------------------------------------------------------------ */

function ExitBox({
  answers,
  errors,
  dispatch,
  title,
  button,
  variant = "primary",
}: Omit<Props, "step"> & {
  title: string;
  button: string;
  /** "secondary" = optional capture sitting beside a louder primary action. */
  variant?: "primary" | "secondary";
}) {
  if (answers.exitSent) {
    return (
      <div className="rounded-lg bg-go-soft/60 p-4">
        <p className="font-semibold text-go-deep">
          Thanks — we'll email {answers.exitEmail}.
        </p>
      </div>
    );
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "submitExit" });
  };
  // Secondary variant is a quiet, optional block (no heavy border, outline CTA)
  // so the screen has a single clear primary action.
  const wrap =
    variant === "secondary"
      ? "flex flex-col gap-3 rounded-lg bg-tint p-4"
      : "flex flex-col gap-3 rounded-lg border-[1.5px] border-line p-4";
  return (
    <form onSubmit={onSubmit} className={wrap} noValidate>
      <strong className="text-ink">{title}</strong>
      <Field
        id="exitEmail"
        label="Email (optional)"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="off"
        autoCorrect="off"
        value={answers.exitEmail}
        error={errors.exitEmail}
        onChange={(e) => dispatch({ type: "setField", key: "exitEmail", value: e.target.value })}
      />
      <Cta type="submit" variant={variant}>
        {button}
      </Cta>
    </form>
  );
}

function Numbered({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[16px] leading-relaxed text-ink">
      <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-go-soft text-[14px] font-bold text-go-deep">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function CheckDot() {
  return (
    <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-go text-action-ink">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M2.5 6.2l2.2 2.2 4.8-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
