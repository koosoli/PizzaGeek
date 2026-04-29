import {
  combineBlendSegments,
  createDefaultInput,
  getSauceOption,
  getStyleById,
  normalizeBlend,
  type CalculatorInput,
  type SauceRecipeOption
} from "@pizza-geek/core";
import { getDefaultStarterInoculationPercent, getPrefermentModeFromStage } from "./preferment";

export function inferSauceStyleFromOption(option?: SauceRecipeOption): CalculatorInput["sauce"]["style"] {
  if (!option) return "classic";
  const searchable = `${option.name} ${option.description ?? ""} ${option.cookType}`.toLowerCase();

  if (
    searchable.includes("white") ||
    searchable.includes("bianca") ||
    searchable.includes("crema") ||
    searchable.includes("alfredo")
  ) {
    return "white";
  }

  if (option.cookType.toLowerCase().includes("cook") || option.cookType.toLowerCase().includes("simmer")) {
    return "cooked";
  }

  if (option.cookType.toLowerCase().includes("raw") || option.cookType.toLowerCase().includes("no-cook")) {
    return "raw";
  }

  return "classic";
}

export function normalizeCalculatorInput(candidate: CalculatorInput): CalculatorInput {
  const styleId = candidate?.styleId ?? createDefaultInput().styleId;
  const base = createDefaultInput(styleId);
  const legacyPizzaOvenTemp = (candidate as CalculatorInput & { oven?: { pizzaOvenTempF?: number } }).oven
    ?.pizzaOvenTempF;
  const legacyPreferment = {
    ...base.preferment,
    ...candidate?.preferment
  };
  const rawPreferments = candidate?.preferments?.length
    ? candidate.preferments
    : legacyPreferment.kind !== "none"
      ? [legacyPreferment]
      : [];
  const preferments = rawPreferments.map((preferment) => {
    const mergedPreferment = {
      ...base.preferment,
      ...preferment
    };
    const prefermentMode = getPrefermentModeFromStage(mergedPreferment);
    const storedStarterInoculationPercent = (preferment as Partial<typeof preferment>).starterInoculationPercent;

    return {
      ...mergedPreferment,
      starterInoculationPercent:
        typeof storedStarterInoculationPercent === "number"
          ? storedStarterInoculationPercent
          : getDefaultStarterInoculationPercent(prefermentMode),
      bigaStyle: mergedPreferment.bigaStyle === "bassinage" ? "standard" : mergedPreferment.bigaStyle
    };
  });
  const primaryPreferment = preferments[0] ?? {
    ...legacyPreferment,
    kind: "none" as const
  };
  const sauce = {
    ...base.sauce,
    ...candidate?.sauce
  };
  const normalizedSauceOption = getSauceOption(styleId, sauce.recipeId);
  const legacyBlend = candidate?.flourBlend?.length ? normalizeBlend(candidate.flourBlend) : base.flourBlend;
  const prefermentFlourBlend = candidate?.prefermentFlourBlend?.length
    ? normalizeBlend(candidate.prefermentFlourBlend)
    : legacyBlend;
  const mainDoughFlourBlend = candidate?.mainDoughFlourBlend?.length
    ? normalizeBlend(candidate.mainDoughFlourBlend)
    : legacyBlend;
  const totalPrefermentPercent = preferments.reduce((sum, preferment) => sum + preferment.flourPercent, 0);
  const flourBlend =
    totalPrefermentPercent <= 0
      ? mainDoughFlourBlend
      : combineBlendSegments([
          { blend: prefermentFlourBlend, weight: totalPrefermentPercent },
          { blend: mainDoughFlourBlend, weight: Math.max(0, 100 - totalPrefermentPercent) }
        ]);

  return {
    ...base,
    ...candidate,
    yeastType: candidate?.yeastType ?? base.yeastType,
    manualYeastPercent: candidate?.manualYeastPercent,
    fermentation: {
      ...base.fermentation,
      ...candidate?.fermentation
    },
    preferment: primaryPreferment,
    preferments,
    sauce: {
      ...sauce,
      recipeId: normalizedSauceOption?.id ?? sauce.recipeId,
      style: normalizedSauceOption ? inferSauceStyleFromOption(normalizedSauceOption) : sauce.style
    },
    flourBlend,
    prefermentFlourBlend,
    mainDoughFlourBlend,
    pan: {
      ...base.pan,
      ...candidate?.pan,
      enabled: Boolean(getStyleById(styleId)?.panStyle)
    },
    oven: {
      ...base.oven,
      ...candidate?.oven,
      pizzaOvenStoneTempF:
        candidate?.oven?.pizzaOvenStoneTempF ??
        (legacyPizzaOvenTemp ? Math.max(650, legacyPizzaOvenTemp - 75) : base.oven.pizzaOvenStoneTempF),
      pizzaOvenTopTempF: candidate?.oven?.pizzaOvenTopTempF ?? legacyPizzaOvenTemp ?? base.oven.pizzaOvenTopTempF
    }
  };
}