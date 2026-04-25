import { getDefaultSauceOptionId } from "../data/sauces";
import { HIDE_OIL_SUGAR_STYLES, PIZZA_STYLES, STYLE_IDS, getStyleById } from "../data/styles";
import { bestDefaultFlourId } from "./flour";
import type {
  CalculatorInput,
  FermentationSchedule,
  OvenOptions,
  PanOptions,
  PrefermentOptions,
  SauceOptions
} from "./types";

export const FERMENTATION_PRESETS = {
  authentic: {
    label: "Authentic",
    roomTempHours: 2,
    cellarTempHours: 0,
    coldBulkHours: 0,
    coldBallHours: 0,
    finalRiseHours: 20,
    description: "Classic room-temperature fermentation, about 22h total."
  },
  rapid: {
    label: "Rapid",
    roomTempHours: 1,
    cellarTempHours: 0,
    coldBulkHours: 0,
    coldBallHours: 0,
    finalRiseHours: 1,
    description: "Emergency 2h dough with higher yeast pressure."
  },
  express: {
    label: "Express",
    roomTempHours: 2,
    cellarTempHours: 0,
    coldBulkHours: 0,
    coldBallHours: 0,
    finalRiseHours: 2,
    description: "Same-day dough in about 4h."
  },
  sameDay: {
    label: "Same Day",
    roomTempHours: 2,
    cellarTempHours: 0,
    coldBulkHours: 0,
    coldBallHours: 0,
    finalRiseHours: 6,
    description: "Mix in the morning, bake for dinner."
  },
  overnight: {
    label: "Overnight",
    roomTempHours: 2,
    cellarTempHours: 0,
    coldBulkHours: 0,
    coldBallHours: 14,
    finalRiseHours: 3,
    description: "Evening mix for next-day pizza."
  },
  twoDay: {
    label: "2-Day",
    roomTempHours: 2,
    cellarTempHours: 0,
    coldBulkHours: 0,
    coldBallHours: 48,
    finalRiseHours: 4,
    description: "Deep flavor from a 48h cold proof."
  },
  threeDay: {
    label: "3-Day",
    roomTempHours: 2,
    cellarTempHours: 0,
    coldBulkHours: 0,
    coldBallHours: 72,
    finalRiseHours: 5,
    description: "Maximum cold-ferment flavor."
  },
  cellar: {
    label: "Cellar",
    roomTempHours: 2,
    cellarTempHours: 48,
    coldBulkHours: 0,
    coldBallHours: 0,
    finalRiseHours: 3,
    description: "Traditional cool-room fermentation."
  }
} satisfies Record<string, Omit<FermentationSchedule, "roomTempF" | "cellarTempF" | "fridgeTempF"> & { label: string; description: string }>;

export type FermentationPresetKey = keyof typeof FERMENTATION_PRESETS;

export function scheduleFromPreset(
  preset: FermentationPresetKey,
  roomTempF = 72,
  cellarTempF = 55,
  fridgeTempF = 39
): FermentationSchedule {
  const selected = FERMENTATION_PRESETS[preset];
  return {
    roomTempHours: selected.roomTempHours,
    cellarTempHours: selected.cellarTempHours,
    coldBulkHours: selected.coldBulkHours,
    coldBallHours: selected.coldBallHours,
    finalRiseHours: selected.finalRiseHours,
    roomTempF,
    cellarTempF,
    fridgeTempF
  };
}

export function choosePresetForStyle(styleId: string): FermentationPresetKey {
  const style = getStyleById(styleId) ?? PIZZA_STYLES[0];
  if (style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN) return "overnight";
  if (style.coldFermentRecommended) {
    if (style.fermentationHours.recommended >= 70) return "threeDay";
    if (style.fermentationHours.recommended >= 48) return "twoDay";
    return "overnight";
  }
  if (style.fermentationHours.recommended >= 16) return "authentic";
  if (style.fermentationHours.recommended >= 6) return "sameDay";
  return "express";
}

export function defaultPreferment(): PrefermentOptions {
  return {
    kind: "none",
    flourPercent: 30,
    bigaHydration: 55,
    bigaStyle: "standard",
    roomHours: 12,
    coldHours: 0
  };
}

export function defaultPanOptions(): PanOptions {
  return {
    enabled: false,
    shape: "rectangular",
    length: 10,
    width: 14,
    diameter: 12,
    depth: 2,
    unit: "in"
  };
}

export function defaultOvenOptions(type = "steel-stone"): OvenOptions {
  return {
    type: type as OvenOptions["type"],
    pizzaOvenStoneTempF: 775,
    pizzaOvenTopTempF: 900,
    deckOvenTempF: 550,
    useBroilerMethod: false,
    useFinishingBroil: false
  };
}

export function defaultSauceOptions(styleId = PIZZA_STYLES[0].id): SauceOptions {
  const style = getStyleById(styleId) ?? PIZZA_STYLES[0];

  if (style.id === STYLE_IDS.FLAMMKUCHEN || style.id === STYLE_IDS.FOCACCIA || style.id === STYLE_IDS.COCA) {
    return {
      enabled: false,
      style: "classic",
      recipeId: getDefaultSauceOptionId(style.id),
      gramsPerPizza: 0
    };
  }

  if (style.id === STYLE_IDS.CHICAGO_DEEP_DISH) {
    return {
      enabled: true,
      style: "cooked",
      recipeId: getDefaultSauceOptionId(style.id),
      gramsPerPizza: 180
    };
  }

  if (style.panStyle) {
    return {
      enabled: true,
      style: "classic",
      recipeId: getDefaultSauceOptionId(style.id),
      gramsPerPizza: 130
    };
  }

  if (
    style.id === STYLE_IDS.NEAPOLITAN ||
    style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN ||
    style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN
  ) {
    return {
      enabled: true,
      style: "raw",
      recipeId: getDefaultSauceOptionId(style.id),
      gramsPerPizza: 85
    };
  }

  if (style.id === STYLE_IDS.NEW_YORK || style.id === STYLE_IDS.NEW_HAVEN) {
    return {
      enabled: true,
      style: "classic",
      recipeId: getDefaultSauceOptionId(style.id),
      gramsPerPizza: 95
    };
  }

  return {
    enabled: true,
    style: "classic",
    recipeId: getDefaultSauceOptionId(style.id),
    gramsPerPizza: 90
  };
}

export function createDefaultInput(styleId = PIZZA_STYLES[0].id): CalculatorInput {
  const style = getStyleById(styleId) ?? PIZZA_STYLES[0];
  const preset = choosePresetForStyle(style.id);
  const hideEnrichments = HIDE_OIL_SUGAR_STYLES.has(style.name);
  const baseInput: CalculatorInput = {
    styleId: style.id,
    doughBalls: style.defaultBallCount,
    ballWeight: style.defaultBallWeight,
    hydrationPercent: style.hydration.recommended,
    saltPercent: style.salt.recommended,
    oilPercent: hideEnrichments ? 0 : style.oil.recommended,
    sugarPercent: hideEnrichments ? 0 : style.sugar.recommended,
    honeyPercent: 0,
    maltPercent: 0,
    lardPercent: style.name === "Chicago Deep Dish" ? 3 : 0,
    milkPowderPercent: 0,
    yeastType: "idy",
    mixerType: "planetary",
    fermentation: scheduleFromPreset(preset),
    preferment: defaultPreferment(),
    flourBlendEnabled: true,
    flourBlend: [{ flourId: bestDefaultFlourId(style.flourType), percentage: 100 }],
    pan: { ...defaultPanOptions(), enabled: Boolean(style.panStyle) },
    oven: defaultOvenOptions(style.defaultOven),
    sauce: defaultSauceOptions(style.id)
  };

  if (style.id === STYLE_IDS.CONTEMPORARY_NEAPOLITAN_DOUBLE_PREFERMENT_WHOLE_GRAIN) {
    return {
      ...baseInput,
      hydrationPercent: 75,
      saltPercent: 3,
      oilPercent: 0,
      sugarPercent: 0,
      doughBalls: 7,
      ballWeight: 255,
      yeastType: "fresh",
      manualYeastPercent: 0.9,
      fermentation: {
        roomTempHours: 0,
        cellarTempHours: 0,
        coldBulkHours: 0,
        coldBallHours: 14,
        finalRiseHours: 1,
        roomTempF: 72,
        cellarTempF: 55,
        fridgeTempF: 39
      },
      flourBlendEnabled: true,
      flourBlend: [
        { flourId: "caputo-nuvola", percentage: 90 },
        { flourId: "whole-wheat", percentage: 10 }
      ],
      oven: {
        ...defaultOvenOptions(style.defaultOven),
        pizzaOvenStoneTempF: 800,
        pizzaOvenTopTempF: 900
      }
    };
  }

  return baseInput;
}
