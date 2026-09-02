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

function browserOnly() {
  return typeof window !== "undefined";
}

export function normalizeSyncEndpoint(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (
      url.protocol !== "https:" &&
      url.hostname !== "127.0.0.1" &&
      url.hostname !== "localhost"
    ) return "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

export function getSavedSyncEndpoint() {
  if (!browserOnly()) return "";
  return normalizeSyncEndpoint(localStorage.getItem(ENDPOINT_KEY) || "");
}

export function saveSyncEndpoint(value) {
  if (!browserOnly()) return "";
  const endpoint = normalizeSyncEndpoint(value);
  if (!endpoint) throw new Error("invalid_endpoint");
  localStorage.setItem(ENDPOINT_KEY, endpoint);
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
    const parsed = JSON.parse(localStorage.getItem(REVISIONS_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function writeRevisionMap(value) {
  localStorage.setItem(REVISIONS_KEY, JSON.stringify(value));
}

function authHeaders(token, json = false) {
  const headers = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function api(endpoint, token, path, init = {}) {
  const response = await fetch(`${endpoint}${path}`, {
    cache: "no-store",
    ...init,
  });
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

async function checksum(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function localSyncInventory() {
  return FARM_STORES.map((store) => ({
    ...store,
    present: readValidFarmStore(store) !== null,
  }));
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

    revisions[store.id] = Number(body.revision);
    writeRevisionMap(revisions);
    result.uploaded += 1;
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

    valid.push({
      store,
      payload: body.payload,
      revision: Number(body.revision || 0),
    });
  }

  if (!valid.length) return { restored: 0, stores: [] };

  const current = {};
  for (const { store } of valid) {
    const local = readValidFarmStore(store);
    if (local !== null) current[store.id] = local;
  }

  const snapshot = {
    version: 1,
    createdAt: new Date().toISOString(),
    reason: "before-cloud-pull",
    stores: current,
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

  for (const item of valid) {
    localStorage.setItem(item.store.key, JSON.stringify(item.payload));
    revisions[item.store.id] = item.revision;
  }

  writeRevisionMap(revisions);

  return {
    restored: valid.length,
    stores: valid.map((item) => item.store.label),
  };
}
