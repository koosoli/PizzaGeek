import { FERMENTATION_PRESETS, type BakeStep, type FermentationPresetKey } from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";
import { formatDateTime, getIntlLocale } from "./locale";

export type PlannerTimelineStatus = "past" | "current" | "next" | "future";
export type PlannerStepProgressState = "done" | "skipped";
export type PlannerStepProgress = {
  state: PlannerStepProgressState;
  updatedAt: string;
};

type PlannerLabels = {
  quickSchedule: string;
  rapidTarget: string;
  todayTarget: string;
  overnightTarget: string;
  twoDayTarget: string;
  threeDayTarget: string;
  breadExpressTarget: string;
  breadTodayTarget: string;
  breadOvernightTarget: string;
  breadTwoDayTarget: string;
  breadThreeDayTarget: string;
};

export const plannerShortcutPresets: FermentationPresetKey[] = ["rapid", "sameDay", "overnight", "twoDay", "threeDay"];
export const breadPlannerShortcutPresets: FermentationPresetKey[] = ["express", "sameDay", "overnight", "twoDay", "threeDay"];

export function getPresetLabel(key: FermentationPresetKey, locale: LocaleCode): string {
  if (locale === "en") return FERMENTATION_PRESETS[key].label;

  if (locale === "de") {
    const labels: Record<FermentationPresetKey, string> = {
      authentic: "Authentisch",
      rapid: "Schnell",
      express: "Express",
      sameDay: "Gleicher Tag",
      overnight: "Über Nacht",
      twoDay: "2 Tage",
      threeDay: "3 Tage",
      cellar: "Keller"
    };

    return labels[key];
  }

  const labels: Record<FermentationPresetKey, string> = {
    authentic: "Autentico",
    rapid: "Rapido",
    express: "Express",
    sameDay: "Stesso giorno",
    overnight: "Notte",
    twoDay: "2 giorni",
    threeDay: "3 giorni",
    cellar: "Cantina"
  };

  return labels[key];
}

export function getPlannerPanelLabels(locale: LocaleCode) {
  if (locale === "de") {
    return {
      currentStageLabel: "Aktuelle Phase",
      nextStageLabel: "Nächste Phase",
      noCurrentStageLabel: "Noch nicht gestartet",
      noNextStageLabel: "Kein späterer Schritt",
      noteAddLabel: "Bäcker-Notiz hinzufügen",
      noteHideLabel: "Schließen",
      noteLabel: "Bäcker-Notiz",
      notePlaceholder: "Merke dir hier Erinnerung, Beobachtung oder Übergabe für diesen Schritt.",
      noteShowLabel: "Öffnen",
      prefermentWindowLabel: "Vorteig-Fenster",
      processHint: "Zeigt den aktuellen Teigablauf, Wartephasen und den nächsten Handgriff.",
      processLabel: "Prozess-Timeline",
      clearStepStateLabel: "Zurücksetzen",
      markDoneLabel: "Erledigt",
      skipStepLabel: "Überspringen"
    };
  }

  if (locale === "it") {
    return {
      currentStageLabel: "Fase attuale",
      nextStageLabel: "Fase successiva",
      noCurrentStageLabel: "Non ancora iniziato",
      noNextStageLabel: "Nessun passaggio successivo",
      noteAddLabel: "Aggiungi nota",
      noteHideLabel: "Chiudi",
      noteLabel: "Nota del fornaio",
      notePlaceholder: "Aggiungi promemoria, osservazione o consegna per questo passaggio.",
      noteShowLabel: "Apri",
      prefermentWindowLabel: "Finestra prefermento",
      processHint: "Mostra il flusso reale dell'impasto, le attese e il prossimo passaggio operativo.",
      processLabel: "Timeline processo",
      clearStepStateLabel: "Azzera",
      markDoneLabel: "Fatto",
      skipStepLabel: "Salta"
    };
  }

  return {
    currentStageLabel: "Current stage",
    nextStageLabel: "Next stage",
    noCurrentStageLabel: "Not started yet",
    noNextStageLabel: "No later step",
    noteAddLabel: "Add baker note",
    noteHideLabel: "Hide",
    noteLabel: "Baker note",
    notePlaceholder: "Add a reminder, observation, or handoff for this step.",
    noteShowLabel: "Show",
    prefermentWindowLabel: "Preferment window",
    processHint: "See the live dough flow, waiting stages, and the next hands-on checkpoint.",
    processLabel: "Process timeline",
    clearStepStateLabel: "Clear",
    markDoneLabel: "Done",
    skipStepLabel: "Skip"
  };
}

export function formatPlannerTarget(value: Date, locale: LocaleCode): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

export function formatPlannerDuration(minutes: number, locale: LocaleCode): string {
  if (minutes <= 0) {
    if (locale === "de") return "Sofort";
    if (locale === "it") return "Subito";
    return "Immediate";
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  if (locale === "de") {
    if (hours > 0 && remainderMinutes > 0) return `${hours} Std. ${remainderMinutes} Min.`;
    if (hours > 0) return `${hours} Std.`;
    return `${remainderMinutes} Min.`;
  }

  if (locale === "it") {
    if (hours > 0 && remainderMinutes > 0) return `${hours}h ${remainderMinutes} min`;
    if (hours > 0) return `${hours}h`;
    return `${remainderMinutes} min`;
  }

  if (hours > 0 && remainderMinutes > 0) return `${hours}h ${remainderMinutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${remainderMinutes} min`;
}

export function getPlannerKindLabel(type: BakeStep["type"], locale: LocaleCode): string {
  if (type === "ready") {
    if (locale === "de") return "Bereit";
    if (locale === "it") return "Pronto";
    return "Ready";
  }

  if (type === "action") {
    if (locale === "de") return "Aktion";
    if (locale === "it") return "Azione";
    return "Hands-on";
  }

  if (locale === "de") return "Reifezeit";
  if (locale === "it") return "Attesa";
  return "Timed";
}

export function getPlannerStatusLabel(status: PlannerTimelineStatus, locale: LocaleCode): string {
  if (status === "past") {
    if (locale === "de") return "Erledigt";
    if (locale === "it") return "Completato";
    return "Done";
  }

  if (status === "current") {
    if (locale === "de") return "Jetzt";
    if (locale === "it") return "Ora";
    return "Now";
  }

  if (status === "next") {
    if (locale === "de") return "Als Nächstes";
    if (locale === "it") return "Prossimo";
    return "Up next";
  }

  if (locale === "de") return "Später";
  if (locale === "it") return "Dopo";
  return "Later";
}

export function formatPlannerEndLabel(value: Date, locale: LocaleCode): string {
  const formatted = formatDateTime(value.toISOString(), locale);
  if (locale === "de") return `Ende ${formatted}`;
  if (locale === "it") return `Fine ${formatted}`;
  return `Ends ${formatted}`;
}

export function formatPlannerRange(start: Date, end: Date, locale: LocaleCode): string {
  return `${formatDateTime(start.toISOString(), locale)} - ${formatDateTime(end.toISOString(), locale)}`;
}

export function getPlannerProgressLabel(progress: PlannerStepProgressState, locale: LocaleCode): string {
  if (progress === "done") {
    if (locale === "de") return "Abgehakt";
    if (locale === "it") return "Completato";
    return "Checked off";
  }

  if (locale === "de") return "Übersprungen";
  if (locale === "it") return "Saltato";
  return "Skipped";
}

export function getPlannerShortcutLabel(key: FermentationPresetKey, labels: PlannerLabels, breadMode: boolean): string {
  if (breadMode) {
    switch (key) {
      case "express":
        return labels.breadExpressTarget;
      case "sameDay":
        return labels.breadTodayTarget;
      case "overnight":
        return labels.breadOvernightTarget;
      case "twoDay":
        return labels.breadTwoDayTarget;
      case "threeDay":
        return labels.breadThreeDayTarget;
      default:
        return labels.quickSchedule;
    }
  }

  switch (key) {
    case "express":
      return labels.quickSchedule;
    case "rapid":
      return labels.rapidTarget;
    case "sameDay":
      return labels.todayTarget;
    case "overnight":
      return labels.overnightTarget;
    case "twoDay":
      return labels.twoDayTarget;
    case "threeDay":
      return labels.threeDayTarget;
    default:
      return labels.quickSchedule;
  }
}