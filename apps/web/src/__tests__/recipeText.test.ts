import { calculateDough, createDefaultInput, STYLE_IDS } from "@pizza-geek/core";
import { describe, expect, it } from "vitest";
import { normalizeCalculatorInput } from "../calculatorInput";
import { getMethodSteps } from "../recipeText";

describe("getMethodSteps", () => {
  it("mentions preferment and main dough flour blends in the method text", () => {
    const candidate = createDefaultInput(STYLE_IDS.NEW_YORK);
    candidate.preferment = {
      ...candidate.preferment,
      kind: "poolish",
      flourPercent: 30,
      bigaHydration: 100,
      roomHours: 12
    };
    candidate.preferments = [candidate.preferment];
    candidate.prefermentFlourBlend = [
      { flourId: "caputo-nuvola", percentage: 70 },
      { flourId: "whole-wheat", percentage: 30 }
    ];
    candidate.mainDoughFlourBlend = [
      { flourId: "king-arthur-bread", percentage: 80 },
      { flourId: "all-trumps", percentage: 20 }
    ];

    const input = normalizeCalculatorInput(candidate);
    const result = calculateDough(input);
    const steps = getMethodSteps(input, result, "en", "F");

    expect(steps[0]).toMatch(/Add \d+g Caputo Nuvola \(70%\) and \d+g Generic Whole Wheat \(30%\)\./);
    expect(steps.find((step) => step.startsWith("Mix the final dough"))).toMatch(
      /Add \d+g King Arthur Bread Flour \(80%\) and \d+g Gold Medal \(General Mills\) All Trumps \(20%\)\./
    );
  });

  it("mentions the selected flour even when the dough uses a single flour", () => {
    const candidate = createDefaultInput(STYLE_IDS.NEW_YORK);
    candidate.mainDoughFlourBlend = [{ flourId: "all-trumps", percentage: 100 }];
    candidate.flourBlend = [{ flourId: "all-trumps", percentage: 100 }];

    const input = normalizeCalculatorInput(candidate);
    const result = calculateDough(input);
    const steps = getMethodSteps(input, result, "en", "F");

    expect(steps.find((step) => step.startsWith("Mix the final dough"))).toMatch(
      /Add \d+g Gold Medal \(General Mills\) All Trumps \(100%\)\./
    );
  });
});
