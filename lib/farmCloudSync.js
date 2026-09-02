import {
  FARM_STORES,
  readValidFarmStore,
  validFarmStoreValue,
} from "@/lib/farmStoreRegistry";

const ENDPOINT_KEY = "price-family-farm-cloud-sync-endpoint-v1";
const TOKEN_KEY = "price-family-farm-cloud-sync-token-v1";
const DEVICE_KEY = "price-family-farm-cloud-sync-device-v1";
const REVISIONS_KEY = "price-family-farm-cloud-sync-revisions-v1";
const PRE_PULL_KEY = "price-family-farm-pre-cloud-pull-v1";
const MAX_PRE_PULL_BYTES = 9_500_000;
const REQUEST_TIMEOUT_MS = 30_000;
const CHECKSUM_PATTERN = /^[a-f0-9]{64}$/;
const CONFIGURED_SYNC_ENDPOINT = process.env.NEXT_PUBLIC_FARM_SYNC_ENDPOINT || "";

function browserOnly() {
  return typeof window !== "undefined";
}

function isLoopbackHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function sanitizeRevisionMap(value) {
  const revisions = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return revisions;
  for (const store of FARM_STORES) {
    const revision = Number(value[store.id]);
    if (Number.isInteger(revision) && revision >= 0) {
      revisions[store.id] = revision;
    }
  }
  return revisions;
}

export function normalizeSyncEndpoint(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const loopback = isLoopbackHost(url.hostname);
    if (url.username || url.password || url.search || url.hash) return "";
    if (url.pathname && url.pathname !== "/") return "";
    if (url.protocol !== "https:" && !(loopback && url.protocol === "http:")) return "";
    return url.origin;
  } catch {
    return "";
  }
}

export function getConfiguredSyncEndpoint() {
  return normalizeSyncEndpoint(CONFIGURED_SYNC_ENDPOINT);
}

export function resolveAllowedSyncEndpoint(value) {
  const endpoint = normalizeSyncEndpoint(value);
  if (!endpoint) return "";

  const configured = getConfiguredSyncEndpoint();
  if (configured) return endpoint === configured ? endpoint : "";

  try {
    return isLoopbackHost(new URL(endpoint).hostname) ? endpoint : "";
  } catch {
    return "";
  }
}

export function getSavedSyncEndpoint() {
  const configured = getConfiguredSyncEndpoint();
  if (configured) return configured;
  if (!browserOnly()) return "";
  return resolveAllowedSyncEndpoint(localStorage.getItem(ENDPOINT_KEY) || "");
}

export function saveSyncEndpoint(value) {
  const endpoint = resolveAllowedSyncEndpoint(value);
  if (!endpoint) {
    throw new Error(getConfiguredSyncEndpoint() ? "endpoint_not_allowed" : "endpoint_not_configured");
  }

  if (browserOnly()) {
    if (getConfiguredSyncEndpoint()) localStorage.removeItem(ENDPOINT_KEY);
    else localStorage.setItem(ENDPOINT_KEY, endpoint);
  }
  return endpoint;
}

export function getSessionSyncToken() {
  if (!browserOnly()) return "";
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setSessionSyncToken(value) {
  if (!browserOnly()) return;
  const token = String(value || "").trim();
  if (!token) sessionStorage.removeItem(TOKEN_KEY);
  else sessionStorage.setItem(TOKEN_KEY, token);
}

export function getDeviceKey() {
  if (!browserOnly()) return "";
  let key = localStorage.getItem(DEVICE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, key);
  }
  return key;
}

function readRevisionMap() {
  if (!browserOnly()) return {};
  try {
    return sanitizeRevisionMap(
      JSON.parse(localStorage.getItem(REVISIONS_KEY) || "{}"),
    );
  } catch {
    return {};
  }
}

function writeRevisionMap(value) {
  localStorage.setItem(REVISIONS_KEY, JSON.stringify(sanitizeRevisionMap(value)));
}

function authHeaders(token, json = false) {
  const safeToken = String(token || "").trim();
  if (!safeToken) throw new Error("token_required");
  const headers = { Authorization: `Bearer ${safeToken}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function api(endpoint, token, path, init = {}) {
  const allowedEndpoint = resolveAllowedSyncEndpoint(endpoint);
  if (!allowedEndpoint) throw new Error("endpoint_not_allowed");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${allowedEndpoint}${path}`, {
      cache: "no-store",
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) throw new Error("request_timeout");
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

export async function testCloudConnection(endpoint, token) {
  const { response, body } = await api(endpoint, token, "/health", {
    headers: authHeaders(token),
  });
  if (!response.ok || !body?.ok) {
    throw new Error(body?.error || `health_${response.status}`);
  }
  return body;
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

async function checksum(value) {
  const serialized = stableJsonStringify(value);
  if (typeof serialized !== "string") throw new Error("invalid_sync_payload");
  const bytes = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parsePrePullSnapshot() {
  if (!browserOnly()) return null;
  try {
    const snapshot = JSON.parse(localStorage.getItem(PRE_PULL_KEY) || "null");
    if (
      !snapshot ||
      typeof snapshot !== "object" ||
      Array.isArray(snapshot) ||
      ![1, 2].includes(snapshot.version) ||
      !snapshot.stores ||
      typeof snapshot.stores !== "object" ||
      Array.isArray(snapshot.stores)
    ) return null;

    const stores = {};
    for (const store of FARM_STORES) {
      if (!Object.prototype.hasOwnProperty.call(snapshot.stores, store.id)) continue;
      const value = snapshot.stores[store.id];
      if (validFarmStoreValue(store, value)) stores[store.id] = value;
    }

    const storedIds = new Set(Object.keys(stores));
    const absent = snapshot.version >= 2 && Array.isArray(snapshot.absent)
      ? snapshot.absent.filter(
          (id) =>
            typeof id === "string" &&
            FARM_STORES.some((store) => store.id === id) &&
            !storedIds.has(id),
        )
      : [];

    if (!Object.keys(stores).length && !absent.length) return null;

    return {
      version: snapshot.version,
      createdAt:
        typeof snapshot.createdAt === "string" ? snapshot.createdAt : null,
      stores,
      absent,
      revisions:
        snapshot.version >= 2 ? sanitizeRevisionMap(snapshot.revisions) : null,
    };
  } catch {
    return null;
  }
}

function restoreRawValue(key, raw) {
  if (raw == null) localStorage.removeItem(key);
  else localStorage.setItem(key, raw);
}

function applyLocalStoreBatch(changes, revisions, errorPrefix) {
  const previous = new Map(
    changes.map(({ store }) => [store.id, localStorage.getItem(store.key)]),
  );
  const previousRevisionRaw = localStorage.getItem(REVISIONS_KEY);
  const applied = [];

  try {
    for (const change of changes) {
      restoreRawValue(change.store.key, change.raw);
      applied.push(change.store);
    }
    writeRevisionMap(revisions);
  } catch {
    let rollbackFailed = false;

    for (const store of applied.reverse()) {
      try {
        restoreRawValue(store.key, previous.get(store.id));
      } catch {
        rollbackFailed = true;
      }
    }

    try {
      restoreRawValue(REVISIONS_KEY, previousRevisionRaw);
    } catch {
      rollbackFailed = true;
    }

    throw new Error(
      rollbackFailed ? `${errorPrefix}_rollback_failed` : `${errorPrefix}_write_failed`,
    );
  }
}

export function getPrePullRecoveryInfo() {
  const snapshot = parsePrePullSnapshot();
  if (!snapshot) return null;
  return {
    version: snapshot.version,
    createdAt: snapshot.createdAt,
    storeCount: Object.keys(snapshot.stores).length,
    absentCount: snapshot.absent.length,
    affectedCount: Object.keys(snapshot.stores).length + snapshot.absent.length,
  };
}

export function restorePrePullFarmStores() {
  const snapshot = parsePrePullSnapshot();
  if (!snapshot) throw new Error("pre_pull_recovery_missing");

  const changes = [];
  for (const store of FARM_STORES) {
    if (Object.prototype.hasOwnProperty.call(snapshot.stores, store.id)) {
      changes.push({ store, raw: JSON.stringify(snapshot.stores[store.id]) });
    } else if (snapshot.absent.includes(store.id)) {
      changes.push({ store, raw: null });
    }
  }

  let revisions;
  if (snapshot.revisions) {
    revisions = snapshot.revisions;
  } else {
    revisions = readRevisionMap();
    for (const { store } of changes) delete revisions[store.id];
  }

  applyLocalStoreBatch(changes, revisions, "pre_pull_recovery");

  return {
    restored: Object.keys(snapshot.stores).length,
    removed: snapshot.absent.length,
    createdAt: snapshot.createdAt,
  };
}

export function localSyncInventory() {
  return FARM_STORES.map((store) => ({
    ...store,
    present: readValidFarmStore(store) !== null,
  }));
}

function partialUploadFailure(result, store, error) {
  const cause = error instanceof Error ? error.message : String(error);
  return new Error(
    `partial_upload:${JSON.stringify({
      uploaded: result.uploaded,
      conflicts: result.conflicts.length,
      storeId: store.id,
      storeLabel: store.label,
      cause,
    })}`,
  );
}

export async function pushLocalFarmStores(endpoint, token) {
  const revisions = readRevisionMap();
  const deviceKey = getDeviceKey();
  const result = { uploaded: 0, conflicts: [], skipped: 0 };

  for (const store of FARM_STORES) {
    const payload = readValidFarmStore(store);
    if (payload === null) {
      result.skipped += 1;
      continue;
    }

    try {
      const expectedRevision = Number(revisions[store.id] || 0);
      const requestBody = {
        schemaVersion: 1,
        expectedRevision,
        checksum: await checksum(payload),
        sourceDeviceKey: deviceKey,
        payload,
      };

      const { response, body } = await api(
        endpoint,
        token,
        `/v1/documents/${encodeURIComponent(store.id)}`,
        {
          method: "PUT",
          headers: authHeaders(token, true),
          body: JSON.stringify(requestBody),
        },
      );

      if (response.status === 409) {
        result.conflicts.push({
          id: store.id,
          label: store.label,
          serverRevision: Number(body?.revision || 0),
        });
        continue;
      }

      if (!response.ok || body?.status !== "ok") {
        throw new Error(body?.error || `push_${store.id}_${response.status}`);
      }

      const nextRevision = Number(body.revision);
      if (!Number.isInteger(nextRevision) || nextRevision < 1) {
        throw new Error(`invalid_push_revision_${store.id}`);
      }
      revisions[store.id] = nextRevision;
      writeRevisionMap(revisions);
      result.uploaded += 1;
    } catch (error) {
      if (result.uploaded > 0 || result.conflicts.length > 0) {
        throw partialUploadFailure(result, store, error);
      }
      throw error;
    }
  }

  return result;
}

export async function listCloudFarmStores(endpoint, token) {
  const { response, body } = await api(endpoint, token, "/v1/documents", {
    headers: authHeaders(token),
  });
  if (!response.ok || !Array.isArray(body?.documents)) {
    throw new Error(body?.error || `list_${response.status}`);
  }
  return body.documents;
}

export async function pullCloudFarmStores(endpoint, token) {
  const documents = await listCloudFarmStores(endpoint, token);
  const revisions = readRevisionMap();
  const valid = [];

  for (const item of documents) {
    const id = String(item.document_key || "");
    const store = FARM_STORES.find((candidate) => candidate.id === id);
    if (!store) continue;

    const { response, body } = await api(
      endpoint,
      token,
      `/v1/documents/${encodeURIComponent(id)}`,
      { headers: authHeaders(token) },
    );

    if (!response.ok || !body) {
      throw new Error(body?.error || `pull_${id}_${response.status}`);
    }
    if (!validFarmStoreValue(store, body.payload)) {
      throw new Error(`invalid_cloud_payload_${id}`);
    }

    const schemaVersion = Number(body.schema_version);
    if (schemaVersion !== 1) {
      throw new Error(`invalid_cloud_schema_${id}`);
    }
    const revision = Number(body.revision);
    if (!Number.isInteger(revision) || revision < 1) {
      throw new Error(`invalid_cloud_revision_${id}`);
    }
    const remoteChecksum =
      typeof body.checksum === "string" ? body.checksum.trim().toLowerCase() : "";
    if (
      !CHECKSUM_PATTERN.test(remoteChecksum) ||
      remoteChecksum !== (await checksum(body.payload))
    ) {
      throw new Error(`invalid_cloud_checksum_${id}`);
    }

    valid.push({
      store,
      payload: body.payload,
      revision,
    });
  }

  if (!valid.length) return { restored: 0, stores: [] };

  const current = {};
  const absent = [];
  for (const { store } of valid) {
    const local = readValidFarmStore(store);
    if (local !== null) current[store.id] = local;
    else absent.push(store.id);
  }

  const snapshot = {
    version: 2,
    createdAt: new Date().toISOString(),
    reason: "before-cloud-pull",
    stores: current,
    absent,
    revisions,
  };
  const snapshotRaw = JSON.stringify(snapshot);
  const snapshotBytes = new TextEncoder().encode(snapshotRaw).byteLength;

  if (snapshotBytes > MAX_PRE_PULL_BYTES) {
    throw new Error("pre_pull_snapshot_too_large");
  }

  try {
    localStorage.setItem(PRE_PULL_KEY, snapshotRaw);
  } catch {
    throw new Error("pre_pull_snapshot_failed");
  }

  const nextRevisions = { ...revisions };
  const changes = valid.map((item) => {
    nextRevisions[item.store.id] = item.revision;
    return { store: item.store, raw: JSON.stringify(item.payload) };
  });

  applyLocalStoreBatch(changes, nextRevisions, "cloud_restore");

  return {
    restored: valid.length,
    stores: valid.map((item) => item.store.label),
  };
}
