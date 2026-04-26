import { isLoafStyleId, isTinLoafStyleId } from "../data/styles";
import type { BakeStep, CalculatorInput, ScheduleMode } from "./types";

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function prefermentLabel(input: CalculatorInput): string {
  if (input.preferment.kind === "poolish") return "Poolish";
  if (input.preferment.bigaStyle === "tiga") return "Tiga";
  if (input.preferment.bigaStyle === "bassinage") return "Bassinage biga";
  return "Biga";
}

function mixDurationMinutes(input: CalculatorInput): number {
  if (input.mixerType === "hand") return input.preferment.kind === "none" ? 35 : 15;
  if (input.mixerType === "spiral") return input.preferment.kind === "none" ? 12 : 8;
  return input.preferment.kind === "none" ? 15 : 10;
}

export function buildBakePlan(
  input: CalculatorInput,
  mode: ScheduleMode,
  anchorDate = new Date()
): BakeStep[] {
  const steps: Omit<BakeStep, "time">[] = [];
  const preferment = prefermentLabel(input);
  const loafWorkflow = isLoafStyleId(input.styleId);
  const tinLoaf = isTinLoafStyleId(input.styleId);

  if (input.preferment.kind !== "none") {
    steps.push({
      label: `Mix ${preferment}`,
      description: `Prepare the ${preferment.toLowerCase()} starter.`,
      durationMinutes: 10,
      type: "action"
    });
    steps.push({
      label: `${preferment} ferments`,
      description: `${input.preferment.roomHours}h at room temperature.`,
      durationMinutes: input.preferment.roomHours * 60,
      type: "timed"
    });
    if (input.preferment.coldHours > 0) {
      steps.push({
        label: `${preferment} cold ferment`,
        description: `${input.preferment.coldHours}h refrigerated.`,
        durationMinutes: input.preferment.coldHours * 60,
        type: "timed"
      });
    }
  }

  steps.push({
    label: input.preferment.kind === "none" ? "Mix and knead" : "Mix final dough",
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
