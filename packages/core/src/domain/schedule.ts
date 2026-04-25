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

  if (input.fermentation.coldBulkHours > 0 && !input.pan.enabled) {
    steps.push({
      label: "Divide and ball",
      description: "Portion the dough and ball it after the bulk cold stage.",
      durationMinutes: 10,
      type: "action"
    });
  }

  if (input.fermentation.coldBallHours > 0) {
    steps.push({
      label: "Cold Ball",
      description: `${input.fermentation.coldBallHours}h refrigerated around ${input.fermentation.fridgeTempF}F.`,
      durationMinutes: input.fermentation.coldBallHours * 60,
      type: "timed"
    });
  }

  if (input.fermentation.finalRiseHours > 0) {
    steps.push({
      label: input.fermentation.coldBallHours > 0 || input.fermentation.coldBulkHours > 0 ? "Temper" : "Ball Proof",
      description: `${input.fermentation.finalRiseHours}h final rise before baking.`,
      durationMinutes: input.fermentation.finalRiseHours * 60,
      type: "timed"
    });
  }

  steps.push({
    label: "Ready to bake",
    description: "Preheat, stretch, top, and bake.",
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
