import type { SizeUnit, TemperatureUnit } from "@pizza-geek/core";
import { getProductModeForStyleId, type ProductMode } from "./productModes";

export type LocaleCode = "en" | "de";
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
  de: { temperatureUnit: "C", sizeUnit: "cm", currency: "EUR" }
} as const;

export function getLocaleDefaults(locale: LocaleCode) {
  return LOCALE_DEFAULTS[locale];
}

export function resolveAppSettings(
  storedSettings: Partial<AppSettings> | undefined,
  currentStyleId: string
): AppSettings {
  const language = storedSettings?.language === "de" ? "de" : DEFAULT_SETTINGS.language;
  const localeDefaults = getLocaleDefaults(language);

  return {
    language,
    mode: DEFAULT_SETTINGS.mode,
    temperatureUnit: localeDefaults.temperatureUnit,
    sizeUnit: localeDefaults.sizeUnit,
    theme: DEFAULT_SETTINGS.theme,
    ...storedSettings,
    productMode: getProductModeForStyleId(currentStyleId)
  };
}
