/* ============================================================================
   Derived values read off the answers object. Kept pure and in one place so
   screens, the flow map and the lead panel all describe the lead identically.
   ============================================================================ */

import { getRange } from "../services/estimate";
import { pathOf } from "./steps";
import type { Answers, Lead } from "./types";

/** Short place label for headings: "Cape May, NJ" / "ZIP 37738" / free text. */
export function place(a: Answers): string {
  if (!a.loc) return "";
  if (a.loc.kind === "address") return `${a.loc.city}, ${a.loc.st}`;
  if (a.loc.kind === "zip") return `ZIP ${a.loc.zip}`;
  return a.loc.text ?? "";
}

/** Full address string for the lead and confirmation. */
export function locFull(a: Answers): string {
  if (!a.loc) return "";
  if (a.loc.kind === "address") {
    return `${a.loc.street}, ${a.loc.city}, ${a.loc.st} ${a.loc.zip}`;
  }
  const rest = a.loc.kind === "zip" ? `ZIP ${a.loc.zip}` : (a.loc.text ?? "");
  return a.street ? `${a.street} (${rest})` : rest;
}

/** Pre-formatted earnings range for the current beds + place. */
export function rangeDisplay(a: Answers): string {
  if (!a.beds) return "";
  return getRange(a.beds, place(a)).display;
}

/** "Studios" / "2-bedroom homes" — the subject of the estimate sentence. */
export function bedsLabel(a: Answers): string {
  if (!a.beds) return "homes";
  return a.beds === "Studio" ? "Studios" : `${a.beds}-bedroom homes`;
}

/** First name for the friendly confirmation greeting. */
export function firstName(a: Answers): string {
  return (a.name || "").trim().split(/\s+/)[0] || "there";
}

/**
 * Split one typed name into first/last for the lead object. One visible field
 * keeps the contact step short (the lever against the 35% drop-off); splitting
 * on the last space still hands sales a structured first + last name.
 */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

/**
 * The answer shown next to a completed step in the flow map. Mirrors the
 * prototype's `answer(id)`.
 */
export function stepAnswer(a: Answers, id: string): string {
  switch (id) {
    case "intent":
      return a.path === "single"
        ? "One property"
        : a.path === "multi"
          ? "Several properties"
          : a.path === "buy"
            ? "Buying"
            : "";
    case "type":
      return a.type ?? "";
    case "beds":
      return a.beds ?? "";
    case "location":
      return a.loc ? locFull(a) : "";
    case "renting":
      return a.renting ?? "";
    case "furnished":
      return a.furnished ?? "";
    case "estimate":
      return a.beds && a.loc ? rangeDisplay(a) : "";
    case "contact":
      return a.email || "";
    case "count":
      return a.count ?? "";
    case "market":
      return a.market || "";
    case "rentingMulti":
      return a.rentingMulti ?? "";
    default:
      return "";
  }
}

/** Build the lead object sales receives. Nothing is sent — this is logged and
 *  rendered only. */
export function buildLead(a: Answers): Lead {
  const path = pathOf(a);
  const { firstName: first, lastName: last } = splitName(a.name);
  const base: Lead = {
    path,
    name: a.name,
    firstName: first,
    lastName: last,
    email: a.email,
    phone: a.phone,
    contactMethod: a.method,
    timeline: a.timeline ?? undefined,
    callSlot: a.slot ?? undefined,
  };

  if (path === "multi") {
    return {
      ...base,
      propertyCount: a.count ?? undefined,
      mainMarket: a.market || undefined,
      anyRented: (a.rentingMulti as Lead["anyRented"]) ?? undefined,
    };
  }

  return {
    ...base,
    propertyAddress: locFull(a),
    propertyType: a.type ?? undefined,
    bedrooms: a.beds ?? undefined,
    furnished: (a.furnished as Lead["furnished"]) ?? undefined,
    currentlyRenting: a.renting === "Yes" ? "Yes" : a.renting ? "No" : undefined,
    rangeShown: rangeDisplay(a),
  };
}
