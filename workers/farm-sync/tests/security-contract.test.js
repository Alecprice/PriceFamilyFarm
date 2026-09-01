import { describe, expect, it } from "vitest";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

describe("Farm OS cloud sync security", () => {
  it("keeps the Neon connection server-side", () => {
    expect(source).toContain("env.DATABASE_URL");
    expect(source).not.toContain("NEXT_PUBLIC_DATABASE_URL");
  });

  it("requires an authorization token and restricted CORS", () => {
    expect(source).toContain("Authorization");
    expect(source).toContain("PFF_SYNC_TOKEN");
    expect(source).toContain("PFF_ALLOWED_ORIGIN");
  });

  it("writes through the revision-aware database function", () => {
    expect(source).toContain("expectedRevision");
    expect(source).toContain("pff_put_document");
    expect(source).toContain('status === "conflict"');
  });
});
