// Web3Forms access keys are client-facing identifiers, not server secrets.
// Keep the production domain restricted in the Web3Forms dashboard so the
// public key cannot be casually reused from unrelated sites. An environment
// value can replace the legacy key without changing application code.
export const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
  "2cbd28d3-7400-421d-b6e5-5de0fa1a2939";
