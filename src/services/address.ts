/* ============================================================================
   Address suggestion service.

   Ships a MOCK over eight sample addresses so the prototype needs no API key.
   The real thing would call Google Places Autocomplete (or similar). Baymard:
   automatic address lookup is the best-performing address-entry pattern, and
   address errors are far more common on mobile.

   Swap the implementation behind `AddressService` without touching callers.
   ============================================================================ */

export interface AddressSuggestion {
  street: string;
  city: string;
  st: string;
  zip: string;
}

export interface AddressService {
  /** Return up to `limit` matches for a free-text query. */
  suggest(query: string, limit?: number): AddressSuggestion[];
}

/** Eight sample vacation-rental markets. Prototype data only. */
export const SAMPLE_ADDRESSES: AddressSuggestion[] = [
  { street: "12 Harbor View Rd", city: "Cape May", st: "NJ", zip: "08204" },
  { street: "48 Pine Ridge Trail", city: "Gatlinburg", st: "TN", zip: "37738" },
  { street: "305 Gulf Shore Dr", city: "Destin", st: "FL", zip: "32541" },
  { street: "7 Aspen Ct", city: "Breckenridge", st: "CO", zip: "80424" },
  { street: "1190 Lakeshore Blvd", city: "Incline Village", st: "NV", zip: "89451" },
  { street: "26 Dune Grass Ln", city: "Kill Devil Hills", st: "NC", zip: "27948" },
  { street: "410 Canyon Rim Rd", city: "Sedona", st: "AZ", zip: "86336" },
  { street: "88 Mill Pond Rd", city: "Stowe", st: "VT", zip: "05672" },
];

function full(a: AddressSuggestion): string {
  return `${a.street}, ${a.city}, ${a.st} ${a.zip}`;
}

export const mockAddressService: AddressService = {
  suggest(query, limit = 4) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return SAMPLE_ADDRESSES.filter((a) =>
      full(a).toLowerCase().includes(q),
    ).slice(0, limit);
  },
};

/* --- Seam for the real service ---------------------------------------------
export const placesAddressService: AddressService = {
  suggest(query) {
    // new google.maps.places.AutocompleteService().getPlacePredictions(...)
    // Map predictions to AddressSuggestion[]. Debounce in the caller.
  },
};
---------------------------------------------------------------------------- */

/** The implementation the app uses. Change this one line to go live. */
export const addressService: AddressService = mockAddressService;

export function suggest(query: string, limit?: number): AddressSuggestion[] {
  return addressService.suggest(query, limit);
}

/** Format a suggestion as a single display string. */
export function formatAddress(a: AddressSuggestion): string {
  return full(a);
}
