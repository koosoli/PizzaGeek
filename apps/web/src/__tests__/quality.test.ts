import { calculateDough, createDefaultInput, STYLE_IDS } from "@pizza-geek/core";
import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { getIngredientPercentageNotices } from "../quality";

describe("getIngredientPercentageNotices", () => {
  it("flags extreme ingredient percentages as danger notices", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.saltPercent = 100;
    input.honeyPercent = 100;
    input.maltPercent = 100;

    const notices = getIngredientPercentageNotices(input, calculateDough(input), copy.en, "en");

    expect(notices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tone: "danger", message: expect.stringContaining("Salt at 100%") }),
        expect.objectContaining({ tone: "danger", message: expect.stringContaining("Honey at 100%") }),
        expect.objectContaining({ tone: "danger", message: expect.stringContaining("Malt at 100%") })
      ])
    );
  });

  it("warns when style-bound percentages drift outside the active style range", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.saltPercent = 5;

    const notices = getIngredientPercentageNotices(input, calculateDough(input), copy.en, "en");

    expect(notices).toContainEqual(
      expect.objectContaining({
        tone: "warning",
        message: expect.stringContaining("Salt is outside this style's")
      })
    );
  });
});
