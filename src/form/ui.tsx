/* ============================================================================
   Shared form primitives. Big tap targets, visible focus, strong contrast —
   tuned for an audience that skews 50+ and mobile. Body text never below 17px.

   Selected state uses a soft fill + trailing check (NOT a heavy ring) so it
   reads as "chosen", clearly distinct from the keyboard focus ring.
   ============================================================================ */

import type { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";

/** Full-width single-choice row (auto-advances on tap in the screens). */
export function Choice({
  label,
  sub,
  selected,
  onClick,
  icon,
}: {
  label: string;
  sub?: string;
  selected?: boolean;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        "flex w-full min-h-16 items-center gap-3 rounded-lg border-[1.5px] px-4 py-3 text-left transition-colors",
        selected
          ? "border-action bg-action-soft"
          : "border-line bg-surface hover:border-line-strong",
      ].join(" ")}
    >
      {icon && (
        <span
          className={selected ? "flex-none text-action" : "flex-none text-muted"}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[17px] font-semibold text-ink">{label}</span>
        {sub && <span className="text-[14px] font-normal text-muted">{sub}</span>}
      </span>
      {selected && (
        <Check className="ml-auto flex-none text-action" size={20} aria-hidden="true" />
      )}
    </button>
  );
}

/** Compact chip in a grid (bedrooms, contact method). */
export function Chip({
  label,
  selected,
  onClick,
  ariaLabel,
  icon,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
  ariaLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        "flex min-h-14 items-center justify-center gap-2 rounded-lg border-[1.5px] px-2 text-[17px] text-ink transition-colors",
        selected
          ? "border-action bg-action-soft font-semibold"
          : "border-line bg-surface hover:border-line-strong",
      ].join(" ")}
    >
      {icon && (
        <span className={selected ? "text-action" : "text-muted"} aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}

/** Primary (or secondary) action button. */
export function Cta({
  children,
  type = "button",
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-action text-action-ink hover:bg-action-hover"
      : "border-[1.5px] border-line bg-surface text-ink hover:border-line-strong";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`min-h-[54px] w-full rounded-lg px-5 py-3 text-[17px] font-bold transition-colors ${styles}`}
    >
      {children}
    </button>
  );
}

/** Quiet text-link button. */
export function TextButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 self-start py-2 text-left text-[16px] font-semibold text-action underline underline-offset-2 hover:text-action-hover"
    >
      {children}
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

/** Labeled text input with inline hint + error and the right mobile a11y.
 *  Focus ring is an inset box-shadow (not outline) so it is never clipped by a
 *  scroll container. */
export function Field({ id, label, hint, error, ...input }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "min-h-[52px] w-full rounded-md border-[1.5px] bg-surface px-3.5 py-2.5 text-[17px] text-ink",
          "placeholder:text-muted/70",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-action/70 focus-visible:border-action",
          error ? "border-error" : "border-line",
        ].join(" ")}
        {...input}
      />
      {hint && (
        <span id={hintId} className="text-[14px] text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={errId} className="text-[14px] font-semibold text-error">
          {error}
        </span>
      )}
    </div>
  );
}

/** Secondary (muted) line under a heading. */
export function Lede({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted">{children}</p>;
}

/** Fine print. */
export function Fine({ children }: { children: ReactNode }) {
  return <p className="text-[13.5px] leading-relaxed text-muted">{children}</p>;
}

/** Small uppercase eyebrow. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-go-deep">
      {children}
    </p>
  );
}

/** The screen heading — focus lands here on each step change. */
export function Heading({ children }: { children: ReactNode }) {
  return (
    <h1
      tabIndex={-1}
      className="text-[26px] leading-[1.18] font-extrabold text-ink outline-none sm:text-[28px]"
    >
      {children}
    </h1>
  );
}
