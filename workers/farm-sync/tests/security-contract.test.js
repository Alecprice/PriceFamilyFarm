import { describe, expect, it } from "vitest";
import fs from "node:fs";
import worker from "../src/index.js";

const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const migration002 = fs.readFileSync(
  new URL("../migrations/002_serialize_document_creates.sql", import.meta.url),
  "utf8",
);

const allowedOrigin = "https://price-family-farm.alecjprice.com";
const configuredEnv = {
  DATABASE_URL: "postgresql://user:pass@example.com/farm",
  PFF_SYNC_TOKEN: "test-sync-token",
  PFF_ALLOWED_ORIGIN: allowedOrigin,
};
const emptyObjectChecksum =
  "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a";

function authorizedHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${configuredEnv.PFF_SYNC_TOKEN}`,
    Origin: allowedOrigin,
    ...extra,
  };
}

async function readJson(response) {
  return JSON.parse(await response.text());
}

async function putBody(body) {
  return worker.fetch(
    new Request("https://sync.example/v1/documents/records", {
      method: "PUT",
      headers: authorizedHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    }),
    configuredEnv,
  );
}

describe("Farm OS cloud sync security contracts", () => {
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

  it("keeps the streamed request limit byte-based", () => {
    expect(source).toContain("request.body.getReader()");
    expect(source).toContain("value.byteLength");
    expect(source).toContain("payload_too_large");
  });

  it("uses canonical key ordering for integrity hashes", () => {
    expect(source).toContain("Object.keys(value).sort()");
    expect(source).toContain('crypto.subtle.digest("SHA-256"');
    expect(source).toContain("CHECKSUM_PATTERN");
  });

  it("serializes first-write races before the document row lookup", () => {
    const advisoryLockIndex = migration002.indexOf(
      "PERFORM pg_advisory_xact_lock(",
    );
    const rowLookupIndex = migration002.indexOf("SELECT *", advisoryLockIndex);
    const rowLockIndex = migration002.indexOf("FOR UPDATE", rowLookupIndex);

    expect(advisoryLockIndex).toBeGreaterThanOrEqual(0);
    expect(rowLookupIndex).toBeGreaterThan(advisoryLockIndex);
    expect(rowLockIndex).toBeGreaterThan(rowLookupIndex);
    expect(migration002).toContain("'version', 2");
  });
});

describe("Farm OS cloud sync request boundary", () => {
  it("accepts preflight only for the configured origin", async () => {
    const allowed = await worker.fetch(
      new Request("https://sync.example/v1/documents", {
        method: "OPTIONS",
        headers: { Origin: allowedOrigin },
      }),
      { PFF_ALLOWED_ORIGIN: allowedOrigin },
    );
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);

    const denied = await worker.fetch(
      new Request("https://sync.example/v1/documents", {
        method: "OPTIONS",
        headers: { Origin: "https://attacker.example" },
      }),
      { PFF_ALLOWED_ORIGIN: allowedOrigin },
    );
    expect(denied.status).toBe(403);
  });

  it("fails closed when the preflight allowed origin is not configured", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/v1/documents", {
        method: "OPTIONS",
        headers: { Origin: allowedOrigin },
      }),
      {},
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("rejects a disallowed request origin before configuration or database access", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/health", {
        headers: { Origin: "https://attacker.example" },
      }),
      { PFF_ALLOWED_ORIGIN: allowedOrigin },
    );
    expect(response.status).toBe(403);
    expect(await readJson(response)).toEqual({ error: "origin_not_allowed" });
  });

  it("fails closed when server configuration is missing", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/health", {
        headers: { Origin: allowedOrigin },
      }),
      { PFF_ALLOWED_ORIGIN: allowedOrigin },
    );
    expect(response.status).toBe(503);
    expect(await readJson(response)).toEqual({ error: "server_not_configured" });
  });

  it("requires the allowed production origin even for non-browser clients", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/health", {
        headers: {
          Authorization: `Bearer ${configuredEnv.PFF_SYNC_TOKEN}`,
        },
      }),
      {
        DATABASE_URL: configuredEnv.DATABASE_URL,
        PFF_SYNC_TOKEN: configuredEnv.PFF_SYNC_TOKEN,
      },
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(await readJson(response)).toEqual({ error: "server_not_configured" });
  });

  it("rejects an invalid bearer token before database access", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/health", {
        headers: {
          Origin: allowedOrigin,
          Authorization: "Bearer wrong-token",
        },
      }),
      configuredEnv,
    );
    expect(response.status).toBe(401);
    expect(await readJson(response)).toEqual({ error: "unauthorized" });
  });

  it("rejects malformed, encoded, or unapproved document keys without querying the database", async () => {
    for (const path of [
      "/v1/documents/%E0%A4%A",
      "/v1/documents/not%2Fallowed",
      "/v1/documents/admin",
    ]) {
      const response = await worker.fetch(
        new Request(`https://sync.example${path}`, {
          headers: authorizedHeaders(),
        }),
        configuredEnv,
      );
      expect(response.status).toBe(400);
      expect(await readJson(response)).toEqual({ error: "invalid_document_key" });
    }
  });

  it("rejects unsupported methods on valid document paths", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/v1/documents/records", {
        method: "DELETE",
        headers: authorizedHeaders(),
      }),
      configuredEnv,
    );
    expect(response.status).toBe(405);
    expect(await readJson(response)).toEqual({ error: "method_not_allowed" });
  });

  it("rejects malformed JSON before any database write", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/v1/documents/records", {
        method: "PUT",
        headers: authorizedHeaders({ "Content-Type": "application/json" }),
        body: "{not-json",
      }),
      configuredEnv,
    );
    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({ error: "invalid_json" });
  });

  it("requires supported schema and optimistic revision metadata before database writes", async () => {
    const unsupportedSchema = await putBody({
      schemaVersion: 2,
      expectedRevision: 0,
      checksum: emptyObjectChecksum,
      sourceDeviceKey: "device-1",
      payload: {},
    });
    expect(unsupportedSchema.status).toBe(400);
    expect(await readJson(unsupportedSchema)).toEqual({ error: "invalid_schema_version" });

    const missingRevision = await putBody({
      schemaVersion: 1,
      checksum: emptyObjectChecksum,
      sourceDeviceKey: "device-1",
      payload: {},
    });
    expect(missingRevision.status).toBe(400);
    expect(await readJson(missingRevision)).toEqual({ error: "invalid_expected_revision" });
  });

  it("requires a source device key and matching canonical payload checksum", async () => {
    const missingDevice = await putBody({
      schemaVersion: 1,
      expectedRevision: 0,
      checksum: emptyObjectChecksum,
      payload: {},
    });
    expect(missingDevice.status).toBe(400);
    expect(await readJson(missingDevice)).toEqual({ error: "invalid_source_device_key" });

    const badChecksum = await putBody({
      schemaVersion: 1,
      expectedRevision: 0,
      checksum: "0".repeat(64),
      sourceDeviceKey: "device-1",
      payload: {},
    });
    expect(badChecksum.status).toBe(400);
    expect(await readJson(badChecksum)).toEqual({ error: "invalid_checksum" });
  });

  it("enforces the declared byte limit before reading the body", async () => {
    const response = await worker.fetch(
      new Request("https://sync.example/v1/documents/records", {
        method: "PUT",
        headers: authorizedHeaders({
          "Content-Type": "application/json",
          "Content-Length": "5000001",
        }),
        body: "{}",
      }),
      configuredEnv,
    );
    expect(response.status).toBe(413);
    expect(await readJson(response)).toEqual({ error: "payload_too_large" });
  });

  it("enforces the byte limit for multibyte streamed bodies without Content-Length", async () => {
    const multibyteBody = `{"payload":"${"é".repeat(2_500_001)}"}`;
    expect(multibyteBody.length).toBeLessThan(5_000_000);
    expect(new TextEncoder().encode(multibyteBody).byteLength).toBeGreaterThan(5_000_000);

    const response = await worker.fetch(
      new Request("https://sync.example/v1/documents/records", {
        method: "PUT",
        headers: authorizedHeaders({ "Content-Type": "application/json" }),
        body: multibyteBody,
      }),
      configuredEnv,
    );
    expect(response.status).toBe(413);
    expect(await readJson(response)).toEqual({ error: "payload_too_large" });
  });
});
