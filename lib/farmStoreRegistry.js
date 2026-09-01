import {
  isValidBackupCollection,
  isValidPlanShape,
} from "@/lib/planner/plannerStorage";

export const FARM_STORES = [
  { id: "records", key: "price-family-farm-records-v2", label: "Farm records", max: 2_000_000, kind: "object" },
  { id: "funding", key: "price-family-farm-funding-v1", label: "Funding & education", max: 500_000, kind: "array" },
  { id: "planner", key: "price-family-farm-planner-v1", label: "Farm planner", max: 1_000_000, kind: "array" },
  { id: "journey", key: "pff.growingJourney.v1", label: "My Growing Journey", max: 750_000, kind: "journey" },
  { id: "journey-backups", key: "pff.growingJourney.backups.v1", label: "Growing Journey recovery snapshots", max: 4_000_000, kind: "journey-backups" },
  { id: "calendar", key: "price-family-farm-calendar-v1", label: "Farm calendar", max: 1_000_000, kind: "array" },
  { id: "journal", key: "price-family-farm-journal-v1", label: "Farm journal", max: 1_000_000, kind: "array" },
  { id: "garden", key: "price-family-farm-garden-layout-v1", label: "Garden layout", max: 500_000, kind: "array" },
  { id: "map", key: "price-family-farm-map-v1", label: "Schematic farm map", max: 500_000, kind: "array" },
  { id: "inventory", key: "price-family-farm-inventory-v1", label: "Farm inventory", max: 500_000, kind: "array" },
  { id: "plantings", key: "price-family-farm-plantings-v1", label: "Plantings & successions", max: 1_000_000, kind: "array" },
  { id: "market", key: "price-family-farm-market-plan-v1", label: "Market planner", max: 750_000, kind: "array" },
];

export const FARM_STORE_BY_ID = Object.fromEntries(
  FARM_STORES.map((store) => [store.id, store]),
);

export const MAX_FARM_SYNC_BYTES = 9_500_000;

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function validFarmStoreValue(store, value) {
  if (!store) return false;
  if (store.kind === "array" && !Array.isArray(value)) return false;
  if (store.kind === "object" && !safeObject(value)) return false;
  if (store.kind === "journey" && !isValidPlanShape(value)) return false;
  if (store.kind === "journey-backups" && !isValidBackupCollection(value)) return false;

  try {
    return JSON.stringify(value).length <= store.max;
  } catch {
    return false;
  }
}

export function readValidFarmStore(store) {
  try {
    const raw = localStorage.getItem(store.key);
    if (!raw || raw.length > store.max) return null;
    const value = JSON.parse(raw);
    return validFarmStoreValue(store, value) ? value : null;
  } catch {
    return null;
  }
}
