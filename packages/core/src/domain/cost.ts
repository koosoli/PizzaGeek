import type { CostBreakdown, CostSettings, DoughResult } from "./types";

export function defaultCostSettings(currency = "USD"): CostSettings {
  return {
    currency,
    flourPerKg: 3,
    saltPerKg: 1,
    yeastPerKg: 24,
    oilPerKg: 8,
    sugarPerKg: 2,
    honeyPerKg: 8,
    maltPerKg: 12,
    lardPerKg: 7,
    milkPowderPerKg: 10
  };
}

function cost(grams: number, perKg: number): number {
  return (grams / 1000) * perKg;
}

export function calculateCost(result: DoughResult, settings: CostSettings, ballCount: number): CostBreakdown {
  const ingredients = result.ingredients;
  const lines = {
    flour: cost(ingredients.totalFlour, settings.flourPerKg),
    salt: cost(ingredients.totalSalt, settings.saltPerKg),
    yeast: cost(ingredients.totalYeast, settings.yeastPerKg),
    oil: cost(ingredients.totalOil, settings.oilPerKg),
    sugar: cost(ingredients.totalSugar, settings.sugarPerKg),
    honey: cost(ingredients.totalHoney, settings.honeyPerKg),
    malt: cost(ingredients.totalMalt, settings.maltPerKg),
    lard: cost(ingredients.totalLard, settings.lardPerKg),
    milkPowder: cost(ingredients.totalMilkPowder, settings.milkPowderPerKg)
  };
  const total = Object.values(lines).reduce((sum, line) => sum + line, 0);
  return {
    total,
    perBall: ballCount > 0 ? total / ballCount : total,
    currency: settings.currency,
    lines
  };
}
