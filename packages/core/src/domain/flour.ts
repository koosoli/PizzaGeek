import { FLOURS, getFlourById } from "../data/flours";
import type { FlourBlendAnalysis, FlourBlendItem } from "./types";

export function parseWStrength(value?: string): number | null {
  if (!value) return null;
  const plus = value.match(/W(\d+)\+/i);
  if (plus) return Number.parseInt(plus[1], 10);
  const range = value.match(/W(\d+)-(\d+)/i);
  if (range) {
    return Math.round((Number.parseInt(range[1], 10) + Number.parseInt(range[2], 10)) / 2);
  }
  const exact = value.match(/W(\d+)/i);
  return exact ? Number.parseInt(exact[1], 10) : null;
}

export function estimateWFromProtein(proteinPercent: number): number {
  if (proteinPercent <= 10) return 180;
  if (proteinPercent <= 10.5) return 200;
  if (proteinPercent <= 11) return 220;
  if (proteinPercent <= 11.5) return 250;
  if (proteinPercent <= 12) return 270;
  if (proteinPercent <= 12.5) return 290;
  if (proteinPercent <= 13) return 310;
  if (proteinPercent <= 13.5) return 340;
  if (proteinPercent <= 14) return 370;
  return 390;
}

export function getMinimumWForFermentation(roomHours: number, coldHours: number, hydration?: number): number {
  const totalStressHours = roomHours + coldHours / 4;
  let minimum = 160;
  if (totalStressHours <= 2) minimum = 160;
  else if (totalStressHours <= 4) minimum = 180;
  else if (totalStressHours <= 8) minimum = 210;
  else if (totalStressHours <= 14) minimum = 240;
  else if (totalStressHours <= 20) minimum = 280;
  else if (totalStressHours <= 30) minimum = 300;
  else minimum = 320;

  if (hydration && hydration > 65 && totalStressHours > 4) {
    minimum += Math.round(((hydration - 65) / 5) * 20);
  }

  return minimum;
}

export function calculateBlendedW(blend: FlourBlendItem[]): number | null {
  if (blend.length === 0) return null;
  let weighted = 0;
  let seen = false;

  for (const item of blend) {
    const flour = getFlourById(item.flourId);
    if (!flour) continue;
    const w = parseWStrength(flour.wStrength) ?? estimateWFromProtein(flour.proteinPercent);
    weighted += w * (item.percentage / 100);
    seen = true;
  }

  return seen ? Math.round(weighted) : null;
}

export function calculateBlendedAbsorption(blend: FlourBlendItem[]): number {
  return Math.round(
    blend.reduce((sum, item) => {
      const flour = getFlourById(item.flourId);
      return sum + (flour?.absorptionAdjustment ?? 0) * (item.percentage / 100);
    }, 0) * 10
  ) / 10;
}

export function normalizeBlend(blend: FlourBlendItem[]): FlourBlendItem[] {
  const valid = blend.filter((item) => item.percentage > 0 && getFlourById(item.flourId));
  const total = valid.reduce((sum, item) => sum + item.percentage, 0);
  if (valid.length === 0 || total <= 0) return [{ flourId: "caputo-pizzeria", percentage: 100 }];

  let normalized = valid.map((item) => ({
    flourId: item.flourId,
    percentage: Math.round((item.percentage / total) * 100)
  }));

  const delta = 100 - normalized.reduce((sum, item) => sum + item.percentage, 0);
  normalized = normalized.map((item, index) =>
    index === 0 ? { ...item, percentage: item.percentage + delta } : item
  );

  return normalized;
}

export function combineBlendSegments(segments: Array<{ blend: FlourBlendItem[]; weight: number }>): FlourBlendItem[] {
  const totals = new Map<string, number>();

  for (const segment of segments) {
    if (segment.weight <= 0) continue;

    const normalized = normalizeBlend(segment.blend);
    for (const item of normalized) {
      totals.set(item.flourId, (totals.get(item.flourId) ?? 0) + (item.percentage / 100) * segment.weight);
    }
  }

  return normalizeBlend(
    Array.from(totals.entries()).map(([flourId, percentage]) => ({
      flourId,
      percentage
    }))
  );
}

export function describeBlend(blend: FlourBlendItem[]): string {
  const normalized = normalizeBlend(blend);
  return normalized
    .map((item) => {
      const flour = getFlourById(item.flourId);
      return `${item.percentage}% ${flour ? `${flour.brand} ${flour.name}` : item.flourId}`;
    })
    .join(" + ");
}

export function analyzeFlourBlend(
  blend: FlourBlendItem[],
  roomHours: number,
  coldHours: number,
  hydration: number,
  enabled = true
): FlourBlendAnalysis {
  const normalized = normalizeBlend(blend);
  const blendedW = enabled ? calculateBlendedW(normalized) : null;
  const requiredW = getMinimumWForFermentation(roomHours, coldHours, hydration);
  const absorptionAdjustment = enabled ? calculateBlendedAbsorption(normalized) : 0;

  if (!enabled || blendedW === null) {
    return {
      description: "Flour blend disabled",
      blendedW: null,
      absorptionAdjustment: 0,
      warningColor: "ok"
    };
  }

  const gap = requiredW - blendedW;
  let warningColor: FlourBlendAnalysis["warningColor"] = "ok";
  let warning: string | undefined;
  if (gap > 80) {
    warningColor = "danger";
    warning = `Blend is likely too weak for this ferment. Aim for W${requiredW}+ or shorten the cold proof.`;
  } else if (gap > 40) {
    warningColor = "warning";
    warning = `Blend is light for this schedule. Add folds, reduce hydration, or blend in stronger flour.`;
  } else if (gap > 0) {
    warningColor = "notice";
    warning = `This is workable but close to the edge for a ${roomHours + coldHours}h ferment.`;
  } else if (coldHours > 48) {
    warning = `Strong enough for the long ferment. Keep dough cold and handle gently.`;
  }

  return {
    description: describeBlend(normalized),
    blendedW,
    absorptionAdjustment,
    warning,
    warningColor
  };
}

export function bestDefaultFlourId(styleFlour: string): string {
  const lower = styleFlour.toLowerCase();
  if (lower.includes("high-gluten")) return "all-trumps";
  if (lower.includes("bread") || lower.includes("strong")) return "king-arthur-bread";
  if (lower.includes("all-purpose") || lower.includes("ap")) return "king-arthur-ap";
  if (lower.includes("manitoba")) return "manitoba";
  return FLOURS[0].id;
}
