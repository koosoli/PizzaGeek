import { describe, expect, it } from "vitest";
import { STYLE_IDS } from "@pizza-geek/core";
import { getLocaleDefaults, resolveAppSettings } from "../appConfig";

describe("appConfig", () => {
  it("returns Italian defaults with euro and metric units", () => {
    expect(getLocaleDefaults("it")).toEqual({
      temperatureUnit: "C",
      sizeUnit: "cm",
      currency: "EUR"
    });
  });

  it("keeps Italian when resolving persisted settings", () => {
    const settings = resolveAppSettings({ language: "it" }, STYLE_IDS.NEW_YORK);

    expect(settings.language).toBe("it");
    expect(settings.temperatureUnit).toBe("C");
    expect(settings.sizeUnit).toBe("cm");
  });

  it("falls back to English for unknown persisted locale values", () => {
    const settings = resolveAppSettings({ language: "fr" as never }, STYLE_IDS.NEW_YORK);

    expect(settings.language).toBe("en");
  });
});