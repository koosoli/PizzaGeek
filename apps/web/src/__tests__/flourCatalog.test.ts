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
    expect(filterFlours(flours, "bread")).toContainEqual(customFlour);
    expect(filterFlours(flours, "w300")).toEqual([customFlour]);
  });

  it("drops malformed custom flours during normalization", () => {
    const normalized = normalizeCustomFlours([
      createDefaultCustomFlour(),
      { id: "broken", brand: "", name: "Missing brand", type: "bread", proteinPercent: 12, absorptionAdjustment: 0, regions: ["GLOBAL"] }
    ]);

    expect(normalized).toEqual([createDefaultCustomFlour()]);
  });
});
