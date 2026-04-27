import { getSauceOption } from "../data/sauces";
import { getStyleById, isBreadStyleId, isLoafStyleId, isTinLoafStyleId, STYLE_IDS } from "../data/styles";
import { analyzeFlourBlend, combineBlendSegments, normalizeBlend } from "./flour";
import type {
  CalculatorInput,
  DoughResult,
  IngredientBreakdown,
  MixerType,
  OvenOptions,
  OvenType,
  PanOptions,
  PizzaStyle,
  WaterTemperatureResult,
  YeastType
} from "./types";

const YEAST_MULTIPLIER: Record<YeastType, number> = {
  none: 0,
  idy: 1,
  ady: 1.33,
  fresh: 3
};

const YEAST_LIMITS: Record<YeastType, { min: number; max: number }> = {
  none: { min: 0, max: 0 },
  idy: { min: 0.05, max: 2 },
  ady: { min: 0.07, max: 2.7 },
  fresh: { min: 0.15, max: 6 }
};

function isNaturalStarterPreferment(input: CalculatorInput): boolean {
  return (
    input.preferment.kind === "biga" &&
    (input.preferment.bigaStyle === "lievito-madre" || input.preferment.bigaStyle === "sauerdough")
  );
}

function getEffectiveYeastType(input: CalculatorInput): YeastType {
  return calculateYeastPercent(input) > 0 ? input.yeastType : "fresh";
}

function sameBlend(left: ReturnType<typeof normalizeBlend>, right: ReturnType<typeof normalizeBlend>): boolean {
  if (left.length !== right.length) return false;

  return left.every(
    (item, index) => item.flourId === right[index]?.flourId && item.percentage === right[index]?.percentage
  );
}

const MIXER_FRICTION_F: Record<MixerType, number> = {
  hand: 6,
  spiral: 10,
  planetary: 20
};

function isNeapolitanFamily(styleId: string): boolean {
  return (
    styleId === STYLE_IDS.NEAPOLITAN ||
    styleId === STYLE_IDS.CONTEMPORARY_NEAPOLITAN ||
    styleId === STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

function humidityFermentationFactor(
  humidityPercent: number,
  idealPercent: number,
  maxEffect: number,
  minPercent: number,
  maxPercent: number
): number {
  const clampedHumidity = clamp(humidityPercent, minPercent, maxPercent);
  if (clampedHumidity === idealPercent) return 1;

  const range = clampedHumidity > idealPercent ? maxPercent - idealPercent : idealPercent - minPercent;
  if (range <= 0) return 1;

  return 1 + ((clampedHumidity - idealPercent) / range) * maxEffect;
}

export function effectiveFermentationHours(input: CalculatorInput): number {
  const schedule = input.fermentation;
  const roomTempFactor = 2 ** ((schedule.roomTempF - 68) / 15);
  const cellarTempFactor = 0.2 + ((clamp(schedule.cellarTempF, 50, 65) - 50) / 15) * 0.4;
  const fridgeTempFactor = 0.1 + ((clamp(schedule.fridgeTempF, 34, 46) - 34) / 12) * 0.1;
  const roomHumidityFactor = humidityFermentationFactor(schedule.roomHumidityPercent, 60, 0.08, 30, 85);
  const cellarHumidityFactor = humidityFermentationFactor(schedule.cellarHumidityPercent, 72, 0.06, 45, 90);
  const fridgeHumidityFactor = humidityFermentationFactor(schedule.fridgeHumidityPercent, 50, 0.04, 30, 80);
  const coldHours = schedule.coldBulkHours + schedule.coldBallHours;
  const finalWarmupFactor = coldHours > 0 || schedule.cellarTempHours > 0 ? 0.6 : 1;

  return (
    schedule.roomTempHours * roomTempFactor * roomHumidityFactor +
    schedule.cellarTempHours * cellarTempFactor * cellarHumidityFactor +
    coldHours * fridgeTempFactor * fridgeHumidityFactor +
    schedule.finalRiseHours * roomTempFactor * roomHumidityFactor * finalWarmupFactor
  );
}

export function calculateYeastPercent(input: CalculatorInput): number {
  if (input.yeastType === "none") {
    return 0;
  }

  if (isNaturalStarterPreferment(input)) {
    return Math.max(0, input.manualYeastPercent ?? 0);
  }

  if (input.manualYeastPercent && input.manualYeastPercent > 0) {
    return input.manualYeastPercent;
  }

  const hours = Math.max(1, effectiveFermentationHours(input));
  const base = 3.48 * hours ** -1.447;
  const shortFermentBoost = hours < 4 ? 1 + (0.25 * (4 - hours)) / 3 : 1;
  const yeastType = input.yeastType;
  const yeast = base * shortFermentBoost * YEAST_MULTIPLIER[yeastType] * ovenYeastMultiplier(input.oven);
  const limits = YEAST_LIMITS[yeastType];
  return clamp(yeast, limits.min, limits.max);
}

function calculatePrefermentLeavening(input: CalculatorInput, prefermentFlour: number): number {
  if (!isNaturalStarterPreferment(input)) {
    return Math.max(0.1, round(prefermentFlour * 0.0008, 2));
  }

  const inoculationPercent = clamp(input.preferment.starterInoculationPercent, 1, 100);
  return Math.max(1, round((prefermentFlour * inoculationPercent) / 100, 1));
}

export function ovenYeastMultiplier(oven: OvenOptions): number {
  switch (oven.type) {
    case "wood-fired":
    case "coal-fired":
    case "pizza-oven":
      return 1;
    case "deck-oven":
      if (oven.deckOvenTempF >= 700) return 1;
      if (oven.deckOvenTempF >= 650) return 1.1;
      if (oven.deckOvenTempF >= 600) return 1.2;
      if (oven.deckOvenTempF >= 550) return 1.3;
      return 1.4;
    case "steel-stone":
      return 1.2;
    case "conventional":
      return 1.4;
    default:
      return 1;
  }
}

export function calculateWaterTemperature(input: CalculatorInput, waterGrams: number): WaterTemperatureResult {
  const schedule = input.fermentation;
  const yeastType = getEffectiveYeastType(input);
  const coldHours = schedule.coldBulkHours + schedule.coldBallHours;
  let targetFdtF: number;

  if (coldHours > 0) {
    targetFdtF = schedule.roomTempHours >= 8 ? 73 : 76;
  } else if (schedule.roomTempHours >= 24) {
    targetFdtF = 70;
  } else if (schedule.roomTempHours >= 16) {
    targetFdtF = 73;
  } else if (schedule.roomTempHours >= 8) {
    targetFdtF = 76;
  } else {
    targetFdtF = 80;
  }

  const flourTempF = input.flourTempF ?? schedule.roomTempF;
  const waterTempF = Math.round(
    3 * targetFdtF - schedule.roomTempF - flourTempF - MIXER_FRICTION_F[input.mixerType]
  );
  const clampedWaterTempF = clamp(waterTempF, 32, 105);
  let warning: string | undefined;
  let note: string | undefined;

  if (waterTempF < 40) warning = "Ice water needed. Chill water thoroughly and include ice if required.";
  else if (waterTempF < 50) warning = "Very cold water. Refrigerate the water before mixing.";
  else if (waterTempF > 85) warning = "Warm water. Check yeast freshness and avoid overheating the dough.";

  if (yeastType === "ady" && waterTempF < 70) {
    note = "Active dry yeast works best if bloomed separately in warm water first.";
  }

  const result: WaterTemperatureResult = {
    targetFdtF,
    targetFdtC: fahrenheitToCelsius(targetFdtF),
    waterTempF: clampedWaterTempF,
    waterTempC: fahrenheitToCelsius(clampedWaterTempF),
    warning,
    note
  };

  if (yeastType === "ady" && waterGrams > 60) {
    const proofingWaterG = Math.min(50, Math.round(waterGrams * 0.25));
    const remainingWaterG = Math.max(0, Math.round(waterGrams) - proofingWaterG);
    const proofingWaterTempF = 105;
    const remainingWaterTempF =
      remainingWaterG > 0
        ? clamp(
            Math.round((clampedWaterTempF * Math.round(waterGrams) - proofingWaterG * proofingWaterTempF) / remainingWaterG),
            32,
            100
          )
        : clampedWaterTempF;
    result.adyProofing = {
      proofingWaterG,
      proofingWaterTempF,
      remainingWaterG,
      remainingWaterTempF
    };
  }

  return result;
}

export function calculatePanAreaSqIn(pan: PanOptions): number | undefined {
  if (!pan.enabled) return undefined;
  const toInches = (value: number) => (pan.unit === "cm" ? value / 2.54 : value);
  if (pan.shape === "round") {
    const radius = toInches(pan.diameter) / 2;
    return Math.PI * radius * radius;
  }
  return toInches(pan.length) * toInches(pan.width);
}

export function estimatePanBallWeight(styleId: string, pan: PanOptions): number | undefined {
  const area = calculatePanAreaSqIn(pan);
  if (!area) return undefined;
  const style = getStyleById(styleId);
  const density =
    style?.id === STYLE_IDS.DETROIT
      ? pan.depth >= 2.5
        ? 4.3
        : 3.5
      : style?.id === STYLE_IDS.FOCACCIA
        ? pan.depth <= 1 ? 1.8 : 2.5
        : style?.id === STYLE_IDS.SICILIAN
          ? pan.depth <= 1 ? 1.7 : 2.5
          : style?.id === STYLE_IDS.CHICAGO_DEEP_DISH
            ? pan.depth >= 2 ? 5.1 : 4.3
              : style?.id === STYLE_IDS.ROMAN
                ? 1.8
                : style?.id === STYLE_IDS.GRANDMA
                  ? 1.5
                  : style?.id === STYLE_IDS.SANDWICH_LOAF
                    ? pan.depth >= 3.5
                      ? 19
                      : 16
                  : 2.3;
  return Math.round(area * density);
}

export function getOvenBakeProfile(style: PizzaStyle, oven: OvenOptions, pan?: PanOptions): DoughResult["oven"] {
  const panArea = pan ? calculatePanAreaSqIn(pan) : undefined;

  if (style.id === STYLE_IDS.COUNTRY_LOAF) {
    return {
      tempF: 475,
      tempC: fahrenheitToCelsius(475),
      minTime: 35,
      maxTime: 48,
      unit: "minutes",
      detail: "Steam first 20 min or bake covered, then vent to finish."
    };
  }

  if (style.id === STYLE_IDS.SEMOLINA_LOAF) {
    return {
      tempF: 465,
      tempC: fahrenheitToCelsius(465),
      minTime: 32,
      maxTime: 42,
      unit: "minutes",
      detail: "Steam early, score confidently, and finish until the crust turns deep gold."
    };
  }

  if (style.id === STYLE_IDS.WHOLE_GRAIN_HEARTH) {
    return {
      tempF: 470,
      tempC: fahrenheitToCelsius(470),
      minTime: 36,
      maxTime: 48,
      unit: "minutes",
      detail: "Steam first 20 min and bake through full color before slicing."
    };
  }

  if (style.id === STYLE_IDS.SANDWICH_LOAF) {
    return {
      tempF: 400,
      tempC: fahrenheitToCelsius(400),
      minTime: 30,
      maxTime: 40,
      unit: "minutes",
      detail: "Bake in a tin and rotate once the top has set."
    };
  }

  if (style.id === STYLE_IDS.MILK_BREAD) {
    return {
      tempF: 375,
      tempC: fahrenheitToCelsius(375),
      minTime: 28,
      maxTime: 38,
      unit: "minutes",
      detail: "Bake in a tin and tent once browned if the top colors early."
    };
  }

  if (style.panStyle && pan && panArea) {
    if (style.id === STYLE_IDS.DETROIT) {
      const large = panArea > 160;
      return {
        tempF: large ? 500 : 525,
        tempC: fahrenheitToCelsius(large ? 500 : 525),
        minTime: large ? 16 : 12,
        maxTime: large ? 20 : 15,
        unit: "minutes"
      };
    }
    if (style.id === STYLE_IDS.CHICAGO_DEEP_DISH) {
      const diameter = pan.shape === "round" ? pan.diameter : Math.sqrt((panArea / Math.PI) * 4);
      const minTime = diameter <= 10 ? 20 : diameter <= 12 ? 22 : 25;
      const extra = pan.depth >= 2 ? 5 : 0;
      return {
        tempF: 425,
        tempC: fahrenheitToCelsius(425),
        minTime: minTime + extra,
        maxTime: minTime + extra + 8,
        unit: "minutes"
      };
    }
    if (style.id === STYLE_IDS.SICILIAN || style.id === STYLE_IDS.FOCACCIA || style.id === STYLE_IDS.SCHIACCIATA) {
      const big = panArea > 180;
      return {
        tempF: style.id === STYLE_IDS.FOCACCIA ? 450 : style.id === STYLE_IDS.SCHIACCIATA ? 460 : big ? 450 : 475,
        tempC: fahrenheitToCelsius(style.id === STYLE_IDS.FOCACCIA ? 450 : style.id === STYLE_IDS.SCHIACCIATA ? 460 : big ? 450 : 475),
        minTime: style.id === STYLE_IDS.FOCACCIA ? 18 : style.id === STYLE_IDS.SCHIACCIATA ? 16 : big ? 25 : 20,
        maxTime: style.id === STYLE_IDS.FOCACCIA ? 28 : style.id === STYLE_IDS.SCHIACCIATA ? 24 : big ? 32 : 28,
        unit: "minutes"
      };
    }
  }

  if (oven.type === "pizza-oven") {
    const stoneTemp = clamp(oven.pizzaOvenStoneTempF, 650, 950);
    const topTemp = clamp(oven.pizzaOvenTopTempF, 650, 1000);
    const temp = Math.round(stoneTemp * 0.55 + topTemp * 0.45);
    const neapolitanStyle = isNeapolitanFamily(style.id);
    const fast = neapolitanStyle ? stoneTemp >= 800 && topTemp >= 800 : temp >= 850;
    const minTime = fast
        ? neapolitanStyle
          ? style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN ||
            style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN
            ? 75
            : 90
        : 90
      : temp >= 800
        ? 2
        : 3;
    const maxTime = fast ? 120 : temp >= 800 ? 3 : 5;
    return {
      tempF: temp,
      tempC: fahrenheitToCelsius(temp),
      minTime,
      maxTime,
      unit: fast ? "seconds" : "minutes",
      detail: `Stone ${stoneTemp}F, top ${topTemp}F`
    };
  }

  if (oven.type === "wood-fired") {
    const seconds = isNeapolitanFamily(style.id);
    return {
      tempF: seconds ? 900 : 700,
      tempC: fahrenheitToCelsius(seconds ? 900 : 700),
      minTime:
        seconds
          ? style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN ||
            style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN
            ? 75
            : 60
          : Math.max(2, style.cookTime.min - 4),
      maxTime:
        seconds
          ? style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN ||
            style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN
            ? 120
            : 90
          : Math.max(4, style.cookTime.max - 6),
      unit: seconds ? "seconds" : "minutes"
    };
  }

  if (oven.type === "coal-fired") {
    return {
      tempF: isNeapolitanFamily(style.id) ? 900 : 800,
      tempC: fahrenheitToCelsius(isNeapolitanFamily(style.id) ? 900 : 800),
      minTime: isNeapolitanFamily(style.id) ? 4 : Math.max(3, style.cookTime.min - 3),
      maxTime: isNeapolitanFamily(style.id) ? 6 : Math.max(5, style.cookTime.max - 5),
      unit: "minutes"
    };
  }

  if (oven.type === "deck-oven") {
    const temp = clamp(oven.deckOvenTempF, 500, 700);
    const heatBoost = Math.round((temp - 500) / 50);
    return {
      tempF: temp,
      tempC: fahrenheitToCelsius(temp),
      minTime: Math.max(3, style.cookTime.min - heatBoost),
      maxTime: Math.max(5, style.cookTime.max - heatBoost),
      unit: style.cookTime.unit === "seconds" ? "minutes" : style.cookTime.unit
    };
  }

  if (oven.type === "steel-stone") {
    const temp = oven.useBroilerMethod ? 625 : style.id === STYLE_IDS.NEW_YORK ? 550 : 525;
    return {
      tempF: temp,
      tempC: fahrenheitToCelsius(temp),
      minTime: Math.max(3, style.cookTime.min - (oven.useBroilerMethod ? 4 : 1)),
      maxTime: Math.max(5, style.cookTime.max - (oven.useBroilerMethod ? 5 : 1)),
      unit: "minutes"
    };
  }

  const temp = oven.useFinishingBroil ? Math.max(style.ovenTempF.recommended, 500) : style.ovenTempF.recommended;
  return {
    tempF: temp,
    tempC: fahrenheitToCelsius(temp),
    minTime: style.cookTime.unit === "seconds" ? 8 : style.cookTime.min,
    maxTime: style.cookTime.unit === "seconds" ? 12 : style.cookTime.max,
    unit: "minutes"
  };
}

export function calculateIngredients(input: CalculatorInput, yeastPercent: number): IngredientBreakdown {
  const targetDough = input.doughBalls * input.ballWeight;
  const flour = (targetDough / (100 + input.hydrationPercent + input.saltPercent)) * 100;
  let water = (flour * input.hydrationPercent) / 100;
  const salt = (flour * input.saltPercent) / 100;
  const yeast = (flour * yeastPercent) / 100;
  const oil = (flour * input.oilPercent) / 100;
  const lard = (flour * input.lardPercent) / 100;
  const sugar = (flour * input.sugarPercent) / 100;
  const honey = (flour * input.honeyPercent) / 100;
  const malt = (flour * input.maltPercent) / 100;
  const milkPowder = (flour * input.milkPowderPercent) / 100;

  if (honey > 0) {
    water -= honey * 0.18;
  }

  const roundedFlour = Math.round(flour);
  const roundedWater = Math.max(0, Math.round(water));
  let prefermentFlour: number | undefined;
  let prefermentWater: number | undefined;
  let prefermentYeast: number | undefined;
  let mainFlour: number | undefined;
  let mainWater: number | undefined;
  let mainYeast: number | undefined;
  const naturalStarter = isNaturalStarterPreferment(input);

  if (input.preferment.kind !== "none") {
    prefermentFlour = Math.round((flour * input.preferment.flourPercent) / 100);
    prefermentWater = Math.round(
      prefermentFlour * (input.preferment.kind === "poolish" ? 1 : input.preferment.bigaHydration / 100)
    );
    prefermentYeast = calculatePrefermentLeavening(input, prefermentFlour);
    mainFlour = Math.max(0, roundedFlour - prefermentFlour);
    mainWater = Math.max(0, roundedWater - prefermentWater);
    mainYeast = naturalStarter ? round(yeast, 1) : Math.max(0, round(yeast - prefermentYeast, 1));
  }

  const totalDoughWeight =
    flour + water + salt + yeast + oil + lard + sugar + honey + malt + milkPowder;

  return {
    totalFlour: roundedFlour,
    totalWater: roundedWater,
    totalSalt: round(salt, 1),
    totalYeast: round(yeast, 1),
    totalOil: Math.round(oil),
    totalSugar: round(sugar, 1),
    totalHoney: round(honey, 1),
    totalMalt: round(malt, 1),
    totalLard: Math.round(lard),
    totalMilkPowder: round(milkPowder, 1),
    totalDoughWeight: Math.round(totalDoughWeight),
    prefermentFlour,
    prefermentWater,
    prefermentYeast,
    mainFlour,
    mainWater,
    mainYeast
  };
}

function sauceLabel(style: CalculatorInput["sauce"]["style"]): string {
  switch (style) {
    case "raw":
      return "raw tomato";
    case "cooked":
      return "cooked tomato";
    case "white":
      return "white sauce";
    default:
      return "classic tomato";
  }
}

function buildSaucePlan(input: CalculatorInput): DoughResult["sauce"] | undefined {
  if (!input.sauce.enabled || input.sauce.gramsPerPizza <= 0) {
    return undefined;
  }

  const perPizzaGrams = Math.round(input.sauce.gramsPerPizza);
  const totalGrams = perPizzaGrams * input.doughBalls;
  const recipe = getSauceOption(input.styleId, input.sauce.recipeId);
  const styleLabel = sauceLabel(input.sauce.style);
  const instructions = [
    `Use about ${perPizzaGrams}g ${recipe?.name ?? styleLabel} per pizza, or ${totalGrams}g total for the batch.`,
    ...(recipe?.instructions.length
      ? recipe.instructions
      : [
          input.sauce.style === "raw"
            ? "Apply the sauce lightly after opening the dough so the center stays supple and the rim can rise cleanly."
            : input.sauce.style === "cooked"
              ? "Cool the sauce fully before topping and keep the layer even so the crust can bake through."
              : input.sauce.style === "white"
                ? "Spread the white sauce sparingly after stretching to avoid weighing down the center."
                : "Spread the sauce in a thin, even layer and leave the rim mostly clear."
        ])
  ];

  return {
    style: input.sauce.style,
    recipeId: recipe?.id ?? input.sauce.recipeId,
    recipeName: recipe?.name,
    totalGrams,
    perPizzaGrams,
    instructions
  };
}

export function calculateDough(input: CalculatorInput): DoughResult {
  const style = getStyleById(input.styleId);
  if (!style) throw new Error(`Unknown pizza style: ${input.styleId}`);
  if (input.doughBalls <= 0 || input.ballWeight <= 0) {
    throw new Error("Dough balls and ball weight must be positive.");
  }

  const legacyBlend = normalizeBlend(input.flourBlend);
  const prefermentBlendCandidate = normalizeBlend(
    input.prefermentFlourBlend?.length ? input.prefermentFlourBlend : input.flourBlend
  );
  const mainDoughBlendCandidate = normalizeBlend(
    input.mainDoughFlourBlend?.length ? input.mainDoughFlourBlend : input.flourBlend
  );
  const useLegacyBlend =
    sameBlend(prefermentBlendCandidate, mainDoughBlendCandidate) && !sameBlend(prefermentBlendCandidate, legacyBlend);
  const prefermentBlend = useLegacyBlend ? legacyBlend : prefermentBlendCandidate;
  const mainDoughBlend = useLegacyBlend ? legacyBlend : mainDoughBlendCandidate;
  const normalizedBlend =
    input.preferment.kind === "none"
      ? mainDoughBlend
      : combineBlendSegments([
          { blend: prefermentBlend, weight: input.preferment.flourPercent },
          { blend: mainDoughBlend, weight: 100 - input.preferment.flourPercent }
        ]);
  const coldHours = input.fermentation.coldBulkHours + input.fermentation.coldBallHours;
  const flourBlend = analyzeFlourBlend(
    normalizedBlend,
    input.fermentation.roomTempHours,
    coldHours,
    input.hydrationPercent,
    input.flourBlendEnabled
  );
  const yeastPercent = calculateYeastPercent(input);
  const ingredients = calculateIngredients(input, yeastPercent);
  const waterTemperature = calculateWaterTemperature(input, ingredients.totalWater);
  const oven = getOvenBakeProfile(style, input.oven, input.pan);
  const panArea = calculatePanAreaSqIn(input.pan);
  const sauce = buildSaucePlan(input);

  return {
    style,
    ingredients,
    percentages: {
      hydration: round(input.hydrationPercent, 1),
      salt: round(input.saltPercent, 1),
      yeast: round(yeastPercent, 2),
      oil: input.oilPercent > 0 ? round(input.oilPercent, 1) : undefined,
      sugar: input.sugarPercent > 0 ? round(input.sugarPercent, 1) : undefined,
      honey: input.honeyPercent > 0 ? round(input.honeyPercent, 1) : undefined,
      malt: input.maltPercent > 0 ? round(input.maltPercent, 1) : undefined,
      lard: input.lardPercent > 0 ? round(input.lardPercent, 1) : undefined,
      milkPowder: input.milkPowderPercent > 0 ? round(input.milkPowderPercent, 1) : undefined
    },
    yeastPercent,
    effectiveFermentationHours: round(effectiveFermentationHours(input), 1),
    totalFermentationHours:
      input.fermentation.roomTempHours +
      input.fermentation.cellarTempHours +
      input.fermentation.coldBulkHours +
      input.fermentation.coldBallHours +
      input.fermentation.finalRiseHours,
    waterTemperature,
    flourBlend,
    oven,
    pan: panArea ? { areaSqIn: round(panArea, 1), depth: input.pan.depth } : undefined,
    sauce,
    instructions: generateInstructions(input, style, ingredients, waterTemperature, sauce)
  };
}

function yeastLabel(type: YeastType): string {
  if (type === "none") return "no commercial yeast";
  if (type === "ady") return "active dry yeast";
  if (type === "fresh") return "fresh yeast";
  return "instant dry yeast";
}

function prefermentLeaveningLabel(input: CalculatorInput): string {
  if (input.preferment.bigaStyle === "lievito-madre") return "lievito madre starter";
  if (input.preferment.bigaStyle === "sauerdough") return "sourdough starter";
  return "yeast";
}

export function generateInstructions(
  input: CalculatorInput,
  style: PizzaStyle,
  ingredients: IngredientBreakdown,
  water: WaterTemperatureResult,
  sauce?: DoughResult["sauce"]
): string[] {
  const instructions: string[] = [];
  const totalFermentHours =
    input.fermentation.roomTempHours +
    input.fermentation.cellarTempHours +
    input.fermentation.coldBulkHours +
    input.fermentation.coldBallHours +
    input.fermentation.finalRiseHours;
  const prefermentName =
    input.preferment.kind === "poolish"
      ? "Poolish"
      : input.preferment.bigaStyle === "tiga"
        ? "Tiga"
        : input.preferment.bigaStyle === "lievito-madre"
            ? "Lievito madre"
            : input.preferment.bigaStyle === "sauerdough"
              ? "Sourdough"
          : "Biga";

  if (input.preferment.kind !== "none") {
    instructions.push(
      `Mix ${prefermentName}: combine ${ingredients.prefermentFlour}g flour (${input.preferment.flourPercent}% of total flour), ${ingredients.prefermentWater}g water, and ${ingredients.prefermentYeast}g ${prefermentLeaveningLabel(input)}. Ferment ${input.preferment.roomHours}h at room temperature${input.preferment.coldHours > 0 ? `, then ${input.preferment.coldHours}h cold` : ""}.`
    );
  }

  if (input.yeastType === "ady" && water.adyProofing) {
    instructions.push(
      `Bloom ADY in ${water.adyProofing.proofingWaterG}g water at ${fahrenheitToCelsius(water.adyProofing.proofingWaterTempF)}C (${water.adyProofing.proofingWaterTempF}F). Use the remaining ${water.adyProofing.remainingWaterG}g water at ${fahrenheitToCelsius(water.adyProofing.remainingWaterTempF)}C (${water.adyProofing.remainingWaterTempF}F).`
    );
  } else {
    instructions.push(
      `Use water at ${water.waterTempC}C (${water.waterTempF}F). Target dough temp: ${water.targetFdtC}C (${water.targetFdtF}F) for ${totalFermentHours}h ferment.`
    );
  }

  const flour = input.preferment.kind === "none" ? ingredients.totalFlour : ingredients.mainFlour;
  const waterAmount = input.preferment.kind === "none" ? ingredients.totalWater : ingredients.mainWater;
  const yeast = input.preferment.kind === "none" ? ingredients.totalYeast : ingredients.mainYeast;
  instructions.push(
    `Mix final dough with ${flour}g ${input.preferment.kind === "none" ? "flour" : "additional flour"}, ${waterAmount}g ${input.preferment.kind === "none" ? "water" : "additional water"}, ${ingredients.totalSalt}g salt${!yeast ? "" : `, and ${yeast}g ${input.preferment.kind === "none" ? yeastLabel(input.yeastType) : `additional ${yeastLabel(input.yeastType)}`}`}${input.preferment.kind !== "none" ? `${!yeast ? ", plus the ripe " : " plus the ripe "}${prefermentName}` : ""}.`
  );

  const enrichments = [
    ingredients.totalOil > 0 ? `${ingredients.totalOil}g oil` : null,
    ingredients.totalLard > 0 ? `${ingredients.totalLard}g lard` : null,
    ingredients.totalSugar > 0 ? `${ingredients.totalSugar}g sugar` : null,
    ingredients.totalHoney > 0 ? `${ingredients.totalHoney}g honey` : null,
    ingredients.totalMalt > 0 ? `${ingredients.totalMalt}g malt` : null,
    ingredients.totalMilkPowder > 0 ? `${ingredients.totalMilkPowder}g milk powder` : null
  ].filter(Boolean);
  if (enrichments.length > 0) instructions.push(`Add enrichments: ${enrichments.join(", ")}.`);

  if (input.mixerType === "hand") {
    instructions.push("Rest 20 minutes, then knead or stretch-and-fold until the dough is smooth and elastic.");
  } else if (input.mixerType === "spiral") {
    instructions.push("Mix on speed 1 for about 3 minutes, then speed 2 for 5-8 minutes until developed.");
  } else {
    instructions.push("Mix on low until combined, then medium-low until the dough pulls from the bowl and passes a gentle windowpane.");
  }

  if (input.fermentation.roomTempHours > 0) {
    instructions.push(`Bulk ferment ${input.fermentation.roomTempHours}h at about ${input.fermentation.roomTempF}F.`);
  }
  if (input.fermentation.cellarTempHours > 0) {
    instructions.push(`Move to cellar conditions for ${input.fermentation.cellarTempHours}h at about ${input.fermentation.cellarTempF}F.`);
  }
  if (input.fermentation.coldBulkHours > 0) {
    instructions.push(
      `Cold bulk ${input.fermentation.coldBulkHours}h at about ${input.fermentation.fridgeTempF}F as one mass${isLoafStyleId(style.id) ? ", then pre-shape and rest." : ", then divide and ball."}`
    );
  }
  if (input.fermentation.coldBallHours > 0) {
    instructions.push(
      `${isLoafStyleId(style.id) ? "Cold proof" : "Cold ball"} ${input.fermentation.coldBallHours}h at about ${input.fermentation.fridgeTempF}F after dividing the dough.`
    );
  }

  if (isLoafStyleId(style.id)) {
    instructions.push(
      input.doughBalls > 1
        ? `Divide into ${input.doughBalls} pieces around ${input.ballWeight}g each, pre-shape, and rest 20 minutes before the final shape.`
        : "Pre-shape the dough gently, then rest it for 20 minutes before the final shape."
    );
    instructions.push(
      isTinLoafStyleId(style.id)
        ? "Shape into a tight log, place seam-side down in a greased loaf tin, and proof until the crown nears the rim."
        : "Shape the loaf tightly, place it seam-side up in a floured banneton or towel-lined bowl, and proof until aerated."
    );
  } else if (style.panStyle) {
    instructions.push("Oil the pan generously, place dough in the pan, and proof until relaxed before final stretching.");
  } else {
    instructions.push(`Divide into ${input.doughBalls} dough ball${input.doughBalls === 1 ? "" : "s"} around ${input.ballWeight}g each and proof until extensible.`);
  }

  if (input.fermentation.finalRiseHours > 0) {
    instructions.push(
      isLoafStyleId(style.id)
        ? `Final proof ${input.fermentation.finalRiseHours}h at about ${input.fermentation.roomTempF}F until the dough springs back slowly when pressed.`
        : `Temper for ${input.fermentation.finalRiseHours}h at about ${input.fermentation.roomTempF}F before topping and baking.`
    );
  }

  if (sauce) {
    instructions.push(...sauce.instructions);
  }

  if (isLoafStyleId(style.id)) {
    instructions.push(
      style.id === STYLE_IDS.SANDWICH_LOAF
        ? "Bake in the tin until the top is richly browned, then de-pan and cool fully before slicing."
        : "Score the loaf, bake with steam or under a cover for the first part of the bake, then vent and finish until deeply colored."
    );
  } else {
    instructions.push(`Bake at ${isNeapolitanFamily(style.id) && input.oven.type === "wood-fired" ? "very high heat" : "the calculated oven setting"} until the bottom is crisp and the top is properly browned.`);
  }

  return instructions;
}
