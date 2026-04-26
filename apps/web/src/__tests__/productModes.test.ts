import { describe, expect, it } from "vitest";
import { STYLE_IDS } from "@pizza-geek/core";
import {
  DEFAULT_STYLE_ID_BY_PRODUCT,
  getBreadProfiles,
  getFallbackStyleIdForProductMode,
  getProductModeForStyleId,
  isBreadStyleId
} from "../productModes";

describe("productModes", () => {
  it("classifies bread-first styles separately from pizza styles", () => {
    expect(isBreadStyleId(STYLE_IDS.FOCACCIA)).toBe(true);
    expect(isBreadStyleId(STYLE_IDS.COUNTRY_LOAF)).toBe(true);
    expect(isBreadStyleId(STYLE_IDS.SANDWICH_LOAF)).toBe(true);
    expect(isBreadStyleId(STYLE_IDS.COCA)).toBe(true);
    expect(isBreadStyleId(STYLE_IDS.NEAPOLITAN)).toBe(false);
    expect(getProductModeForStyleId(STYLE_IDS.FLAMMKUCHEN)).toBe("bread");
    expect(getProductModeForStyleId(STYLE_IDS.NEW_YORK)).toBe("pizza");
  });

  it("keeps a recent style only when it belongs to the selected product mode", () => {
    expect(getFallbackStyleIdForProductMode("bread", STYLE_IDS.COUNTRY_LOAF)).toBe(STYLE_IDS.COUNTRY_LOAF);
    expect(getFallbackStyleIdForProductMode("bread", STYLE_IDS.NEAPOLITAN)).toBe(DEFAULT_STYLE_ID_BY_PRODUCT.bread);
    expect(getFallbackStyleIdForProductMode("pizza", STYLE_IDS.FOCACCIA)).toBe(DEFAULT_STYLE_ID_BY_PRODUCT.pizza);
  });

  it("returns localized bread profiles for the UI", () => {
    const englishProfiles = getBreadProfiles("en");
    const germanProfiles = getBreadProfiles("de");

    expect(englishProfiles).toHaveLength(5);
    expect(germanProfiles).toHaveLength(5);
    expect(englishProfiles[0]?.styleId).toBe(STYLE_IDS.FOCACCIA);
    expect(englishProfiles.some((profile) => profile.styleId === STYLE_IDS.COUNTRY_LOAF)).toBe(true);
    expect(germanProfiles[2]?.description).toContain("Kastenlaib");
  });
});
