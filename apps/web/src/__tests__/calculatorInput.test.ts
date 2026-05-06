import { createDefaultInput, STYLE_IDS, type CalculatorInput } from "@pizza-geek/core";
import { describe, expect, it } from "vitest";
import { applySinglePrefermentPatch, normalizeCalculatorInput } from "../calculatorInput";

describe("normalizeCalculatorInput", () => {
  it("drops removed flour ids from persisted blends", () => {
    const candidate = {
      ...createDefaultInput(STYLE_IDS.NEW_YORK),
      prefermentFlourBlend: [],
      mainDoughFlourBlend: [],
      flourBlend: [
        { flourId: "removed-flour", percentage: 70 },
        { flourId: "plain-flour", percentage: 30 }
      ]
    };

    const normalized = normalizeCalculatorInput(candidate);

    expect(normalized.flourBlend).toEqual([{ flourId: "plain-flour", percentage: 100 }]);
    expect(normalized.prefermentFlourBlend).toEqual([{ flourId: "plain-flour", percentage: 100 }]);
    expect(normalized.mainDoughFlourBlend).toEqual([{ flourId: "plain-flour", percentage: 100 }]);
  });

  it("normalizes legacy bassinage preferments into standard biga", () => {
    const candidate = createDefaultInput(STYLE_IDS.NEW_YORK);
    candidate.preferment = {
      ...candidate.preferment,
      kind: "biga",
      bigaStyle: "bassinage"
    };

    const normalized = normalizeCalculatorInput(candidate);

    expect(normalized.preferment.bigaStyle).toBe("standard");
    expect(normalized.preferments).toEqual([expect.objectContaining({ kind: "biga", bigaStyle: "standard" })]);
  });

  it("fills in starter inoculation defaults for legacy natural starter preferments", () => {
    const candidate = createDefaultInput(STYLE_IDS.NEW_YORK) as CalculatorInput;
    const preferment = {
      ...candidate.preferment,
      kind: "biga",
      bigaStyle: "lievito-madre"
    } as CalculatorInput["preferment"];
    delete (preferment as Partial<CalculatorInput["preferment"]>).starterInoculationPercent;
    candidate.preferments = [preferment];

    const normalized = normalizeCalculatorInput(candidate);

    expect(normalized.preferments?.[0]?.starterInoculationPercent).toBe(50);
  });

  it("keeps the single preferment editor in sync with the preferments array", () => {
    const candidate = createDefaultInput(STYLE_IDS.NEW_YORK);
    candidate.preferment = {
      ...candidate.preferment,
      kind: "poolish",
      bigaHydration: 100
    };
    candidate.preferments = [{
      ...candidate.preferment,
      kind: "poolish",
      bigaHydration: 100
    }];

    const updated = applySinglePrefermentPatch(candidate, {
      kind: "biga",
      bigaStyle: "standard",
      bigaHydration: 55
    });

    expect(updated.preferment.kind).toBe("biga");
    expect(updated.preferments).toEqual([expect.objectContaining({ kind: "biga", bigaStyle: "standard", bigaHydration: 55 })]);

    const cleared = applySinglePrefermentPatch(updated, { kind: "none" });

    expect(cleared.preferment.kind).toBe("none");
    expect(cleared.preferments).toEqual([]);
  });

  it("keeps valid custom flours available to the blend normalizer", () => {
    const candidate = createDefaultInput(STYLE_IDS.NEW_YORK);
    candidate.customFlours = [{
      id: "custom-flour",
      brand: "Custom",
      name: "Strong White",
      type: "bread",
      proteinPercent: 14,
      wStrength: "W350",
      absorptionAdjustment: 3,
      regions: ["GLOBAL"]
    }];
    candidate.flourBlend = [{ flourId: "custom-flour", percentage: 100 }];
    candidate.prefermentFlourBlend = [{ flourId: "custom-flour", percentage: 100 }];
    candidate.mainDoughFlourBlend = [{ flourId: "custom-flour", percentage: 100 }];

    const normalized = normalizeCalculatorInput(candidate);

    expect(normalized.customFlours).toEqual(candidate.customFlours);
    expect(normalized.flourBlend).toEqual([{ flourId: "custom-flour", percentage: 100 }]);
    expect(normalized.prefermentFlourBlend).toEqual([{ flourId: "custom-flour", percentage: 100 }]);
    expect(normalized.mainDoughFlourBlend).toEqual([{ flourId: "custom-flour", percentage: 100 }]);
  });

  it("converts legacy single pizza oven temperatures into split stone and top values", () => {
    const candidate = createDefaultInput(STYLE_IDS.NEAPOLITAN) as CalculatorInput & {
      oven: CalculatorInput["oven"] & { pizzaOvenTempF: number };
    };
    candidate.oven = {
      ...candidate.oven,
      pizzaOvenStoneTempF: undefined as unknown as number,
      pizzaOvenTopTempF: undefined as unknown as number,
      pizzaOvenTempF: 825
    };

    const normalized = normalizeCalculatorInput(candidate as CalculatorInput);

    expect(normalized.oven.pizzaOvenStoneTempF).toBe(750);
    expect(normalized.oven.pizzaOvenTopTempF).toBe(825);
  });
});
