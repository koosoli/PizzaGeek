import { createDefaultInput, STYLE_IDS } from "@pizza-geek/core";
import { describe, expect, it } from "vitest";
import {
  createDefaultCustomFlour,
  filterFlours,
  getSelectableFlours,
  getVisibleFlours,
  normalizeCustomFlours,
  remapBlendToRegion,
  remapInputFloursToRegion
} from "../flourCatalog";

describe("flourCatalog", () => {
  it("keeps custom flours at the top of the selectable list", () => {
    const customFlour = createDefaultCustomFlour();

    const flours = getSelectableFlours([customFlour]);

    expect(flours[0]).toEqual(customFlour);
  });

  it("filters flours by brand, name, type, and w strength", () => {
    const customFlour = createDefaultCustomFlour();
    const flours = getSelectableFlours([customFlour]);

    expect(filterFlours(flours, "custom")).toEqual([customFlour]);
    expect(filterFlours(flours, "my flour")).toEqual([customFlour]);
    expect(filterFlours(flours, "bread")).toContainEqual(customFlour);
    expect(filterFlours(flours, "w300")).toContainEqual(customFlour);
  });

  it("filters flours by region and combines region filters with search", () => {
    const flours = getSelectableFlours();
    const usOnly = filterFlours(flours, "", "US");
    const euOnly = filterFlours(flours, "", "EU");

    expect(usOnly).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "king-arthur-bread" }),
      expect.objectContaining({ id: "caputo-pizzeria" })
    ]));
    expect(usOnly).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "manitoba" })]));

    expect(euOnly).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "manitoba" }),
      expect.objectContaining({ id: "caputo-pizzeria" })
    ]));
    expect(euOnly).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "king-arthur-bread" })]));

    expect(filterFlours(flours, "caputo", "US").every((flour) => flour.regions.includes("US"))).toBe(true);
  });

  it("limits visible dropdown flours to the active region filter", () => {
    const flours = getSelectableFlours();
    const usOnly = filterFlours(flours, "", "US");

    expect(getVisibleFlours(flours, usOnly, "manitoba", "", "US")).toEqual(usOnly);
  });

  it("keeps the selected flour visible only when a search is active and the region still matches", () => {
    const flours = getSelectableFlours();
    const searchResults = filterFlours(flours, "king", "US");
    const visibleFlours = getVisibleFlours(flours, searchResults, "caputo-pizzeria", "king", "US");

    expect(visibleFlours[0]).toEqual(expect.objectContaining({ id: "caputo-pizzeria" }));
    expect(visibleFlours.slice(1)).toEqual(searchResults);
    expect(getVisibleFlours(flours, searchResults, "manitoba", "king", "US")).toEqual(searchResults);
  });

  it("drops malformed custom flours during normalization", () => {
    const normalized = normalizeCustomFlours([
      createDefaultCustomFlour(),
      { id: "broken", brand: "", name: "Missing brand", type: "bread", proteinPercent: 12, absorptionAdjustment: 0, regions: ["GLOBAL"] }
    ]);

    expect(normalized).toEqual([createDefaultCustomFlour()]);
  });

  it("remaps out-of-region preset flours to curated EU equivalents", () => {
    expect(remapBlendToRegion([
      { flourId: "king-arthur-bread", percentage: 80 },
      { flourId: "all-trumps", percentage: 20 }
    ], "EU")).toEqual([
      { flourId: "diamant-550", percentage: 80 },
      { flourId: "caputo-americana", percentage: 20 }
    ]);
  });

  it("remaps default recipe blends when a regional flour preference is active", () => {
    const input = createDefaultInput(STYLE_IDS.COUNTRY_LOAF);
    const remapped = remapInputFloursToRegion(input, "EU");

    expect(remapped.flourBlend).toEqual([
      { flourId: "diamant-550", percentage: 90 },
      { flourId: "whole-wheat", percentage: 10 }
    ]);
    expect(remapped.mainDoughFlourBlend).toEqual(remapped.flourBlend);
  });
});
