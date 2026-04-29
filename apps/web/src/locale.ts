import type { LocaleCode } from "./appConfig";

type LanguageLabels = {
  english: string;
  german: string;
  italian: string;
};

export function getIntlLocale(locale: LocaleCode): string {
  if (locale === "de") return "de-DE";
  if (locale === "it") return "it-IT";
  return "en-US";
}

export function getBakeDurationUnit(unit: "seconds" | "minutes", locale: LocaleCode): string {
  if (locale === "de") return unit === "seconds" ? "Sek." : "Min.";
  if (locale === "it") return unit === "seconds" ? "sec." : "min.";
  return unit;
}

export function getLanguageLabel(locale: LocaleCode, labels: LanguageLabels): string {
  if (locale === "de") return labels.german;
  if (locale === "it") return labels.italian;
  return labels.english;
}

export function getPerPizzaLabel(locale: LocaleCode): string {
  return locale === "de" ? "Pizza" : "pizza";
}

export function formatDateTime(value: string, locale: LocaleCode): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}