import { neon } from "@neondatabase/serverless";

const MAX_BODY_BYTES = 5_000_000;
const KEY_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;

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

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.PFF_ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
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

    if (request.method === "OPTIONS") {
      if (origin && origin !== env.PFF_ALLOWED_ORIGIN) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: cors(env) });
    }

    if (origin && origin !== env.PFF_ALLOWED_ORIGIN) {
      return json(env, { error: "origin_not_allowed" }, 403);
    }

    if (!env.DATABASE_URL || !env.PFF_SYNC_TOKEN) {
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
        return json(env, {
          ok: rows.length === 1,
          schema: rows[0]?.value ?? null,
        });
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

      const key = decodeURIComponent(match[1]);
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

        const schemaVersion = Number(body.schemaVersion ?? 1);
        const expectedRevision =
          body.expectedRevision == null ? null : Number(body.expectedRevision);
        const checksum =
          typeof body.checksum === "string" ? body.checksum.slice(0, 200) : null;
        const sourceDeviceKey =
          typeof body.sourceDeviceKey === "string"
            ? body.sourceDeviceKey.slice(0, 200)
            : null;

        if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
          return json(env, { error: "invalid_schema_version" }, 400);
        }
        if (
          expectedRevision !== null &&
          (!Number.isInteger(expectedRevision) || expectedRevision < 0)
        ) {
          return json(env, { error: "invalid_expected_revision" }, 400);
        }
        if (!Object.prototype.hasOwnProperty.call(body, "payload")) {
          return json(env, { error: "payload_required" }, 400);
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
