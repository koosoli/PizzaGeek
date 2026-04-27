import type { SizeUnit, TemperatureUnit } from "@pizza-geek/core";
import { getProductModeForStyleId, type ProductMode } from "./productModes";

export type LocaleCode = "en" | "de" | "it";
export type ThemeMode = "dark" | "light";
export type WorkspaceMode = "guided" | "studio";

export type AppSettings = {
  language: LocaleCode;
  productMode: ProductMode;
  mode: WorkspaceMode;
  temperatureUnit: TemperatureUnit;
  sizeUnit: SizeUnit;
  theme: ThemeMode;
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  productMode: "pizza",
  mode: "guided",
  temperatureUnit: "F",
  sizeUnit: "in",
  theme: "dark"
};

const LOCALE_DEFAULTS = {
  en: { temperatureUnit: "F", sizeUnit: "in", currency: "USD" },
  de: { temperatureUnit: "C", sizeUnit: "cm", currency: "EUR" },
  it: { temperatureUnit: "C", sizeUnit: "cm", currency: "EUR" }
} as const;

function isLocaleCode(value: unknown): value is LocaleCode {
  return value === "en" || value === "de" || value === "it";
}

export function getLocaleDefaults(locale: LocaleCode) {
  return LOCALE_DEFAULTS[locale];
}

export function resolveAppSettings(
  storedSettings: Partial<AppSettings> | undefined,
  currentStyleId: string
): AppSettings {
  const language = isLocaleCode(storedSettings?.language) ? storedSettings.language : DEFAULT_SETTINGS.language;
  const localeDefaults = getLocaleDefaults(language);

  return {
    mode: DEFAULT_SETTINGS.mode,
    theme: DEFAULT_SETTINGS.theme,
    ...storedSettings,
    language,
    temperatureUnit: storedSettings?.temperatureUnit ?? localeDefaults.temperatureUnit,
    sizeUnit: storedSettings?.sizeUnit ?? localeDefaults.sizeUnit,
    productMode: getProductModeForStyleId(currentStyleId)
  };
}
