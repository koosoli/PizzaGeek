import { describe, expect, it } from "vitest";
import {
  buildBakePlan,
  calculateCost,
  calculateDough,
  createDefaultInput,
  defaultCostSettings,
  effectiveFermentationHours,
  STYLE_IDS
} from "../index";

describe("calculateDough", () => {
  it("calculates a baseline Neapolitan dough", () => {
    const input = createDefaultInput(STYLE_IDS.NEAPOLITAN);
    const result = calculateDough(input);

    expect(result.ingredients.totalFlour).toBeGreaterThan(600);
    expect(result.ingredients.totalWater).toBeGreaterThan(350);
    expect(result.percentages.hydration).toBe(60);
    expect(result.ingredients.totalOil).toBe(0);
    expect(result.ingredients.totalSugar).toBe(0);
    expect(result.waterTemperature.targetFdtF).toBeGreaterThanOrEqual(70);
  });

  it("supports contemporary neapolitan with dual-zone pizza oven settings", () => {
    const input = createDefaultInput(STYLE_IDS.CONTEMPORARY_NEAPOLITAN);
    input.oven.type = "pizza-oven";
    input.oven.pizzaOvenStoneTempF = 790;
    input.oven.pizzaOvenTopTempF = 930;

    const result = calculateDough(input);

    expect(result.style.name).toBe("Contemporary Neapolitan");
    expect(input.hydrationPercent).toBe(72);
    expect(result.style.hydration.min).toBe(68);
    expect(result.style.hydration.max).toBe(80);
    expect(input.oilPercent).toBe(2);
    expect(result.ingredients.totalOil).toBeGreaterThan(0);
    expect(result.oven.detail).toContain("Stone 790F");
    expect(result.oven.detail).toContain("top 930F");
  });

  it("includes sauce guidance when sauce is enabled", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    const result = calculateDough(input);

    expect(result.sauce?.perPizzaGrams).toBeGreaterThan(0);
    expect(result.sauce?.recipeName).toBeTruthy();
    expect(result.sauce?.instructions.length).toBeGreaterThan(1);
  });

  it("keeps Neapolitan pizza-oven bake times in seconds at 454C stone and top heat", () => {
    const input = createDefaultInput(STYLE_IDS.NEAPOLITAN);
    input.oven.type = "pizza-oven";
    input.oven.pizzaOvenStoneTempF = 849;
    input.oven.pizzaOvenTopTempF = 849;

    const result = calculateDough(input);

    expect(result.oven.unit).toBe("seconds");
    expect(result.oven.minTime).toBe(90);
    expect(result.oven.maxTime).toBe(120);
  });

  it("splits flour and water when a poolish is enabled", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "poolish";
    input.preferment.flourPercent = 30;

    const result = calculateDough(input);

    expect(result.ingredients.prefermentFlour).toBeGreaterThan(0);
    expect(result.ingredients.prefermentWater).toBe(result.ingredients.prefermentFlour);
    expect(result.ingredients.mainFlour).toBeLessThan(result.ingredients.totalFlour);
  });

  it("respects the chosen preferment percentage for bassinage-style doughs", () => {
    const input = createDefaultInput(STYLE_IDS.CONTEMPORARY_NEAPOLITAN);
    input.preferment.kind = "biga";
    input.preferment.bigaStyle = "bassinage";
    input.preferment.flourPercent = 45;
    input.manualYeastPercent = 0.25;

    const result = calculateDough(input);

    expect(result.ingredients.prefermentFlour).toBe(Math.round((result.ingredients.totalFlour * 45) / 100));
    expect(result.ingredients.mainFlour).toBeGreaterThan(0);
    expect(result.ingredients.mainYeast).toBeGreaterThan(0);
  });

  it("analyzes weak flour for long high-hydration ferments", () => {
    const input = createDefaultInput(STYLE_IDS.ROMAN);
    input.flourBlend = [{ flourId: "plain-flour", percentage: 100 }];
    input.fermentation.coldBallHours = 72;

    const result = calculateDough(input);

    expect(result.flourBlend.blendedW).toBeLessThan(260);
    expect(["warning", "danger"]).toContain(result.flourBlend.warningColor);
  });

  it("lets fridge temperature affect cold fermentation intensity", () => {
    const coldInput = createDefaultInput(STYLE_IDS.NEW_YORK);
    coldInput.fermentation.coldBallHours = 48;
    coldInput.fermentation.fridgeTempF = 36;

    const warmInput = createDefaultInput(STYLE_IDS.NEW_YORK);
    warmInput.fermentation.coldBallHours = 48;
    warmInput.fermentation.fridgeTempF = 44;

    expect(effectiveFermentationHours(warmInput)).toBeGreaterThan(effectiveFermentationHours(coldInput));
  });
});

describe("buildBakePlan", () => {
  it("can work backward from a ready-by date", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "biga";
    const readyAt = new Date("2026-04-26T18:00:00");

    const plan = buildBakePlan(input, "ready-by", readyAt);

    expect(plan.at(-1)?.label).toBe("Ready to bake");
    expect(plan.at(-1)?.time.toISOString()).toBe(readyAt.toISOString());
    expect(plan[0].time.getTime()).toBeLessThan(readyAt.getTime());
  });
});

describe("calculateCost", () => {
  it("returns batch and per-ball cost", () => {
    const input = createDefaultInput(STYLE_IDS.DETROIT);
    const result = calculateDough(input);
    const cost = calculateCost(result, defaultCostSettings(), input.doughBalls);

    expect(cost.total).toBeGreaterThan(0);
    expect(cost.perBall).toBe(cost.total / input.doughBalls);
  });
});
