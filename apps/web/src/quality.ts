import type { CalculatorInput, DoughResult, RangePreset, TemperatureUnit } from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";
import { clampTo, formatTemperature } from "./appHelpers";
import type { CopyText } from "./copy";
import { isBreadStyleId } from "./productModes";

export type QualitySignal = {
  label: string;
  value: string;
  score: number;
  tone: "ok" | "notice" | "warning" | "danger";
  note: string;
};

export type DoughSetupNotice = {
  tone: "ok" | "notice" | "warning" | "danger";
  message: string;
};

export const DOUGH_PERCENT_LIMITS = {
  hydrationPercent: 100,
  saltPercent: 10,
  oilPercent: 20,
  sugarPercent: 20,
  honeyPercent: 20,
  maltPercent: 5,
  lardPercent: 20,
  milkPowderPercent: 10
} as const;

type QualityScore = Pick<QualitySignal, "score" | "tone">;

function createQualityScore(score: number): QualityScore {
  const normalizedScore = Math.round(clampTo(score, 0, 100));
  return { score: normalizedScore, tone: toneForScore(normalizedScore) };
}

function scoreAgainstRange(value: number, min: number, recommended: number, max: number): QualityScore {
  if (value < min) {
    const driftRange = Math.max(recommended - min, 1);
    const score = 60 - clampTo((min - value) / driftRange, 0, 1) * 60;
    return createQualityScore(score);
  }
  if (value > max) {
    const driftRange = Math.max(max - recommended, 1);
    const score = 60 - clampTo((value - max) / driftRange, 0, 1) * 60;
    return createQualityScore(score);
  }
  const halfRange = value <= recommended ? recommended - min : max - recommended;
  if (halfRange <= 0) return createQualityScore(100);
  const score = 100 - clampTo(Math.abs(value - recommended) / halfRange, 0, 1) * 40;
  return createQualityScore(score);
}

function scoreAgainstLimit(value: number, max: number): QualityScore {
  if (value <= max) return createQualityScore(100);
  const score = 60 - clampTo((value - max) / Math.max(max, 1), 0, 1) * 60;
  return createQualityScore(score);
}

function toneForScore(score: number): QualitySignal["tone"] {
  if (score >= 86) return "ok";
  if (score >= 68) return "notice";
  if (score >= 45) return "warning";
  return "danger";
}

export function buildQualitySignals(
  result: DoughResult,
  input: CalculatorInput,
  temperatureUnit: TemperatureUnit,
  labels: CopyText
): QualitySignal[] {
  const hydrationSignal = scoreAgainstRange(
    input.hydrationPercent,
    result.style.hydration.min,
    result.style.hydration.recommended,
    result.style.hydration.max
  );
  const saltSignal = scoreAgainstRange(
    input.saltPercent,
    result.style.salt.min,
    result.style.salt.recommended,
    result.style.salt.max
  );
  const ingredientAlertSignals = getIngredientThresholdSignals(input, result, labels);
  const fermentSignal = scoreAgainstRange(
    result.totalFermentationHours,
    result.style.fermentationHours.min,
    result.style.fermentationHours.recommended,
    result.style.fermentationHours.max
  );
  const flourScore =
    result.flourBlend.warningColor === "danger"
      ? 24
      : result.flourBlend.warningColor === "warning"
        ? 55
        : result.flourBlend.warningColor === "notice"
          ? 75
          : 94;
  const waterScore = result.waterTemperature.warning ? 55 : 94;

  return [
    {
      label: labels.hydrationFit,
      value: `${input.hydrationPercent}%`,
      score: hydrationSignal.score,
      tone: hydrationSignal.tone,
      note: `${result.style.hydration.min}-${result.style.hydration.max}%`
    },
    {
      label: labels.saltBalance,
      value: `${input.saltPercent}%`,
      score: saltSignal.score,
      tone: saltSignal.tone,
      note: `${result.style.salt.recommended}%`
    },
    ...ingredientAlertSignals,
    {
      label: labels.fermentPlan,
      value: `${result.totalFermentationHours}h`,
      score: fermentSignal.score,
      tone: fermentSignal.tone,
      note: `${result.effectiveFermentationHours}h adjusted`
    },
    {
      label: labels.flourStrength,
      value: result.flourBlend.blendedW ? `W${result.flourBlend.blendedW}` : "Off",
      score: flourScore,
      tone: toneForScore(flourScore),
      note: result.flourBlend.warning ?? result.flourBlend.description
    },
    {
      label: labels.mixTemperature,
      value: formatTemperature(result.waterTemperature.waterTempF, temperatureUnit),
      score: waterScore,
      tone: toneForScore(waterScore),
      note: result.waterTemperature.warning ?? `Targets ${formatTemperature(result.waterTemperature.targetFdtF, temperatureUnit)}`
    }
  ];
}

function getIngredientThresholdSignals(
  input: CalculatorInput,
  result: DoughResult,
  labels: Pick<CopyText, "oil" | "sugar" | "honey" | "malt" | "lard" | "milkPowder">
): QualitySignal[] {
  const checks: Array<{
    label: string;
    value: number;
    max: number;
    range?: RangePreset;
  }> = [
    { label: labels.oil, value: input.oilPercent, max: DOUGH_PERCENT_LIMITS.oilPercent, range: result.style.oil },
    { label: labels.sugar, value: input.sugarPercent, max: DOUGH_PERCENT_LIMITS.sugarPercent, range: result.style.sugar },
    { label: labels.honey, value: input.honeyPercent, max: DOUGH_PERCENT_LIMITS.honeyPercent },
    { label: labels.malt, value: input.maltPercent, max: DOUGH_PERCENT_LIMITS.maltPercent },
    { label: labels.lard, value: input.lardPercent, max: DOUGH_PERCENT_LIMITS.lardPercent },
    { label: labels.milkPowder, value: input.milkPowderPercent, max: DOUGH_PERCENT_LIMITS.milkPowderPercent }
  ];

  return checks.reduce<QualitySignal[]>((signals, check) => {
    if (check.value > check.max) {
      signals.push(buildIngredientThresholdSignal(check.label, check.value, `≤ ${check.max}%`, scoreAgainstLimit(check.value, check.max)));
      return signals;
    }

    if (check.range && (check.value < check.range.min || check.value > check.range.max)) {
      signals.push(
        buildIngredientThresholdSignal(
          check.label,
          check.value,
          `${check.range.min}-${check.range.max}%`,
          scoreAgainstRange(check.value, check.range.min, check.range.recommended, check.range.max)
        )
      );
    }

    return signals;
  }, []);
}

function buildIngredientThresholdSignal(label: string, value: number, note: string, qualityScore: QualityScore): QualitySignal {
  return {
    label,
    value: `${roundPercent(value)}%`,
    ...qualityScore,
    note
  };
}

export function getHydrationWorkabilityNotice(
  input: CalculatorInput,
  result: DoughResult,
  locale: LocaleCode
): DoughSetupNotice | null {
  const nearMax = input.hydrationPercent >= result.style.hydration.max - 0.5;
  const nearMin = input.hydrationPercent <= result.style.hydration.min + 0.5;

  if (nearMax) {
    if (result.flourBlend.warningColor === "danger" || result.flourBlend.warningColor === "warning") {
      return {
        tone: result.flourBlend.warningColor,
        message:
          locale === "de"
            ? "Diese Hydration liegt am oberen Rand des Profils fur die aktuelle Mehlstarke. Rechne mit weicherem Teig, mehr Faltintervallen oder einer staerkeren Mehlmischung."
            : "This hydration sits at the top of the profile for the current flour strength. Expect a looser dough, more folds, or a stronger flour blend."
      };
    }

    return {
      tone: "notice",
      message:
        locale === "de"
          ? "Du arbeitest am nassen Ende dieses Profils. Nutze Faltungen, nasse Haende und eine schonende Endformung."
          : "You are working at the wet end of this profile. Use folds, wet hands, and a gentle final shape."
    };
  }

  if (isBreadStyleId(result.style.id) && nearMin) {
    return {
      tone: "notice",
      message:
        locale === "de"
          ? "Diese Einstellung liegt auf der trockeneren Seite des Brotprofils. Rechne mit strafferer Formgebung und engerer Krume."
          : "This setting sits on the drier side of the bread profile. Expect easier shaping and a tighter crumb."
    };
  }

  return null;
}

function formatNegativePercentNotice(label: string, locale: LocaleCode) {
  if (locale === "de") return `${label} kann nicht negativ sein.`;
  if (locale === "it") return `${label} non può essere negativo.`;
  return `${label} cannot be negative.`;
}

function formatStyleRangeNotice(label: string, range: RangePreset, locale: LocaleCode) {
  if (locale === "de") return `${label} liegt außerhalb des Stilbereichs von ${range.min}-${range.max}%.`;
  if (locale === "it") return `${label} è fuori dall'intervallo dello stile di ${range.min}-${range.max}%.`;
  return `${label} is outside this style's ${range.min}-${range.max}% range.`;
}

function formatExtremePercentNotice(label: string, value: number, max: number, locale: LocaleCode) {
  if (locale === "de") {
    return `${label} bei ${value}% liegt weit über einem brauchbaren Bereich. Prüfe die Prozentangabe (typisch höchstens etwa ${max}%).`;
  }
  if (locale === "it") {
    return `${label} al ${value}% è ben oltre un intervallo utilizzabile. Controlla la percentuale inserita (di solito non oltre circa ${max}%).`;
  }
  return `${label} at ${value}% is far beyond a workable range. Double-check the percentage entry (usually no more than about ${max}%).`;
}

export function getIngredientPercentageNotices(
  input: CalculatorInput,
  result: DoughResult,
  labels: Pick<CopyText, "salt" | "oil" | "sugar" | "honey" | "malt" | "lard" | "milkPowder">,
  locale: LocaleCode
): DoughSetupNotice[] {
  const checks: Array<{
    label: string;
    value: number;
    max: number;
    range?: RangePreset;
  }> = [
    { label: labels.salt, value: input.saltPercent, max: DOUGH_PERCENT_LIMITS.saltPercent, range: result.style.salt },
    { label: labels.oil, value: input.oilPercent, max: DOUGH_PERCENT_LIMITS.oilPercent, range: result.style.oil },
    { label: labels.sugar, value: input.sugarPercent, max: DOUGH_PERCENT_LIMITS.sugarPercent, range: result.style.sugar },
    { label: labels.honey, value: input.honeyPercent, max: DOUGH_PERCENT_LIMITS.honeyPercent },
    { label: labels.malt, value: input.maltPercent, max: DOUGH_PERCENT_LIMITS.maltPercent },
    { label: labels.lard, value: input.lardPercent, max: DOUGH_PERCENT_LIMITS.lardPercent },
    { label: labels.milkPowder, value: input.milkPowderPercent, max: DOUGH_PERCENT_LIMITS.milkPowderPercent }
  ];

  return checks.reduce<DoughSetupNotice[]>((notices, check) => {
    if (check.value < 0) {
      notices.push({ tone: "danger", message: formatNegativePercentNotice(check.label, locale) });
      return notices;
    }

    if (check.value > check.max) {
      notices.push({
        tone: "danger",
        message: formatExtremePercentNotice(check.label, roundPercent(check.value), check.max, locale)
      });
      return notices;
    }

    if (check.range && (check.value < check.range.min || check.value > check.range.max)) {
      notices.push({ tone: "warning", message: formatStyleRangeNotice(check.label, check.range, locale) });
      return notices;
    }

    return notices;
  }, []);
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}
