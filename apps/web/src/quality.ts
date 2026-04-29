import type { CalculatorInput, DoughResult, TemperatureUnit } from "@pizza-geek/core";
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

function scoreAgainstRange(value: number, min: number, recommended: number, max: number) {
  if (value < min || value > max) return 34;
  const halfRange = value <= recommended ? recommended - min : max - recommended;
  if (halfRange <= 0) return 100;
  return Math.round(100 - clampTo(Math.abs(value - recommended) / halfRange, 0, 1) * 22);
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
  const hydrationScore = scoreAgainstRange(
    input.hydrationPercent,
    result.style.hydration.min,
    result.style.hydration.recommended,
    result.style.hydration.max
  );
  const saltScore = scoreAgainstRange(
    input.saltPercent,
    result.style.salt.min,
    result.style.salt.recommended,
    result.style.salt.max
  );
  const fermentDelta = Math.abs(result.totalFermentationHours - result.style.fermentationHours.recommended);
  const fermentScore =
    result.totalFermentationHours < result.style.fermentationHours.min ||
    result.totalFermentationHours > result.style.fermentationHours.max
      ? 50
      : Math.round(
          100 -
            clampTo(
              fermentDelta / Math.max(1, result.style.fermentationHours.max - result.style.fermentationHours.min),
              0,
              1
            ) *
              26
        );
  const flourScore =
    result.flourBlend.warningColor === "danger"
      ? 35
      : result.flourBlend.warningColor === "warning"
        ? 55
        : result.flourBlend.warningColor === "notice"
          ? 75
          : 94;
  const waterScore = result.waterTemperature.warning ? 64 : 94;

  return [
    {
      label: labels.hydrationFit,
      value: `${input.hydrationPercent}%`,
      score: hydrationScore,
      tone: toneForScore(hydrationScore),
      note: `${result.style.hydration.min}-${result.style.hydration.max}%`
    },
    {
      label: labels.saltBalance,
      value: `${input.saltPercent}%`,
      score: saltScore,
      tone: toneForScore(saltScore),
      note: `${result.style.salt.recommended}%`
    },
    {
      label: labels.fermentPlan,
      value: `${result.totalFermentationHours}h`,
      score: fermentScore,
      tone: toneForScore(fermentScore),
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

export function getHydrationWorkabilityNotice(
  input: CalculatorInput,
  result: DoughResult,
  locale: LocaleCode
): { tone: "notice" | "warning" | "danger"; message: string } | null {
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