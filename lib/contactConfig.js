const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Web3Forms access keys are public browser identifiers, not server-side
// secrets. Keeping the production value out of source control still reduces
// accidental reuse and bot scraping. Restrict the key to the production
// domain in Web3Forms and inject it at build time.
export const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || "";

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export function contactFormsConfigured() {
  return KEY_PATTERN.test(WEB3FORMS_ACCESS_KEY);
}
