import { isLoafStyleId, isTinLoafStyleId } from "../data/styles";
import type { BakeStep, CalculatorInput, PrefermentOptions, ScheduleMode } from "./types";

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function getActivePreferments(input: CalculatorInput): PrefermentOptions[] {
  const preferments = input.preferments?.length ? input.preferments : [input.preferment];
  return preferments.filter((preferment) => preferment.kind !== "none" && preferment.flourPercent > 0);
}

function prefermentLabel(preferment: PrefermentOptions): string {
  if (preferment.kind === "poolish") return "Poolish";
  if (preferment.bigaStyle === "tiga") return "Tiga";
  if (preferment.bigaStyle === "lievito-madre") return "Lievito madre";
  if (preferment.bigaStyle === "sauerdough") return "Sourdough";
  return "Biga";
}

function mixDurationMinutes(input: CalculatorInput): number {
  const hasPreferments = getActivePreferments(input).length > 0;
  if (input.mixerType === "hand") return hasPreferments ? 15 : 35;
  if (input.mixerType === "spiral") return hasPreferments ? 8 : 12;
  return hasPreferments ? 10 : 15;
}

export function buildBakePlan(
  input: CalculatorInput,
  mode: ScheduleMode,
  anchorDate = new Date()
): BakeStep[] {
  const steps: Omit<BakeStep, "time">[] = [];
  const preferments = getActivePreferments(input);
  const loafWorkflow = isLoafStyleId(input.styleId);
  const tinLoaf = isTinLoafStyleId(input.styleId);

  for (const preferment of preferments) {
    const label = prefermentLabel(preferment);
    steps.push({
      label: `Mix ${label}`,
      description: `Prepare the ${label.toLowerCase()} starter.`,
      durationMinutes: 10,
      type: "action"
    });
    steps.push({
      label: `${label} ferments`,
      description: `${preferment.roomHours}h at room temperature.`,
      durationMinutes: preferment.roomHours * 60,
      type: "timed"
    });
    if (preferment.coldHours > 0) {
      steps.push({
        label: `${label} cold ferment`,
        description: `${preferment.coldHours}h refrigerated.`,
        durationMinutes: preferment.coldHours * 60,
        type: "timed"
      });
    }
  }

  steps.push({
    label: preferments.length === 0 ? "Mix and knead" : "Mix final dough",
    description:
      input.mixerType === "hand"
        ? "Combine, rest, then knead or fold until smooth."
        : "Mix until combined, then develop gluten.",
    durationMinutes: mixDurationMinutes(input),
    type: "action"
  });

  if (input.fermentation.roomTempHours > 0) {
    steps.push({
      label: "Bulk Ferment",
      description: `${input.fermentation.roomTempHours}h at room temperature.`,
      durationMinutes: input.fermentation.roomTempHours * 60,
      type: "timed"
    });
  }

  if (input.fermentation.cellarTempHours > 0) {
    steps.push({
      label: "Cellar Ferment",
      description: `${input.fermentation.cellarTempHours}h around ${input.fermentation.cellarTempF}F.`,
      durationMinutes: input.fermentation.cellarTempHours * 60,
      type: "timed"
    });
  }

  if (input.fermentation.coldBulkHours > 0) {
    steps.push({
      label: "Cold Bulk",
      description: `${input.fermentation.coldBulkHours}h as one mass around ${input.fermentation.fridgeTempF}F.`,
      durationMinutes: input.fermentation.coldBulkHours * 60,
      type: "timed"
    });
  }

  if (loafWorkflow) {
    steps.push({
      label: "Pre-shape",
      description:
        input.doughBalls > 1
          ? `Divide into ${input.doughBalls} pieces and pre-shape them.`
          : "Pre-shape the loaf gently after bulk fermentation.",
      durationMinutes: 10,
      type: "action"
    });
    steps.push({
      label: "Bench rest",
      description: "Let the dough relax before the final shape.",
      durationMinutes: 20,
      type: "timed"
    });
    steps.push({
      label: "Final shape",
      description: tinLoaf ? "Shape into a tight pan loaf and load the tin." : "Shape the loaf tightly and place it in the proofing basket.",
      durationMinutes: 10,
      type: "action"
    });
  } else if (input.fermentation.coldBulkHours > 0 && !input.pan.enabled) {
    steps.push({
      label: "Divide and ball",
      description: "Portion the dough and ball it after the bulk cold stage.",
      durationMinutes: 10,
      type: "action"
    });
  }

  if (input.fermentation.coldBallHours > 0) {
    steps.push({
      label: loafWorkflow ? "Cold Proof" : "Cold Ball",
      description: `${input.fermentation.coldBallHours}h refrigerated around ${input.fermentation.fridgeTempF}F.`,
      durationMinutes: input.fermentation.coldBallHours * 60,
      type: "timed"
    });
  }

  if (input.fermentation.finalRiseHours > 0) {
    steps.push({
      label: loafWorkflow ? "Final Proof" : input.fermentation.coldBallHours > 0 || input.fermentation.coldBulkHours > 0 ? "Temper" : "Ball Proof",
      description: `${input.fermentation.finalRiseHours}h final rise before baking.`,
      durationMinutes: input.fermentation.finalRiseHours * 60,
      type: "timed"
    });
  }

  steps.push({
    label: "Ready to bake",
    description: loafWorkflow
      ? tinLoaf
        ? "Preheat, load the tin, bake through, then cool before slicing."
        : "Preheat, score, steam or cover the loaf, then bake and cool fully."
      : "Preheat, stretch, top, and bake.",
    durationMinutes: 0,
    type: "ready"
  });

  if (mode === "starting-now") {
    let cursor = new Date(anchorDate);
    return steps.map((step) => {
      const fullStep: BakeStep = { ...step, time: new Date(cursor) };
      cursor = addMinutes(cursor, step.durationMinutes);
      return fullStep;
    });
  }

  let cursor = new Date(anchorDate);
  const reversed: BakeStep[] = [];
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const step = steps[index];
    reversed.unshift({ ...step, time: new Date(cursor) });
    cursor = addMinutes(cursor, -step.durationMinutes);
  }
  return reversed;
}

export function formatPlanTime(step: BakeStep): string {
  return step.time.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
