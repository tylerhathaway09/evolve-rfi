/* ============================================================================
   Types for the RFI flow. The lead object is the contract with sales; the
   answers object is the full working state while the owner moves through.
   ============================================================================ */

/** The two real paths through the flow (exits are off-path). */
export type Path = "single" | "multi";

/** The first-question choice. "buy" leaves the owner flow immediately. */
export type Intent = "single" | "multi" | "buy";

export type StepId =
  // single path
  | "intent"
  | "type"
  | "beds"
  | "location"
  | "renting"
  | "furnished"
  | "estimate"
  | "street"
  | "contact"
  | "done"
  // multi path
  | "count"
  | "market"
  | "rentingMulti"
  // exits (off the progress bar)
  | "ineligible"
  | "buy";

export type ContactMethod = "Call" | "Text" | "Email";

/** How the owner gave us their location on the address step. */
export type LocKind = "address" | "zip" | "text";

export interface LocValue {
  kind: LocKind;
  street?: string;
  city?: string;
  st?: string;
  zip?: string;
  /** Raw free text, when the owner continued with what they typed. */
  text?: string;
}

/** Full working state. One flat object, easy to persist and reason about. */
export interface Answers {
  /** Intent choice from the first screen. */
  path: Intent | null;

  // --- single path ---
  type: string | null;
  beds: string | null;
  loc: LocValue | null;
  locText: string; // live text in the address field
  renting: string | null;
  furnished: string | null;

  // --- contact (both paths) ---
  name: string;
  email: string;
  phone: string;
  method: ContactMethod;
  /** Street collected at contact time when location was a ZIP or free text. */
  street: string;

  // --- multi path ---
  count: string | null;
  market: string;
  rentingMulti: string | null;

  // --- optional, after submit ---
  timeline: string | null;
  slot: string | null;

  // --- exit email capture ---
  exitEmail: string;
  exitSent: boolean;
}

/**
 * What sales receives on completion. Logged to the console and rendered in the
 * "What sales receives" panel. Nothing is ever sent anywhere.
 */
export interface Lead {
  path: Path;
  /** What the owner typed (one field - less friction on mobile). */
  name: string;
  /** Derived on submit so sales/CRM still gets structured first/last. */
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactMethod: ContactMethod;

  // single
  propertyAddress?: string;
  propertyType?: string;
  bedrooms?: string;
  furnished?: "Furnished" | "Not yet";
  currentlyRenting?: "Yes" | "No";
  rangeShown?: string;

  // multi
  propertyCount?: string;
  mainMarket?: string;
  anyRented?: "Yes" | "No";

  // optional, after submit
  timeline?: string;
  callSlot?: string;
}

/** Validation errors keyed by field id. */
export type Errors = Partial<Record<string, string>>;
