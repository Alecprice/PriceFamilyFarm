import { neon } from "@neondatabase/serverless";

const MAX_BODY_BYTES = 5_000_000;
const KEY_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;
const CHECKSUM_PATTERN = /^[a-f0-9]{64}$/;
const EXPECTED_SCHEMA_NAME = "price-family-farm-cloud-sync";
const EXPECTED_SCHEMA_VERSION = 2;
const EXPECTED_PROJECT_ID = "small-water-25690282";

const ALLOWED_DOCUMENT_KEYS = new Set([
  "records",
  "funding",
  "planner",
  "journey",
  "journey-backups",
  "calendar",
  "journal",
  "garden",
  "map",
  "inventory",
  "plantings",
  "market",
]);

function allowedOrigin(env) {
  return typeof env.PFF_ALLOWED_ORIGIN === "string"
    ? env.PFF_ALLOWED_ORIGIN.trim()
    : "";
}

function cors(env) {
  const headers = {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  const origin = allowedOrigin(env);
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(env, value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...cors(env),
    },
  });
}

function constantTimeTokenMatch(header, token) {
  const expected = `Bearer ${token || ""}`;
  if (!header || header.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= header.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

function stableJsonStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJsonStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableJsonStringify(value[key])}`)
    .join(",")}}`;
}

async function payloadChecksum(value) {
  const serialized = stableJsonStringify(value);
  if (typeof serialized !== "string") throw new Error("invalid_payload");
  const bytes = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function schemaReady(schema) {
  return Boolean(
    schema &&
      typeof schema === "object" &&
      !Array.isArray(schema) &&
      schema.name === EXPECTED_SCHEMA_NAME &&
      Number(schema.version) === EXPECTED_SCHEMA_VERSION &&
      schema.projectId === EXPECTED_PROJECT_ID,
  );
}

async function readBoundedBody(request) {
  const lengthHeader = request.headers.get("Content-Length");
  const declaredLength = lengthHeader == null ? null : Number(lengthHeader);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new Error("payload_too_large");
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let raw = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      try {
        await reader.cancel();
      } catch {
        // Ignore cancellation errors; the request is already rejected.
      }
      throw new Error("payload_too_large");
    }
    raw += decoder.decode(value, { stream: true });
  }

  raw += decoder.decode();
  return raw;
}

async function currentFarmId(sql) {
  const rows = await sql`
    SELECT id
    FROM farm_spaces
    WHERE owner_subject = 'single-user'
    LIMIT 1
  `;
  if (!rows.length) throw new Error("farm_space_missing");
  return String(rows[0].id);
}

const worker = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const configuredOrigin = allowedOrigin(env);

    if (request.method === "OPTIONS") {
      if (!configuredOrigin) {
        return new Response(null, { status: 503, headers: cors(env) });
      }
      if (origin && origin !== configuredOrigin) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: cors(env) });
    }

    if (origin && origin !== configuredOrigin) {
      return json(env, { error: "origin_not_allowed" }, 403);
    }

    if (!configuredOrigin || !env.DATABASE_URL || !env.PFF_SYNC_TOKEN) {
      return json(env, { error: "server_not_configured" }, 503);
    }

    if (!constantTimeTokenMatch(request.headers.get("Authorization"), env.PFF_SYNC_TOKEN)) {
      return json(env, { error: "unauthorized" }, 401);
    }

    const url = new URL(request.url);
    const sql = neon(env.DATABASE_URL);

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        const rows = await sql`
          SELECT value
          FROM pff_meta
          WHERE key = 'schema'
          LIMIT 1
        `;
        const schema = rows[0]?.value ?? null;
        if (!schemaReady(schema)) {
          return json(
            env,
            { ok: false, error: "schema_not_ready", schema },
            503,
          );
        }
        return json(env, { ok: true, schema });
      }

      if (request.method === "GET" && url.pathname === "/v1/documents") {
        const farmId = await currentFarmId(sql);
        const rows = await sql`
          SELECT
            document_key,
            schema_version,
            revision,
            checksum,
            source_device_key,
            updated_at
          FROM farm_documents
          WHERE farm_id = ${farmId}
          ORDER BY document_key
        `;
        return json(env, { documents: rows });
      }

      const match = /^\/v1\/documents\/([^/]+)$/.exec(url.pathname);
      if (!match) return json(env, { error: "not_found" }, 404);

      let key;
      try {
        key = decodeURIComponent(match[1]);
      } catch {
        return json(env, { error: "invalid_document_key" }, 400);
      }
      if (!KEY_PATTERN.test(key) || !ALLOWED_DOCUMENT_KEYS.has(key)) {
        return json(env, { error: "invalid_document_key" }, 400);
      }

      if (request.method === "GET") {
        const farmId = await currentFarmId(sql);
        const rows = await sql`
          SELECT
            document_key,
            schema_version,
            revision,
            payload,
            checksum,
            source_device_key,
            updated_at
          FROM farm_documents
          WHERE farm_id = ${farmId}
            AND document_key = ${key}
          LIMIT 1
        `;
        if (!rows.length) return json(env, { error: "not_found" }, 404);
        return json(env, rows[0]);
      }

      if (request.method === "PUT") {
        const raw = await readBoundedBody(request);

        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          return json(env, { error: "invalid_json" }, 400);
        }

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          return json(env, { error: "invalid_body" }, 400);
        }

        const schemaVersion = Number(body.schemaVersion);
        const expectedRevision = Number(body.expectedRevision);
        const checksum =
          typeof body.checksum === "string"
            ? body.checksum.trim().toLowerCase()
            : "";
        const sourceDeviceKey =
          typeof body.sourceDeviceKey === "string"
            ? body.sourceDeviceKey.trim()
            : "";

        if (schemaVersion !== 1) {
          return json(env, { error: "invalid_schema_version" }, 400);
        }
        if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
          return json(env, { error: "invalid_expected_revision" }, 400);
        }
        if (!Object.prototype.hasOwnProperty.call(body, "payload")) {
          return json(env, { error: "payload_required" }, 400);
        }
        if (!sourceDeviceKey || sourceDeviceKey.length > 200) {
          return json(env, { error: "invalid_source_device_key" }, 400);
        }
        if (
          !CHECKSUM_PATTERN.test(checksum) ||
          checksum !== (await payloadChecksum(body.payload))
        ) {
          return json(env, { error: "invalid_checksum" }, 400);
        }

        const resultRows = await sql`
          SELECT pff_put_document(
            ${key},
            ${JSON.stringify(body.payload)}::jsonb,
            ${schemaVersion},
            ${expectedRevision},
            ${checksum},
            ${sourceDeviceKey}
          ) AS result
        `;

        const result = resultRows[0]?.result;
        if (result?.status === "conflict") return json(env, result, 409);
        return json(env, result ?? { error: "sync_failed" }, 200);
      }

      return json(env, { error: "method_not_allowed" }, 405);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("payload_too_large")) {
        return json(env, { error: "payload_too_large" }, 413);
      }
      console.error("Farm OS sync error", message);
      return json(env, { error: "internal_error" }, 500);
    }
  },
};

export default worker;
