import type { CalculatorInput } from "@pizza-geek/core";

export type SavedRecipe = {
  id: string;
  name: string;
  createdAt: string;
  input: CalculatorInput;
};

export type BakeLogEntry = {
  id: string;
  date: string;
  recipeName: string;
  rating: number;
  outcome: "keeper" | "tweak" | "fail";
  notes: string;
  photoDataUrl?: string;
  photoName?: string;
};

export type PortableDataBundle = {
  version: typeof PORTABLE_DATA_VERSION;
  exportedAt: string;
  savedRecipes: SavedRecipe[];
  bakeLog: BakeLogEntry[];
};

export const PORTABLE_DATA_VERSION = 1;
const LEGACY_PORTABLE_DATA_VERSION = 0;

const BAKE_OUTCOMES = new Set<BakeLogEntry["outcome"]>(["keeper", "tweak", "fail"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeSavedRecipe(value: unknown): SavedRecipe | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string" || !isRecord(value.input)) return null;

  return {
    id: value.id,
    name: value.name,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date(0).toISOString(),
    input: value.input as CalculatorInput
  };
}

export function normalizeBakeLogEntry(value: unknown): BakeLogEntry | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.recipeName !== "string") return null;

  const outcome = BAKE_OUTCOMES.has(value.outcome as BakeLogEntry["outcome"])
    ? (value.outcome as BakeLogEntry["outcome"])
    : "tweak";
  const rating = typeof value.rating === "number" && Number.isFinite(value.rating)
    ? Math.min(5, Math.max(1, Math.round(value.rating)))
    : 3;

  return {
    id: value.id,
    date: typeof value.date === "string" ? value.date : new Date(0).toISOString(),
    recipeName: value.recipeName,
    rating,
    outcome,
    notes: typeof value.notes === "string" ? value.notes : "",
    photoDataUrl: typeof value.photoDataUrl === "string" ? value.photoDataUrl : undefined,
    photoName: typeof value.photoName === "string" ? value.photoName : undefined
  };
}

export function normalizeSavedRecipes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return sortByDateDescending(value.map(normalizeSavedRecipe).filter((recipe): recipe is SavedRecipe => recipe !== null), (recipe) => recipe.createdAt);
}

export function normalizeBakeLog(value: unknown) {
  if (!Array.isArray(value)) return [];
  return sortByDateDescending(value.map(normalizeBakeLogEntry).filter((entry): entry is BakeLogEntry => entry !== null), (entry) => entry.date);
}

function normalizePortableDataBundle(value: unknown): PortableDataBundle | null {
  if (!isRecord(value)) return null;
  const version = value.version;
  if (version !== undefined && version !== LEGACY_PORTABLE_DATA_VERSION && version !== PORTABLE_DATA_VERSION) {
    return null;
  }
  if (!Array.isArray(value.savedRecipes) || !Array.isArray(value.bakeLog)) {
    return null;
  }

  return {
    version: PORTABLE_DATA_VERSION,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : new Date(0).toISOString(),
    savedRecipes: normalizeSavedRecipes(value.savedRecipes),
    bakeLog: normalizeBakeLog(value.bakeLog)
  };
}

function mergeById<T extends { id: string }>(existing: T[], imported: T[]) {
  const merged = new Map(existing.map((item) => [item.id, item]));

  for (const item of imported) {
    merged.set(item.id, item);
  }

  return [...merged.values()];
}

function sortByDateDescending<T>(items: T[], selectDate: (item: T) => string) {
  return [...items].sort((left, right) => new Date(selectDate(right)).getTime() - new Date(selectDate(left)).getTime());
}

export function createPortableDataBundle(
  savedRecipes: SavedRecipe[],
  bakeLog: BakeLogEntry[],
  exportedAt = new Date().toISOString()
): PortableDataBundle {
  return {
    version: PORTABLE_DATA_VERSION,
    exportedAt,
    savedRecipes,
    bakeLog
  };
}

export function serializePortableDataBundle(bundle: PortableDataBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function parsePortableDataBundle(raw: string): PortableDataBundle {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid backup JSON.");
  }

  const normalized = normalizePortableDataBundle(parsed);
  if (!normalized) {
    throw new Error("Unsupported backup format.");
  }

  return normalized;
}

export function mergeSavedRecipes(existing: SavedRecipe[], imported: SavedRecipe[]) {
  return sortByDateDescending(mergeById(existing, imported), (recipe) => recipe.createdAt);
}

export function mergeBakeLog(existing: BakeLogEntry[], imported: BakeLogEntry[]) {
  return sortByDateDescending(mergeById(existing, imported), (entry) => entry.date);
}

export function createPortableDataFileName(date = new Date()): string {
  return `pizza-geek-backup-${date.toISOString().slice(0, 10)}.json`;
}
