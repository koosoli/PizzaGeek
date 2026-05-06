import { describe, expect, it } from "vitest";
import { createDefaultCustomFlour, filterFlours, getSelectableFlours, normalizeCustomFlours } from "../flourCatalog";

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

  it("drops malformed custom flours during normalization", () => {
    const normalized = normalizeCustomFlours([
      createDefaultCustomFlour(),
      { id: "broken", brand: "", name: "Missing brand", type: "bread", proteinPercent: 12, absorptionAdjustment: 0, regions: ["GLOBAL"] }
    ]);

    expect(normalized).toEqual([createDefaultCustomFlour()]);
  });
});
