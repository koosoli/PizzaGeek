import {
  AlertCircle,
  BookOpen,
  Calculator,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  Coffee,
  Copy as CopyIcon,
  Download,
  Flame,
  FlaskConical,
  Gauge,
  Globe,
  Printer,
  RotateCcw,
  Save,
  Settings2,
  Upload,
  Wheat
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  buildBakePlan,
  calculateCost,
  calculateDough,
  choosePresetForStyle,
  combineBlendSegments,
  createDefaultInput,
  defaultCostSettings,
  estimatePanBallWeight,
  FERMENTATION_PRESETS,
  normalizeBlend,
  PIZZA_STYLES,
  SAUCE_SALT_WARNING,
  fahrenheitToCelsius,
  getSauceCollectionForStyle,
  getSauceOption,
  getStyleById,
  scheduleFromPreset,
  type BakeStep,
  type CalculatorInput,
  type CostSettings,
  type DoughResult,
  type FermentationPresetKey,
  type Flour,
  type FlourBlendItem,
  type OvenType,
  type PizzaStyle,
  type SauceRecipeOption,
  type ScheduleMode,
  type SizeUnit,
  type TemperatureUnit,
  type YeastType
} from "@pizza-geek/core";
import { type AppSettings, DEFAULT_SETTINGS, getLocaleDefaults, resolveAppSettings, type LocaleCode, type ThemeMode, type WorkspaceMode } from "./appConfig";
import { BreadProfilePicker } from "./components/BreadProfilePicker";
import { Field, Segmented, SelectField, Toggle } from "./components/Controls";
import { FermentationPanelContent, getFermentationStageContent } from "./components/FermentationPanelContent";
import { PlannerPanelContent, type PlannerShortcut, type PlannerTimelineItem } from "./components/PlannerPanelContent";
import { PrintSheetContent } from "./components/PrintSheetContent";
import { RecipeSheetPanelContent } from "./components/RecipeSheetPanelContent";
import { SettingsPanelContent } from "./components/SettingsPanelContent";
import { StylePicker, type StylePickerGroup } from "./components/StylePicker";
import { Metric, Notice, PanelTitle } from "./components/Surface";
import {
  createPortableDataBundle,
  createPortableDataFileName,
  mergeBakeLog,
  mergeSavedRecipes,
  normalizeBakeLog,
  normalizeSavedRecipes,
  parsePortableDataBundle,
  serializePortableDataBundle,
  type BakeLogEntry,
  type SavedRecipe
} from "./dataExchange";
import { usePersistentState } from "./hooks/usePersistentState";
import {
  getBreadProfiles,
  getFallbackStyleIdForProductMode,
  getProductModeForStyleId,
  isBreadStyleId,
  isLoafStyleId,
  isTinLoafStyleId,
  type ProductMode
} from "./productModes";
import { getDefaultRecipeName, isAutoRecipeName, getRecipeDisplayName, getPortableDataImportMessage, getYeastOptionLabel, getYeastOptions, ovenOptions, presetKeys, getBatchLabels, getBatchDescriptor, numberValue, celsiusToFahrenheit, toLocalDateTimeInputValue, displayTemperatureValue, parseTemperatureInput, formatTemperature, formatMoney, addHours, roundDateUp, getPresetDurationHours, clampTo, createMobileSlider, createStyleSlider, createTemperatureSlider, getCountSlider, getWeightSlider, getSizePresetForStyle, roundTo, formatSizePresetLabel, formatArea, getLengthSuffix, styleRange } from "./appHelpers";
import { formatDateTime, getBakeDurationUnit, getIntlLocale, getLanguageLabel, getPerPizzaLabel } from "./locale";
import { copy, type CopyText } from "./copy";
import { type BlendBreakdownRow, type StageBlendBreakdownRow, rebalanceBlendPercentages, buildStageBlendBreakdown, mergeBlendBreakdowns } from "./blendBreakdown";
import { type PlannerTimelineStatus, type PlannerStepProgressState, type PlannerStepProgress, plannerShortcutPresets, breadPlannerShortcutPresets, formatPlannerTarget, formatPlannerDuration, getPlannerKindLabel, getPlannerPanelLabels, getPlannerStatusLabel, formatPlannerEndLabel, formatPlannerRange, getPlannerProgressLabel, getPlannerShortcutLabel, getPresetLabel } from "./planner";
import { type PrefermentMode, type NaturalStarterChoice, getPrefermentModeFromStage, getDefaultStarterInoculationPercent, isNaturalStarterPreferment, getPrefermentLeaveningName, getNaturalStarterUiHint, getNaturalStarterChoice, getPrefermentPatch, getPrefermentDisplayName } from "./preferment";
import { convertPanToUnit } from "./pan";
import { getSauceStyleLabel, getSauceUiCopy, localizeSauceOption, localizeSauceSaltWarning } from "./sauceText";
import {
  buildQualitySignals,
  DOUGH_PERCENT_LIMITS,
  getHydrationWorkabilityNotice,
  getIngredientPercentageNotices,
  type DoughSetupNotice,
  type QualitySignal
} from "./quality";
import { applySinglePrefermentPatch, inferSauceStyleFromOption, normalizeCalculatorInput } from "./calculatorInput";
import { formatBakeWindow, getEnrichmentHint, getMethodSteps, getOvenDetailText, getWaterSummaryText, localizePlanStep, localizeWaterMessage } from "./recipeText";
import {
  createDefaultCustomFlour,
  CUSTOM_FLOUR_ID,
  filterFlours,
  getSelectableFlours,
  getVisibleFlours,
  type FlourRegionFilter
} from "./flourCatalog";

type BlendTarget = "prefermentFlourBlend" | "mainDoughFlourBlend";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PanelKey =
  | "settings"
  | "styles"
  | "doughSetup"
  | "fermentation"
  | "doughStudio"
  | "sauce"
  | "bakeSurface"
  | "ovenProfile"
  | "planner"
  | "formula"
  | "quality"
  | "guidance"
  | "method"
  | "cost"
  | "saved"
  | "journal";

const BRAND_NAME = "Pizza Geek";
const APP_VERSION = __APP_VERSION__;
const BRAND_LOGO_SRC = `${import.meta.env.BASE_URL}favicon.svg`;
const BUY_ME_A_SLICE_URL = "https://buymeacoffee.com/koosoli";
const STORAGE_KEYS = {
  settings: "pizza-geek.settings",
  input: "pizza-geek.input",
  costs: "pizza-geek.costs",
  saved: "pizza-geek.saved",
  bakeLog: "pizza-geek.bake-log"
} as const;

const DEFAULT_PANEL_STATE: Record<PanelKey, boolean> = {
  settings: true,
  styles: true,
  doughSetup: false,
  fermentation: true,
  doughStudio: false,
  sauce: false,
  bakeSurface: true,
  ovenProfile: true,
  planner: false,
  formula: true,
  quality: false,
  guidance: true,
  method: true,
  cost: false,
  saved: false,
  journal: false
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy copy path below.
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);

  if (selection) {
    selection.removeAllRanges();
    if (previousRange) {
      selection.addRange(previousRange);
    }
  }

  activeElement?.focus();
  return copied;
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function App() {
  const [storedSettings, setSettings] = usePersistentState<AppSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    { legacyKeys: ["pizza-nerd.settings"] }
  );
  const [input, setInput] = usePersistentState<CalculatorInput>(
    STORAGE_KEYS.input,
    createDefaultInput(),
    { legacyKeys: ["pizza-nerd.input"] }
  );
  const [costSettings, setCostSettings] = usePersistentState<CostSettings>(
    STORAGE_KEYS.costs,
    defaultCostSettings(),
    { legacyKeys: ["pizza-nerd.costs"] }
  );
  const [savedRecipes, setSavedRecipes] = usePersistentState<SavedRecipe[]>(
    STORAGE_KEYS.saved,
    [],
    { legacyKeys: ["pizza-nerd.saved"], deserialize: normalizeSavedRecipes }
  );
  const [bakeLog, setBakeLog] = usePersistentState<BakeLogEntry[]>(
    STORAGE_KEYS.bakeLog,
    [],
    { legacyKeys: ["pizza-nerd.bake-log"], deserialize: normalizeBakeLog }
  );
  const persistedStyleId = normalizeCalculatorInput(input).styleId;
  const [preset, setPreset] = useState<FermentationPresetKey>(() => choosePresetForStyle(persistedStyleId));
  const [planMode, setPlanMode] = useState<ScheduleMode>("starting-now");
  const [readyBy, setReadyBy] = useState(() => {
    const date = new Date(Date.now() + 48 * 60 * 60 * 1000);
    date.setMinutes(0, 0, 0);
    return toLocalDateTimeInputValue(date);
  });
  const [copyMethodState, setCopyMethodState] = useState<"idle" | "copied" | "failed">("idle");
  const [dataTransferNotice, setDataTransferNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [openPanels, setOpenPanels] = useState<Record<PanelKey, boolean>>(DEFAULT_PANEL_STATE);
  const [showFermentationDetails, setShowFermentationDetails] = useState(false);
  const [showSauceRecipe, setShowSauceRecipe] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneDisplayMode());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [offlineReady, setOfflineReady] = useState(false);
  const [plannerNotes, setPlannerNotes] = useState<Record<string, string>>({});
  const [plannerStepProgress, setPlannerStepProgress] = useState<Record<string, PlannerStepProgress>>({});
  const [flourFilter, setFlourFilter] = useState("");
  const [flourRegionFilter, setFlourRegionFilter] = useState<FlourRegionFilter>("all");
  const [recipeName, setRecipeName] = useState(() =>
    getDefaultRecipeName(
      persistedStyleId,
      storedSettings.language === "de" || storedSettings.language === "it" ? storedSettings.language : "en"
    )
  );
  const [logDraft, setLogDraft] = useState<{
    rating: number;
    outcome: BakeLogEntry["outcome"];
    notes: string;
    photoDataUrl?: string;
    photoName?: string;
  }>({
      rating: 5,
      outcome: "keeper",
      notes: ""
  });
  const [recentStyleByProductMode, setRecentStyleByProductMode] = useState<Record<ProductMode, string>>(() => {
    const initialMode = getProductModeForStyleId(persistedStyleId);
    return {
      pizza: initialMode === "pizza" ? persistedStyleId : getFallbackStyleIdForProductMode("pizza"),
      bread: initialMode === "bread" ? persistedStyleId : getFallbackStyleIdForProductMode("bread")
    };
  });

  const settings = useMemo(
    () => resolveAppSettings(storedSettings as Partial<AppSettings>, persistedStyleId),
    [persistedStyleId, storedSettings]
  );
  const isBreadMode = settings.productMode === "bread";
  const isGuidedMode = settings.mode === "guided";
  const resolvedCostSettings = useMemo(
    () => ({
      ...defaultCostSettings(getLocaleDefaults(settings.language).currency),
      ...costSettings
    }),
    [costSettings, settings.language]
  );
  const t = copy[settings.language];
  const sauceUi = getSauceUiCopy(settings.language);
  const normalizedInput = useMemo(() => {
    const normalized = normalizeCalculatorInput(input);
    return normalized.pan.unit === settings.sizeUnit
      ? normalized
      : {
          ...normalized,
          pan: convertPanToUnit(normalized.pan, settings.sizeUnit)
        };
  }, [input, settings.sizeUnit]);
  const result = useMemo(() => calculateDough(normalizedInput), [normalizedInput]);
  const selectedSauceCollection = useMemo(
    () => getSauceCollectionForStyle(normalizedInput.styleId),
    [normalizedInput.styleId]
  );
  const selectedSauceOption = useMemo(
    () => getSauceOption(normalizedInput.styleId, normalizedInput.sauce.recipeId),
    [normalizedInput.sauce.recipeId, normalizedInput.styleId]
  );
  const localizedSauceOptions = useMemo(
    () => selectedSauceCollection?.options.map((option) => localizeSauceOption(option, settings.language) ?? option) ?? [],
    [selectedSauceCollection, settings.language]
  );
  const localizedSelectedSauceOption = useMemo(
    () => localizeSauceOption(selectedSauceOption, settings.language),
    [selectedSauceOption, settings.language]
  );
  const localizedYeastOptions = useMemo(() => getYeastOptions(settings.language), [settings.language]);
  const availableFlours = useMemo(() => getSelectableFlours(normalizedInput.customFlours ?? []), [normalizedInput.customFlours]);
  const filteredFlourOptions = useMemo(
    () => filterFlours(availableFlours, flourFilter, flourRegionFilter),
    [availableFlours, flourFilter, flourRegionFilter]
  );
  const customFlour = normalizedInput.customFlours?.[0];
  const prefermentMode = getPrefermentModeFromStage(normalizedInput.preferment);
  const naturalStarterSelected = isNaturalStarterPreferment(normalizedInput.preferment);
  const naturalStarterChoice = getNaturalStarterChoice(normalizedInput.preferment);
  const prefermentName = getPrefermentDisplayName(normalizedInput.preferment, settings.language);
  const prefermentFlourGrams = prefermentMode === "none" ? 0 : (result.ingredients.prefermentFlour ?? 0);
  const mainDoughFlourGrams = prefermentMode === "none" ? 0 : (result.ingredients.mainFlour ?? 0);
  const mainDoughWaterGrams = prefermentMode === "none" ? 0 : (result.ingredients.mainWater ?? 0);
  const mainDoughYeastGrams = prefermentMode === "none" ? 0 : (result.ingredients.mainYeast ?? 0);
  const prefermentSplitText = `${prefermentName}: ${normalizedInput.preferment.flourPercent}% = ${prefermentFlourGrams}g ${t.flour.toLowerCase()}, ${result.ingredients.prefermentWater}g ${t.water.toLowerCase()}, ${result.ingredients.prefermentYeast}g ${t.yeast.toLowerCase()}`;
  const mainDoughAdditionsText = `${t.mainDoughAdditions}: ${mainDoughFlourGrams}g ${t.additionalFlour}, ${mainDoughWaterGrams}g ${t.additionalWater}${mainDoughYeastGrams > 0 ? `, ${mainDoughYeastGrams}g ${t.additionalYeast}` : ""}`;
  const activeStyle = result.style;
  const loafWorkflow = isLoafStyleId(activeStyle.id);
  const tinLoaf = isTinLoafStyleId(activeStyle.id);
  const batchLabels = getBatchLabels(activeStyle.id, t);
  const batchDescriptor = getBatchDescriptor(normalizedInput, activeStyle, settings.language);
  const doughCountSlider = getCountSlider(activeStyle.id);
  const doughWeightSlider = getWeightSlider(activeStyle.id);
  const hydrationSlider = createStyleSlider(result.style.hydration.min, result.style.hydration.max, 4, 35, 100, 0.5);
  const saltSlider = createStyleSlider(result.style.salt.min, result.style.salt.max, 0.5, 0.5, 5, 0.1);
  const oilSlider = createStyleSlider(result.style.oil.min, result.style.oil.max, 2, 0, 14, 0.1);
  const sugarSlider = createStyleSlider(result.style.sugar.min, result.style.sugar.max, 2, 0, 14, 0.1);
  const styleGroups = useMemo<StylePickerGroup[]>(() => {
    const primaryStyles = PIZZA_STYLES.filter((style) => !style.parentStyleId);
    return primaryStyles.map((parent) => ({
      parent,
      variants: PIZZA_STYLES.filter((style) => style.parentStyleId === parent.id)
    }));
  }, []);
  const visibleStyleGroups = useMemo(
    () =>
      styleGroups.filter(({ parent }) =>
        settings.productMode === "bread" ? getProductModeForStyleId(parent.id) === "bread" : getProductModeForStyleId(parent.id) === "pizza"
      ),
    [settings.productMode, styleGroups]
  );
  const breadProfiles = useMemo(() => getBreadProfiles(settings.language), [settings.language]);
  const usesPanGeometry = Boolean(activeStyle.panStyle);
  const cost = useMemo(
    () => calculateCost(result, resolvedCostSettings, normalizedInput.doughBalls),
    [normalizedInput.doughBalls, resolvedCostSettings, result]
  );
  const displayRecipeName = getRecipeDisplayName(recipeName, normalizedInput.styleId, settings.language);
  const qualitySignals = useMemo(
    () => buildQualitySignals(result, normalizedInput, settings.temperatureUnit, t),
    [normalizedInput, result, settings.temperatureUnit, t]
  );
  const panelSummaries = useMemo(
    () => ({
      settings: `${getLanguageLabel(settings.language, t)} · ${settings.productMode === "bread" ? t.breadProduct : t.pizzaProduct} · ${settings.mode === "guided" ? t.guidedMode : t.studioMode} · °${settings.temperatureUnit} · ${settings.sizeUnit === "in" ? t.inches : t.centimeters} · ${settings.theme === "dark" ? t.dark : t.light}`,
      styles: `${activeStyle.name} · ${activeStyle.origin}`,
      doughSetup: `${batchDescriptor} · ${normalizedInput.hydrationPercent}% ${t.hydration.toLowerCase()}`,
      fermentation: `${getPresetLabel(preset, settings.language)} · ${result.totalFermentationHours}h ${t.totalTime.toLowerCase()}`,
      doughStudio: normalizedInput.flourBlendEnabled ? `${prefermentName} · ${t.flourBlend}` : prefermentName,
      sauce: normalizedInput.sauce.enabled
        ? `${localizedSelectedSauceOption?.name ?? getSauceStyleLabel(normalizedInput.sauce.style, t)} · ${normalizedInput.sauce.gramsPerPizza}g / ${getPerPizzaLabel(settings.language)}`
        : t.none,
      planner:
        planMode === "ready-by"
          ? `${t.readyBy}: ${formatDateTime(new Date(readyBy).toISOString(), settings.language)}`
          : `${result.totalFermentationHours}h ${t.totalTime.toLowerCase()}`,
      formula: `${displayRecipeName} · ${batchDescriptor}`,
      quality:
        qualitySignals.length > 2
          ? `${qualitySignals[0]?.label} · ${qualitySignals[1]?.label} +${qualitySignals.length - 2}`
          : qualitySignals.map((signal) => signal.label).join(" · "),
      guidance: `${result.totalFermentationHours}h · ${formatTemperature(result.oven.tempF, settings.temperatureUnit)}`,
      method: `${result.totalFermentationHours}h · ${formatTemperature(result.oven.tempF, settings.temperatureUnit)}`,
      cost: `${formatMoney(cost.perBall, cost.currency, settings.language)} · ${batchLabels.perUnit.toLowerCase()}`,
      saved: `${savedRecipes.length} ${t.savedCount}`,
      journal: `${bakeLog.length} ${t.journalCount}`
    }),
    [
      activeStyle.name,
      activeStyle.origin,
      batchDescriptor,
      batchLabels.perUnit,
      bakeLog.length,
      cost,
      displayRecipeName,
      localizedSelectedSauceOption,
      normalizedInput.flourBlendEnabled,
      normalizedInput.hydrationPercent,
      normalizedInput.sauce.enabled,
      normalizedInput.sauce.gramsPerPizza,
      normalizedInput.sauce.style,
      planMode,
      prefermentName,
      preset,
      qualitySignals,
      readyBy,
      result.oven.tempF,
      result.totalFermentationHours,
      savedRecipes.length,
      settings,
      t
    ]
  );
  const plan = useMemo<BakeStep[]>(() => {
    const anchor = planMode === "ready-by" ? new Date(readyBy) : new Date();
    return buildBakePlan(normalizedInput, planMode, anchor);
  }, [normalizedInput, planMode, readyBy]);
  const localizedPlan = useMemo(
    () =>
      plan.map((step) => ({
        ...step,
        ...localizePlanStep(step, normalizedInput, settings.language, settings.temperatureUnit)
      })),
    [plan, normalizedInput, settings.language, settings.temperatureUnit]
  );
  const plannerPanelLabels = useMemo(() => getPlannerPanelLabels(settings.language), [settings.language]);
  const timelineItems = useMemo<PlannerTimelineItem[]>(
    () => {
      const now = Date.now();
      const currentIndex = localizedPlan.findIndex((step, index) => {
        const stepStart = step.time.getTime();
        const nextStepStart = localizedPlan[index + 1]?.time.getTime();
        return stepStart <= now && (nextStepStart === undefined || now < nextStepStart);
      });

      return localizedPlan.map((step, index) => {
        const id = `${step.label}-${step.time.toISOString()}`;
        const progress = plannerStepProgress[id];
        const note = plannerNotes[id] ?? "";
        let statusTone: PlannerTimelineStatus;

        if (currentIndex === -1) {
          statusTone = index === 0 ? "next" : "future";
        } else if (index < currentIndex) {
          statusTone = "past";
        } else if (index === currentIndex) {
          statusTone = "current";
        } else if (index === currentIndex + 1) {
          statusTone = "next";
        } else {
          statusTone = "future";
        }

        const endTime =
          step.durationMinutes > 0 ? new Date(step.time.getTime() + step.durationMinutes * 60_000) : undefined;

        return {
          id,
          timeLabel: formatDateTime(step.time.toISOString(), settings.language),
          title: step.label,
          description: step.description,
          note,
          progressLabel: progress ? getPlannerProgressLabel(progress.state, settings.language) : undefined,
          progressTone: progress?.state,
          progressTimeLabel: progress ? formatDateTime(progress.updatedAt, settings.language) : undefined,
          durationLabel: step.durationMinutes > 0 ? formatPlannerDuration(step.durationMinutes, settings.language) : undefined,
          endLabel: endTime ? formatPlannerEndLabel(endTime, settings.language) : undefined,
          kindLabel: getPlannerKindLabel(step.type, settings.language),
          kindTone: step.type === "ready" ? "ready" : step.type === "action" ? "action" : "timed",
          statusLabel: getPlannerStatusLabel(statusTone, settings.language),
          statusTone
        };
      });
    },
    [localizedPlan, plannerNotes, plannerStepProgress, settings.language]
  );
  const planStartValue = useMemo(
    () => (localizedPlan[0] ? formatDateTime(localizedPlan[0].time.toISOString(), settings.language) : "--"),
    [localizedPlan, settings.language]
  );
  const planBakeValue = useMemo(
    () =>
      localizedPlan.length > 0
        ? formatDateTime(localizedPlan[localizedPlan.length - 1].time.toISOString(), settings.language)
        : "--",
    [localizedPlan, settings.language]
  );
  const plannerShortcutReference = useMemo(() => roundDateUp(new Date()), [planMode, readyBy]);
  const plannerShortcutKeys = isBreadMode ? breadPlannerShortcutPresets : plannerShortcutPresets;
  const methodSteps = useMemo(
    () => getMethodSteps(normalizedInput, result, settings.language, settings.temperatureUnit),
    [normalizedInput, result, settings.language, settings.temperatureUnit]
  );
  const ovenDetail = useMemo(
    () => getOvenDetailText(normalizedInput, t, settings.temperatureUnit),
    [normalizedInput, settings.temperatureUnit, t]
  );
  const waterSummary = useMemo(
    () => getWaterSummaryText(result, settings.language, settings.temperatureUnit),
    [result, settings.language, settings.temperatureUnit]
  );
  const sizePreset = useMemo(() => getSizePresetForStyle(activeStyle.name), [activeStyle.name]);
  const doughSetupNotices = useMemo(() => {
    const notices: DoughSetupNotice[] = [];
    const hydrationNotice = getHydrationWorkabilityNotice(normalizedInput, result, settings.language);

    if (hydrationNotice) {
      notices.push(hydrationNotice);
    }

    notices.push(
      ...getIngredientPercentageNotices(
        normalizedInput,
        result,
        {
          salt: t.salt,
          oil: t.oil,
          sugar: t.sugar,
          honey: t.honey,
          malt: t.malt,
          lard: t.lard,
          milkPowder: t.milkPowder
        },
        settings.language
      )
    );

    if (normalizedInput.flourBlendEnabled && result.flourBlend.warning) {
      notices.push({
        tone: result.flourBlend.warningColor,
        message: result.flourBlend.warning
      });
    }

    return notices;
  }, [normalizedInput, result, settings.language]);
  const sizePresetEntries = useMemo(
    () =>
      Object.entries(sizePreset).map(([size, weight]) => ({
        sizeInches: Number(size),
        weight,
        label: formatSizePresetLabel(Number(size), settings.sizeUnit)
      })),
    [settings.sizeUnit, sizePreset]
  );
  const prefermentBlendTotal = useMemo(
    () => normalizedInput.prefermentFlourBlend.reduce((sum, item) => sum + item.percentage, 0),
    [normalizedInput.prefermentFlourBlend]
  );

  const handleTimelineNoteChange = (id: string, value: string) => {
    setPlannerNotes((current) => ({
      ...current,
      [id]: value
    }));
  };

  const handleTimelineStepProgressChange = (id: string, value: PlannerStepProgressState | null) => {
    setPlannerStepProgress((current) => {
      if (!value) {
        const next = { ...current };
        delete next[id];
        return next;
      }

      return {
        ...current,
        [id]: {
          state: value,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  const mainDoughBlendTotal = useMemo(
    () => normalizedInput.mainDoughFlourBlend.reduce((sum, item) => sum + item.percentage, 0),
    [normalizedInput.mainDoughFlourBlend]
  );
  const prefermentBlendBreakdown = useMemo<StageBlendBreakdownRow[]>(() => {
    if (!normalizedInput.flourBlendEnabled || prefermentMode === "none") return [];
    return buildStageBlendBreakdown(normalizedInput.prefermentFlourBlend, prefermentFlourGrams, normalizedInput.customFlours);
  }, [
    normalizedInput.customFlours,
    normalizedInput.flourBlendEnabled,
    normalizedInput.prefermentFlourBlend,
    prefermentFlourGrams,
    prefermentMode
  ]);
  const mainDoughBlendBreakdown = useMemo<StageBlendBreakdownRow[]>(() => {
    if (!normalizedInput.flourBlendEnabled) return [];
    const targetFlourGrams = prefermentMode === "none" ? result.ingredients.totalFlour : mainDoughFlourGrams;
    return buildStageBlendBreakdown(normalizedInput.mainDoughFlourBlend, targetFlourGrams, normalizedInput.customFlours);
  }, [
    mainDoughFlourGrams,
    normalizedInput.customFlours,
    normalizedInput.flourBlendEnabled,
    normalizedInput.mainDoughFlourBlend,
    prefermentMode,
    result.ingredients.totalFlour
  ]);
  const blendBreakdown = useMemo<BlendBreakdownRow[]>(() => {
    if (!normalizedInput.flourBlendEnabled) return [];

    return mergeBlendBreakdowns(
      normalizedInput.flourBlend,
      prefermentBlendBreakdown,
      mainDoughBlendBreakdown,
      normalizedInput.customFlours
    );
  }, [
    mainDoughBlendBreakdown,
    normalizedInput.customFlours,
    normalizedInput.flourBlend,
    normalizedInput.flourBlendEnabled,
    prefermentBlendBreakdown
  ]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.style.colorScheme = settings.theme;
    document.title = `${displayRecipeName} | ${BRAND_NAME}`;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", settings.theme === "dark" ? "#171717" : "#f1eee6");
  }, [displayRecipeName, settings.language, settings.theme]);

  useEffect(() => {
    const serializedCurrent = JSON.stringify(input);
    const serializedNormalized = JSON.stringify(normalizedInput);
    if (serializedCurrent !== serializedNormalized) {
      setInput(normalizedInput);
    }
  }, [input, normalizedInput, setInput]);

  useEffect(() => {
    if (copyMethodState === "idle") return;
    const timer = window.setTimeout(() => setCopyMethodState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [copyMethodState]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    setIsInstalled(isStandaloneDisplayMode());
    setOfflineReady("serviceWorker" in navigator);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!isGuidedMode) return;
    setShowFermentationDetails(false);
    setShowSauceRecipe(false);
    setOpenPanels((current) => ({
      ...current,
      doughSetup: true,
      doughStudio: false,
      cost: false,
      saved: false,
      journal: false
    }));
  }, [isGuidedMode]);

  useEffect(() => {
    if (!isBreadMode) return;
    setShowSauceRecipe(false);
    setOpenPanels((current) => ({
      ...current,
      sauce: false
    }));
  }, [isBreadMode]);

  const setPartial = (patch: Partial<CalculatorInput>) => {
    setInput((current) => ({ ...normalizeCalculatorInput(current), ...patch }));
  };

  const setFermentation = (patch: Partial<CalculatorInput["fermentation"]>) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        fermentation: {
          ...normalized.fermentation,
          ...patch
        }
      };
    });
  };

  const setPreferment = (patch: Partial<CalculatorInput["preferment"]>) => {
    setInput((current) => applySinglePrefermentPatch(current, patch));
  };

  const setPan = (patch: Partial<CalculatorInput["pan"]>) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        pan: {
          ...normalized.pan,
          ...patch
        }
      };
    });
  };

  const setOven = (patch: Partial<CalculatorInput["oven"]>) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        oven: {
          ...normalized.oven,
          ...patch
        }
      };
    });
  };

  const setSauce = (patch: Partial<CalculatorInput["sauce"]>) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        sauce: {
          ...normalized.sauce,
          ...patch
        }
      };
    });
  };

  const togglePanel = (key: PanelKey) => {
    setOpenPanels((current) => ({
      ...current,
      [key]: !current[key]
    }));
  };
  const renderPanelToggle = (key: PanelKey) => {
    const toggleLabel = openPanels[key] ? t.collapseSection : t.expandSection;
    return (
      <button
        className={`iconButton panelToggle ${openPanels[key] ? "open" : ""}`}
        type="button"
        aria-label={toggleLabel}
        title={toggleLabel}
        onClick={() => togglePanel(key)}
      >
        <ChevronDown size={16} />
      </button>
    );
  };

  const patchSettings = (patch: Partial<AppSettings>) => {
    setSettings((current) => ({
      ...DEFAULT_SETTINGS,
      ...current,
      ...patch
    }));
  };

  const applyCalculatorInput = (nextInput: CalculatorInput, nextRecipeName?: string) => {
    const normalized = normalizeCalculatorInput(nextInput);
    const converted =
      normalized.pan.unit === settings.sizeUnit
        ? normalized
        : {
            ...normalized,
            pan: convertPanToUnit(normalized.pan, settings.sizeUnit)
          };
    const nextProductMode = getProductModeForStyleId(converted.styleId);
    const nextState =
      nextProductMode === "bread"
        ? {
            ...converted,
            sauce: {
              ...converted.sauce,
              enabled: false,
              gramsPerPizza: 0
            }
          }
        : converted;

    patchSettings({ productMode: nextProductMode });
    setRecentStyleByProductMode((current) => ({
      ...current,
      [nextProductMode]: nextState.styleId
    }));
    setInput(nextState);
    setPreset(choosePresetForStyle(nextState.styleId));
    setRecipeName(nextRecipeName ?? getDefaultRecipeName(nextState.styleId, settings.language));

    if (isGuidedMode && typeof window !== "undefined" && window.innerWidth <= 760) {
      setOpenPanels((current) => ({
        ...current,
        styles: false,
        doughSetup: true
      }));
    }
  };

  const applyStyleSelection = (styleId: string) => {
    applyCalculatorInput(createDefaultInput(styleId));
  };

  const updateTheme = (theme: ThemeMode) => {
    patchSettings({ theme });
  };

  const updateWorkspaceMode = (mode: WorkspaceMode) => {
    patchSettings({ mode });
  };

  const updateProductMode = (productMode: ProductMode) => {
    patchSettings({ productMode });

    if (getProductModeForStyleId(normalizedInput.styleId) === productMode) {
      return;
    }

    applyStyleSelection(getFallbackStyleIdForProductMode(productMode, recentStyleByProductMode[productMode]));
  };

  const updateLanguage = (nextLanguage: LocaleCode) => {
    const localeDefaults = getLocaleDefaults(nextLanguage);
    patchSettings({
      language: nextLanguage,
      temperatureUnit: localeDefaults.temperatureUnit,
      sizeUnit: localeDefaults.sizeUnit
    });
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        pan: convertPanToUnit(normalized.pan, localeDefaults.sizeUnit)
      };
    });
    setCostSettings((current) => ({
      ...defaultCostSettings(localeDefaults.currency),
      ...current,
      currency: localeDefaults.currency
    }));
    setRecipeName((current) =>
      current.trim() === "" || isAutoRecipeName(current, normalizedInput.styleId)
        ? getDefaultRecipeName(normalizedInput.styleId, nextLanguage)
        : current
    );
  };

  const updateTemperatureUnit = (nextUnit: TemperatureUnit) => {
    patchSettings({ temperatureUnit: nextUnit });
  };

  const updateSizeUnit = (nextUnit: SizeUnit) => {
    patchSettings({ sizeUnit: nextUnit });
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        pan: convertPanToUnit(normalized.pan, nextUnit)
      };
    });
  };

  const onStyleChange = (styleId: string) => {
    applyStyleSelection(styleId);
  };

  const onPresetChange = (key: FermentationPresetKey) => {
    setPreset(key);
    setFermentation(
      scheduleFromPreset(
        key,
        normalizedInput.fermentation.roomTempF,
        normalizedInput.fermentation.cellarTempF,
        normalizedInput.fermentation.fridgeTempF
      )
    );
  };

  const applyPlannerShortcut = (key: FermentationPresetKey, targetDate: Date) => {
    setPlanMode("ready-by");
    setReadyBy(toLocalDateTimeInputValue(targetDate));
    setPreset(key);
    setFermentation(
      scheduleFromPreset(
        key,
        normalizedInput.fermentation.roomTempF,
        normalizedInput.fermentation.cellarTempF,
        normalizedInput.fermentation.fridgeTempF
      )
    );
  };

  const plannerShortcuts = useMemo<PlannerShortcut[]>(() => {
    const readyByTimestamp = new Date(readyBy).getTime();

    return plannerShortcutKeys.map((key) => {
      const durationHours = getPresetDurationHours(key);
      const targetDate = addHours(plannerShortcutReference, durationHours);
      return {
        id: key,
        label: getPlannerShortcutLabel(key, t, isBreadMode),
        note: `${durationHours}h · ${formatPlannerTarget(targetDate, settings.language)}`,
        active:
          planMode === "ready-by" && preset === key && Math.abs(targetDate.getTime() - readyByTimestamp) < 60_000,
        onSelect: () => applyPlannerShortcut(key, targetDate)
      };
    });
  }, [
    normalizedInput.fermentation.cellarTempF,
    normalizedInput.fermentation.fridgeTempF,
    normalizedInput.fermentation.roomTempF,
    planMode,
    plannerShortcutKeys,
    preset,
    plannerShortcutReference,
    readyBy,
    settings.language,
    isBreadMode,
    t
  ]);

  const setBlendItem = (target: BlendTarget, index: number, patch: Partial<FlourBlendItem>) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      const updatedBlend = normalized[target].map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      );

      return {
        ...normalized,
        [target]:
          patch.percentage === undefined
            ? updatedBlend
            : rebalanceBlendPercentages(updatedBlend, index, patch.percentage)
      };
    });
  };

  const setCustomFlour = (patch: Partial<Flour>) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      const nextCustomFlour = {
        ...(normalized.customFlours?.[0] ?? createDefaultCustomFlour()),
        ...patch,
        id: CUSTOM_FLOUR_ID,
        regions: ["GLOBAL"]
      };

      return {
        ...normalized,
        customFlours: [nextCustomFlour]
      };
    });
  };

  const addCustomFlour = () => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      if (normalized.customFlours?.length) return normalized;

      return {
        ...normalized,
        customFlours: [createDefaultCustomFlour()]
      };
    });
  };

  const removeCustomFlour = () => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        customFlours: []
      };
    });
  };

  const addBlendItem = (target: BlendTarget) => {
    if (normalizedInput[target].length >= 4) return;
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      const nextBlend = [
        ...normalized[target],
        { flourId: "caputo-manitoba-oro", percentage: 0 }
      ];

      return {
        ...normalized,
        [target]: rebalanceBlendPercentages(nextBlend, nextBlend.length - 1, Math.max(10, Math.round(100 / nextBlend.length)))
      };
    });
  };

  const removeBlendItem = (target: BlendTarget, index: number) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        [target]: normalizeBlend(
          normalized[target].filter((_, itemIndex) => itemIndex !== index)
        )
      };
    });
  };

  const applyPanWeight = () => {
    const estimated = estimatePanBallWeight(normalizedInput.styleId, normalizedInput.pan);
    if (!estimated) return;
    setPartial({ doughBalls: 1, ballWeight: estimated });
  };

  const applySizePreset = (size: number) => {
    const weight = sizePreset[size];
    if (!weight) return;
    setPartial({ ballWeight: weight });
  };

  const saveRecipe = () => {
    const saved: SavedRecipe = {
      id: crypto.randomUUID(),
      name: displayRecipeName,
      createdAt: new Date().toISOString(),
      input: normalizedInput
    };
    setSavedRecipes((items) => [saved, ...items]);
  };

  const exportRecipe = () => {
    const payload = JSON.stringify({ name: displayRecipeName, input: normalizedInput, result }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${displayRecipeName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "pizza-geek-recipe"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportRecipeData = () => {
    if (typeof document === "undefined") return;

    try {
      const bundle = createPortableDataBundle(savedRecipes, bakeLog);
      const payload = serializePortableDataBundle(bundle);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = createPortableDataFileName();
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setDataTransferNotice({ tone: "success", message: t.dataExported });
    } catch {
      setDataTransferNotice({ tone: "error", message: t.dataExportError });
    }
  };

  const installApp = async () => {
    if (!installPromptEvent) return;

    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPromptEvent(null);
      setIsInstalled(true);
    }
  };

  const onRecipeDataImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const bundle = parsePortableDataBundle(await file.text());
      const importedRecipes = bundle.savedRecipes.map((recipe) => ({
        ...recipe,
        input: normalizeCalculatorInput(recipe.input)
      }));
      setSavedRecipes((items) => mergeSavedRecipes(items, importedRecipes));
      setBakeLog((items) => mergeBakeLog(items, bundle.bakeLog));
      setDataTransferNotice({
        tone: "success",
        message: getPortableDataImportMessage(settings.language, importedRecipes.length, bundle.bakeLog.length)
      });
    } catch {
      setDataTransferNotice({ tone: "error", message: t.dataImportError });
    } finally {
      event.target.value = "";
    }
  };

  const copyShareText = async () => {
    const bakeTimeUnit = getBakeDurationUnit(result.oven.unit, settings.language);
    const lines = [
      displayRecipeName,
      `${batchDescriptor}, ${result.percentages.hydration}% ${t.hydration.toLowerCase()}`,
      `${t.flour} ${result.ingredients.totalFlour}g, ${t.water} ${result.ingredients.totalWater}g, ${t.salt.toLowerCase()} ${result.ingredients.totalSalt}g, ${t.yeast.toLowerCase()} ${result.ingredients.totalYeast}g`,
      settings.language === "de"
        ? `${t.bake} ${formatTemperature(result.oven.tempF, settings.temperatureUnit)} für ${result.oven.minTime}-${result.oven.maxTime} ${bakeTimeUnit}`
        : settings.language === "it"
          ? `${t.bake} ${formatTemperature(result.oven.tempF, settings.temperatureUnit)} per ${result.oven.minTime}-${result.oven.maxTime} ${bakeTimeUnit}`
          : `${t.bake} ${formatTemperature(result.oven.tempF, settings.temperatureUnit)} for ${result.oven.minTime}-${result.oven.maxTime} ${bakeTimeUnit}`
    ];
    if (prefermentMode !== "none") {
      lines.push(`${prefermentSplitText}; ${mainDoughAdditionsText}`);
    }
    if (result.sauce) {
      lines.push(
        settings.language === "de"
          ? `${t.sauce}: ${localizedSelectedSauceOption?.name ?? result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, t)} - ${result.sauce.perPizzaGrams}g / Pizza (${result.sauce.totalGrams}g gesamt)`
          : settings.language === "it"
            ? `${t.sauce}: ${localizedSelectedSauceOption?.name ?? result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, t)} - ${result.sauce.perPizzaGrams}g / pizza (${result.sauce.totalGrams}g totali)`
            : `${t.sauce}: ${localizedSelectedSauceOption?.name ?? result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, t)} - ${result.sauce.perPizzaGrams}g / pizza (${result.sauce.totalGrams}g total)`
      );
    }
    await copyTextToClipboard(lines.join("\n"));
  };

  const copyMethodText = async () => {
    const lines = [displayRecipeName, ...methodSteps.map((step, index) => `${index + 1}. ${step}`)];
    try {
      const copied = await copyTextToClipboard(lines.join("\n"));
      setCopyMethodState(copied ? "copied" : "failed");
    } catch {
      setCopyMethodState("failed");
    }
  };

  const printRecipe = () => window.print();

  const loadSavedRecipe = (recipe: SavedRecipe) => {
    applyCalculatorInput(recipe.input, recipe.name);
  };

  const onBakePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogDraft((current) => ({
        ...current,
        photoDataUrl: String(reader.result),
        photoName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const addBakeLog = () => {
    const entry: BakeLogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      recipeName: displayRecipeName,
      rating: logDraft.rating,
      outcome: logDraft.outcome,
      notes: logDraft.notes,
      photoDataUrl: logDraft.photoDataUrl,
      photoName: logDraft.photoName
    };
    setBakeLog((items) => [entry, ...items]);
    setLogDraft({ rating: 5, outcome: "keeper", notes: "" });
  };

  return (
    <main className="appShell">
      <header className="topbar">
        <div className="brandLockup">
          <img src={BRAND_LOGO_SRC} alt="" className="brandLogo" />
          <div className="headingBlock">
            <div className="brandRow">
              <span className="brandMark">{t.brand}</span>
              <span className="versionBadge" aria-label={`Version ${APP_VERSION}`}>
                v{APP_VERSION}
              </span>
            </div>
            <h1>{t.title}</h1>
            <p>{isBreadMode ? t.subtitleBread : t.subtitle}</p>
          </div>
        </div>
        <div className="headerActions noPrint">
          <a className="ghostButton supportButton" href={BUY_ME_A_SLICE_URL} target="_blank" rel="noreferrer">
            <Coffee size={16} />
            {t.buySlice}
          </a>
          <button className="ghostButton" type="button" onClick={printRecipe}>
            <Printer size={16} />
            {t.printRecipe}
          </button>
          <button className="ghostButton" type="button" onClick={() => onStyleChange(normalizedInput.styleId)}>
            <RotateCcw size={16} />
            {isBreadMode ? t.resetProfile : t.resetStyle}
          </button>
        </div>
      </header>

      <section className="heroBand">
        <div className="heroText">
          <div className="heroEyebrowRow">
            <p className="eyebrow">{isBreadMode ? t.breadProduct : t.pizzaProduct}</p>
            <span className="heroTag">{activeStyle.origin}</span>
          </div>
          <h2>{activeStyle.name}</h2>
          <p>{activeStyle.profile}</p>
          <div className="heroMeta">
            <span>{activeStyle.flourType}</span>
            <span>
              {activeStyle.fermentationHours.recommended}h{" "}
              {settings.language === "de" ? "Zielgare" : settings.language === "it" ? "fermentazione target" : "target ferment"}
            </span>
            <span>
              {formatTemperature(result.oven.tempF, settings.temperatureUnit)}{" "}
              {settings.language === "de" ? "Backprofil" : settings.language === "it" ? "profilo cottura" : "bake profile"}
            </span>
          </div>
        </div>
        <div className="metricStrip">
          <Metric label={t.flour} value={`${result.ingredients.totalFlour}g`} />
          <Metric label={t.water} value={`${result.ingredients.totalWater}g`} />
          <Metric label={t.yeast} value={`${result.ingredients.totalYeast}g`} />
          <Metric label={t.bake} value={formatTemperature(result.oven.tempF, settings.temperatureUnit)} />
        </div>
      </section>

      <div className="workspace">
        <div className="controlStack noPrint">
          <section className="panel">
            <PanelTitle
              icon={<Globe size={18} />}
              label={t.settings}
              summary={panelSummaries.settings}
              collapsed={!openPanels.settings}
              collapseAction={
                <button
                  className={`iconButton panelToggle ${openPanels.settings ? "open" : ""}`}
                  type="button"
                  aria-label={openPanels.settings ? t.collapseSection : t.expandSection}
                  title={openPanels.settings ? t.collapseSection : t.expandSection}
                  onClick={() => togglePanel("settings")}
                >
                  <ChevronDown size={16} />
                </button>
              }
            />
            {openPanels.settings ? (
              <SettingsPanelContent
                language={settings.language}
                theme={settings.theme}
                temperatureUnit={settings.temperatureUnit}
                sizeUnit={settings.sizeUnit}
                workspaceMode={settings.mode}
                productMode={settings.productMode}
                labels={{
                  language: t.language,
                  english: t.english,
                  german: t.german,
                  italian: t.italian,
                  theme: t.theme,
                  dark: t.dark,
                  light: t.light,
                  temperatureUnit: t.temperatureUnit,
                  fahrenheit: t.fahrenheit,
                  celsius: t.celsius,
                  sizeUnit: t.sizeUnit,
                  inches: t.inches,
                  centimeters: t.centimeters,
                  workspaceMode: t.workspaceMode,
                  guidedMode: t.guidedMode,
                  studioMode: t.studioMode,
                  workspaceHint: t.workspaceHint,
                  productMode: t.productMode,
                  pizzaProduct: t.pizzaProduct,
                  breadProduct: t.breadProduct,
                  productModeHint: t.productModeHint,
                  appInstall: t.appInstall,
                  appInstallHint: t.appInstallHint,
                  installApp: t.installApp,
                  installReady: t.installReady,
                  installedApp: t.installedApp,
                  installUnavailable: t.installUnavailable,
                  offlineReady: t.offlineReady,
                  offlinePending: t.offlinePending,
                  offlineNow: t.offlineNow,
                  recipeData: t.recipeData,
                  recipeDataHint: t.recipeDataHint,
                  exportData: t.exportData,
                  importData: t.importData
                }}
                installStatus={{
                  canInstall: installPromptEvent !== null,
                  isInstalled,
                  offlineReady,
                  isOnline
                }}
                dataTransferNotice={dataTransferNotice}
                exportIcon={<Download size={16} />}
                importIcon={<Upload size={16} />}
                onLanguageChange={updateLanguage}
                onThemeChange={updateTheme}
                onTemperatureUnitChange={updateTemperatureUnit}
                onSizeUnitChange={updateSizeUnit}
                onWorkspaceModeChange={updateWorkspaceMode}
                onProductModeChange={updateProductMode}
                onInstallApp={installApp}
                onExportData={exportRecipeData}
                onImportData={onRecipeDataImport}
              />
            ) : null}
          </section>

          <section className="panel">
            <PanelTitle
              icon={<BookOpen size={18} />}
              label={isBreadMode ? t.breadProfiles : t.styles}
              summary={panelSummaries.styles}
              collapsed={!openPanels.styles}
              collapseAction={renderPanelToggle("styles")}
            />
            {openPanels.styles ? (
              isBreadMode ? (
                <BreadProfilePicker
                  hint={t.breadModeHint}
                  profiles={breadProfiles}
                  value={normalizedInput.styleId}
                  onChange={onStyleChange}
                />
              ) : (
                <StylePicker
                  groups={visibleStyleGroups}
                  guidedHint={t.guidedStylesHint}
                  mode={settings.mode}
                  styleLibraryLabel={t.styleLibrary}
                  value={normalizedInput.styleId}
                  variantsLabel={t.variants}
                  onChange={onStyleChange}
                />
              )
            ) : null}
          </section>

          <section className="panel">
            <PanelTitle
              icon={<Settings2 size={18} />}
              label={t.doughSetup}
              summary={panelSummaries.doughSetup}
              collapsed={!openPanels.doughSetup}
              collapseAction={renderPanelToggle("doughSetup")}
            />
            {openPanels.doughSetup ? (
              <>
                <div className="fieldGrid">
                  <Field
                    label={batchLabels.count}
                    value={normalizedInput.doughBalls}
                    min={1}
                    slider={doughCountSlider}
                    onChange={(value) => setPartial({ doughBalls: numberValue(value, 1) })}
                  />
                  <Field
                    label={batchLabels.weight}
                    value={normalizedInput.ballWeight}
                    suffix="g"
                    min={1}
                    slider={doughWeightSlider}
                    onChange={(value) => setPartial({ ballWeight: numberValue(value, 1) })}
                  />
                  <Field
                    label={t.hydration}
                    value={normalizedInput.hydrationPercent}
                    suffix="%"
                    min={0}
                    max={DOUGH_PERCENT_LIMITS.hydrationPercent}
                    step={0.1}
                    slider={hydrationSlider}
                    onChange={(value) => setPartial({ hydrationPercent: numberValue(value) })}
                  />
                  <Field
                    label={t.salt}
                    value={normalizedInput.saltPercent}
                    suffix="%"
                    min={0}
                    max={DOUGH_PERCENT_LIMITS.saltPercent}
                    step={0.1}
                    slider={saltSlider}
                    onChange={(value) => setPartial({ saltPercent: numberValue(value) })}
                  />
                  <Field
                    label={t.oil}
                    value={normalizedInput.oilPercent}
                    suffix="%"
                    hint={getEnrichmentHint("oil", settings.language, result)}
                    min={0}
                    max={DOUGH_PERCENT_LIMITS.oilPercent}
                    step={0.1}
                    slider={oilSlider}
                    onChange={(value) => setPartial({ oilPercent: numberValue(value) })}
                  />
                  <Field
                    label={t.sugar}
                    value={normalizedInput.sugarPercent}
                    suffix="%"
                    hint={getEnrichmentHint("sugar", settings.language, result)}
                    min={0}
                    max={DOUGH_PERCENT_LIMITS.sugarPercent}
                    step={0.1}
                    slider={sugarSlider}
                    onChange={(value) => setPartial({ sugarPercent: numberValue(value) })}
                  />
                  {!isGuidedMode ? (
                    <>
                      <Field
                        label={t.honey}
                        value={normalizedInput.honeyPercent}
                        suffix="%"
                        hint={getEnrichmentHint("honey", settings.language, result)}
                        min={0}
                        max={DOUGH_PERCENT_LIMITS.honeyPercent}
                        step={0.1}
                        onChange={(value) => setPartial({ honeyPercent: numberValue(value) })}
                      />
                      <Field
                        label={t.malt}
                        value={normalizedInput.maltPercent}
                        suffix="%"
                        hint={getEnrichmentHint("malt", settings.language, result)}
                        min={0}
                        max={DOUGH_PERCENT_LIMITS.maltPercent}
                        step={0.1}
                        onChange={(value) => setPartial({ maltPercent: numberValue(value) })}
                      />
                      <Field
                        label={t.lard}
                        value={normalizedInput.lardPercent}
                        suffix="%"
                        hint={getEnrichmentHint("lard", settings.language, result)}
                        min={0}
                        max={DOUGH_PERCENT_LIMITS.lardPercent}
                        step={0.1}
                        onChange={(value) => setPartial({ lardPercent: numberValue(value) })}
                      />
                      <Field
                        label={t.milkPowder}
                        value={normalizedInput.milkPowderPercent}
                        suffix="%"
                        hint={getEnrichmentHint("milk-powder", settings.language, result)}
                        min={0}
                        max={DOUGH_PERCENT_LIMITS.milkPowderPercent}
                        step={0.1}
                        onChange={(value) => setPartial({ milkPowderPercent: numberValue(value) })}
                      />
                    </>
                  ) : null}
                </div>
                <div className="fieldGrid compact">
                  {naturalStarterSelected ? <Notice tone="notice">{getNaturalStarterUiHint(settings.language)}</Notice> : null}
                  <SelectField
                    label={t.yeastType}
                    value={normalizedInput.yeastType}
                    onChange={(value) =>
                      setPartial({
                        yeastType: value as YeastType,
                        manualYeastPercent: value === "none" ? undefined : normalizedInput.manualYeastPercent
                      })
                    }
                  >
                    {localizedYeastOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label={t.naturalStarter}
                    value={naturalStarterChoice}
                    onChange={(value) => {
                      const nextValue = value as NaturalStarterChoice;
                      if (nextValue === "none" && !naturalStarterSelected) return;
                      setPreferment(getPrefermentPatch(nextValue));
                    }}
                  >
                    <option value="none">{t.none}</option>
                    <option value="lievito-madre">{t["lievito-madre"]}</option>
                    <option value="sauerdough">{t.sauerdough}</option>
                  </SelectField>
                  <SelectField
                    label={t.mixerType}
                    value={normalizedInput.mixerType}
                    onChange={(value) => setPartial({ mixerType: value as CalculatorInput["mixerType"] })}
                  >
                    <option value="hand">Hand</option>
                    <option value="planetary">Planetary</option>
                    <option value="spiral">Spiral</option>
                  </SelectField>
                  {(!isGuidedMode || naturalStarterSelected) && normalizedInput.yeastType !== "none" ? (
                    <>
                      <Field
                        label={t.manualYeast}
                        value={normalizedInput.manualYeastPercent ?? ""}
                        suffix="%"
                        step={0.01}
                        onChange={(value) =>
                          setPartial({ manualYeastPercent: value === "" ? undefined : numberValue(value) })
                        }
                      />
                      <Field
                        label={t.flourTemp}
                        value={displayTemperatureValue(
                          normalizedInput.flourTempF ?? normalizedInput.fermentation.roomTempF,
                          settings.temperatureUnit
                        )}
                        suffix={`\u00B0${settings.temperatureUnit}`}
                        onChange={(value) =>
                          setPartial({
                            flourTempF: parseTemperatureInput(
                              value,
                              settings.temperatureUnit,
                              normalizedInput.fermentation.roomTempF
                            )
                          })
                        }
                      />
                    </>
                  ) : null}
                </div>
                {doughSetupNotices.length ? (
                  <div className="noticeStack">
                    {doughSetupNotices.map((notice) => (
                      <Notice key={`${notice.tone}-${notice.message}`} tone={notice.tone}>
                        {notice.message}
                      </Notice>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </section>

          <section className="panel">
            <PanelTitle
              icon={<CalendarClock size={18} />}
              label={t.fermentation}
              summary={panelSummaries.fermentation}
              collapsed={!openPanels.fermentation}
              collapseAction={renderPanelToggle("fermentation")}
            />
            {openPanels.fermentation ? (
              <FermentationPanelContent
                locale={settings.language}
                temperatureUnit={settings.temperatureUnit}
                presetKeys={presetKeys}
                preset={preset}
                totalFermentationHours={result.totalFermentationHours}
                showFermentationDetails={showFermentationDetails}
                fermentation={normalizedInput.fermentation}
                labels={{
                  totalTime: t.totalTime,
                  advancedSchedule: t.advancedSchedule,
                  roomTemp: t.roomTemp,
                  cellarTemp: t.cellarTemp,
                  fridgeTemp: t.fridgeTemp,
                  roomHumidity: t.roomHumidity,
                  cellarHumidity: t.cellarHumidity,
                  fridgeHumidity: t.fridgeHumidity
                }}
                onPresetChange={onPresetChange}
                onToggleDetails={() => setShowFermentationDetails((current) => !current)}
                onFermentationChange={setFermentation}
                getPresetLabel={(key) => getPresetLabel(key, settings.language)}
              />
            ) : null}
          </section>

          {!isGuidedMode ? (
            <section className="panel">
              <PanelTitle
                icon={<FlaskConical size={18} />}
                label={t.doughStudio}
                summary={panelSummaries.doughStudio}
                collapsed={!openPanels.doughStudio}
                collapseAction={renderPanelToggle("doughStudio")}
              />
              {openPanels.doughStudio ? (
                <>
                  <div className="fieldGrid compact">
                    <SelectField
                      label={t.prefermentMode}
                      value={prefermentMode}
                      onChange={(value) => setPreferment(getPrefermentPatch(value as PrefermentMode))}
                    >
                      <option value="none">{t.none}</option>
                      <option value="poolish">{t.poolish}</option>
                      <option value="biga">{t.biga}</option>
                      <option value="tiga">{t.tiga}</option>
                      <option value="lievito-madre">{t["lievito-madre"]}</option>
                      <option value="sauerdough">{t.sauerdough}</option>
                    </SelectField>
                    <Toggle
                      checked={normalizedInput.flourBlendEnabled}
                      label={t.flourBlend}
                      hint={result.flourBlend.description}
                      onChange={(checked) => setPartial({ flourBlendEnabled: checked })}
                    />
                  </div>
                  <p className="sectionMeta fieldMeta">{t.prefermentHint}</p>

                  {prefermentMode !== "none" ? (
                    <div className="fieldGrid">
                      <Field
                        label={`${t.prefermentFlour} (${prefermentFlourGrams}g)`}
                        value={normalizedInput.preferment.flourPercent}
                        suffix="%"
                        min={0}
                        max={100}
                        onChange={(value) => setPreferment({ flourPercent: numberValue(value, 30) })}
                      />
                      <Field
                        label={t.bigaHydration}
                        value={normalizedInput.preferment.bigaHydration}
                        suffix="%"
                        onChange={(value) => setPreferment({ bigaHydration: numberValue(value, 55) })}
                      />
                      {naturalStarterSelected ? (
                        <Field
                          label={t.starterInoculation}
                          value={normalizedInput.preferment.starterInoculationPercent}
                          suffix="%"
                          min={1}
                          max={100}
                          onChange={(value) =>
                            setPreferment({
                              starterInoculationPercent: numberValue(
                                value,
                                getDefaultStarterInoculationPercent(prefermentMode)
                              )
                            })
                          }
                        />
                      ) : null}
                      <Field
                        label={t.prefermentRoom}
                        value={normalizedInput.preferment.roomHours}
                        suffix="h"
                        onChange={(value) => setPreferment({ roomHours: numberValue(value, 12) })}
                      />
                      <Field
                        label={t.prefermentCold}
                        value={normalizedInput.preferment.coldHours}
                        suffix="h"
                        onChange={(value) => setPreferment({ coldHours: numberValue(value) })}
                      />
                      <p className="sectionMeta fieldMeta">
                        {normalizedInput.preferment.flourPercent}% = {prefermentFlourGrams}g {t.flour.toLowerCase()} {t.inPreferment}
                      </p>
                      <p className="sectionMeta fieldMeta">{mainDoughAdditionsText}</p>
                    </div>
                  ) : null}

                  {normalizedInput.flourBlendEnabled ? (
                    <div className="blendList">
                      <label className="field single">
                        <span>{t.filterFlours}</span>
                        <input
                          type="search"
                          value={flourFilter}
                          placeholder={t.filterFloursPlaceholder}
                          onChange={(event) => setFlourFilter(event.target.value)}
                        />
                      </label>
                      <div className="blendFilterToggles">
                        <Toggle
                          checked={flourRegionFilter === "US"}
                          label={t.usFloursOnly}
                          onChange={(checked) => setFlourRegionFilter(checked ? "US" : "all")}
                        />
                        <Toggle
                          checked={flourRegionFilter === "EU"}
                          label={t.euFloursOnly}
                          onChange={(checked) => setFlourRegionFilter(checked ? "EU" : "all")}
                        />
                      </div>
                      {(flourFilter.trim() !== "" || flourRegionFilter !== "all") && filteredFlourOptions.length === 0 ? (
                        <p className="sectionMeta fieldMeta">{t.flourFilterEmpty}</p>
                      ) : null}
                      <div className="customFlourCard">
                        <div className="panelMetaRow">
                          <strong>{t.customFlour}</strong>
                          {customFlour ? (
                            <button className="ghostButton" type="button" onClick={removeCustomFlour}>
                              {t.removeCustomFlour}
                            </button>
                          ) : (
                            <button className="ghostButton" type="button" onClick={addCustomFlour}>
                              {t.addCustomFlour}
                            </button>
                          )}
                        </div>
                        <p className="sectionMeta fieldMeta">{t.customFlourHint}</p>
                        {customFlour ? (
                          <div className="customFlourGrid">
                            <label className="field single">
                              <span>{t.customFlourBrand}</span>
                              <input
                                type="text"
                                value={customFlour.brand}
                                onChange={(event) => setCustomFlour({ brand: event.target.value })}
                              />
                            </label>
                            <label className="field single">
                              <span>{t.customFlourName}</span>
                              <input
                                type="text"
                                value={customFlour.name}
                                onChange={(event) => setCustomFlour({ name: event.target.value })}
                              />
                            </label>
                            <label className="field">
                              <span>{t.customFlourType}</span>
                              <select
                                value={customFlour.type}
                                onChange={(event) => setCustomFlour({ type: event.target.value as Flour["type"] })}
                              >
                                <option value="tipo00">Tipo 00</option>
                                <option value="tipo0">Tipo 0</option>
                                <option value="bread">Bread</option>
                                <option value="high-gluten">High gluten</option>
                                <option value="all-purpose">All-purpose</option>
                                <option value="manitoba">Manitoba</option>
                                <option value="whole-grain">Whole grain</option>
                              </select>
                            </label>
                            <Field
                              label={t.customFlourProtein}
                              value={customFlour.proteinPercent}
                              suffix="%"
                              step={0.1}
                              min={0}
                              onChange={(value) => setCustomFlour({ proteinPercent: numberValue(value, 12) })}
                            />
                            <label className="field single">
                              <span>{t.customFlourWStrength}</span>
                              <input
                                type="text"
                                value={customFlour.wStrength ?? ""}
                                placeholder="W300"
                                onChange={(event) => setCustomFlour({ wStrength: event.target.value || undefined })}
                              />
                            </label>
                            <Field
                              label={t.customFlourAbsorption}
                              value={customFlour.absorptionAdjustment}
                              step={0.1}
                              min={-10}
                              max={10}
                              onChange={(value) => setCustomFlour({ absorptionAdjustment: numberValue(value) })}
                            />
                          </div>
                        ) : null}
                      </div>
                      {prefermentMode !== "none" ? (
                        <>
                          <div className="panelMetaRow">
                            <strong>{prefermentName}</strong>
                            <span className="sectionMeta">
                              {t.blendTotal}: {prefermentBlendTotal}% · {prefermentFlourGrams}g
                            </span>
                          </div>
                          {normalizedInput.prefermentFlourBlend.map((item, index) => {
                            const breakdown = prefermentBlendBreakdown[index];
                            const flourSelectLabel = `${prefermentName} ${t.flour.toLowerCase()} ${index + 1}`;
                            const flourPercentLabel = `${prefermentName} ${t.flourBlend.toLowerCase()} % ${index + 1}`;

                            return (
                              <div className="blendRow" key={`preferment-${item.flourId}-${index}`}>
                                <select
                                  aria-label={flourSelectLabel}
                                  title={flourSelectLabel}
                                  value={item.flourId}
                                  onChange={(event) => setBlendItem("prefermentFlourBlend", index, { flourId: event.target.value })}
                                >
                                  {getVisibleFlours(
                                    availableFlours,
                                    filteredFlourOptions,
                                    item.flourId,
                                    flourFilter,
                                    flourRegionFilter
                                  ).map((flour) => (
                                    <option key={flour.id} value={flour.id}>
                                      {flour.brand} {flour.name}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  aria-label={flourPercentLabel}
                                  title={flourPercentLabel}
                                  type="number"
                                  value={item.percentage}
                                  min={0}
                                  max={100}
                                  onChange={(event) =>
                                    setBlendItem("prefermentFlourBlend", index, { percentage: numberValue(event.target.value) })
                                  }
                                />
                                <button
                                  className="iconButton"
                                  type="button"
                                  onClick={() => removeBlendItem("prefermentFlourBlend", index)}
                                  aria-label="Remove flour"
                                >
                                  x
                                </button>
                                {breakdown ? <p className="sectionMeta blendMeta">{breakdown.grams}g {t.inPreferment}</p> : null}
                              </div>
                            );
                          })}
                          <button className="ghostButton" type="button" onClick={() => addBlendItem("prefermentFlourBlend")}>
                            {t.addFlour}
                          </button>
                        </>
                      ) : null}

                      <div className="panelMetaRow">
                        <strong>{prefermentMode === "none" ? t.flourBlend : t.mainDoughAdditions}</strong>
                        <span className="sectionMeta">
                          {t.blendTotal}: {mainDoughBlendTotal}% · {prefermentMode === "none" ? result.ingredients.totalFlour : mainDoughFlourGrams}g
                        </span>
                      </div>
                      {normalizedInput.mainDoughFlourBlend.map((item, index) => {
                        const breakdown = mainDoughBlendBreakdown[index];
                        const flourSelectLabel = `${t.mainDoughAdditions} ${t.flour.toLowerCase()} ${index + 1}`;
                        const flourPercentLabel = `${t.mainDoughAdditions} ${t.flourBlend.toLowerCase()} % ${index + 1}`;

                        return (
                          <div className="blendRow" key={`main-${item.flourId}-${index}`}>
                            <select
                              aria-label={flourSelectLabel}
                              title={flourSelectLabel}
                              value={item.flourId}
                              onChange={(event) => setBlendItem("mainDoughFlourBlend", index, { flourId: event.target.value })}
                            >
                              {getVisibleFlours(
                                availableFlours,
                                filteredFlourOptions,
                                item.flourId,
                                flourFilter,
                                flourRegionFilter
                              ).map((flour) => (
                                <option key={flour.id} value={flour.id}>
                                  {flour.brand} {flour.name}
                                </option>
                              ))}
                            </select>
                            <input
                              aria-label={flourPercentLabel}
                              title={flourPercentLabel}
                              type="number"
                              value={item.percentage}
                              min={0}
                              max={100}
                              onChange={(event) =>
                                setBlendItem("mainDoughFlourBlend", index, { percentage: numberValue(event.target.value) })
                              }
                            />
                            <button
                              className="iconButton"
                              type="button"
                              onClick={() => removeBlendItem("mainDoughFlourBlend", index)}
                              aria-label="Remove flour"
                            >
                              x
                            </button>
                            {breakdown ? (
                              <p className="sectionMeta blendMeta">
                                {breakdown.grams}g {prefermentMode === "none" ? t.totalLabel : t.mainDoughAdditions.toLowerCase()}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                      <button className="ghostButton" type="button" onClick={() => addBlendItem("mainDoughFlourBlend")}>
                        {t.addFlour}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : null}

          {!isBreadMode ? (
            <section className="panel">
            <PanelTitle
              icon={<BookOpen size={18} />}
              label={t.sauce}
              summary={panelSummaries.sauce}
              collapsed={!openPanels.sauce}
              collapseAction={renderPanelToggle("sauce")}
            />
            {openPanels.sauce ? (
              <>
                <div className="fieldGrid compact">
                  <Toggle
                    checked={normalizedInput.sauce.enabled}
                    label={t.sauce}
                    hint={t.sauceHint}
                    onChange={(checked) => setSauce({ enabled: checked })}
                  />
                </div>
                {normalizedInput.sauce.enabled ? (
                  <>
                    <div className="fieldGrid compact">
                      <Field
                        label={t.sauceWeight}
                        value={normalizedInput.sauce.gramsPerPizza}
                        suffix="g"
                        step={5}
                        min={0}
                        slider={createMobileSlider(0, 180, 5)}
                        onChange={(value) => setSauce({ gramsPerPizza: numberValue(value, 90) })}
                      />
                      {!selectedSauceCollection ? (
                        <SelectField
                          label={t.sauceStyle}
                          value={normalizedInput.sauce.style}
                          onChange={(value) => setSauce({ style: value as CalculatorInput["sauce"]["style"] })}
                        >
                          <option value="classic">{t.sauceClassic}</option>
                          <option value="raw">{t.sauceRaw}</option>
                          <option value="cooked">{t.sauceCooked}</option>
                          <option value="white">{t.sauceWhite}</option>
                        </SelectField>
                      ) : null}
                    </div>
                    {selectedSauceCollection ? (
                      <>
                        <Notice tone="notice">
                          {localizeSauceSaltWarning(selectedSauceCollection.saltWarning ?? SAUCE_SALT_WARNING, settings.language)}
                        </Notice>
                        <div className="sauceOptionGrid">
                          {localizedSauceOptions.map((option) => (
                            <button
                              className={localizedSelectedSauceOption?.id === option.id ? "sauceOptionCard active" : "sauceOptionCard"}
                              key={option.id}
                              type="button"
                              onClick={() =>
                                setSauce({
                                  recipeId: option.id,
                                  style: inferSauceStyleFromOption(option)
                                })
                              }
                            >
                              <strong>{option.name}</strong>
                              {option.description ? <span>{option.description}</span> : null}
                              <small>{option.cookType}</small>
                            </button>
                          ))}
                        </div>
                        {localizedSelectedSauceOption ? (
                          <>
                            <div className="panelMetaRow">
                              <span className="sectionMeta">
                                {localizedSelectedSauceOption.name} · {normalizedInput.sauce.gramsPerPizza}g / {getPerPizzaLabel(settings.language)}
                              </span>
                              <button
                                className={`subtleDisclosure ${showSauceRecipe ? "open" : ""}`}
                                type="button"
                                onClick={() => setShowSauceRecipe((current) => !current)}
                              >
                                <span>{t.sauceRecipeDetails}</span>
                                <ChevronDown size={16} />
                              </button>
                            </div>
                            {showSauceRecipe ? (
                              <div className="sauceDetailCard">
                                <div className="sauceDetailHeader">
                                  <div>
                                    <strong>{localizedSelectedSauceOption.name}</strong>
                                    {localizedSelectedSauceOption.description ? <span>{localizedSelectedSauceOption.description}</span> : null}
                                  </div>
                                  <div className="sauceMeta">
                                    {localizedSelectedSauceOption.source ? (
                                      <span>
                                        {sauceUi.source}: {localizedSelectedSauceOption.source}
                                      </span>
                                    ) : null}
                                    {localizedSelectedSauceOption.yield ? (
                                      <span>
                                        {sauceUi.yield}: {localizedSelectedSauceOption.yield}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="sauceDetailGrid">
                                  <div className="sauceDetailBlock">
                                    <h4>{sauceUi.ingredients}</h4>
                                    <ul className="detailList">
                                      {localizedSelectedSauceOption.ingredients.map((ingredient) => (
                                        <li key={`${localizedSelectedSauceOption.id}-${ingredient.item}`}>
                                          <strong>{ingredient.item}</strong>
                                          <span>
                                            {ingredient.amount}
                                            {ingredient.note ? ` - ${ingredient.note}` : ""}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="sauceDetailBlock">
                                    <h4>{sauceUi.instructions}</h4>
                                    <ol className="detailList ordered">
                                      {localizedSelectedSauceOption.instructions.map((instruction) => (
                                        <li key={`${localizedSelectedSauceOption.id}-${instruction}`}>{instruction}</li>
                                      ))}
                                    </ol>
                                  </div>
                                </div>
                                {localizedSelectedSauceOption.proTip ? (
                                  <Notice tone="ok">
                                    <strong>{sauceUi.proTip}:</strong> {localizedSelectedSauceOption.proTip}
                                  </Notice>
                                ) : null}
                              </div>
                            ) : null}
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
            </section>
          ) : null}

          <section className="panel">
            <PanelTitle
              icon={<Wheat size={18} />}
              label={t.bakeSurface}
              collapsed={!openPanels.bakeSurface}
              collapseAction={renderPanelToggle("bakeSurface")}
            />
            {openPanels.bakeSurface ? (
              usesPanGeometry ? (
                <div className="fieldGrid">
                  <SelectField
                    label={t.shape}
                    value={normalizedInput.pan.shape}
                    onChange={(value) => setPan({ shape: value as CalculatorInput["pan"]["shape"] })}
                  >
                    <option value="rectangular">{t.rectangular}</option>
                    <option value="round">{t.round}</option>
                  </SelectField>
                  {normalizedInput.pan.shape === "round" ? (
                    <Field
                      label={`${t.diameter} (${settings.sizeUnit === "in" ? t.inches : t.centimeters})`}
                      value={normalizedInput.pan.diameter}
                      suffix={getLengthSuffix(settings.sizeUnit)}
                      onChange={(value) => setPan({ diameter: numberValue(value, 12) })}
                    />
                  ) : (
                    <>
                      <Field
                        label={`${t.length} (${settings.sizeUnit === "in" ? t.inches : t.centimeters})`}
                        value={normalizedInput.pan.length}
                        suffix={getLengthSuffix(settings.sizeUnit)}
                        onChange={(value) => setPan({ length: numberValue(value, 10) })}
                      />
                      <Field
                        label={`${t.width} (${settings.sizeUnit === "in" ? t.inches : t.centimeters})`}
                        value={normalizedInput.pan.width}
                        suffix={getLengthSuffix(settings.sizeUnit)}
                        onChange={(value) => setPan({ width: numberValue(value, 14) })}
                      />
                    </>
                  )}
                  <Field
                    label={`${t.depth} (${settings.sizeUnit === "in" ? t.inches : t.centimeters})`}
                    value={normalizedInput.pan.depth}
                    suffix={getLengthSuffix(settings.sizeUnit)}
                    step={0.5}
                    onChange={(value) => setPan({ depth: numberValue(value, 2) })}
                  />
                  <button className="actionButton alignEnd" type="button" onClick={applyPanWeight}>
                    {t.applyPanWeight}
                  </button>
                  {tinLoaf ? <Notice tone="notice">{t.tinLoafHint}</Notice> : null}
                </div>
              ) : loafWorkflow ? (
                <div className="sizePanel">
                  <p>{t.freeformLoafHint}</p>
                  <Notice tone="notice">{formatBakeWindow(result.oven, settings.language, settings.temperatureUnit, ovenDetail)}</Notice>
                </div>
              ) : (
                <div className="sizePanel">
                  <p>{t.sizeHint}</p>
                  <div className="presetScroller">
                    {sizePresetEntries.map((entry) => (
                      <button
                        className="chip"
                        key={entry.sizeInches}
                        type="button"
                        onClick={() => applySizePreset(entry.sizeInches)}
                      >
                        {entry.label} = {entry.weight}g
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : null}
          </section>

          <section className="panel">
            <PanelTitle
              icon={<Flame size={18} />}
              label={t.ovenProfile}
              collapsed={!openPanels.ovenProfile}
              collapseAction={renderPanelToggle("ovenProfile")}
            />
            {openPanels.ovenProfile ? (
              <>
                <Segmented value={normalizedInput.oven.type} options={ovenOptions} onChange={(value) => setOven({ type: value })} />
                <div className="fieldGrid">
                  {normalizedInput.oven.type === "pizza-oven" ? (
                    <>
                      <Field
                        label={t.stoneTemp}
                        value={displayTemperatureValue(normalizedInput.oven.pizzaOvenStoneTempF, settings.temperatureUnit)}
                        suffix={`\u00B0${settings.temperatureUnit}`}
                        onChange={(value) =>
                          setOven({
                            pizzaOvenStoneTempF: parseTemperatureInput(
                              value,
                              settings.temperatureUnit,
                              normalizedInput.oven.pizzaOvenStoneTempF
                            )
                          })
                        }
                      />
                      <Field
                        label={t.topHeat}
                        value={displayTemperatureValue(normalizedInput.oven.pizzaOvenTopTempF, settings.temperatureUnit)}
                        suffix={`\u00B0${settings.temperatureUnit}`}
                        onChange={(value) =>
                          setOven({
                            pizzaOvenTopTempF: parseTemperatureInput(
                              value,
                              settings.temperatureUnit,
                              normalizedInput.oven.pizzaOvenTopTempF
                            )
                          })
                        }
                      />
                    </>
                  ) : null}
                  {normalizedInput.oven.type === "deck-oven" ? (
                    <Field
                      label={t.deckTemp}
                      value={displayTemperatureValue(normalizedInput.oven.deckOvenTempF, settings.temperatureUnit)}
                      suffix={`\u00B0${settings.temperatureUnit}`}
                      onChange={(value) =>
                        setOven({
                          deckOvenTempF: parseTemperatureInput(
                            value,
                            settings.temperatureUnit,
                            normalizedInput.oven.deckOvenTempF
                          )
                        })
                      }
                    />
                  ) : null}
                  {normalizedInput.oven.type === "steel-stone" ? (
                    <Toggle
                      checked={normalizedInput.oven.useBroilerMethod}
                      label={t.broilerFinish}
                      onChange={(checked) => setOven({ useBroilerMethod: checked })}
                    />
                  ) : null}
                  {normalizedInput.oven.type === "conventional" ? (
                    <Toggle
                      checked={normalizedInput.oven.useFinishingBroil}
                      label={t.finishingBroil}
                      onChange={(checked) => setOven({ useFinishingBroil: checked })}
                    />
                  ) : null}
                </div>
              </>
            ) : null}
          </section>

          <section className="panel">
            <PanelTitle
              icon={<CalendarClock size={18} />}
              label={t.planner}
              summary={panelSummaries.planner}
              collapsed={!openPanels.planner}
              collapseAction={
                <button
                  className={`iconButton panelToggle ${openPanels.planner ? "open" : ""}`}
                  type="button"
                  aria-label={openPanels.planner ? t.collapseSection : t.expandSection}
                  title={openPanels.planner ? t.collapseSection : t.expandSection}
                  onClick={() => togglePanel("planner")}
                >
                  <ChevronDown size={16} />
                </button>
              }
            />
            {openPanels.planner ? (
              <PlannerPanelContent
                bakeLabel={t.bake}
                currentStageLabel={plannerPanelLabels.currentStageLabel}
                nextStageLabel={plannerPanelLabels.nextStageLabel}
                noCurrentStageLabel={plannerPanelLabels.noCurrentStageLabel}
                noNextStageLabel={plannerPanelLabels.noNextStageLabel}
                noteAddLabel={plannerPanelLabels.noteAddLabel}
                noteHideLabel={plannerPanelLabels.noteHideLabel}
                noteLabel={plannerPanelLabels.noteLabel}
                notePlaceholder={plannerPanelLabels.notePlaceholder}
                noteShowLabel={plannerPanelLabels.noteShowLabel}
                planMode={planMode}
                prefermentWindowLabel={plannerPanelLabels.prefermentWindowLabel}
                processHint={plannerPanelLabels.processHint}
                processLabel={plannerPanelLabels.processLabel}
                readyByLabel={t.readyBy}
                readyByValue={readyBy}
                readyDateLabel={t.readyDate}
                readyNowLabel={t.today}
                clearStepStateLabel={plannerPanelLabels.clearStepStateLabel}
                markDoneLabel={plannerPanelLabels.markDoneLabel}
                quickScheduleLabel={t.quickSchedule}
                quickScheduleHint={isBreadMode ? t.breadQuickScheduleHint : t.quickScheduleHint}
                skipStepLabel={plannerPanelLabels.skipStepLabel}
                startLabel={t.startAt}
                startValue={planStartValue}
                bakeValue={planBakeValue}
                shortcuts={plannerShortcuts}
                timeline={timelineItems}
                onTimelineNoteChange={handleTimelineNoteChange}
                onTimelineStepProgressChange={handleTimelineStepProgressChange}
                onPlanModeChange={setPlanMode}
                onReadyByChange={setReadyBy}
              />
            ) : null}
          </section>
        </div>

        <aside className="resultStack">
          <section className="panel recipeCard">
            <PanelTitle
              icon={<Wheat size={18} />}
              label={t.formula}
              summary={panelSummaries.formula}
              collapsed={!openPanels.formula}
              collapseAction={renderPanelToggle("formula")}
            />
            {openPanels.formula ? (
              <RecipeSheetPanelContent
                origin={activeStyle.origin}
                title={displayRecipeName}
                flourType={activeStyle.flourType}
                labels={{
                  copy: t.copy,
                  export: t.export,
                  print: t.print
                }}
                ingredients={[
                  { label: t.flour, value: `${result.ingredients.totalFlour}g`, pct: "100%" },
                  {
                    label: t.water,
                    value: `${result.ingredients.totalWater}g`,
                    pct: `${result.percentages.hydration}%`,
                    status: styleRange(result, "hydration", normalizedInput.hydrationPercent)
                  },
                  {
                    label: t.salt,
                    value: `${result.ingredients.totalSalt}g`,
                    pct: `${result.percentages.salt}%`,
                    status: styleRange(result, "salt", normalizedInput.saltPercent)
                  },
                  { label: t.yeast, value: `${result.ingredients.totalYeast}g`, pct: `${result.percentages.yeast}%` },
                  ...(result.ingredients.totalOil > 0
                    ? [{
                        label: t.oil,
                        value: `${result.ingredients.totalOil}g`,
                        pct: `${result.percentages.oil}%`,
                        status: styleRange(result, "oil", normalizedInput.oilPercent)
                      }]
                    : []),
                  ...(result.ingredients.totalSugar > 0
                    ? [{
                        label: t.sugar,
                        value: `${result.ingredients.totalSugar}g`,
                        pct: `${result.percentages.sugar}%`,
                        status: styleRange(result, "sugar", normalizedInput.sugarPercent)
                      }]
                    : []),
                  ...(result.ingredients.totalHoney > 0 ? [{ label: t.honey, value: `${result.ingredients.totalHoney}g`, pct: `${result.percentages.honey}%` }] : []),
                  ...(result.ingredients.totalMalt > 0 ? [{ label: t.malt, value: `${result.ingredients.totalMalt}g`, pct: `${result.percentages.malt}%` }] : []),
                  ...(result.ingredients.totalLard > 0 ? [{ label: t.lard, value: `${result.ingredients.totalLard}g`, pct: `${result.percentages.lard}%` }] : []),
                  ...(result.ingredients.totalMilkPowder > 0
                    ? [{ label: t.milkPowder, value: `${result.ingredients.totalMilkPowder}g`, pct: `${result.percentages.milkPowder}%` }]
                    : [])
                ]}
                metrics={[
                  { label: batchLabels.count, value: `${normalizedInput.doughBalls}` },
                  { label: batchLabels.weight, value: `${normalizedInput.ballWeight}g` },
                  { label: t.waterTemp, value: formatTemperature(result.waterTemperature.waterTempF, settings.temperatureUnit) },
                  { label: t.bake, value: formatTemperature(result.oven.tempF, settings.temperatureUnit) }
                ]}
                waterSummary={{
                  title: waterSummary.title,
                  useText: waterSummary.useText,
                  targetText: waterSummary.targetText,
                  noteText: result.waterTemperature.note ? localizeWaterMessage(result.waterTemperature.note, settings.language) : undefined
                }}
                prefermentSummary={
                  prefermentMode !== "none"
                    ? {
                        title: t.prefermentSplit,
                        lines: [prefermentSplitText, mainDoughAdditionsText]
                      }
                    : undefined
                }
                flourBlendSummary={
                  normalizedInput.flourBlendEnabled
                    ? {
                        title: t.flourBlend,
                        lines: blendBreakdown.map(
                          (item) =>
                            `${item.flourLabel}: ${item.totalGrams}g ${t.totalLabel}${
                              prefermentMode !== "none"
                                ? `, ${item.prefermentGrams}g ${prefermentName}, ${item.mainDoughGrams}g ${t.mainDoughAdditions.toLowerCase()}`
                                : ""
                            }`
                        )
                      }
                    : undefined
                }
                sauceSummary={
                  result.sauce
                    ? {
                        title: t.sauce,
                        lines: [
                          `${localizedSelectedSauceOption?.name ?? result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, t)}: ${result.sauce.perPizzaGrams}g / ${getPerPizzaLabel(settings.language)}`,
                          settings.language === "de"
                            ? `${result.sauce.totalGrams}g gesamt für den Batch`
                            : settings.language === "it"
                              ? `${result.sauce.totalGrams}g totali per il batch`
                              : `${result.sauce.totalGrams}g total for the batch`,
                          ...(localizedSelectedSauceOption?.source ? [`${sauceUi.source}: ${localizedSelectedSauceOption.source}`] : [])
                        ]
                      }
                    : undefined
                }
                onCopy={copyShareText}
                onExport={exportRecipe}
                onPrint={printRecipe}
              />
            ) : null}
          </section>

          <section className="panel printHide">
            <PanelTitle
              icon={<Gauge size={18} />}
              label={t.recipeHealth}
              summary={panelSummaries.quality}
              collapsed={!openPanels.quality}
              collapseAction={
                <button
                  className={`iconButton panelToggle ${openPanels.quality ? "open" : ""}`}
                  type="button"
                  aria-label={openPanels.quality ? t.collapseSection : t.expandSection}
                  title={openPanels.quality ? t.collapseSection : t.expandSection}
                  onClick={() => togglePanel("quality")}
                >
                  <ChevronDown size={16} />
                </button>
              }
            />
            {openPanels.quality ? (
              <div className="signalList">
                {qualitySignals.map((signal) => (
                  <SignalRow key={signal.label} signal={signal} />
                ))}
              </div>
            ) : null}
          </section>

          <section className="panel">
            <PanelTitle
              icon={<AlertCircle size={18} />}
              label={t.guidance}
              summary={panelSummaries.guidance}
              collapsed={!openPanels.guidance}
              collapseAction={renderPanelToggle("guidance")}
            />
            {openPanels.guidance ? (
              <>
                <div className="guidanceGrid">
                  <Metric label={t.effectiveFerment} value={`${result.effectiveFermentationHours}h`} />
                  <Metric label={t.totalTime} value={`${result.totalFermentationHours}h`} />
                  <Metric label={t.waterTemp} value={formatTemperature(result.waterTemperature.waterTempF, settings.temperatureUnit)} />
                  <Metric label={t.targetFdt} value={formatTemperature(result.waterTemperature.targetFdtF, settings.temperatureUnit)} />
                  <Metric label={t.bake} value={formatTemperature(result.oven.tempF, settings.temperatureUnit)} />
                  <Metric
                    label={t.bakeTime}
                    value={`${result.oven.minTime}-${result.oven.maxTime} ${getBakeDurationUnit(result.oven.unit, settings.language)}`}
                  />
                </div>
                {ovenDetail ? <Notice tone="notice">{ovenDetail}</Notice> : null}
                {result.waterTemperature.warning ? (
                  <Notice tone="warning">{localizeWaterMessage(result.waterTemperature.warning, settings.language)}</Notice>
                ) : null}
                {result.waterTemperature.note ? (
                  <Notice tone="notice">{localizeWaterMessage(result.waterTemperature.note, settings.language)}</Notice>
                ) : null}
                {result.flourBlend.warning ? <Notice tone={result.flourBlend.warningColor}>{result.flourBlend.warning}</Notice> : null}
                {result.pan ? (
                  <Notice tone="notice">
                    {t.panGeometry}: {formatArea(result.pan.areaSqIn, settings.sizeUnit)}, {t.depth.toLowerCase()} {normalizedInput.pan.depth}{getLengthSuffix(settings.sizeUnit)}
                  </Notice>
                ) : null}
              </>
            ) : null}
          </section>

          <section className="panel">
            <PanelTitle
              icon={<FlaskConical size={18} />}
              label={t.method}
              summary={panelSummaries.method}
              collapsed={!openPanels.method}
              action={
                <button
                  className={`ghostButton ${copyMethodState === "copied" ? "successState" : copyMethodState === "failed" ? "errorState" : ""}`}
                  type="button"
                  onClick={copyMethodText}
                >
                  {copyMethodState === "copied" ? (
                    <Check size={16} />
                  ) : copyMethodState === "failed" ? (
                    <AlertCircle size={16} />
                  ) : (
                    <CopyIcon size={16} />
                  )}
                  {copyMethodState === "copied"
                    ? sauceUi.copyMethodCopied
                    : copyMethodState === "failed"
                      ? sauceUi.copyMethodFailed
                      : sauceUi.copyMethod}
                </button>
              }
              collapseAction={renderPanelToggle("method")}
            />
            {openPanels.method ? (
              <ol className="methodList">
                {methodSteps.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
            ) : null}
          </section>

          {!isGuidedMode ? (
            <>
              <section className="panel noPrint">
                <PanelTitle
                  icon={<Calculator size={18} />}
                  label={t.cost}
                  summary={panelSummaries.cost}
                  collapsed={!openPanels.cost}
                  collapseAction={
                    <button
                      className={`iconButton panelToggle ${openPanels.cost ? "open" : ""}`}
                      type="button"
                      aria-label={openPanels.cost ? t.collapseSection : t.expandSection}
                      title={openPanels.cost ? t.collapseSection : t.expandSection}
                      onClick={() => togglePanel("cost")}
                    >
                      <ChevronDown size={16} />
                    </button>
                  }
                />
                {openPanels.cost ? (
                  <>
                    <div className="fieldGrid">
                      <Field
                        label={t.flourCost}
                        value={resolvedCostSettings.flourPerKg}
                        step={0.1}
                        onChange={(value) => setCostSettings((current) => ({ ...current, flourPerKg: numberValue(value) }))}
                      />
                      <Field
                        label={t.yeastCost}
                        value={resolvedCostSettings.yeastPerKg}
                        step={0.1}
                        onChange={(value) => setCostSettings((current) => ({ ...current, yeastPerKg: numberValue(value) }))}
                      />
                      <Field
                        label={t.oilCost}
                        value={resolvedCostSettings.oilPerKg}
                        step={0.1}
                        onChange={(value) => setCostSettings((current) => ({ ...current, oilPerKg: numberValue(value) }))}
                      />
                      <SelectField
                        label={t.currency}
                        value={resolvedCostSettings.currency}
                        onChange={(value) => setCostSettings((current) => ({ ...current, currency: value }))}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                      </SelectField>
                    </div>
                    <div className="costTotal">
                      <span>{t.batch}</span>
                      <strong>{formatMoney(cost.total, cost.currency, settings.language)}</strong>
                      <span>{batchLabels.perUnit}</span>
                      <strong>{formatMoney(cost.perBall, cost.currency, settings.language)}</strong>
                    </div>
                  </>
                ) : null}
              </section>

              <section className="panel noPrint">
                <PanelTitle
                  icon={<Save size={18} />}
                  label={t.savedRecipes}
                  summary={panelSummaries.saved}
                  collapsed={!openPanels.saved}
                  collapseAction={
                    <button
                      className={`iconButton panelToggle ${openPanels.saved ? "open" : ""}`}
                      type="button"
                      aria-label={openPanels.saved ? t.collapseSection : t.expandSection}
                      title={openPanels.saved ? t.collapseSection : t.expandSection}
                      onClick={() => togglePanel("saved")}
                    >
                      <ChevronDown size={16} />
                    </button>
                  }
                />
                {openPanels.saved ? (
                  <>
                    <div className="saveRow">
                      <input value={recipeName} onChange={(event) => setRecipeName(event.target.value)} placeholder={t.recipeName} />
                      <button className="actionButton" type="button" onClick={saveRecipe}>
                        <Save size={16} />
                        {t.save}
                      </button>
                    </div>
                    <p className="sectionMeta">
                      {savedRecipes.length} {t.savedCount}
                    </p>
                    <div className="savedList scrollArea">
                      {savedRecipes.map((recipe) => (
                        <button className="savedItem" key={recipe.id} type="button" onClick={() => loadSavedRecipe(recipe)}>
                          <strong>{recipe.name}</strong>
                          <span>{formatDateTime(recipe.createdAt, settings.language)}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>

              <section className="panel noPrint">
                <PanelTitle
                  icon={<ClipboardList size={18} />}
                  label={t.bakeJournal}
                  summary={panelSummaries.journal}
                  collapsed={!openPanels.journal}
                  collapseAction={
                    <button
                      className={`iconButton panelToggle ${openPanels.journal ? "open" : ""}`}
                      type="button"
                      aria-label={openPanels.journal ? t.collapseSection : t.expandSection}
                      title={openPanels.journal ? t.collapseSection : t.expandSection}
                      onClick={() => togglePanel("journal")}
                    >
                      <ChevronDown size={16} />
                    </button>
                  }
                />
                {openPanels.journal ? (
                  <>
                    <div className="fieldGrid compact">
                      <Field
                        label={t.rating}
                        value={logDraft.rating}
                        min={1}
                        max={5}
                        slider={createMobileSlider(1, 5, 1)}
                        onChange={(value) => setLogDraft((current) => ({ ...current, rating: numberValue(value, 5) }))}
                      />
                      <SelectField
                        label={t.outcome}
                        value={logDraft.outcome}
                        onChange={(value) => setLogDraft((current) => ({ ...current, outcome: value as BakeLogEntry["outcome"] }))}
                      >
                        <option value="keeper">{t.keeper}</option>
                        <option value="tweak">{t.tweak}</option>
                        <option value="fail">{t.fail}</option>
                      </SelectField>
                    </div>
                    <div className="photoRow">
                      <label className="ghostButton fileButton">
                        <input type="file" accept="image/*" onChange={onBakePhotoChange} />
                        {t.addPhoto}
                      </label>
                      {logDraft.photoDataUrl ? (
                        <button
                          className="ghostButton"
                          type="button"
                          onClick={() => setLogDraft((current) => ({ ...current, photoDataUrl: undefined, photoName: undefined }))}
                        >
                          {t.removePhoto}
                        </button>
                      ) : null}
                    </div>
                    {logDraft.photoDataUrl ? (
                      <div className="photoPreview">
                        <img src={logDraft.photoDataUrl} alt={logDraft.photoName ?? "Bake preview"} />
                        <span>{logDraft.photoName}</span>
                      </div>
                    ) : (
                      <p className="sectionMeta">{t.noPhoto}</p>
                    )}
                    <textarea
                      value={logDraft.notes}
                      onChange={(event) => setLogDraft((current) => ({ ...current, notes: event.target.value }))}
                      placeholder={t.notesPlaceholder}
                    />
                    <button className="actionButton fullWidth" type="button" onClick={addBakeLog}>
                      {t.logBake}
                    </button>
                    <p className="sectionMeta">
                      {bakeLog.length} {t.journalCount}
                    </p>
                    <div className="savedList scrollArea">
                      {bakeLog.map((entry) => (
                        <div className="savedItem staticItem" key={entry.id}>
                          <strong>{entry.recipeName}</strong>
                          <span>
                            {entry.rating}/5, {t[entry.outcome]}, {formatDateTime(entry.date, settings.language)}
                          </span>
                          {entry.photoDataUrl ? (
                            <img className="journalImage" src={entry.photoDataUrl} alt={entry.photoName ?? entry.recipeName} />
                          ) : null}
                          {entry.notes ? <p>{entry.notes}</p> : null}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
            </>
          ) : null}
        </aside>
      </div>
      <PrintSheetContent
        activeStyle={activeStyle}
        appVersion={APP_VERSION}
        batchDescriptor={batchDescriptor}
        blendBreakdown={blendBreakdown}
        displayRecipeName={displayRecipeName}
        localizedSelectedSauceOption={localizedSelectedSauceOption}
        mainDoughAdditionsText={mainDoughAdditionsText}
        methodSteps={methodSteps}
        normalizedInput={normalizedInput}
        ovenDetail={ovenDetail}
        prefermentFlourGrams={prefermentFlourGrams}
        prefermentMode={prefermentMode}
        prefermentName={prefermentName}
        prefermentSplitText={prefermentSplitText}
        result={result}
        sauceSaltWarning={selectedSauceCollection?.saltWarning ?? SAUCE_SALT_WARNING}
        sauceUi={sauceUi}
        settings={settings}
        t={t}
        waterSummary={waterSummary}
      />
    </main>
  );
}

function Ingredient({
  label,
  value,
  pct,
  status = "ok"
}: {
  label: string;
  value: string;
  pct: string;
  status?: "ok" | "danger";
}) {
  return (
    <div className={`ingredient ${status}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{pct}</em>
    </div>
  );
}

function SignalRow({ signal }: { signal: QualitySignal }) {
  return (
    <div className={`signalRow ${signal.tone}`}>
      <div className="signalHeader">
        <strong>{signal.label}</strong>
        <span>{signal.value}</span>
      </div>
      <progress className="signalTrack" max={100} value={signal.score} aria-hidden="true" />
      <p>{signal.note}</p>
    </div>
  );
}
