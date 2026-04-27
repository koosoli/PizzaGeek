export type YeastType = "none" | "idy" | "ady" | "fresh";
export type MixerType = "hand" | "planetary" | "spiral";
export type OvenType =
  | "wood-fired"
  | "coal-fired"
  | "pizza-oven"
  | "deck-oven"
  | "steel-stone"
  | "conventional";
export type PrefermentKind = "none" | "poolish" | "biga";
export type BigaStyle = "standard" | "tiga" | "bassinage" | "lievito-madre" | "sauerdough";
export type ScheduleMode = "starting-now" | "ready-by";
export type PanShape = "round" | "rectangular";
export type TemperatureUnit = "F" | "C";
export type SizeUnit = "in" | "cm";
export type SauceStyle = "classic" | "raw" | "cooked" | "white";

export interface SauceRecipeIngredient {
  item: string;
  amount: string;
  note?: string;
}

export interface SauceRecipeOption {
  id: string;
  name: string;
  description?: string;
  cookType: string;
  ingredients: SauceRecipeIngredient[];
  instructions: string[];
  proTip?: string;
  source?: string;
  yield?: string;
  isDefault?: boolean;
}

export interface StyleSauceCollection {
  sourceStyleId: string;
  styleName: string;
  saltWarning?: string;
  defaultOptionId: string;
  options: SauceRecipeOption[];
}

export interface RangePreset {
  min: number;
  recommended: number;
  max: number;
}

export interface PizzaStyle {
  id: string;
  name: string;
  parentStyleId?: string;
  variantLabel?: string;
  origin: string;
  flourType: string;
  profile: string;
  hydration: RangePreset;
  salt: RangePreset;
  oil: RangePreset;
  sugar: RangePreset;
  fermentationHours: RangePreset;
  coldFermentRecommended: boolean;
  ovenTempF: RangePreset;
  cookTime: {
    min: number;
    max: number;
    unit: "seconds" | "minutes";
  };
  defaultOven: OvenType;
  defaultBallWeight: number;
  defaultBallCount: number;
  panStyle?: boolean;
}

export interface Flour {
  id: string;
  brand: string;
  name: string;
  type: "tipo00" | "tipo0" | "bread" | "high-gluten" | "all-purpose" | "manitoba" | "whole-grain";
  proteinPercent: number;
  wStrength?: string;
  absorptionAdjustment: number;
  regions: string[];
}

export interface FlourBlendItem {
  flourId: string;
  percentage: number;
}

export interface PrefermentOptions {
  kind: PrefermentKind;
  flourPercent: number;
  bigaHydration: number;
  bigaStyle: BigaStyle;
  starterInoculationPercent: number;
  roomHours: number;
  coldHours: number;
}

export interface FermentationSchedule {
  roomTempHours: number;
  cellarTempHours: number;
  coldBulkHours: number;
  coldBallHours: number;
  finalRiseHours: number;
  roomTempF: number;
  cellarTempF: number;
  fridgeTempF: number;
  roomHumidityPercent: number;
  cellarHumidityPercent: number;
  fridgeHumidityPercent: number;
}

export interface PanOptions {
  enabled: boolean;
  shape: PanShape;
  length: number;
  width: number;
  diameter: number;
  depth: number;
  unit: SizeUnit;
}

export interface OvenOptions {
  type: OvenType;
  pizzaOvenStoneTempF: number;
  pizzaOvenTopTempF: number;
  deckOvenTempF: number;
  useBroilerMethod: boolean;
  useFinishingBroil: boolean;
}

export interface SauceOptions {
  enabled: boolean;
  style: SauceStyle;
  recipeId?: string;
  gramsPerPizza: number;
}

export interface CostSettings {
  currency: string;
  flourPerKg: number;
  saltPerKg: number;
  yeastPerKg: number;
  oilPerKg: number;
  sugarPerKg: number;
  honeyPerKg: number;
  maltPerKg: number;
  lardPerKg: number;
  milkPowderPerKg: number;
}

export interface CalculatorInput {
  styleId: string;
  doughBalls: number;
  ballWeight: number;
  hydrationPercent: number;
  saltPercent: number;
  oilPercent: number;
  sugarPercent: number;
  honeyPercent: number;
  maltPercent: number;
  lardPercent: number;
  milkPowderPercent: number;
  yeastType: YeastType;
  mixerType: MixerType;
  fermentation: FermentationSchedule;
  preferment: PrefermentOptions;
  flourBlendEnabled: boolean;
  flourBlend: FlourBlendItem[];
  prefermentFlourBlend: FlourBlendItem[];
  mainDoughFlourBlend: FlourBlendItem[];
  pan: PanOptions;
  oven: OvenOptions;
  sauce: SauceOptions;
  manualYeastPercent?: number;
  flourTempF?: number;
}

export interface IngredientBreakdown {
  totalFlour: number;
  totalWater: number;
  totalSalt: number;
  totalYeast: number;
  totalOil: number;
  totalSugar: number;
  totalHoney: number;
  totalMalt: number;
  totalLard: number;
  totalMilkPowder: number;
  totalDoughWeight: number;
  prefermentFlour?: number;
  prefermentWater?: number;
  prefermentYeast?: number;
  mainFlour?: number;
  mainWater?: number;
  mainYeast?: number;
}

export interface WaterTemperatureResult {
  targetFdtF: number;
  targetFdtC: number;
  waterTempF: number;
  waterTempC: number;
  warning?: string;
  note?: string;
  adyProofing?: {
    proofingWaterG: number;
    proofingWaterTempF: number;
    remainingWaterG: number;
    remainingWaterTempF: number;
  };
}

export interface FlourBlendAnalysis {
  description: string;
  blendedW: number | null;
  absorptionAdjustment: number;
  warning?: string;
  warningColor: "ok" | "notice" | "warning" | "danger";
}

export interface BakeStep {
  time: Date;
  label: string;
  description: string;
  durationMinutes: number;
  type: "action" | "timed" | "ready";
}

export interface CostBreakdown {
  total: number;
  perBall: number;
  currency: string;
  lines: Record<string, number>;
}

export interface DoughResult {
  style: PizzaStyle;
  ingredients: IngredientBreakdown;
  percentages: {
    hydration: number;
    salt: number;
    yeast: number;
    oil?: number;
    sugar?: number;
    honey?: number;
    malt?: number;
    lard?: number;
    milkPowder?: number;
  };
  yeastPercent: number;
  effectiveFermentationHours: number;
  totalFermentationHours: number;
  waterTemperature: WaterTemperatureResult;
  flourBlend: FlourBlendAnalysis;
  oven: {
    tempF: number;
    tempC: number;
    minTime: number;
    maxTime: number;
    unit: "seconds" | "minutes";
    detail?: string;
  };
  pan?: {
    areaSqIn: number;
    depth: number;
  };
  sauce?: {
    style: SauceStyle;
    recipeId?: string;
    recipeName?: string;
    totalGrams: number;
    perPizzaGrams: number;
    instructions: string[];
  };
  instructions: string[];
}
