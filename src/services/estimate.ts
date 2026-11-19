/* ============================================================================
   Earnings estimate service.

   Ships a MOCK lookup so the prototype is self-contained. The real thing would
   call Evolve's revenue model (comparable nearby rentals x bedrooms x season).
   The result is deliberately a RANGE, labelled as sample data in the UI — an
   over-confident point estimate can lift completion but hurt close rate later.

   Swap the implementation behind `EstimateService` without touching callers.
   ============================================================================ */

export interface EstimateRange {
  /** Lower bound in whole dollars. */
  low: number;
  /** Upper bound in whole dollars. */
  high: number;
  /** Pre-formatted "$34,000 to $48,000". */
  display: string;
  /** True while this is prototype sample data (always true here). */
  isSample: boolean;
}

export interface EstimateService {
  getRange(bedrooms: string, place: string): EstimateRange;
}

/** Annual base in $thousands per bedroom count. Prototype sample table. */
const BASE: Record<string, number> = {
  Studio: 24,
  "1": 30,
  "2": 41,
  "3": 54,
  "4": 68,
  "5": 83,
  "6+": 99,
};

/** +/-18% band around the base, rounded to the nearest thousand. */
function bandFor(bedrooms: string): { low: number; high: number } {
  const base = BASE[bedrooms] ?? 41;
  return {
    low: Math.round(base * 0.82) * 1000,
    high: Math.round(base * 1.18) * 1000,
  };
}

function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export const mockEstimateService: EstimateService = {
  getRange(bedrooms /* , place */) {
    // `place` is accepted for parity with the real signature (the live model
    // would vary the band by market); the mock ignores it.
    const { low, high } = bandFor(bedrooms);
    return {
      low,
      high,
      display: `${money(low)} to ${money(high)}`,
      isSample: true,
    };
  },
};

/* --- Seam for the real service ---------------------------------------------
export const placesEstimateService: EstimateService = {
  getRange(bedrooms, place) {
    // fetch('/api/estimate?beds=' + bedrooms + '&place=' + place) ...
    // Return { low, high, display, isSample: false }.
  },
};
---------------------------------------------------------------------------- */

/** The implementation the app uses. Change this one line to go live. */
export const estimateService: EstimateService = mockEstimateService;

export function getRange(bedrooms: string, place: string): EstimateRange {
  return estimateService.getRange(bedrooms, place);
}
