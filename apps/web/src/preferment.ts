import type { PrefermentOptions } from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";

export type PrefermentMode = "none" | "poolish" | "biga" | "tiga" | "lievito-madre" | "sauerdough";
export type NaturalStarterChoice = "none" | "lievito-madre" | "sauerdough";

export function getPrefermentModeFromStage(preferment: PrefermentOptions): PrefermentMode {
  if (preferment.kind === "none") return "none";
  if (preferment.kind === "poolish") return "poolish";
  if (preferment.bigaStyle === "tiga") return "tiga";
  if (preferment.bigaStyle === "lievito-madre") return "lievito-madre";
  if (preferment.bigaStyle === "sauerdough") return "sauerdough";
  return "biga";
}

export function getDefaultStarterInoculationPercent(mode: PrefermentMode): number {
  if (mode === "lievito-madre") return 50;
  if (mode === "sauerdough") return 20;
  return 20;
}

export function isNaturalStarterPreferment(preferment: PrefermentOptions): boolean {
  return preferment.kind === "biga" && (preferment.bigaStyle === "lievito-madre" || preferment.bigaStyle === "sauerdough");
}

export function getPrefermentLeaveningName(preferment: PrefermentOptions, locale: LocaleCode): string {
  if (!isNaturalStarterPreferment(preferment)) {
    if (locale === "de") return "Hefe";
    if (locale === "it") return "lievito";
    return "yeast";
  }

  if (preferment.bigaStyle === "lievito-madre") {
    if (locale === "de") return "Lievito-madre-Anstellgut";
    if (locale === "it") return "lievito madre";
    return "lievito madre starter";
  }

  if (locale === "de") return "Sauerteig-Anstellgut";
  if (locale === "it") return "lievito naturale";
  return "sourdough starter";
}

export function getNaturalStarterUiHint(locale: LocaleCode): string {
  if (locale === "de") {
    return "Lievito madre und Sauerteig belegen hier den Vorteig. Ohne manuelle Hefe bleibt der Hauptteig hefefrei; mit einem manuellen Prozentwert kannst du Hybridteige rechnen.";
  }

  if (locale === "it") {
    return "Lievito madre e lievito naturale occupano qui il prefermento. Se il lievito manuale resta vuoto l'impasto finale non usa lievito commerciale; con una percentuale manuale puoi fare impasti ibridi.";
  }

  return "Lievito madre and sourdough live in the preferment slot here. Leave manual yeast blank for starter-only doughs, or add a manual yeast % if you want a hybrid dough.";
}

export function getNaturalStarterChoice(preferment: PrefermentOptions): NaturalStarterChoice {
  if (preferment.kind === "biga" && preferment.bigaStyle === "lievito-madre") return "lievito-madre";
  if (preferment.kind === "biga" && preferment.bigaStyle === "sauerdough") return "sauerdough";
  return "none";
}

export function getPrefermentPatch(mode: PrefermentMode): Partial<PrefermentOptions> {
  if (mode === "none") return { kind: "none" };
  if (mode === "poolish") return { kind: "poolish", bigaStyle: "standard", bigaHydration: 100, starterInoculationPercent: 20 };
  if (mode === "tiga") return { kind: "biga", bigaStyle: "tiga", bigaHydration: 55, starterInoculationPercent: 20 };
  if (mode === "lievito-madre") return { kind: "biga", bigaStyle: "lievito-madre", bigaHydration: 50, starterInoculationPercent: 50 };
  if (mode === "sauerdough") return { kind: "biga", bigaStyle: "sauerdough", bigaHydration: 100, starterInoculationPercent: 20 };
  return { kind: "biga", bigaStyle: "standard", bigaHydration: 55, starterInoculationPercent: 20 };
}

export function getPrefermentDisplayName(preferment: PrefermentOptions, locale: LocaleCode): string {
  if (preferment.kind === "poolish") return "Poolish";
  if (preferment.bigaStyle === "tiga") return "Tiga";
  if (preferment.bigaStyle === "lievito-madre") return "Lievito madre";
  if (preferment.bigaStyle === "sauerdough") {
    if (locale === "de") return "Sauerteig";
    if (locale === "it") return "Lievito naturale";
    return "Sourdough";
  }
  return "Biga";
}