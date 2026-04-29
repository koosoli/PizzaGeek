import { FLOURS, type FlourBlendItem } from "@pizza-geek/core";
import { clampTo } from "./appHelpers";

export type BlendBreakdownRow = {
  flourId: string;
  percentage: number;
  flourLabel: string;
  totalGrams: number;
  prefermentGrams: number;
  mainDoughGrams: number;
};

export type StageBlendBreakdownRow = {
  flourId: string;
  percentage: number;
  flourLabel: string;
  grams: number;
};

export function rebalanceBlendPercentages(
  blend: FlourBlendItem[],
  index: number,
  nextPercentage: number
): FlourBlendItem[] {
  if (blend.length <= 1) {
    return blend.map((item) => ({ ...item, percentage: 100 }));
  }

  const target = clampTo(Math.round(nextPercentage), 0, 100);
  const otherIndexes = blend.map((_, itemIndex) => itemIndex).filter((itemIndex) => itemIndex !== index);
  const remaining = 100 - target;
  const result = blend.map((item) => ({ ...item }));
  result[index].percentage = target;

  const sourceTotal = otherIndexes.reduce((sum, itemIndex) => sum + Math.max(0, blend[itemIndex].percentage), 0);
  if (sourceTotal <= 0) {
    const base = Math.floor(remaining / otherIndexes.length);
    let extra = remaining - base * otherIndexes.length;
    for (const itemIndex of otherIndexes) {
      result[itemIndex].percentage = base + (extra > 0 ? 1 : 0);
      if (extra > 0) extra -= 1;
    }
    return result;
  }

  const weighted = otherIndexes.map((itemIndex) => {
    const raw = (Math.max(0, blend[itemIndex].percentage) / sourceTotal) * remaining;
    const floor = Math.floor(raw);
    return { itemIndex, raw, floor, fraction: raw - floor };
  });

  let assigned = weighted.reduce((sum, item) => sum + item.floor, 0);
  for (const item of weighted) {
    result[item.itemIndex].percentage = item.floor;
  }

  let leftovers = remaining - assigned;
  const ranked = [...weighted].sort((left, right) => right.fraction - left.fraction);
  for (let itemIndex = 0; itemIndex < ranked.length && leftovers > 0; itemIndex += 1) {
    result[ranked[itemIndex].itemIndex].percentage += 1;
    leftovers -= 1;
  }

  return result;
}

function allocateBlendGrams(blend: FlourBlendItem[], totalGrams: number): number[] {
  if (blend.length === 0) return [];
  if (totalGrams <= 0) return blend.map(() => 0);

  const allocations = blend.map((item, index) => {
    const raw = (Math.max(0, item.percentage) / 100) * totalGrams;
    const floor = Math.floor(raw);
    return { index, floor, fraction: raw - floor };
  });

  const grams = allocations.map((entry) => entry.floor);
  let remaining = totalGrams - grams.reduce((sum, value) => sum + value, 0);
  const ranked = [...allocations].sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; index < ranked.length && remaining > 0; index += 1) {
    grams[ranked[index].index] += 1;
    remaining -= 1;
  }

  return grams;
}

export function buildStageBlendBreakdown(blend: FlourBlendItem[], totalGrams: number): StageBlendBreakdownRow[] {
  const grams = allocateBlendGrams(blend, totalGrams);

  return blend.map((item, index) => ({
    flourId: item.flourId,
    percentage: item.percentage,
    flourLabel: getFlourLabel(item.flourId),
    grams: grams[index] ?? 0
  }));
}

export function mergeBlendBreakdowns(
  overallBlend: FlourBlendItem[],
  prefermentRows: StageBlendBreakdownRow[],
  mainDoughRows: StageBlendBreakdownRow[]
): BlendBreakdownRow[] {
  const rows = new Map<string, BlendBreakdownRow>();

  for (const item of overallBlend) {
    rows.set(item.flourId, {
      flourId: item.flourId,
      percentage: item.percentage,
      flourLabel: getFlourLabel(item.flourId),
      totalGrams: 0,
      prefermentGrams: 0,
      mainDoughGrams: 0
    });
  }

  const ensureRow = (row: StageBlendBreakdownRow) => {
    if (!rows.has(row.flourId)) {
      rows.set(row.flourId, {
        flourId: row.flourId,
        percentage: 0,
        flourLabel: row.flourLabel,
        totalGrams: 0,
        prefermentGrams: 0,
        mainDoughGrams: 0
      });
    }

    return rows.get(row.flourId)!;
  };

  for (const row of prefermentRows) {
    const entry = ensureRow(row);
    entry.prefermentGrams += row.grams;
    entry.totalGrams += row.grams;
  }

  for (const row of mainDoughRows) {
    const entry = ensureRow(row);
    entry.mainDoughGrams += row.grams;
    entry.totalGrams += row.grams;
  }

  return Array.from(rows.values()).filter((row) => row.totalGrams > 0 || row.percentage > 0);
}

export function getFlourLabel(flourId: string): string {
  const flour = FLOURS.find((entry) => entry.id === flourId);
  return flour ? `${flour.brand} ${flour.name}` : flourId;
}