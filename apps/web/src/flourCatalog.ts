import {
  estimateWFromProtein,
  getFlourById,
  getFlourCatalog,
  normalizeBlend,
  parseWStrength,
  type CalculatorInput,
  type Flour,
  type FlourBlendItem
} from "@pizza-geek/core";

export const CUSTOM_FLOUR_ID = "custom-flour";
export type FlourRegionFilter = "all" | "US" | "EU";
type FlourRegionPreference = Exclude<FlourRegionFilter, "all">;

const REGION_EQUIVALENT_OVERRIDES: Record<FlourRegionPreference, Record<string, string>> = {
  EU: {
    "all-trumps": "caputo-americana",
    "king-arthur-ap": "diamant-405",
    "king-arthur-bread": "diamant-550",
    "sir-lancelot": "caputo-manitoba-oro",
    "store-brand-bread": "diamant-550"
  },
  US: {
    "aldi-goldahren": "king-arthur-ap",
    "caputo-americana": "all-trumps",
    "caputo-chef-red": "king-arthur-bread",
    "caputo-manitoba-oro": "sir-lancelot",
    "dallagiovanna-rossa": "sir-lancelot",
    "diamant-405": "king-arthur-ap",
    "diamant-550": "king-arthur-bread",
    "manitoba": "sir-lancelot",
    "plain-flour": "king-arthur-ap",
    "pivetti-manitoba": "sir-lancelot"
  }
};

export function createDefaultCustomFlour(): Flour {
  return {
    id: CUSTOM_FLOUR_ID,
    brand: "Custom",
    name: "My flour",
    type: "bread",
    proteinPercent: 13,
    wStrength: "W300",
    absorptionAdjustment: 0,
    regions: ["GLOBAL"]
  };
}

export function normalizeCustomFlours(candidate: CalculatorInput["customFlours"]): Flour[] {
  if (!Array.isArray(candidate)) return [];

  return candidate.flatMap((flour, index) => {
    if (!flour || typeof flour !== "object") return [];

    const brand = typeof flour.brand === "string" ? flour.brand.trim() : "";
    const name = typeof flour.name === "string" ? flour.name.trim() : "";
    const proteinPercent = typeof flour.proteinPercent === "number" && Number.isFinite(flour.proteinPercent)
      ? flour.proteinPercent
      : Number.NaN;
    const absorptionAdjustment = typeof flour.absorptionAdjustment === "number" && Number.isFinite(flour.absorptionAdjustment)
      ? flour.absorptionAdjustment
      : Number.NaN;
    const type = flour.type;

    if (
      brand === "" ||
      name === "" ||
      !Number.isFinite(proteinPercent) ||
      !Number.isFinite(absorptionAdjustment) ||
      !["tipo00", "tipo0", "bread", "high-gluten", "all-purpose", "manitoba", "whole-grain"].includes(type)
    ) {
      return [];
    }

    const id = typeof flour.id === "string" && flour.id.trim() !== "" ? flour.id : `${CUSTOM_FLOUR_ID}-${index + 1}`;
    const wStrength = typeof flour.wStrength === "string" && flour.wStrength.trim() !== "" ? flour.wStrength.trim() : undefined;

    return [{
      id,
      brand,
      name,
      type,
      proteinPercent,
      wStrength,
      absorptionAdjustment,
      regions: ["GLOBAL"]
    }];
  });
}

export function getSelectableFlours(customFlours: Flour[] = []): Flour[] {
  return getFlourCatalog(customFlours);
}

function matchesRegion(flour: Flour, region: FlourRegionFilter): boolean {
  return region === "all" || flour.regions.includes(region);
}

function getFlourStrength(flour: Flour): number {
  return parseWStrength(flour.wStrength) ?? estimateWFromProtein(flour.proteinPercent);
}

function findEquivalentFlourId(
  flourId: string,
  region: FlourRegionPreference,
  customFlours: Flour[] = []
): string {
  if (flourId === CUSTOM_FLOUR_ID || customFlours.some((flour) => flour.id === flourId)) return flourId;

  const source = getFlourById(flourId, customFlours);
  if (!source || matchesRegion(source, region)) return flourId;
  if (source.regions.length === 1 && source.regions[0] === "GLOBAL") return flourId;

  const overrideId = REGION_EQUIVALENT_OVERRIDES[region][flourId];
  if (overrideId) return overrideId;

  const sourceStrength = getFlourStrength(source);
  const candidates = getSelectableFlours(customFlours).filter(
    (candidate) =>
      candidate.id !== flourId &&
      candidate.id !== CUSTOM_FLOUR_ID &&
      matchesRegion(candidate, region)
  );
  const typedCandidates = candidates.filter((candidate) => candidate.type === source.type);
  const pool = typedCandidates.length > 0 ? typedCandidates : candidates;

  const bestMatch = pool
    .map((candidate) => ({
      id: candidate.id,
      score:
        Math.abs(getFlourStrength(candidate) - sourceStrength) +
        Math.abs(candidate.proteinPercent - source.proteinPercent) * 10 +
        Math.abs(candidate.absorptionAdjustment - source.absorptionAdjustment) * 20
    }))
    .sort((left, right) => left.score - right.score)[0];

  return bestMatch?.id ?? flourId;
}

export function remapBlendToRegion(
  blend: FlourBlendItem[],
  region: FlourRegionFilter,
  customFlours: Flour[] = []
): FlourBlendItem[] {
  if (region === "all") return blend;

  const totals = new Map<string, number>();
  for (const item of blend) {
    const mappedId = findEquivalentFlourId(item.flourId, region, customFlours);
    totals.set(mappedId, (totals.get(mappedId) ?? 0) + item.percentage);
  }

  return normalizeBlend(
    Array.from(totals.entries()).map(([flourId, percentage]) => ({
      flourId,
      percentage
    })),
    customFlours
  );
}

export function remapInputFloursToRegion(
  input: CalculatorInput,
  region: FlourRegionFilter
): CalculatorInput {
  if (region === "all" || !input.flourBlendEnabled) return input;

  const customFlours = input.customFlours ?? [];
  return {
    ...input,
    flourBlend: remapBlendToRegion(input.flourBlend, region, customFlours),
    prefermentFlourBlend: remapBlendToRegion(input.prefermentFlourBlend, region, customFlours),
    mainDoughFlourBlend: remapBlendToRegion(input.mainDoughFlourBlend, region, customFlours)
  };
}

export function filterFlours(flours: Flour[], query: string, region: FlourRegionFilter = "all"): Flour[] {
  const normalized = query.trim().toLowerCase();
  return flours.filter((flour) => {
    if (!matchesRegion(flour, region)) return false;
    if (normalized === "") return true;

    return [flour.brand, flour.name, flour.type, flour.wStrength ?? "", flour.id].some((value) =>
      value.toLowerCase().includes(normalized)
    );
  });
}

export function getVisibleFlours(
  flours: Flour[],
  filteredFlours: Flour[],
  selectedFlourId: string,
  query: string,
  region: FlourRegionFilter = "all"
): Flour[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery === "" && region === "all") return flours;

  if (filteredFlours.some((flour) => flour.id === selectedFlourId)) {
    return filteredFlours;
  }

  const selectedFlour = flours.find((flour) => flour.id === selectedFlourId);
  const isRegionMatch = selectedFlour ? matchesRegion(selectedFlour, region) : false;

  return normalizedQuery !== "" && selectedFlour && isRegionMatch
    ? [selectedFlour, ...filteredFlours]
    : filteredFlours;
}
