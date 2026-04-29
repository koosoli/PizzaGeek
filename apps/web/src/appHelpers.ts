import {
  FERMENTATION_PRESETS,
  fahrenheitToCelsius,
  getStyleById,
  type CalculatorInput,
  type DoughResult,
  type FermentationPresetKey,
  type OvenType,
  type PizzaStyle,
  type SizeUnit,
  type TemperatureUnit,
  type YeastType
} from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";
import { type CopyText } from "./copy";
import { getIntlLocale } from "./locale";
import { isBreadStyleId, isLoafStyleId } from "./productModes";

export function getDefaultRecipeName(styleId: string, locale: LocaleCode) {
  const styleName = getStyleById(styleId)?.name ?? "Pizza";
  if (locale === "de") return `${styleName} Teig`;
  if (locale === "it") return `${styleName} impasto`;
  return `${styleName} dough`;
}

export function isAutoRecipeName(name: string, styleId: string) {
  const trimmed = name.trim();
  const styleName = getStyleById(styleId)?.name ?? "Pizza";
  return new Set(["House dough", styleName, `${styleName} dough`, `${styleName} Teig`]).has(trimmed);
}

export function getRecipeDisplayName(recipeName: string, styleId: string, locale: LocaleCode) {
  return recipeName.trim() || getDefaultRecipeName(styleId, locale);
}

export function getPortableDataImportMessage(locale: LocaleCode, recipeCount: number, journalCount: number) {
  if (locale === "de") {
    return `Backup importiert: ${recipeCount} Rezepte, ${journalCount} Backnotizen.`;
  }

  if (locale === "it") {
    return `Backup importato: ${recipeCount} ricette, ${journalCount} note di cottura.`;
  }

  return `Imported backup: ${recipeCount} recipes, ${journalCount} journal entries.`;
}

export function getYeastOptionLabel(type: YeastType, locale: LocaleCode): string {
  if (type === "none") {
    if (locale === "de") return "Keine zusätzliche Hefe";
    if (locale === "it") return "Nessun lievito aggiuntivo";
    return "No commercial yeast";
  }

  if (type === "ady") {
    if (locale === "de") return "ADY (Aktive Trockenhefe)";
    if (locale === "it") return "ADY (Lievito secco attivo)";
    return "ADY (Active Dry Yeast)";
  }

  if (type === "fresh") {
    if (locale === "de") return "Frischhefe";
    if (locale === "it") return "Lievito fresco";
    return "Fresh yeast";
  }

  if (locale === "de") return "IDY (Instant-Trockenhefe)";
  if (locale === "it") return "IDY (Lievito secco istantaneo)";
  return "IDY (Instant Dry Yeast)";
}

export function getYeastOptions(locale: LocaleCode): Array<{ value: YeastType; label: string }> {
  return [
    { value: "none", label: getYeastOptionLabel("none", locale) },
    { value: "idy", label: getYeastOptionLabel("idy", locale) },
    { value: "ady", label: getYeastOptionLabel("ady", locale) },
    { value: "fresh", label: getYeastOptionLabel("fresh", locale) }
  ];
}

export const ovenOptions: Array<{ value: OvenType; label: string }> = [
  { value: "wood-fired", label: "Wood" },
  { value: "coal-fired", label: "Coal" },
  { value: "pizza-oven", label: "Pizza oven" },
  { value: "deck-oven", label: "Deck" },
  { value: "steel-stone", label: "Steel" },
  { value: "conventional", label: "Home" }
];

export const presetKeys = Object.keys(FERMENTATION_PRESETS) as FermentationPresetKey[];

const sizePresets: Record<string, Record<number, number>> = {
  default: { 10: 180, 12: 250, 14: 320, 16: 400, 18: 500 },
  Neapolitan: { 10: 220, 12: 250, 14: 300, 16: 420, 18: 550 },
  "Contemporary Neapolitan": { 10: 240, 12: 270, 14: 340, 16: 450, 18: 580 },
  "Contemporary Neapolitan - Double Preferment Whole Grain": { 10: 230, 12: 255, 14: 330, 16: 440, 18: 570 },
  "New Haven": { 10: 220, 12: 260, 14: 320, 16: 420, 18: 550 },
  "Pizza alla Pala": { 10: 280, 12: 350, 14: 450, 16: 550, 18: 700 },
  "New York": { 10: 240, 12: 300, 14: 360, 16: 460, 18: 580 },
  California: { 10: 220, 12: 260, 14: 320, 16: 420, 18: 520 },
  Montreal: { 10: 250, 12: 300, 14: 360, 16: 440, 18: 560 },
  Coca: { 10: 170, 12: 220, 14: 280, 16: 360, 18: 460 },
  Flammkuchen: { 10: 160, 12: 200, 14: 250, 16: 320, 18: 400 },
  Lahmacun: { 10: 120, 12: 150, 14: 180, 16: 220, 18: 260 }
};

export function getBatchLabels(styleId: string, labels: CopyText) {
  if (isLoafStyleId(styleId)) {
    return {
      count: labels.loaves,
      weight: labels.loafWeight,
      perUnit: labels.perLoaf
    };
  }

  if (isBreadStyleId(styleId)) {
    return {
      count: labels.pieces,
      weight: labels.pieceWeight,
      perUnit: labels.perPiece
    };
  }

  return {
    count: labels.doughBalls,
    weight: labels.ballWeight,
    perUnit: labels.perDough
  };
}

export function getBatchDescriptor(input: CalculatorInput, style: PizzaStyle, locale: LocaleCode): string {
  if (isLoafStyleId(style.id)) {
    if (locale === "de") {
      return `${input.doughBalls} Laib${input.doughBalls === 1 ? "" : "e"} mit ${input.ballWeight}g`;
    }

    if (locale === "it") {
      return `${input.doughBalls} pagnotta${input.doughBalls === 1 ? "" : "e"} da ${input.ballWeight}g`;
    }

    return `${input.doughBalls} loaf${input.doughBalls === 1 ? "" : "s"} at ${input.ballWeight}g`;
  }

  if (isBreadStyleId(style.id)) {
    if (locale === "de") {
      return `${input.doughBalls} Stück${input.doughBalls === 1 ? "" : "e"} mit ${input.ballWeight}g`;
    }

    if (locale === "it") {
      return `${input.doughBalls} pezzo${input.doughBalls === 1 ? "" : "i"} da ${input.ballWeight}g`;
    }

    return `${input.doughBalls} piece${input.doughBalls === 1 ? "" : "s"} at ${input.ballWeight}g`;
  }

  return `${input.doughBalls} x ${input.ballWeight}g`;
}

export function numberValue(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

export function toLocalDateTimeInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function displayTemperatureValue(tempF: number, unit: TemperatureUnit): number {
  return unit === "F" ? Math.round(tempF) : fahrenheitToCelsius(tempF);
}

export function parseTemperatureInput(value: string, unit: TemperatureUnit, fallbackF: number): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallbackF;
  return unit === "F" ? parsed : celsiusToFahrenheit(parsed);
}

export function formatTemperature(tempF: number, unit: TemperatureUnit): string {
  const value = displayTemperatureValue(tempF, unit);
  return `${value}\u00B0${unit}`;
}

export function formatMoney(value: number, currency: string, locale: LocaleCode) {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency
  }).format(value);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function roundDateUp(date: Date, incrementMinutes = 30): Date {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  const currentMinutes = rounded.getMinutes();
  const nextMinutes = Math.ceil(currentMinutes / incrementMinutes) * incrementMinutes;
  if (nextMinutes >= 60) {
    rounded.setHours(rounded.getHours() + 1, 0, 0, 0);
    return rounded;
  }
  rounded.setMinutes(nextMinutes, 0, 0);
  return rounded;
}

export function getPresetDurationHours(preset: FermentationPresetKey): number {
  const selected = FERMENTATION_PRESETS[preset];
  return (
    selected.roomTempHours +
    selected.cellarTempHours +
    selected.coldBulkHours +
    selected.coldBallHours +
    selected.finalRiseHours
  );
}

export function clampTo(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createMobileSlider(min: number, max: number, step = 1) {
  return { min, max, step, mobileOnly: true };
}

export function createStyleSlider(min: number, max: number, padding: number, floor: number, ceiling: number, step = 0.1) {
  const decimals = step < 1 ? 1 : 0;
  return createMobileSlider(
    Number(clampTo(min - padding, floor, ceiling).toFixed(decimals)),
    Number(clampTo(max + padding, floor, ceiling).toFixed(decimals)),
    step
  );
}

export function createTemperatureSlider(minF: number, maxF: number, unit: TemperatureUnit, step = 1) {
  return createMobileSlider(displayTemperatureValue(minF, unit), displayTemperatureValue(maxF, unit), step);
}

export function getCountSlider(styleId: string) {
  if (isLoafStyleId(styleId)) return createMobileSlider(1, 8, 1);
  if (isBreadStyleId(styleId)) return createMobileSlider(1, 10, 1);
  return createMobileSlider(1, 12, 1);
}

export function getWeightSlider(styleId: string) {
  if (isLoafStyleId(styleId)) return createMobileSlider(300, 1200, 10);
  if (isBreadStyleId(styleId)) return createMobileSlider(150, 900, 10);
  return createMobileSlider(160, 550, 5);
}

export function getSizePresetForStyle(styleName: string) {
  return sizePresets[styleName] ?? sizePresets.default;
}

export function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatSizePresetLabel(sizeInches: number, unit: SizeUnit): string {
  if (unit === "in") {
    return `${sizeInches}"`;
  }

  return `${Math.round(sizeInches * 2.54)} cm`;
}

export function formatArea(areaSqIn: number, unit: SizeUnit): string {
  if (unit === "in") {
    return `${roundTo(areaSqIn, 1)} sq in`;
  }

  return `${roundTo(areaSqIn * 6.4516, 1)} sq cm`;
}

export function getLengthSuffix(unit: SizeUnit): string {
  return unit === "in" ? '"' : "cm";
}

export function styleRange(result: DoughResult, field: "hydration" | "salt" | "oil" | "sugar", value: number): "ok" | "danger" {
  const range = result.style[field];
  if (value < range.min || value > range.max) return "danger";
  return "ok";
}