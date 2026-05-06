import { calculateDough, createDefaultInput, STYLE_IDS } from "@pizza-geek/core";
import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { buildQualitySignals, getIngredientPercentageNotices } from "../quality";

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

describe("buildQualitySignals", () => {
  it("drops the salt quality bar into the red when salt is far beyond the style threshold", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.saltPercent = 5;

    const signals = buildQualitySignals(calculateDough(input), input, "F", copy.en);
    const saltSignal = signals.find((signal) => signal.label === copy.en.saltBalance);

    expect(saltSignal).toMatchObject({
      label: copy.en.saltBalance,
      tone: "danger"
    });
    expect(saltSignal?.score).toBeLessThan(45);
  });

  it("shows increasingly risky ingredient bars as percentages move beyond their safe limits", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.oilPercent = 10;
    input.honeyPercent = 21;
    input.maltPercent = 6;

    const signals = buildQualitySignals(calculateDough(input), input, "F", copy.en);
    const oilSignal = signals.find((signal) => signal.label === copy.en.oil);
    const honeySignal = signals.find((signal) => signal.label === copy.en.honey);
    const maltSignal = signals.find((signal) => signal.label === copy.en.malt);

    expect(oilSignal).toMatchObject({
      label: copy.en.oil,
      value: "10%",
      tone: "danger"
    });
    expect(oilSignal?.score).toBeLessThan(45);

    expect(honeySignal).toMatchObject({
      label: copy.en.honey,
      value: "21%",
      tone: "warning"
    });
    expect(honeySignal?.score).toBeGreaterThanOrEqual(45);
    expect(honeySignal?.score).toBeLessThan(68);

    expect(maltSignal).toMatchObject({
      label: copy.en.malt,
      value: "6%",
      tone: "warning"
    });
    expect(maltSignal?.score).toBeGreaterThanOrEqual(45);
    expect(maltSignal?.score).toBeLessThan(68);
  });

  it("makes the flour quality signal more severe as the flour gap grows", () => {
    const strongerInput = createDefaultInput(STYLE_IDS.NEW_YORK);
    strongerInput.flourBlendEnabled = true;
    strongerInput.hydrationPercent = 68;
    strongerInput.fermentation.roomTempHours = 12;
    strongerInput.fermentation.coldBulkHours = 24;
    strongerInput.fermentation.coldBallHours = 0;
    strongerInput.customFlours = [
      {
        id: "custom-strong",
        brand: "Custom",
        name: "Strong",
        type: "bread",
        proteinPercent: 13,
        wStrength: "W285",
        absorptionAdjustment: 0,
        regions: ["GLOBAL"]
      },
      {
        id: "custom-weaker",
        brand: "Custom",
        name: "Weaker",
        type: "bread",
        proteinPercent: 13,
        wStrength: "W255",
        absorptionAdjustment: 0,
        regions: ["GLOBAL"]
      }
    ];
    strongerInput.flourBlend = [{ flourId: "custom-strong", percentage: 100 }];
    strongerInput.prefermentFlourBlend = strongerInput.flourBlend;
    strongerInput.mainDoughFlourBlend = strongerInput.flourBlend;

    const weakerInput = structuredClone(strongerInput);
    weakerInput.flourBlend = [{ flourId: "custom-weaker", percentage: 100 }];
    weakerInput.prefermentFlourBlend = weakerInput.flourBlend;
    weakerInput.mainDoughFlourBlend = weakerInput.flourBlend;

    const strongerSignal = buildQualitySignals(calculateDough(strongerInput), strongerInput, "F", copy.en).find(
      (signal) => signal.label === copy.en.flourStrength
    );
    const weakerSignal = buildQualitySignals(calculateDough(weakerInput), weakerInput, "F", copy.en).find(
      (signal) => signal.label === copy.en.flourStrength
    );

    expect(strongerSignal).toMatchObject({
      label: copy.en.flourStrength,
      tone: "ok"
    });
    expect(weakerSignal).toMatchObject({
      label: copy.en.flourStrength,
      tone: "notice"
    });
    expect(strongerSignal?.score).toBeGreaterThan(weakerSignal?.score ?? 0);
  });
});
