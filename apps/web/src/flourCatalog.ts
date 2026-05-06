import { type CalculatorInput, type Flour, getFlourCatalog } from "@pizza-geek/core";

export const CUSTOM_FLOUR_ID = "custom-flour";
export type FlourRegionFilter = "all" | "US" | "EU";

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

export function filterFlours(flours: Flour[], query: string, region: FlourRegionFilter = "all"): Flour[] {
  const normalized = query.trim().toLowerCase();
  return flours.filter((flour) => {
    const matchesRegion = region === "all" || flour.regions.includes(region);
    if (!matchesRegion) return false;
    if (normalized === "") return true;

    return [flour.brand, flour.name, flour.type, flour.wStrength ?? "", flour.id].some((value) =>
      value.toLowerCase().includes(normalized)
    );
  });
}
