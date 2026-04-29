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

  it("adds the whole-grain double-preferment variant as a contemporary neapolitan preset", () => {
    const input = createDefaultInput(STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN);
    const result = calculateDough(input);

    expect(result.style.name).toBe("Contemporary Neapolitan - Double Preferment Whole Grain");
    expect(input.doughBalls).toBe(7);
    expect(input.ballWeight).toBe(255);
    expect(input.hydrationPercent).toBe(75);
    expect(input.saltPercent).toBe(3);
    expect(input.yeastType).toBe("fresh");
    expect(input.manualYeastPercent).toBe(0.9);
    expect(input.flourBlend).toEqual([
      { flourId: "caputo-nuvola", percentage: 90 },
      { flourId: "whole-wheat", percentage: 10 }
    ]);
    expect(input.fermentation.coldBallHours).toBe(14);
    expect(input.fermentation.finalRiseHours).toBe(1);
    expect(result.sauce?.style).toBe("raw");
    expect(result.oven.unit).toBe("seconds");
  });

  it("builds bread-first defaults for country loaves without sauce", () => {
    const input = createDefaultInput(STYLE_IDS.COUNTRY_LOAF);
    const result = calculateDough(input);

    expect(input.doughBalls).toBe(1);
    expect(input.ballWeight).toBe(850);
    expect(input.fermentation.coldBulkHours).toBe(14);
    expect(input.fermentation.coldBallHours).toBe(0);
    expect(input.flourBlend).toEqual([
      { flourId: "king-arthur-bread", percentage: 90 },
      { flourId: "whole-wheat", percentage: 10 }
    ]);
    expect(input.sauce.enabled).toBe(false);
    expect(result.sauce).toBeUndefined();
    expect(result.oven.detail).toContain("Steam first 20 min");
    expect(result.oven.unit).toBe("minutes");
  });

  it("builds ciabatta defaults with a high-hydration fold-friendly blend", () => {
    const input = createDefaultInput(STYLE_IDS.CIABATTA);
    const result = calculateDough(input);

    expect(input.hydrationPercent).toBe(80);
    expect(input.doughBalls).toBe(4);
    expect(input.ballWeight).toBe(280);
    expect(input.flourBlend).toEqual([
      { flourId: "king-arthur-bread", percentage: 85 },
      { flourId: "caputo-manitoba-oro", percentage: 15 }
    ]);
    expect(input.fermentation.coldBulkHours).toBe(12);
    expect(result.style.name).toBe("Ciabatta");
    expect(result.sauce).toBeUndefined();
  });

  it("builds milk bread defaults with tin geometry and enriched dough percentages", () => {
    const input = createDefaultInput(STYLE_IDS.MILK_BREAD);
    const result = calculateDough(input);

    expect(input.pan.enabled).toBe(true);
    expect(input.pan.length).toBe(9);
    expect(input.pan.width).toBe(4);
    expect(input.oilPercent).toBe(6);
    expect(input.sugarPercent).toBe(8);
    expect(input.milkPowderPercent).toBe(4);
    expect(result.oven.detail).toContain("tent once browned");
    expect(result.oven.unit).toBe("minutes");
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

  it("keeps lievito madre and sauerdough labels distinct in schedules", () => {
    const lievitoMadreInput = createDefaultInput(STYLE_IDS.NEW_YORK);
    lievitoMadreInput.preferment.kind = "biga";
    lievitoMadreInput.preferment.bigaStyle = "lievito-madre";

    const sauerdoughInput = createDefaultInput(STYLE_IDS.NEW_YORK);
    sauerdoughInput.preferment.kind = "biga";
    sauerdoughInput.preferment.bigaStyle = "sauerdough";

    const lievitoMadrePlan = buildBakePlan(lievitoMadreInput, "starting-now", new Date("2026-04-26T10:00:00"));
    const sauerdoughPlan = buildBakePlan(sauerdoughInput, "starting-now", new Date("2026-04-26T10:00:00"));

    expect(lievitoMadrePlan[0]?.label).toBe("Mix Lievito madre");
    expect(sauerdoughPlan[0]?.label).toBe("Mix Sourdough");
  });

  it("does not add extra final-dough yeast for natural starter preferments", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "biga";
    input.preferment.bigaStyle = "sauerdough";
    input.yeastType = "ady";

    const result = calculateDough(input);

    expect(result.ingredients.prefermentYeast).toBeGreaterThan(0);
    expect(result.ingredients.mainYeast).toBe(0);
    expect(result.waterTemperature.adyProofing).toBeUndefined();
    expect(result.waterTemperature.note).toBeUndefined();
  });

  it("allows hybrid sourdough plus commercial yeast when manual yeast is set", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "biga";
    input.preferment.bigaStyle = "sauerdough";
    input.yeastType = "ady";
    input.manualYeastPercent = 0.2;

    const result = calculateDough(input);

    expect(result.ingredients.prefermentYeast).toBeGreaterThan(0);
    expect(result.ingredients.mainYeast).toBeGreaterThan(0);
    expect(result.ingredients.totalYeast).toBe(result.ingredients.mainYeast);
    expect(result.waterTemperature.adyProofing).toBeDefined();
  });

  it("treats yeast type none as no commercial yeast", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "biga";
    input.preferment.bigaStyle = "sauerdough";
    input.yeastType = "none";
    input.manualYeastPercent = 0.2;

    const result = calculateDough(input);

    expect(result.ingredients.prefermentYeast).toBeGreaterThan(0);
    expect(result.ingredients.mainYeast).toBe(0);
    expect(result.ingredients.totalYeast).toBe(0);
    expect(result.waterTemperature.adyProofing).toBeUndefined();
  });

  it("uses the configured starter inoculation for natural starter preferments", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "biga";
    input.preferment.bigaStyle = "lievito-madre";
    input.preferment.flourPercent = 35;
    input.preferment.starterInoculationPercent = 60;

    const result = calculateDough(input);

    expect(result.ingredients.prefermentFlour).toBeDefined();
    expect(result.ingredients.prefermentYeast).toBe(
      Math.max(1, Math.round(((result.ingredients.prefermentFlour ?? 0) * 60)) / 100)
    );
  });

  it("supports separate preferment and main-dough flour blends", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "poolish";
    input.preferment.flourPercent = 40;
    input.flourBlend = [{ flourId: "king-arthur-bread", percentage: 100 }];
    input.prefermentFlourBlend = [{ flourId: "plain-flour", percentage: 100 }];
    input.mainDoughFlourBlend = [{ flourId: "all-trumps", percentage: 100 }];

    const result = calculateDough(input);

    expect(result.flourBlend.blendedW).toBe(314);
    expect(result.flourBlend.description).toContain("Plain / AP Flour");
    expect(result.flourBlend.description).toContain("All Trumps");
  });

  it("supports combined preferment stages like poolish plus biga", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "none";
    input.preferments = [
      { kind: "poolish", flourPercent: 30, bigaHydration: 100, bigaStyle: "standard", starterInoculationPercent: 20, roomHours: 12, coldHours: 0 },
      { kind: "biga", flourPercent: 50, bigaHydration: 55, bigaStyle: "standard", starterInoculationPercent: 20, roomHours: 24, coldHours: 12 }
    ];

    const result = calculateDough(input);

    expect(result.ingredients.prefermentStages).toHaveLength(2);
    expect(result.ingredients.prefermentFlour).toBe(
      result.ingredients.prefermentStages?.reduce((sum, stage) => sum + stage.flour, 0)
    );
    expect(result.ingredients.mainFlour).toBe(result.ingredients.totalFlour - (result.ingredients.prefermentFlour ?? 0));
    expect(result.ingredients.prefermentStages?.[0]?.label).toBe("Poolish");
    expect(result.ingredients.prefermentStages?.[1]?.label).toBe("Biga");
    expect(result.ingredients.prefermentStages?.[0]?.water).toBe(result.ingredients.prefermentStages?.[0]?.flour);
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

  it("lets humidity modestly affect room-temperature fermentation intensity", () => {
    const dryInput = createDefaultInput(STYLE_IDS.NEW_YORK);
    dryInput.fermentation.roomTempHours = 10;
    dryInput.fermentation.finalRiseHours = 2;
    dryInput.fermentation.roomHumidityPercent = 40;

    const humidInput = createDefaultInput(STYLE_IDS.NEW_YORK);
    humidInput.fermentation.roomTempHours = 10;
    humidInput.fermentation.finalRiseHours = 2;
    humidInput.fermentation.roomHumidityPercent = 75;

    expect(effectiveFermentationHours(humidInput)).toBeGreaterThan(effectiveFermentationHours(dryInput));
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

  it("uses loaf-specific shaping steps for sandwich loaves", () => {
    const input = createDefaultInput(STYLE_IDS.SANDWICH_LOAF);
    const startAt = new Date("2026-04-26T10:00:00");

    const plan = buildBakePlan(input, "starting-now", startAt);
    const labels = plan.map((step) => step.label);

    expect(labels).toContain("Pre-shape");
    expect(labels).toContain("Bench rest");
    expect(labels).toContain("Final shape");
    expect(labels).toContain("Final Proof");
    expect(plan.find((step) => step.label === "Final shape")?.description).toContain("tin");
    expect(plan.at(-1)?.description).toContain("cool before slicing");
  });

  it("sequences multiple preferment stages before the final dough", () => {
    const input = createDefaultInput(STYLE_IDS.NEW_YORK);
    input.preferment.kind = "none";
    input.preferments = [
      { kind: "poolish", flourPercent: 30, bigaHydration: 100, bigaStyle: "standard", starterInoculationPercent: 20, roomHours: 12, coldHours: 0 },
      { kind: "biga", flourPercent: 50, bigaHydration: 55, bigaStyle: "standard", starterInoculationPercent: 20, roomHours: 24, coldHours: 12 }
    ];

    const plan = buildBakePlan(input, "starting-now", new Date("2026-04-26T10:00:00"));
    const labels = plan.map((step) => step.label);

    expect(labels).toEqual(
      expect.arrayContaining(["Mix Poolish", "Poolish ferments", "Mix Biga", "Biga ferments", "Biga cold ferment", "Mix final dough"])
    );
    expect(labels.indexOf("Mix Poolish")).toBeLessThan(labels.indexOf("Mix Biga"));
    expect(labels.indexOf("Mix Biga")).toBeLessThan(labels.indexOf("Mix final dough"));
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
