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
  createDefaultInput,
  defaultCostSettings,
  estimatePanBallWeight,
  FERMENTATION_PRESETS,
  FLOURS,
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
type PrefermentMode = "none" | "poolish" | "biga" | "tiga" | "lievito-madre" | "sauerdough";

type QualitySignal = {
  label: string;
  value: string;
  score: number;
  tone: "ok" | "notice" | "warning" | "danger";
  note: string;
};

type BlendBreakdownRow = {
  flourId: string;
  percentage: number;
  flourLabel: string;
  totalGrams: number;
  prefermentGrams: number;
  mainDoughGrams: number;
};

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

function getDefaultRecipeName(styleId: string, locale: LocaleCode) {
  const styleName = getStyleById(styleId)?.name ?? "Pizza";
  if (locale === "de") return `${styleName} Teig`;
  if (locale === "it") return `${styleName} impasto`;
  return `${styleName} dough`;
}

function isAutoRecipeName(name: string, styleId: string) {
  const trimmed = name.trim();
  const styleName = getStyleById(styleId)?.name ?? "Pizza";
  return new Set(["House dough", styleName, `${styleName} dough`, `${styleName} Teig`]).has(trimmed);
}

function getRecipeDisplayName(recipeName: string, styleId: string, locale: LocaleCode) {
  return recipeName.trim() || getDefaultRecipeName(styleId, locale);
}

function getPortableDataImportMessage(locale: LocaleCode, recipeCount: number, journalCount: number) {
  if (locale === "de") {
    return `Backup importiert: ${recipeCount} Rezepte, ${journalCount} Backnotizen.`;
  }

  if (locale === "it") {
    return `Backup importato: ${recipeCount} ricette, ${journalCount} note di cottura.`;
  }

  return `Imported backup: ${recipeCount} recipes, ${journalCount} journal entries.`;
}

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

const copy = {
  en: {
    brand: "Pizza Geek",
    title: "Dough Calculator",
    subtitle:
      "Style-aware dough math for serious home and pro pizza making, with clearer planning, better bake guidance, and a much stronger recipe workflow.",
    subtitleBread:
      "Bread-first dough planning for focaccia, flatbread, and loaf workflows, with proofing and bake guidance that tracks the product.",
    resetStyle: "Reset style",
    resetProfile: "Reset profile",
    printRecipe: "Print sheet",
    buySlice: "Buy a slice",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    productMode: "Product",
    workspaceMode: "Workspace",
    temperatureUnit: "Temperature",
    sizeUnit: "Length unit",
    english: "English",
    german: "Deutsch",
    italian: "Italiano",
    pizzaProduct: "Pizza",
    breadProduct: "Bread",
    guidedMode: "Guided",
    studioMode: "Studio",
    variants: "Variants",
    dark: "Dark",
    light: "Light",
    fahrenheit: "Fahrenheit",
    celsius: "Celsius",
    styles: "Styles",
    doughSetup: "Dough Setup",
    fermentation: "Fermentation",
    doughStudio: "Preferment & Flour",
    bakeSurface: "Shape & Bake",
    ovenProfile: "Oven Profile",
    planner: "Plan Ahead",
    formula: "Recipe Sheet",
    recipeHealth: "Quality Readout",
    guidance: "Bake Guidance",
    method: "Method",
    cost: "Costing",
    savedRecipes: "Recipe Library",
    bakeJournal: "Bake Journal",
    doughBalls: "Dough balls",
    ballWeight: "Ball weight",
    pieces: "Pieces",
    pieceWeight: "Piece weight",
    loaves: "Loaves",
    loafWeight: "Loaf weight",
    hydration: "Hydration",
    salt: "Salt",
    oil: "Oil",
    sugar: "Sugar",
    honey: "Honey",
    malt: "Malt",
    lard: "Lard",
    milkPowder: "Milk powder",
    yeastType: "Yeast",
    mixerType: "Mixer",
    manualYeast: "Manual yeast",
    flourTemp: "Flour temp",
    roomBulk: "Room bulk",
    cellarTime: "Cellar",
    coldBulk: "Fridge bulk",
    coldBall: "Fridge ball",
    finalRise: "Final rise",
    roomTemp: "Room temp",
    cellarTemp: "Cellar temp",
    fridgeTemp: "Fridge temp",
    roomHumidity: "Room humidity",
    cellarHumidity: "Cellar humidity",
    fridgeHumidity: "Fridge humidity",
    prefermentMode: "Preferment style",
    none: "None",
    poolish: "Poolish",
    biga: "Biga",
    tiga: "Tiga",
    bassinage: "Bassinage",
    "lievito-madre": "Lievito madre",
    sauerdough: "Sourdough",
    prefermentFlour: "Preferment flour",
    bigaHydration: "Biga hydration",
    prefermentRoom: "Preferment room",
    prefermentCold: "Preferment cold",
    flourBlend: "Flour blend",
    addFlour: "Add flour",
    blendTotal: "Blend total",
    totalLabel: "total",
    styleLibrary: "Full style library",
    breadProfiles: "Bread profiles",
    breadModeHint: "Bread mode covers pan breads, flatbreads, and loaf profiles with bread-specific proofing and bake guidance.",
    productModeHint: "Pizza keeps the full pizza style library. Bread narrows the app to bread-first profiles instead of pizza assumptions.",
    workspaceHint: "Guided keeps the essentials up front. Switch to Studio for flour blending, costing, saves, and bake logging.",
    guidedStylesHint: "Start with a core style, then use the full library for regional or specialty doughs.",
    prefermentHint:
      "Bassinage is a mixing technique, not a preferment. Lievito madre and sourdough use the preferment slot here and replace extra yeast in the final dough.",
    appInstall: "App install",
    appInstallHint: "Install Pizza Geek for faster launch and offline recipe access.",
    installApp: "Install app",
    installReady: "Ready to install on this device.",
    installedApp: "Installed and launchable like an app.",
    installUnavailable: "Installation is not available in this browser yet.",
    offlineReady: "Offline cache is ready after your first visit.",
    offlinePending: "Offline support is preparing.",
    offlineNow: "You are offline. Cached app screens should still work.",
    recipeData: "Recipe data",
    recipeDataHint: "Move saved recipes and bake journal entries between devices with a versioned JSON backup.",
    panGeometry: "Pan geometry",
    quickWeights: "Quick size weights",
    sizeHint: "Tap a diameter to apply a typical dough-ball weight for this style.",
    freeformLoafHint: "Freeform loaves skip pizza size presets. Shape tight, proof in a banneton or lined bowl, then score and steam the bake.",
    tinLoafHint: "Tin loaves use the pan dimensions above to estimate dough weight and keep the bake profile honest.",
    shape: "Shape",
    unit: "Unit",
    rectangular: "Rectangular",
    round: "Round",
    inches: "Inches",
    centimeters: "Centimeters",
    length: "Length",
    width: "Width",
    diameter: "Diameter",
    depth: "Depth",
    applyPanWeight: "Apply pan weight",
    stoneTemp: "Stone temp",
    topHeat: "Top heat",
    deckTemp: "Deck temp",
    broilerFinish: "Broiler finish",
    finishingBroil: "Finishing broil",
    sauce: "Sauce",
    sauceStyle: "Sauce style",
    sauceWeight: "Sauce / pizza",
    sauceHint: "Adds sauce guidance to the recipe sheet and method.",
    sauceClassic: "Classic tomato",
    sauceRaw: "Raw tomato",
    sauceCooked: "Cooked tomato",
    sauceWhite: "White sauce",
    today: "Starting now",
    readyBy: "Ready by",
    readyDate: "Ready date",
    quickSchedule: "Quick schedule",
    quickScheduleHint: "Pick a bake target and Pizza Geek back-plans the mix for you.",
    breadQuickScheduleHint: "Pick a loaf window and Pizza Geek back-plans bulk, proof, and bake around the bread profile.",
    startAt: "Start",
    todayTarget: "Same Day",
    overnightTarget: "Overnight",
    twoDayTarget: "2-Day",
    threeDayTarget: "3-Day",
    rapidTarget: "Rapid",
    breadExpressTarget: "Mix & Bake",
    breadTodayTarget: "Same-Day Loaf",
    breadOvernightTarget: "Next Morning",
    breadTwoDayTarget: "Slow Flavor",
    breadThreeDayTarget: "Weekend Loaf",
    flour: "Flour",
    water: "Water",
    yeast: "Yeast",
    bake: "Bake",
    effectiveFerment: "Effective ferment",
    totalTime: "Total time",
    waterTemp: "Water temp",
    targetFdt: "Target FDT",
    bakeTime: "Bake time",
    prefermentSplit: "Preferment split",
    mainDough: "Main dough",
    inPreferment: "in preferment",
    mainDoughAdditions: "Main dough additions",
    additionalFlour: "additional flour",
    additionalWater: "additional water",
    additionalYeast: "additional yeast",
    batch: "Batch",
    perDough: "Per dough",
    perPiece: "Per piece",
    perLoaf: "Per loaf",
    recipeName: "Recipe name",
    save: "Save",
    print: "Print",
    export: "Export",
    exportData: "Export data",
    importData: "Import data",
    copy: "Copy",
    dataExported: "Recipe backup downloaded.",
    dataExportError: "Couldn't download the backup.",
    dataImportError: "Couldn't import that file. Use a Pizza Geek backup JSON.",
    addPhoto: "Add photo",
    removePhoto: "Remove photo",
    rating: "Rating",
    outcome: "Outcome",
    notes: "Notes",
    notesPlaceholder:
      "What happened during the bake? Crumb, color, shaping, oven behavior, next adjustment...",
    logBake: "Log bake",
    keeper: "Keeper",
    tweak: "Tweak",
    fail: "Fail",
    savedCount: "saved recipes",
    journalCount: "journal entries",
    noPhoto: "No photo yet",
    flourCost: "Flour / kg",
    yeastCost: "Yeast / kg",
    oilCost: "Oil / kg",
    currency: "Currency",
    hydrationFit: "Hydration fit",
    saltBalance: "Salt balance",
    fermentPlan: "Ferment plan",
    flourStrength: "Flour strength",
    mixTemperature: "Mix temperature",
    advancedSchedule: "Detailed schedule",
    sauceRecipeDetails: "Sauce recipe",
    collapseSection: "Collapse section",
    expandSection: "Expand section"
  },
  de: {
    brand: "Pizza Geek",
    title: "Teigrechner",
    subtitle:
      "Stilbewusste Teigberechnung für ambitionierte Home- und Profi-Pizza, mit klarerer Planung, besserer Backführung und einem deutlich stärkeren Rezept-Workflow.",
    subtitleBread:
      "Brotorientierte Teigplanung für Focaccia-, Fladenbrot- und Laib-Workflows, mit Gare- und Backhinweisen passend zum Produkt.",
    resetStyle: "Stil zurücksetzen",
    resetProfile: "Profil zurücksetzen",
    printRecipe: "Rezept drucken",
    buySlice: "Pizza spendieren",
    settings: "Einstellungen",
    theme: "Thema",
    language: "Sprache",
    productMode: "Produkt",
    workspaceMode: "Arbeitsmodus",
    temperatureUnit: "Temperatur",
    sizeUnit: "Längeneinheit",
    english: "Englisch",
    german: "Deutsch",
    italian: "Italiano",
    pizzaProduct: "Pizza",
    breadProduct: "Brot",
    guidedMode: "Geführt",
    studioMode: "Studio",
    variants: "Varianten",
    dark: "Dunkel",
    light: "Hell",
    fahrenheit: "Fahrenheit",
    celsius: "Celsius",
    styles: "Stile",
    doughSetup: "Teig-Setup",
    fermentation: "Gare",
    doughStudio: "Vorteig & Mehl",
    bakeSurface: "Form & Backen",
    ovenProfile: "Ofenprofil",
    planner: "Backplanung",
    formula: "Rezeptblatt",
    recipeHealth: "Qualitätscheck",
    guidance: "Hinweise",
    method: "Ablauf",
    cost: "Zutatenkosten",
    savedRecipes: "Rezeptbibliothek",
    bakeJournal: "Backjournal",
    doughBalls: "Teiglinge",
    ballWeight: "Teiglingsgewicht",
    pieces: "Stücke",
    pieceWeight: "Stückgewicht",
    loaves: "Laibe",
    loafWeight: "Laibgewicht",
    hydration: "Hydration",
    salt: "Salz",
    oil: "Öl",
    sugar: "Zucker",
    honey: "Honig",
    malt: "Malz",
    lard: "Schmalz",
    milkPowder: "Milchpulver",
    yeastType: "Hefe",
    mixerType: "Mischer",
    manualYeast: "Manuelle Hefe",
    flourTemp: "Mehltemp.",
    roomBulk: "Raumgare",
    cellarTime: "Kellergare",
    coldBulk: "Kühl-Stockgare",
    coldBall: "Kühl-Stückgare",
    finalRise: "Endgare",
    roomTemp: "Raumtemp.",
    cellarTemp: "Kellertemp.",
    fridgeTemp: "Kühlschranktemp.",
    roomHumidity: "Raumfeuchte",
    cellarHumidity: "Kellerfeuchte",
    fridgeHumidity: "Kühlschrankfeuchte",
    prefermentMode: "Vorteig-Stil",
    none: "Keiner",
    poolish: "Poolish",
    biga: "Biga",
    tiga: "Tiga",
    bassinage: "Bassinage",
    "lievito-madre": "Lievito madre",
    sauerdough: "Sauerteig",
    prefermentFlour: "Vorteig-Mehl",
    bigaHydration: "Biga-Hydration",
    prefermentRoom: "Vorteig Raum",
    prefermentCold: "Vorteig kalt",
    flourBlend: "Mehlmischung",
    addFlour: "Mehl hinzufügen",
    blendTotal: "Mischung gesamt",
    totalLabel: "gesamt",
    styleLibrary: "Komplette Stilbibliothek",
    breadProfiles: "Brotprofile",
    breadModeHint: "Der Brotmodus deckt Blechbrote, Fladenbrote und Laibprofile mit brotspezifischer Gare- und Backführung ab.",
    productModeHint: "Pizza behält die volle Pizzastil-Bibliothek. Brot richtet die App auf Brotprofile statt auf Pizza-Annahmen aus.",
    workspaceHint: "Geführt zeigt zuerst das Wesentliche. Studio öffnet Mehlmischung, Kosten, Speicher und Backjournal.",
    guidedStylesHint: "Starte mit einem Kernstil und wechsle für regionale oder spezielle Teige in die volle Bibliothek.",
    prefermentHint:
      "Bassinage ist eine Mischtechnik, kein Vorteig. Lievito madre und Sauerteig nutzen hier den Vorteig-Slot und ersetzen zusätzliche Hefe im Hauptteig.",
    appInstall: "App-Installation",
    appInstallHint: "Installiere Pizza Geek für schnelleren Start und Offline-Zugriff auf Rezepte.",
    installApp: "App installieren",
    installReady: "Auf diesem Gerät installierbar.",
    installedApp: "Installiert und wie eine App startbar.",
    installUnavailable: "Installation ist in diesem Browser derzeit nicht verfügbar.",
    offlineReady: "Offline-Cache ist nach dem ersten Besuch bereit.",
    offlinePending: "Offline-Unterstützung wird vorbereitet.",
    offlineNow: "Du bist offline. Zwischengespeicherte App-Seiten sollten weiter funktionieren.",
    recipeData: "Rezeptdaten",
    recipeDataHint: "Verschiebe gespeicherte Rezepte und Backjournal-Einträge zwischen Geräten mit einem versionierten JSON-Backup.",
    panGeometry: "Blechgeometrie",
    quickWeights: "Schnellgewichte",
    sizeHint: "Ein Durchmesser setzt ein typisches Teiggewicht für diesen Stil.",
    freeformLoafHint: "Freigeschobene Laibe nutzen keine Pizza-Größen. Straff formen, im Garkorb oder in einer ausgelegten Schüssel gehen lassen, dann einschneiden und mit Dampf backen.",
    tinLoafHint: "Kastenbrote nutzen die Formmaße oben für Gewichtsschätzung und ein ehrliches Backprofil.",
    shape: "Form",
    unit: "Einheit",
    rectangular: "Rechteckig",
    round: "Rund",
    inches: "Zoll",
    centimeters: "Zentimeter",
    length: "Länge",
    width: "Breite",
    diameter: "Durchmesser",
    depth: "Tiefe",
    applyPanWeight: "Blechgewicht übernehmen",
    stoneTemp: "Steintemp.",
    topHeat: "Oberhitze",
    deckTemp: "Decktemp.",
    broilerFinish: "Grill-Finish",
    finishingBroil: "Abschlussgrill",
    sauce: "Sauce",
    sauceStyle: "Saucenstil",
    sauceWeight: "Sauce / Pizza",
    sauceHint: "Fügt Saucenhinweise im Rezeptblatt und Ablauf hinzu.",
    sauceClassic: "Klassische Tomate",
    sauceRaw: "Rohe Tomate",
    sauceCooked: "Gekochte Tomate",
    sauceWhite: "Weisse Sauce",
    today: "Jetzt starten",
    readyBy: "Fertig bis",
    readyDate: "Fertig am",
    quickSchedule: "Schnellplanung",
    quickScheduleHint: "Wähle dein Backziel und Pizza Geek plant den Start rückwärts für dich.",
    breadQuickScheduleHint: "Wähle dein Brotfenster und Pizza Geek plant Stockgare, Endgare und Backstart passend zum Profil rückwärts.",
    startAt: "Start",
    todayTarget: "Gleicher Tag",
    overnightTarget: "Über Nacht",
    twoDayTarget: "2 Tage",
    threeDayTarget: "3 Tage",
    rapidTarget: "Schnell",
    breadExpressTarget: "Mischen & Backen",
    breadTodayTarget: "Tageslaib",
    breadOvernightTarget: "Nächster Morgen",
    breadTwoDayTarget: "Mehr Aroma",
    breadThreeDayTarget: "Wochenendlaib",
    flour: "Mehl",
    water: "Wasser",
    yeast: "Hefe",
    bake: "Backen",
    effectiveFerment: "Effektive Gare",
    totalTime: "Gesamtzeit",
    waterTemp: "Wassertemp.",
    targetFdt: "Ziel-FDT",
    bakeTime: "Backzeit",
    prefermentSplit: "Vorteig-Aufteilung",
    mainDough: "Hauptteig",
    inPreferment: "im Vorteig",
    mainDoughAdditions: "Hauptteig-Zugaben",
    additionalFlour: "zusätzliches Mehl",
    additionalWater: "zusätzliches Wasser",
    additionalYeast: "zusätzliche Hefe",
    batch: "Charge",
    perDough: "Pro Teigling",
    perPiece: "Pro Stück",
    perLoaf: "Pro Laib",
    recipeName: "Rezeptname",
    save: "Speichern",
    print: "Drucken",
    export: "Export",
    exportData: "Daten exportieren",
    importData: "Daten importieren",
    copy: "Kopieren",
    dataExported: "Rezept-Backup heruntergeladen.",
    dataExportError: "Das Backup konnte nicht heruntergeladen werden.",
    dataImportError: "Diese Datei konnte nicht importiert werden. Nutze ein Pizza-Geek-Backup als JSON.",
    addPhoto: "Foto hinzufügen",
    removePhoto: "Foto entfernen",
    rating: "Bewertung",
    outcome: "Ergebnis",
    notes: "Notizen",
    notesPlaceholder:
      "Wie lief der Backtag? Krume, Farbe, Formen, Ofenverhalten, nächste Anpassung...",
    logBake: "Backen protokollieren",
    keeper: "Bleibt so",
    tweak: "Nachscharfen",
    fail: "Fehlversuch",
    savedCount: "gespeicherte Rezepte",
    journalCount: "Journaleinträge",
    noPhoto: "Noch kein Foto",
    flourCost: "Mehl / kg",
    yeastCost: "Hefe / kg",
    oilCost: "Öl / kg",
    currency: "Währung",
    hydrationFit: "Hydration",
    saltBalance: "Salzbalance",
    fermentPlan: "Gareplan",
    flourStrength: "Mehlstärke",
    mixTemperature: "Mischtemperatur",
    advancedSchedule: "Detaillierter Zeitplan",
    sauceRecipeDetails: "Saucenrezept",
    collapseSection: "Bereich einklappen",
    expandSection: "Bereich ausklappen"
  },
  it: {
    brand: "Pizza Geek",
    title: "Calcolatore Impasti",
    subtitle:
      "Calcolo impasti orientato allo stile per una pizza fatta seriamente, con pianificazione più chiara, guida di cottura migliore e un flusso ricette più forte.",
    subtitleBread:
      "Pianificazione dell'impasto orientata al pane per focaccia, pani piatti e filoni, con guida di lievitazione e cottura che segue il prodotto.",
    resetStyle: "Reimposta stile",
    resetProfile: "Reimposta profilo",
    printRecipe: "Stampa scheda",
    buySlice: "Offrimi una fetta",
    settings: "Impostazioni",
    theme: "Tema",
    language: "Lingua",
    productMode: "Prodotto",
    workspaceMode: "Workspace",
    temperatureUnit: "Temperatura",
    sizeUnit: "Unità lunghezza",
    english: "English",
    german: "Deutsch",
    italian: "Italiano",
    pizzaProduct: "Pizza",
    breadProduct: "Pane",
    guidedMode: "Guidato",
    studioMode: "Studio",
    variants: "Varianti",
    dark: "Scuro",
    light: "Chiaro",
    fahrenheit: "Fahrenheit",
    celsius: "Celsius",
    styles: "Stili",
    doughSetup: "Setup impasto",
    fermentation: "Fermentazione",
    doughStudio: "Prefermento e farina",
    bakeSurface: "Forma e cottura",
    ovenProfile: "Profilo forno",
    planner: "Pianifica",
    formula: "Scheda ricetta",
    recipeHealth: "Controllo qualità",
    guidance: "Guida",
    method: "Metodo",
    cost: "Costi",
    savedRecipes: "Ricette salvate",
    bakeJournal: "Diario di cottura",
    doughBalls: "Panetti",
    ballWeight: "Peso panetto",
    pieces: "Pezzi",
    pieceWeight: "Peso pezzo",
    loaves: "Pagnotte",
    loafWeight: "Peso pagnotta",
    hydration: "Idratazione",
    salt: "Sale",
    oil: "Olio",
    sugar: "Zucchero",
    honey: "Miele",
    malt: "Malto",
    lard: "Strutto",
    milkPowder: "Latte in polvere",
    yeastType: "Lievito",
    mixerType: "Impastatrice",
    manualYeast: "Lievito manuale",
    flourTemp: "Temp. farina",
    roomBulk: "Puntata ambiente",
    cellarTime: "Cantina",
    coldBulk: "Puntata frigo",
    coldBall: "Appretto frigo",
    finalRise: "Appretto finale",
    roomTemp: "Temp. ambiente",
    cellarTemp: "Temp. cantina",
    fridgeTemp: "Temp. frigo",
    roomHumidity: "Umidità ambiente",
    cellarHumidity: "Umidità cantina",
    fridgeHumidity: "Umidità frigo",
    prefermentMode: "Stile prefermento",
    none: "Nessuno",
    poolish: "Poolish",
    biga: "Biga",
    tiga: "Tiga",
    bassinage: "Bassinage",
    "lievito-madre": "Lievito madre",
    sauerdough: "Lievito naturale",
    prefermentFlour: "Farina prefermento",
    bigaHydration: "Idratazione biga",
    prefermentRoom: "Prefermento ambiente",
    prefermentCold: "Prefermento freddo",
    flourBlend: "Blend farine",
    addFlour: "Aggiungi farina",
    blendTotal: "Blend totale",
    totalLabel: "totale",
    styleLibrary: "Libreria stili completa",
    breadProfiles: "Profili pane",
    breadModeHint: "La modalità pane copre pani in teglia, pani piatti e filoni con guida specifica per lievitazione e cottura.",
    productModeHint: "Pizza mantiene l'intera libreria stili pizza. Pane restringe l'app a profili pensati prima per il pane.",
    workspaceHint: "Guidato tiene l'essenziale in primo piano. Studio apre blend farine, costi, salvataggi e diario di cottura.",
    guidedStylesHint: "Parti da uno stile base, poi usa la libreria completa per impasti regionali o speciali.",
    prefermentHint:
      "Il bassinage è una tecnica di impasto, non un prefermento. Lievito madre e lievito naturale usano qui lo slot del prefermento e sostituiscono il lievito aggiuntivo nell'impasto finale.",
    appInstall: "Installazione app",
    appInstallHint: "Installa Pizza Geek per un avvio più rapido e accesso offline alle ricette.",
    installApp: "Installa app",
    installReady: "Pronta da installare su questo dispositivo.",
    installedApp: "Installata e avviabile come app.",
    installUnavailable: "L'installazione non è ancora disponibile in questo browser.",
    offlineReady: "La cache offline è pronta dopo la prima visita.",
    offlinePending: "Il supporto offline si sta preparando.",
    offlineNow: "Sei offline. Le schermate in cache dovrebbero comunque funzionare.",
    recipeData: "Dati ricette",
    recipeDataHint: "Sposta ricette salvate e note di cottura tra dispositivi con un backup JSON versionato.",
    panGeometry: "Geometria teglia",
    quickWeights: "Pesi rapidi",
    sizeHint: "Tocca un diametro per applicare un peso panetto tipico per questo stile.",
    freeformLoafHint: "I filoni liberi saltano i preset pizza. Forma bene, lievita in banneton o in una ciotola rivestita, poi incidi e cuoci con vapore.",
    tinLoafHint: "I pani in stampo usano le dimensioni sopra per stimare il peso impasto e tenere onesto il profilo di cottura.",
    shape: "Forma",
    unit: "Unità",
    rectangular: "Rettangolare",
    round: "Rotonda",
    inches: "Pollici",
    centimeters: "Centimetri",
    length: "Lunghezza",
    width: "Larghezza",
    diameter: "Diametro",
    depth: "Profondità",
    applyPanWeight: "Applica peso teglia",
    stoneTemp: "Temp. pietra",
    topHeat: "Calore superiore",
    deckTemp: "Temp. platea",
    broilerFinish: "Finitura grill",
    finishingBroil: "Grill finale",
    sauce: "Salsa",
    sauceStyle: "Stile salsa",
    sauceWeight: "Salsa / pizza",
    sauceHint: "Aggiunge indicazioni salsa alla scheda ricetta e al metodo.",
    sauceClassic: "Pomodoro classico",
    sauceRaw: "Pomodoro crudo",
    sauceCooked: "Pomodoro cotto",
    sauceWhite: "Salsa bianca",
    today: "Parti ora",
    readyBy: "Pronta per",
    readyDate: "Data pronta",
    quickSchedule: "Pianificazione rapida",
    quickScheduleHint: "Scegli l'obiettivo di cottura e Pizza Geek pianifica a ritroso per te.",
    breadQuickScheduleHint: "Scegli la finestra del pane e Pizza Geek pianifica puntata, appretto e cottura in base al profilo.",
    startAt: "Inizio",
    todayTarget: "Stesso giorno",
    overnightTarget: "Notte",
    twoDayTarget: "2 giorni",
    threeDayTarget: "3 giorni",
    rapidTarget: "Rapido",
    breadExpressTarget: "Impasta e cuoci",
    breadTodayTarget: "Pane in giornata",
    breadOvernightTarget: "Domani mattina",
    breadTwoDayTarget: "Più aroma",
    breadThreeDayTarget: "Pane del weekend",
    flour: "Farina",
    water: "Acqua",
    yeast: "Lievito",
    bake: "Cottura",
    effectiveFerment: "Fermentazione effettiva",
    totalTime: "Tempo totale",
    waterTemp: "Temp. acqua",
    targetFdt: "FDT target",
    bakeTime: "Tempo cottura",
    prefermentSplit: "Divisione prefermento",
    mainDough: "Impasto finale",
    inPreferment: "nel prefermento",
    mainDoughAdditions: "Aggiunte impasto finale",
    additionalFlour: "farina aggiuntiva",
    additionalWater: "acqua aggiuntiva",
    additionalYeast: "lievito aggiuntivo",
    batch: "Batch",
    perDough: "Per panetto",
    perPiece: "Per pezzo",
    perLoaf: "Per pagnotta",
    recipeName: "Nome ricetta",
    save: "Salva",
    print: "Stampa",
    export: "Esporta",
    exportData: "Esporta dati",
    importData: "Importa dati",
    copy: "Copia",
    dataExported: "Backup ricette scaricato.",
    dataExportError: "Impossibile scaricare il backup.",
    dataImportError: "Impossibile importare questo file. Usa un backup JSON di Pizza Geek.",
    addPhoto: "Aggiungi foto",
    removePhoto: "Rimuovi foto",
    rating: "Valutazione",
    outcome: "Esito",
    notes: "Note",
    notesPlaceholder: "Com'è andata la cottura? Mollica, colore, formatura, comportamento del forno, prossima correzione...",
    logBake: "Registra cottura",
    keeper: "Da tenere",
    tweak: "Da ritoccare",
    fail: "Fallita",
    savedCount: "ricette salvate",
    journalCount: "note di cottura",
    noPhoto: "Nessuna foto",
    flourCost: "Farina / kg",
    yeastCost: "Lievito / kg",
    oilCost: "Olio / kg",
    currency: "Valuta",
    hydrationFit: "Idratazione",
    saltBalance: "Bilanciamento sale",
    fermentPlan: "Piano fermentazione",
    flourStrength: "Forza farina",
    mixTemperature: "Temperatura impasto",
    advancedSchedule: "Piano dettagliato",
    sauceRecipeDetails: "Ricetta salsa",
    collapseSection: "Comprimi sezione",
    expandSection: "Espandi sezione"
  }
} as const;

type CopyText = Record<keyof typeof copy.en, string>;

function getIntlLocale(locale: LocaleCode): string {
  if (locale === "de") return "de-DE";
  if (locale === "it") return "it-IT";
  return "en-US";
}

function getBakeDurationUnit(unit: DoughResult["oven"]["unit"], locale: LocaleCode): string {
  if (locale === "de") return unit === "seconds" ? "Sek." : "Min.";
  if (locale === "it") return unit === "seconds" ? "sec." : "min.";
  return unit;
}

function getLanguageLabel(locale: LocaleCode, labels: Pick<CopyText, "english" | "german" | "italian">): string {
  if (locale === "de") return labels.german;
  if (locale === "it") return labels.italian;
  return labels.english;
}

function getPerPizzaLabel(locale: LocaleCode): string {
  return locale === "de" ? "Pizza" : "pizza";
}

function getYeastOptionLabel(type: YeastType, locale: LocaleCode): string {
  if (type === "ady") {
    if (locale === "de") return "ADY (Aktive Trockenhefe)";
    if (locale === "it") return "ADY (Lievito secco attivo)";
    return "ADY (Active Dry Yeast)";
  }

  if (type === "fresh") {
    if (locale === "de") return "Frischhefe";
    if (locale === "it") return "Lievito fresco";
    return "Fresh yeast";
  }

  if (locale === "de") return "IDY (Instant-Trockenhefe)";
  if (locale === "it") return "IDY (Lievito secco istantaneo)";
  return "IDY (Instant Dry Yeast)";
}

function getYeastOptions(locale: LocaleCode): Array<{ value: YeastType; label: string }> {
  return [
    { value: "idy", label: getYeastOptionLabel("idy", locale) },
    { value: "ady", label: getYeastOptionLabel("ady", locale) },
    { value: "fresh", label: getYeastOptionLabel("fresh", locale) }
  ];
}

const ovenOptions: Array<{ value: OvenType; label: string }> = [
  { value: "wood-fired", label: "Wood" },
  { value: "coal-fired", label: "Coal" },
  { value: "pizza-oven", label: "Pizza oven" },
  { value: "deck-oven", label: "Deck" },
  { value: "steel-stone", label: "Steel" },
  { value: "conventional", label: "Home" }
];

const presetKeys = Object.keys(FERMENTATION_PRESETS) as FermentationPresetKey[];
const plannerShortcutPresets: FermentationPresetKey[] = ["rapid", "sameDay", "overnight", "twoDay", "threeDay"];
const breadPlannerShortcutPresets: FermentationPresetKey[] = ["express", "sameDay", "overnight", "twoDay", "threeDay"];

const sizePresets: Record<string, Record<number, number>> = {
  default: { 10: 180, 12: 250, 14: 320, 16: 400, 18: 500 },
  Neapolitan: { 10: 220, 12: 250, 14: 300, 16: 420, 18: 550 },
  "Contemporary Neapolitan": { 10: 240, 12: 270, 14: 340, 16: 450, 18: 580 },
  "Contemporary Neapolitan - Double Preferment Whole Grain": { 10: 230, 12: 255, 14: 330, 16: 440, 18: 570 },
  "New Haven": { 10: 220, 12: 260, 14: 320, 16: 420, 18: 550 },
  "Pizza alla Pala": { 10: 280, 12: 350, 14: 450, 16: 550, 18: 700 },
  "New York": { 10: 240, 12: 300, 14: 360, 16: 460, 18: 580 },
  California: { 10: 220, 12: 260, 14: 320, 16: 420, 18: 520 },
  Montreal: { 10: 250, 12: 300, 14: 360, 16: 440, 18: 560 },
  Coca: { 10: 170, 12: 220, 14: 280, 16: 360, 18: 460 },
  Flammkuchen: { 10: 160, 12: 200, 14: 250, 16: 320, 18: 400 },
  Lahmacun: { 10: 120, 12: 150, 14: 180, 16: 220, 18: 260 }
};

function getBatchLabels(styleId: string, labels: CopyText) {
  if (isLoafStyleId(styleId)) {
    return {
      count: labels.loaves,
      weight: labels.loafWeight,
      perUnit: labels.perLoaf
    };
  }

  if (isBreadStyleId(styleId)) {
    return {
      count: labels.pieces,
      weight: labels.pieceWeight,
      perUnit: labels.perPiece
    };
  }

  return {
    count: labels.doughBalls,
    weight: labels.ballWeight,
    perUnit: labels.perDough
  };
}

function getBatchDescriptor(input: CalculatorInput, style: PizzaStyle, locale: LocaleCode): string {
  if (isLoafStyleId(style.id)) {
    if (locale === "de") {
      return `${input.doughBalls} Laib${input.doughBalls === 1 ? "" : "e"} mit ${input.ballWeight}g`;
    }

    if (locale === "it") {
      return `${input.doughBalls} pagnotta${input.doughBalls === 1 ? "" : "e"} da ${input.ballWeight}g`;
    }

    return `${input.doughBalls} loaf${input.doughBalls === 1 ? "" : "s"} at ${input.ballWeight}g`;
  }

  if (isBreadStyleId(style.id)) {
    if (locale === "de") {
      return `${input.doughBalls} Stück${input.doughBalls === 1 ? "" : "e"} mit ${input.ballWeight}g`;
    }

    if (locale === "it") {
      return `${input.doughBalls} pezzo${input.doughBalls === 1 ? "" : "i"} da ${input.ballWeight}g`;
    }

    return `${input.doughBalls} piece${input.doughBalls === 1 ? "" : "s"} at ${input.ballWeight}g`;
  }

  return `${input.doughBalls} x ${input.ballWeight}g`;
}

function numberValue(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

function toLocalDateTimeInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function displayTemperatureValue(tempF: number, unit: TemperatureUnit): number {
  return unit === "F" ? Math.round(tempF) : fahrenheitToCelsius(tempF);
}

function parseTemperatureInput(value: string, unit: TemperatureUnit, fallbackF: number): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallbackF;
  return unit === "F" ? parsed : celsiusToFahrenheit(parsed);
}

function formatTemperature(tempF: number, unit: TemperatureUnit): string {
  const value = displayTemperatureValue(tempF, unit);
  return `${value}\u00B0${unit}`;
}

function formatDateTime(value: string, locale: LocaleCode): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

function formatPlannerTarget(value: Date, locale: LocaleCode): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

function formatMoney(value: number, currency: string, locale: LocaleCode) {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency
  }).format(value);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function roundDateUp(date: Date, incrementMinutes = 30): Date {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  const currentMinutes = rounded.getMinutes();
  const nextMinutes = Math.ceil(currentMinutes / incrementMinutes) * incrementMinutes;
  if (nextMinutes >= 60) {
    rounded.setHours(rounded.getHours() + 1, 0, 0, 0);
    return rounded;
  }
  rounded.setMinutes(nextMinutes, 0, 0);
  return rounded;
}

function getPresetDurationHours(preset: FermentationPresetKey): number {
  const selected = FERMENTATION_PRESETS[preset];
  return (
    selected.roomTempHours +
    selected.cellarTempHours +
    selected.coldBulkHours +
    selected.coldBallHours +
    selected.finalRiseHours
  );
}

function styleRange(result: DoughResult, field: "hydration" | "salt" | "oil" | "sugar", value: number): "ok" | "danger" {
  const range = result.style[field];
  if (value < range.min || value > range.max) return "danger";
  return "ok";
}

function clampTo(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createMobileSlider(min: number, max: number, step = 1) {
  return { min, max, step, mobileOnly: true };
}

function createStyleSlider(min: number, max: number, padding: number, floor: number, ceiling: number, step = 0.1) {
  const decimals = step < 1 ? 1 : 0;
  return createMobileSlider(
    Number(clampTo(min - padding, floor, ceiling).toFixed(decimals)),
    Number(clampTo(max + padding, floor, ceiling).toFixed(decimals)),
    step
  );
}

function createTemperatureSlider(minF: number, maxF: number, unit: TemperatureUnit, step = 1) {
  return createMobileSlider(displayTemperatureValue(minF, unit), displayTemperatureValue(maxF, unit), step);
}

function getCountSlider(styleId: string) {
  if (isLoafStyleId(styleId)) return createMobileSlider(1, 8, 1);
  if (isBreadStyleId(styleId)) return createMobileSlider(1, 10, 1);
  return createMobileSlider(1, 12, 1);
}

function getWeightSlider(styleId: string) {
  if (isLoafStyleId(styleId)) return createMobileSlider(300, 1200, 10);
  if (isBreadStyleId(styleId)) return createMobileSlider(150, 900, 10);
  return createMobileSlider(160, 550, 5);
}

function scoreAgainstRange(value: number, min: number, recommended: number, max: number) {
  if (value < min || value > max) return 34;
  const halfRange = value <= recommended ? recommended - min : max - recommended;
  if (halfRange <= 0) return 100;
  return Math.round(100 - clampTo(Math.abs(value - recommended) / halfRange, 0, 1) * 22);
}

function toneForScore(score: number): QualitySignal["tone"] {
  if (score >= 86) return "ok";
  if (score >= 68) return "notice";
  if (score >= 45) return "warning";
  return "danger";
}

function isNaturalStarterPreferment(input: CalculatorInput): boolean {
  return (
    input.preferment.kind === "biga" &&
    (input.preferment.bigaStyle === "lievito-madre" || input.preferment.bigaStyle === "sauerdough")
  );
}

function getPrefermentLeaveningName(input: CalculatorInput, locale: LocaleCode): string {
  if (!isNaturalStarterPreferment(input)) {
    if (locale === "de") return "Hefe";
    if (locale === "it") return "lievito";
    return "yeast";
  }

  if (input.preferment.bigaStyle === "lievito-madre") {
    if (locale === "de") return "Lievito-madre-Anstellgut";
    if (locale === "it") return "lievito madre";
    return "lievito madre starter";
  }

  if (locale === "de") return "Sauerteig-Anstellgut";
  if (locale === "it") return "lievito naturale";
  return "sourdough starter";
}

function getNaturalStarterUiHint(locale: LocaleCode): string {
  if (locale === "de") {
    return "Bei Lievito madre oder Sauerteig ist keine zusätzliche Industriehefe aktiv. Die App ignoriert IDY, ADY und Frischhefe in diesem Modus.";
  }

  if (locale === "it") {
    return "Con lievito madre o lievito naturale non viene usato lievito commerciale aggiuntivo. In questa modalità l'app ignora IDY, ADY e lievito fresco.";
  }

  return "With lievito madre or sourdough, no extra commercial yeast is used. In this mode the app ignores IDY, ADY, and fresh yeast.";
}

function getPrefermentMode(input: CalculatorInput): PrefermentMode {
  if (input.preferment.kind === "none") return "none";
  if (input.preferment.kind === "poolish") return "poolish";
  if (input.preferment.bigaStyle === "tiga") return "tiga";
  if (input.preferment.bigaStyle === "lievito-madre") return "lievito-madre";
  if (input.preferment.bigaStyle === "sauerdough") return "sauerdough";
  return "biga";
}

function getPrefermentPatch(mode: PrefermentMode): Partial<CalculatorInput["preferment"]> {
  if (mode === "none") return { kind: "none" };
  if (mode === "poolish") return { kind: "poolish", bigaStyle: "standard", bigaHydration: 100 };
  if (mode === "tiga") return { kind: "biga", bigaStyle: "tiga", bigaHydration: 55 };
  if (mode === "lievito-madre") return { kind: "biga", bigaStyle: "lievito-madre", bigaHydration: 50 };
  if (mode === "sauerdough") return { kind: "biga", bigaStyle: "sauerdough", bigaHydration: 100 };
  return { kind: "biga", bigaStyle: "standard", bigaHydration: 55 };
}

function getPrefermentDisplayName(input: CalculatorInput, locale: LocaleCode): string {
  if (input.preferment.kind === "poolish") return "Poolish";
  if (input.preferment.bigaStyle === "tiga") return "Tiga";
  if (input.preferment.bigaStyle === "lievito-madre") return "Lievito madre";
  if (input.preferment.bigaStyle === "sauerdough") return locale === "de" ? "Sauerteig" : "Sourdough";
  return "Biga";
}

function getPresetLabel(key: FermentationPresetKey, locale: LocaleCode): string {
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

function getPlannerShortcutLabel(key: FermentationPresetKey, labels: CopyText, breadMode: boolean): string {
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

function getHydrationWorkabilityNotice(
  input: CalculatorInput,
  result: DoughResult,
  locale: LocaleCode
): { tone: "notice" | "warning" | "danger"; message: string } | null {
  const nearMax = input.hydrationPercent >= result.style.hydration.max - 0.5;
  const nearMin = input.hydrationPercent <= result.style.hydration.min + 0.5;

  if (nearMax) {
    if (result.flourBlend.warningColor === "danger" || result.flourBlend.warningColor === "warning") {
      return {
        tone: result.flourBlend.warningColor,
        message:
          locale === "de"
            ? "Diese Hydration liegt am oberen Rand des Profils fur die aktuelle Mehlstarke. Rechne mit weicherem Teig, mehr Faltintervallen oder einer staerkeren Mehlmischung."
            : "This hydration sits at the top of the profile for the current flour strength. Expect a looser dough, more folds, or a stronger flour blend."
      };
    }

    return {
      tone: "notice",
      message:
        locale === "de"
          ? "Du arbeitest am nassen Ende dieses Profils. Nutze Faltungen, nasse Haende und eine schonende Endformung."
          : "You are working at the wet end of this profile. Use folds, wet hands, and a gentle final shape."
    };
  }

  if (isBreadStyleId(result.style.id) && nearMin) {
    return {
      tone: "notice",
      message:
        locale === "de"
          ? "Diese Einstellung liegt auf der trockeneren Seite des Brotprofils. Rechne mit strafferer Formgebung und engerer Krume."
          : "This setting sits on the drier side of the bread profile. Expect easier shaping and a tighter crumb."
    };
  }

  return null;
}

function getSizePresetForStyle(styleName: string) {
  return sizePresets[styleName] ?? sizePresets.default;
}

function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function convertDimension(value: number, from: SizeUnit, to: SizeUnit, decimals = 1): number {
  if (from === to) return value;
  const converted = from === "in" ? value * 2.54 : value / 2.54;
  return roundTo(converted, decimals);
}

function convertPanToUnit(pan: CalculatorInput["pan"], nextUnit: SizeUnit): CalculatorInput["pan"] {
  if (pan.unit === nextUnit) return pan;
  const decimals = nextUnit === "cm" ? 1 : 2;

  return {
    ...pan,
    unit: nextUnit,
    length: convertDimension(pan.length, pan.unit, nextUnit, decimals),
    width: convertDimension(pan.width, pan.unit, nextUnit, decimals),
    diameter: convertDimension(pan.diameter, pan.unit, nextUnit, decimals),
    depth: convertDimension(pan.depth, pan.unit, nextUnit, decimals)
  };
}

function formatSizePresetLabel(sizeInches: number, unit: SizeUnit): string {
  if (unit === "in") {
    return `${sizeInches}"`;
  }

  return `${Math.round(sizeInches * 2.54)} cm`;
}

function formatArea(areaSqIn: number, unit: SizeUnit): string {
  if (unit === "in") {
    return `${roundTo(areaSqIn, 1)} sq in`;
  }

  return `${roundTo(areaSqIn * 6.4516, 1)} sq cm`;
}

function getLengthSuffix(unit: SizeUnit): string {
  return unit === "in" ? '"' : "cm";
}

function rebalanceBlendPercentages(
  blend: FlourBlendItem[],
  index: number,
  nextPercentage: number
): FlourBlendItem[] {
  if (blend.length <= 1) {
    return blend.map((item) => ({ ...item, percentage: 100 }));
  }

  const target = clampTo(Math.round(nextPercentage), 0, 100);
  const otherIndexes = blend.map((_, itemIndex) => itemIndex).filter((itemIndex) => itemIndex !== index);
  const remaining = 100 - target;
  const result = blend.map((item) => ({ ...item }));
  result[index].percentage = target;

  const sourceTotal = otherIndexes.reduce((sum, itemIndex) => sum + Math.max(0, blend[itemIndex].percentage), 0);
  if (sourceTotal <= 0) {
    const base = Math.floor(remaining / otherIndexes.length);
    let extra = remaining - base * otherIndexes.length;
    for (const itemIndex of otherIndexes) {
      result[itemIndex].percentage = base + (extra > 0 ? 1 : 0);
      if (extra > 0) extra -= 1;
    }
    return result;
  }

  const weighted = otherIndexes.map((itemIndex) => {
    const raw = (Math.max(0, blend[itemIndex].percentage) / sourceTotal) * remaining;
    const floor = Math.floor(raw);
    return { itemIndex, raw, floor, fraction: raw - floor };
  });

  let assigned = weighted.reduce((sum, item) => sum + item.floor, 0);
  for (const item of weighted) {
    result[item.itemIndex].percentage = item.floor;
  }

  let leftovers = remaining - assigned;
  const ranked = [...weighted].sort((left, right) => right.fraction - left.fraction);
  for (let itemIndex = 0; itemIndex < ranked.length && leftovers > 0; itemIndex += 1) {
    result[ranked[itemIndex].itemIndex].percentage += 1;
    leftovers -= 1;
  }

  return result;
}

function normalizeBlendAfterRemoval(blend: FlourBlendItem[]): FlourBlendItem[] {
  if (blend.length === 0) {
    return [{ flourId: "caputo-pizzeria", percentage: 100 }];
  }

  if (blend.length === 1) {
    return [{ ...blend[0], percentage: 100 }];
  }

  const total = blend.reduce((sum, item) => sum + Math.max(0, item.percentage), 0);
  if (total <= 0) {
    const even = Math.floor(100 / blend.length);
    return blend.map((item, index) => ({
      ...item,
      percentage: index === blend.length - 1 ? 100 - even * (blend.length - 1) : even
    }));
  }

  let assigned = 0;
  return blend.map((item, index) => {
    if (index === blend.length - 1) {
      return { ...item, percentage: 100 - assigned };
    }

    const percentage = Math.round((Math.max(0, item.percentage) / total) * 100);
    assigned += percentage;
    return { ...item, percentage };
  });
}

function allocateBlendGrams(blend: FlourBlendItem[], totalGrams: number): number[] {
  if (blend.length === 0) return [];
  if (totalGrams <= 0) return blend.map(() => 0);

  const allocations = blend.map((item, index) => {
    const raw = (Math.max(0, item.percentage) / 100) * totalGrams;
    const floor = Math.floor(raw);
    return { index, floor, fraction: raw - floor };
  });

  const grams = allocations.map((entry) => entry.floor);
  let remaining = totalGrams - grams.reduce((sum, value) => sum + value, 0);
  const ranked = [...allocations].sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; index < ranked.length && remaining > 0; index += 1) {
    grams[ranked[index].index] += 1;
    remaining -= 1;
  }

  return grams;
}

function getFlourLabel(flourId: string): string {
  const flour = FLOURS.find((entry) => entry.id === flourId);
  return flour ? `${flour.brand} ${flour.name}` : flourId;
}

function getSauceStyleLabel(style: CalculatorInput["sauce"]["style"], labels: CopyText): string {
  switch (style) {
    case "raw":
      return labels.sauceRaw;
    case "cooked":
      return labels.sauceCooked;
    case "white":
      return labels.sauceWhite;
    default:
      return labels.sauceClassic;
  }
}

function inferSauceStyleFromOption(option?: SauceRecipeOption): CalculatorInput["sauce"]["style"] {
  if (!option) return "classic";
  const searchable = `${option.name} ${option.description ?? ""} ${option.cookType}`.toLowerCase();

  if (
    searchable.includes("white") ||
    searchable.includes("bianca") ||
    searchable.includes("crema") ||
    searchable.includes("alfredo")
  ) {
    return "white";
  }

  if (option.cookType.toLowerCase().includes("cook") || option.cookType.toLowerCase().includes("simmer")) {
    return "cooked";
  }

  if (option.cookType.toLowerCase().includes("raw") || option.cookType.toLowerCase().includes("no-cook")) {
    return "raw";
  }

  return "classic";
}

function formatTemperaturePair(tempF: number, unit: TemperatureUnit): string {
  const secondaryUnit: TemperatureUnit = unit === "F" ? "C" : "F";
  return `${formatTemperature(tempF, unit)} (${formatTemperature(tempF, secondaryUnit)})`;
}

function formatBakeWindow(
  oven: DoughResult["oven"],
  locale: LocaleCode,
  unit: TemperatureUnit,
  detail?: string
): string {
  const durationUnit = getBakeDurationUnit(oven.unit, locale);
  if (detail) {
    return `${detail}, ${oven.minTime}-${oven.maxTime} ${durationUnit}`;
  }

  if (locale === "de") {
    return `${oven.minTime}-${oven.maxTime} ${durationUnit} bei ${formatTemperature(oven.tempF, unit)}`;
  }

  if (locale === "it") {
    return `${oven.minTime}-${oven.maxTime} ${durationUnit} a ${formatTemperature(oven.tempF, unit)}`;
  }

  return `${oven.minTime}-${oven.maxTime} ${durationUnit} @ ${formatTemperature(oven.tempF, unit)}`;
}

function getWaterSummaryText(result: DoughResult, locale: LocaleCode, unit: TemperatureUnit) {
  const water = result.waterTemperature;

  if (locale === "de") {
    return {
      title: "Wassertemperatur",
      useText: `Wasser bei ${formatTemperaturePair(water.waterTempF, unit)} verwenden.`,
      targetText: `Ziel-Teigtemperatur: ${formatTemperaturePair(water.targetFdtF, unit)} für ${result.totalFermentationHours}h Gare.`
    };
  }

  if (locale === "it") {
    return {
      title: "Temperatura dell'acqua",
      useText: `Usa acqua a ${formatTemperaturePair(water.waterTempF, unit)}.`,
      targetText: `Temperatura impasto target: ${formatTemperaturePair(water.targetFdtF, unit)} per ${result.totalFermentationHours}h di fermentazione.`
    };
  }

  return {
    title: "Water Temperature",
    useText: `Use water at ${formatTemperaturePair(water.waterTempF, unit)}.`,
    targetText: `Target dough temp: ${formatTemperaturePair(water.targetFdtF, unit)} for ${result.totalFermentationHours}h ferment.`
  };
}

function getSauceUiCopy(locale: LocaleCode) {
  if (locale === "de") {
    return {
      options: "Saucenoptionen",
      ingredients: "Zutaten",
      instructions: "Anleitung",
      proTip: "Profi-Tipp",
      source: "Quelle",
      yield: "Ergibt",
      copyMethod: "Ablauf kopieren",
      copyMethodCopied: "Kopiert",
      copyMethodFailed: "Kopieren fehlgeschlagen",
      madeWith: "Erstellt mit Pizza Geek"
    };
  }

  if (locale === "it") {
    return {
      options: "Opzioni salsa",
      ingredients: "Ingredienti",
      instructions: "Istruzioni",
      proTip: "Consiglio pro",
      source: "Fonte",
      yield: "Resa",
      copyMethod: "Copia metodo",
      copyMethodCopied: "Copiato",
      copyMethodFailed: "Copia non riuscita",
      madeWith: "Creato con Pizza Geek"
    };
  }

  return {
    options: "Sauce Options",
    ingredients: "Ingredients",
    instructions: "Instructions",
    proTip: "Pro Tip",
    source: "Source",
    yield: "Yield",
    copyMethod: "Copy method",
    copyMethodCopied: "Copied",
    copyMethodFailed: "Copy failed",
    madeWith: "Made with Pizza Geek"
  };
}

const LOCALIZED_SAUCE_OPTIONS: Partial<Record<LocaleCode, Record<string, Partial<SauceRecipeOption>>>> = {
  de: {
    "neapolitan-primary": {
      cookType: "ungekocht",
      ingredients: [
        { item: "San-Marzano-Tomaten (DOP)", amount: "400g", note: "Ganz, geschaelt" },
        { item: "Meersalz", amount: "Nach Geschmack", note: "Zuerst pruefen, ob die Tomaten schon gesalzen sind" },
        { item: "Frische Basilikumblaetter", amount: "4-5 Blaetter", note: "Gezupft, nicht gehackt" },
        { item: "Natives Olivenoel extra", amount: "Ein kleiner Schuss", note: "Hochwertig" }
      ],
      instructions: [
        "Tomaten direkt in eine Schuessel von Hand zerdruecken - keinen Mixer oder Food Processor verwenden. Die Sauce soll Struktur haben, kein Pueree sein.",
        "Salz sparsam zugeben (die Tomaten vorher probieren - viele sind bereits vorgesalzen).",
        "Basilikumblaetter zerzupfen und vorsichtig unterheben.",
        "Olivenoel erst direkt vor der Verwendung daruebergeben.",
        "Sofort verwenden oder bis zu 3 Tage im Kuehlschrank lagern. Nicht kochen."
      ],
      proTip:
        "Echte neapolitanische Sauce bleibt roh. Der 90-Sekunden-Backvorgang im 900°F-Ofen \"gart\" die Sauce perfekt. Vorheriges Kochen macht den Geschmack stumpf und uebergart."
    }
  }
};

function localizeSauceOption(option: SauceRecipeOption | undefined, locale: LocaleCode): SauceRecipeOption | undefined {
  if (!option || locale === "en") return option;
  const localized = LOCALIZED_SAUCE_OPTIONS[locale]?.[option.id];
  return localized ? { ...option, ...localized } : option;
}

function localizeSauceSaltWarning(message: string, locale: LocaleCode): string {
  if (locale === "en") return message;

  const translations: Record<string, string> = {
    "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.":
      locale === "de"
        ? "Vor dem Salzen immer das Etikett der Dosentomaten prüfen. Viele Marken (Cento, La Valle usw.) enthalten bereits Salz. Erst probieren, dann anpassen."
        : "Controlla sempre l'etichetta dei pomodori in scatola prima di aggiungere sale. Molti marchi (Cento, La Valle ecc.) contengono già sale. Assaggia prima, regola dopo."
  };

  return translations[message] ?? message;
}

function getEnrichmentHint(
  key: "oil" | "sugar" | "honey" | "malt" | "lard" | "milk-powder",
  locale: LocaleCode,
  result: DoughResult
) {
  switch (key) {
    case "oil":
      return locale === "de"
        ? `Bereich: ${result.style.oil.min}-${result.style.oil.max}%`
        : locale === "it"
          ? `Intervallo: ${result.style.oil.min}-${result.style.oil.max}%`
          : `Range: ${result.style.oil.min}-${result.style.oil.max}%`;
    case "sugar":
      return locale === "de"
        ? `Bereich: ${result.style.sugar.min}-${result.style.sugar.max}%`
        : locale === "it"
          ? `Intervallo: ${result.style.sugar.min}-${result.style.sugar.max}%`
          : `Range: ${result.style.sugar.min}-${result.style.sugar.max}%`;
    case "honey":
      return locale === "de" ? "Alternative zu Zucker" : locale === "it" ? "Alternativa allo zucchero" : "Alternative to sugar";
    case "malt":
      return locale === "de" ? "Typisch: 0.5-1%" : locale === "it" ? "Tipico: 0.5-1%" : "Typical: 0.5-1%";
    case "lard":
      return locale === "de" ? "Alternative zu Öl" : locale === "it" ? "Alternativa all'olio" : "Alternative to oil";
    case "milk-powder":
      return locale === "de" ? "Typisch: 1-2%" : locale === "it" ? "Tipico: 1-2%" : "Typical: 1-2%";
    default:
      return undefined;
  }
}

function normalizeCalculatorInput(candidate: CalculatorInput): CalculatorInput {
  const styleId = candidate?.styleId ?? createDefaultInput().styleId;
  const base = createDefaultInput(styleId);
  const legacyPizzaOvenTemp = (candidate as CalculatorInput & { oven?: { pizzaOvenTempF?: number } }).oven
    ?.pizzaOvenTempF;
  const preferment = {
    ...base.preferment,
    ...candidate?.preferment
  };
  const naturalStarter =
    preferment.kind === "biga" &&
    (preferment.bigaStyle === "lievito-madre" || preferment.bigaStyle === "sauerdough");
  const sauce = {
    ...base.sauce,
    ...candidate?.sauce
  };
  const normalizedSauceOption = getSauceOption(styleId, sauce.recipeId);

  return {
    ...base,
    ...candidate,
    yeastType: naturalStarter ? "fresh" : candidate?.yeastType ?? base.yeastType,
    manualYeastPercent: naturalStarter ? undefined : candidate?.manualYeastPercent,
    fermentation: {
      ...base.fermentation,
      ...candidate?.fermentation
    },
    preferment: {
      ...preferment,
      bigaStyle: preferment.bigaStyle === "bassinage" ? "standard" : preferment.bigaStyle
    },
    sauce: {
      ...sauce,
      recipeId: normalizedSauceOption?.id ?? sauce.recipeId,
      style: normalizedSauceOption ? inferSauceStyleFromOption(normalizedSauceOption) : sauce.style
    },
    flourBlend: candidate?.flourBlend?.length ? normalizeBlendAfterRemoval(candidate.flourBlend) : base.flourBlend,
    pan: {
      ...base.pan,
      ...candidate?.pan,
      enabled: Boolean(getStyleById(styleId)?.panStyle)
    },
    oven: {
      ...base.oven,
      ...candidate?.oven,
      pizzaOvenStoneTempF:
        candidate?.oven?.pizzaOvenStoneTempF ??
        (legacyPizzaOvenTemp ? Math.max(650, legacyPizzaOvenTemp - 75) : base.oven.pizzaOvenStoneTempF),
      pizzaOvenTopTempF: candidate?.oven?.pizzaOvenTopTempF ?? legacyPizzaOvenTemp ?? base.oven.pizzaOvenTopTempF
    }
  };
}

function localizeWaterMessage(message: string, locale: LocaleCode): string {
  if (locale === "en") return message;

  const translations: Record<string, string> = {
    "Ice water needed. Chill water thoroughly and include ice if required.":
      locale === "de"
        ? "Sehr kaltes Wasser nötig. Wasser stark herunterkühlen und bei Bedarf Eis einplanen."
        : "Serve acqua molto fredda. Raffreddala bene e aggiungi ghiaccio se necessario.",
    "Very cold water. Refrigerate the water before mixing.":
      locale === "de"
        ? "Sehr kaltes Wasser. Das Wasser vor dem Mischen kühlschrankkalt machen."
        : "Acqua molto fredda. Mettila in frigo prima dell'impasto.",
    "Warm water. Check yeast freshness and avoid overheating the dough.":
      locale === "de"
        ? "Warmes Wasser. Hefefrische prüfen und ein Überhitzen des Teigs vermeiden."
        : "Acqua calda. Controlla la freschezza del lievito ed evita di surriscaldare l'impasto.",
    "Active dry yeast works best if bloomed separately in warm water first.":
      locale === "de"
        ? "Aktive Trockenhefe funktioniert am besten, wenn sie zuerst separat in warmem Wasser aktiviert wird."
        : "Il lievito secco attivo funziona meglio se viene prima riattivato separatamente in acqua tiepida."
  };

  return translations[message] ?? message;
}

function getOvenDetailText(
  input: CalculatorInput,
  labels: CopyText,
  unit: TemperatureUnit
): string | undefined {
  if (input.oven.type === "pizza-oven") {
    return `${labels.stoneTemp}: ${formatTemperature(input.oven.pizzaOvenStoneTempF, unit)}, ${labels.topHeat}: ${formatTemperature(input.oven.pizzaOvenTopTempF, unit)}`;
  }

  if (input.oven.type === "deck-oven") {
    return `${labels.deckTemp}: ${formatTemperature(input.oven.deckOvenTempF, unit)}`;
  }

  return undefined;
}

function localizePlanStep(
  step: BakeStep,
  input: CalculatorInput,
  locale: LocaleCode,
  unit: TemperatureUnit
): { label: string; description: string } {
  const prefermentName = getPrefermentDisplayName(input, locale);
  const roomTemp = formatTemperature(input.fermentation.roomTempF, unit);
  const cellarTemp = formatTemperature(input.fermentation.cellarTempF, unit);
  const fridgeTemp = formatTemperature(input.fermentation.fridgeTempF, unit);
  const loafWorkflow = isLoafStyleId(input.styleId);
  const tinLoaf = isTinLoafStyleId(input.styleId);

  switch (step.label) {
    case "Mix Poolish":
    case "Mix Biga":
    case "Mix Tiga":
    case "Mix Bassinage biga":
      return locale === "de"
        ? {
            label: `${prefermentName} mischen`,
            description: `Den ${prefermentName.toLowerCase()} ansetzen.`
          }
        : {
            label: `Mix ${prefermentName}`,
            description: `Build the ${prefermentName.toLowerCase()} preferment.`
          };
    case "Poolish ferments":
    case "Biga ferments":
    case "Tiga ferments":
    case "Bassinage biga ferments":
      return locale === "de"
        ? {
            label: `${prefermentName} reift`,
            description: `${input.preferment.roomHours}h bei Raumtemperatur.`
          }
        : {
            label: `${prefermentName} Ferments`,
            description: `${input.preferment.roomHours}h @ ${roomTemp}.`
          };
    case "Poolish cold ferment":
    case "Biga cold ferment":
    case "Tiga cold ferment":
    case "Bassinage biga cold ferment":
      return locale === "de"
        ? {
            label: `${prefermentName} kalt führen`,
            description: `${input.preferment.coldHours}h im Kühlschrank.`
          }
        : {
            label: `${prefermentName} Cold Ferment`,
            description: `${input.preferment.coldHours}h @ ${fridgeTemp}.`
          };
    case "Mix and knead":
      return locale === "de"
        ? {
            label: "Mischen und kneten",
            description: "Kombinieren, ruhen lassen und dann glatt ausarbeiten."
          }
        : {
            label: "Mix and knead",
            description: "Combine, rest, then knead or fold until smooth."
          };
    case "Mix final dough":
      return locale === "de"
        ? {
            label: "Hauptteig mischen",
            description: "Mischen und den Teig sauber ausentwickeln."
          }
        : {
            label: "Mix final dough",
            description: "Mix the main dough and finish development cleanly."
          };
    case "Bulk Ferment":
      return locale === "de"
        ? {
            label: "Stockgare",
            description: `${input.fermentation.roomTempHours}h bei etwa ${roomTemp}.`
          }
        : {
            label: "Bulk Ferment",
            description: `${input.fermentation.roomTempHours}h @ ${roomTemp}.`
          };
    case "Cellar Ferment":
      return locale === "de"
        ? {
            label: "Kellergare",
            description: `${input.fermentation.cellarTempHours}h bei etwa ${cellarTemp}.`
          }
        : {
            label: "Cellar Ferment",
            description: `${input.fermentation.cellarTempHours}h @ ${cellarTemp}.`
          };
    case "Cold Bulk":
      return locale === "de"
        ? {
            label: "Kalte Stockgare",
            description: `${input.fermentation.coldBulkHours}h bei etwa ${fridgeTemp} als Masse.${loafWorkflow ? " Danach vorformen und entspannen lassen." : " Danach teilen und rundschleifen."}`
          }
        : {
            label: "Cold Bulk",
            description: `${input.fermentation.coldBulkHours}h @ ${fridgeTemp} as one mass${loafWorkflow ? ", then pre-shape and rest." : ", then divide and ball."}`
          };
    case "Divide and ball":
      return locale === "de"
        ? {
            label: "Teilen und rundschleifen",
            description: "Nach der kalten Stockgare portionieren und straff rundschleifen."
          }
        : {
            label: "Divide and ball",
            description: "Portion the dough and ball it after the cold bulk stage."
          };
    case "Pre-shape":
      return locale === "de"
        ? {
            label: "Vorformen",
            description:
              input.doughBalls > 1
                ? `In ${input.doughBalls} Stücke teilen, locker vorformen und für den Endformschluss entspannen lassen.`
                : "Den Teig locker vorformen und vor dem Endformen entspannen lassen."
          }
        : {
            label: "Pre-shape",
            description:
              input.doughBalls > 1
                ? `Divide into ${input.doughBalls} pieces, pre-shape them gently, and let them relax before the final shape.`
                : "Pre-shape the dough gently and let it relax before the final shape."
          };
    case "Bench rest":
      return locale === "de"
        ? {
            label: "Zwischenruhe",
            description: "20 Minuten entspannen lassen, damit der Teig vor dem Endformen nachgibt."
          }
        : {
            label: "Bench rest",
            description: "Rest for 20 minutes so the dough relaxes before the final shape."
          };
    case "Final shape":
      return locale === "de"
        ? {
            label: "Endformen",
            description: tinLoaf
              ? "Straff zum Kastenlaib formen und mit dem Schluss nach unten in die gefettete Form setzen."
              : "Straff formen und mit dem Schluss nach oben in den bemehlten Garkorb oder in eine ausgelegte Schüssel setzen."
          }
        : {
            label: "Final shape",
            description: tinLoaf
              ? "Shape into a tight pan loaf and place it seam-side down in the greased tin."
              : "Shape tightly and place it seam-side up in a floured banneton or lined bowl."
          };
    case "Cold Ball":
      return locale === "de"
        ? {
            label: "Kalte Stückgare",
            description: `${input.fermentation.coldBallHours}h bei etwa ${fridgeTemp}.`
          }
        : {
            label: "Cold Ball",
            description: `${input.fermentation.coldBallHours}h @ ${fridgeTemp}.`
          };
    case "Cold Proof":
      return locale === "de"
        ? {
            label: "Kalte Gare",
            description: `${input.fermentation.coldBallHours}h bei etwa ${fridgeTemp} im Korb oder in der Form.`
          }
        : {
            label: "Cold Proof",
            description: `${input.fermentation.coldBallHours}h @ ${fridgeTemp} in the basket or tin.`
          };
    case "Temper":
      return locale === "de"
        ? {
            label: "Temperieren",
            description: `${input.fermentation.finalRiseHours}h vor dem Backen bei etwa ${roomTemp}.`
          }
        : {
            label: "Temper",
            description: `${input.fermentation.finalRiseHours}h @ ${roomTemp} before baking.`
          };
    case "Ball Proof":
      return locale === "de"
        ? {
            label: "Stückgare",
            description: `${input.fermentation.finalRiseHours}h Endgare vor dem Backen.`
          }
        : {
            label: "Ball Proof",
            description: `${input.fermentation.finalRiseHours}h final proof before baking.`
          };
    case "Final Proof":
      return locale === "de"
        ? {
            label: "Endgare",
            description: `${input.fermentation.finalRiseHours}h bei etwa ${roomTemp}, bis der Teig nach sanftem Druck langsam zurückkommt.`
          }
        : {
            label: "Final Proof",
            description: `${input.fermentation.finalRiseHours}h @ ${roomTemp} until the dough springs back slowly when pressed.`
          };
    case "Ready to bake":
      return locale === "de"
        ? {
            label: "Bereit zum Backen",
            description: loafWorkflow
              ? tinLoaf
                ? "Ofen vorheizen, den Kastenlaib ausbacken und vor dem Schneiden vollständig auskühlen lassen."
                : "Ofen vorheizen, den Laib einschneiden, mit Dampf oder Deckel anbacken und vollständig auskühlen lassen."
              : "Vorheizen, formen, belegen und backen."
          }
        : {
            label: "Ready to bake",
            description: loafWorkflow
              ? tinLoaf
                ? "Preheat, bake the tin loaf through, and cool fully before slicing."
                : "Preheat, score the loaf, start with steam or a cover, then bake and cool fully."
              : "Preheat, stretch, top, and bake."
          };
    default:
      return { label: step.label, description: step.description };
  }
}

function getMethodSteps(
  input: CalculatorInput,
  result: DoughResult,
  locale: LocaleCode,
  unit: TemperatureUnit
): string[] {
  const steps: string[] = [];
  const water = result.waterTemperature;
  const ingredients = result.ingredients;
  const prefermentName = getPrefermentDisplayName(input, locale);
  const prefermentLeaveningName = getPrefermentLeaveningName(input, locale);
  const sauceOption = localizeSauceOption(getSauceOption(input.styleId, input.sauce.recipeId), locale);
  const waterSummary = getWaterSummaryText(result, locale, unit);
  const bakeDetail = getOvenDetailText(input, copy[locale], unit);
  const bakeWindow = formatBakeWindow(result.oven, locale, unit, bakeDetail);
  const loafWorkflow = isLoafStyleId(input.styleId);
  const tinLoaf = isTinLoafStyleId(input.styleId);
  const naturalStarter = isNaturalStarterPreferment(input);

  if (input.preferment.kind !== "none") {
    steps.push(
      locale === "de"
        ? `${prefermentName} mischen: ${ingredients.prefermentFlour}g Mehl (${input.preferment.flourPercent}% vom Gesamtmehl), ${ingredients.prefermentWater}g Wasser und ${ingredients.prefermentYeast}g ${prefermentLeaveningName} kombinieren. ${input.preferment.roomHours}h bei Raumtemperatur reifen lassen${input.preferment.coldHours > 0 ? `, danach ${input.preferment.coldHours}h kalt führen` : ""}.`
        : `Mix ${prefermentName}: combine ${ingredients.prefermentFlour}g flour (${input.preferment.flourPercent}% of total flour), ${ingredients.prefermentWater}g water, and ${ingredients.prefermentYeast}g ${prefermentLeaveningName}. Ferment ${input.preferment.roomHours}h at room temperature${input.preferment.coldHours > 0 ? `, then ${input.preferment.coldHours}h cold` : ""}.`
    );
  }

  if (input.yeastType === "ady" && water.adyProofing) {
    steps.push(
      locale === "de"
        ? `Aktive Trockenhefe in ${water.adyProofing.proofingWaterG}g Wasser bei ${formatTemperaturePair(water.adyProofing.proofingWaterTempF, unit)} aktivieren. Die restlichen ${water.adyProofing.remainingWaterG}g Wasser auf ${formatTemperaturePair(water.adyProofing.remainingWaterTempF, unit)} einstellen.`
        : `Bloom ADY in ${water.adyProofing.proofingWaterG}g water at ${formatTemperaturePair(water.adyProofing.proofingWaterTempF, unit)}. Keep the remaining ${water.adyProofing.remainingWaterG}g water at ${formatTemperaturePair(water.adyProofing.remainingWaterTempF, unit)}.`
    );
  } else {
    steps.push(`${waterSummary.useText} ${waterSummary.targetText}`);
  }

  const flour = input.preferment.kind === "none" ? ingredients.totalFlour : ingredients.mainFlour;
  const waterAmount = input.preferment.kind === "none" ? ingredients.totalWater : ingredients.mainWater;
  const yeast = input.preferment.kind === "none" ? ingredients.totalYeast : ingredients.mainYeast;
  const yeastLabel =
    input.yeastType === "ady" ? "aktive Trockenhefe" : input.yeastType === "fresh" ? "Frischhefe" : "Instant-Trockenhefe";

  steps.push(
    locale === "de"
      ? `Hauptteig mischen mit ${flour}g ${input.preferment.kind === "none" ? "Mehl" : "zusätzlichem Mehl"}, ${waterAmount}g ${input.preferment.kind === "none" ? "Wasser" : "zusätzlichem Wasser"}, ${ingredients.totalSalt}g Salz${naturalStarter || !yeast ? "" : ` und ${yeast}g ${input.preferment.kind === "none" ? yeastLabel : `zusätzlicher ${yeastLabel}`}`}${input.preferment.kind !== "none" ? ` sowie dem reifen ${prefermentName}` : ""}.`
      : `Mix the final dough with ${flour}g ${input.preferment.kind === "none" ? "flour" : "fresh flour"}, ${waterAmount}g ${input.preferment.kind === "none" ? "water" : "fresh water"}, ${ingredients.totalSalt}g salt${naturalStarter || !yeast ? "" : `, and ${yeast}g ${input.preferment.kind === "none" ? (input.yeastType === "ady" ? "active dry yeast" : input.yeastType === "fresh" ? "fresh yeast" : "instant dry yeast") : `additional ${input.yeastType === "ady" ? "active dry yeast" : input.yeastType === "fresh" ? "fresh yeast" : "instant dry yeast"}`}`}${input.preferment.kind !== "none" ? `${naturalStarter || !yeast ? ", plus the ripe " : " plus the ripe "}${prefermentName}` : ""}.`
  );

  const enrichments = [
    ingredients.totalOil > 0 ? `${ingredients.totalOil}g Öl` : null,
    ingredients.totalLard > 0 ? `${ingredients.totalLard}g Schmalz` : null,
    ingredients.totalSugar > 0 ? `${ingredients.totalSugar}g Zucker` : null,
    ingredients.totalHoney > 0 ? `${ingredients.totalHoney}g Honig` : null,
    ingredients.totalMalt > 0 ? `${ingredients.totalMalt}g Malz` : null,
    ingredients.totalMilkPowder > 0 ? `${ingredients.totalMilkPowder}g Milchpulver` : null
  ].filter(Boolean);

  if (enrichments.length > 0) {
    steps.push(locale === "de" ? `Weitere Zutaten einarbeiten: ${enrichments.join(", ")}.` : `Add the enrichments: ${enrichments.join(", ")}.`);
  }

  if (input.mixerType === "hand") {
    steps.push(
      locale === "de"
        ? "20 Minuten ruhen lassen, dann kneten oder dehnen und falten, bis der Teig glatt und elastisch ist."
        : "Rest 20 minutes, then knead or stretch-and-fold until the dough is smooth and elastic."
    );
  } else if (input.mixerType === "spiral") {
    steps.push(
      locale === "de"
        ? "Etwa 3 Minuten auf Stufe 1 mischen, dann 5-8 Minuten auf Stufe 2 bis zur guten Entwicklung."
        : "Mix on speed 1 for about 3 minutes, then on speed 2 for 5-8 minutes until the dough is developed."
    );
  } else {
    steps.push(
      locale === "de"
        ? "Auf niedriger Stufe mischen, dann auf mittlerer Stufe auskneten, bis sich der Teig sauber von der Schüssel löst."
        : "Mix on low until combined, then on medium-low until the dough clears the bowl and feels cohesive."
    );
  }

  if (input.fermentation.roomTempHours > 0) {
    steps.push(
      locale === "de"
        ? `Stockgare ${input.fermentation.roomTempHours}h bei etwa ${formatTemperature(input.fermentation.roomTempF, unit)}.`
        : `Bulk ferment ${input.fermentation.roomTempHours}h @ ${formatTemperature(input.fermentation.roomTempF, unit)}.`
    );
  }

  if (input.fermentation.cellarTempHours > 0) {
    steps.push(
      locale === "de"
        ? `Danach ${input.fermentation.cellarTempHours}h bei Kellerbedingungen um ${formatTemperature(input.fermentation.cellarTempF, unit)}.`
        : `Cellar ferment ${input.fermentation.cellarTempHours}h @ ${formatTemperature(input.fermentation.cellarTempF, unit)}.`
    );
  }

  if (input.fermentation.coldBulkHours > 0) {
    steps.push(
      locale === "de"
        ? `Kalte Stockgare ${input.fermentation.coldBulkHours}h im Kühlschrank bei etwa ${formatTemperature(input.fermentation.fridgeTempF, unit)}.${loafWorkflow ? " Danach locker vorformen und entspannen lassen." : " Danach teilen und rundschleifen."}`
        : `Cold bulk ${input.fermentation.coldBulkHours}h @ ${formatTemperature(input.fermentation.fridgeTempF, unit)} as one mass${loafWorkflow ? ", then pre-shape and rest." : ", then divide and ball."}`
    );
  }

  if (loafWorkflow) {
    steps.push(
      locale === "de"
        ? input.doughBalls > 1
          ? `In ${input.doughBalls} Stücke zu je etwa ${input.ballWeight}g teilen, locker vorformen und 20 Minuten entspannen lassen.`
          : "Den Teig locker vorformen und 20 Minuten entspannen lassen."
        : input.doughBalls > 1
          ? `Divide into ${input.doughBalls} pieces around ${input.ballWeight}g each, pre-shape gently, and rest 20 minutes.`
          : "Pre-shape the dough gently, then rest it for 20 minutes."
    );
    steps.push(
      locale === "de"
        ? tinLoaf
          ? "Danach straff zu einem Kastenlaib formen und mit dem Schluss nach unten in die gefettete Form setzen."
          : "Danach straff formen und mit dem Schluss nach oben in den bemehlten Garkorb oder in eine ausgelegte Schüssel legen."
        : tinLoaf
          ? "Final-shape into a tight pan loaf and place it seam-side down in the greased tin."
          : "Final-shape tightly and place the loaf seam-side up in a floured banneton or lined bowl."
    );
  } else if (!result.style.panStyle) {
    const divideStep =
      locale === "de"
        ? `In ${input.doughBalls} Teigling${input.doughBalls === 1 ? "" : "e"} zu je etwa ${input.ballWeight}g teilen und rundschleifen.`
        : `Divide into ${input.doughBalls} dough ball${input.doughBalls === 1 ? "" : "s"} at about ${input.ballWeight}g each.`;

    if (input.fermentation.coldBulkHours > 0 || input.fermentation.coldBallHours === 0) {
      steps.push(divideStep);
    }
  }

  if (input.fermentation.coldBallHours > 0) {
    steps.push(
      locale === "de"
        ? loafWorkflow
          ? `Kalte Gare ${input.fermentation.coldBallHours}h im Kühlschrank bei etwa ${formatTemperature(input.fermentation.fridgeTempF, unit)}.`
          : `Kalte Stückgare ${input.fermentation.coldBallHours}h im Kühlschrank bei etwa ${formatTemperature(input.fermentation.fridgeTempF, unit)}.`
        : loafWorkflow
          ? `Cold proof ${input.fermentation.coldBallHours}h @ ${formatTemperature(input.fermentation.fridgeTempF, unit)} after shaping.`
          : `Cold ball ${input.fermentation.coldBallHours}h @ ${formatTemperature(input.fermentation.fridgeTempF, unit)} after dividing.`
    );
  }

  if (result.style.panStyle && !tinLoaf) {
    steps.push(
      locale === "de"
        ? "Die Form großzügig ölen, den Teig einlegen und vor dem finalen Ausziehen entspannt aufgehen lassen."
        : "Oil the pan generously, place the dough in it, and proof until relaxed before the final stretch."
    );
  }

  if (input.fermentation.finalRiseHours > 0) {
    steps.push(
      locale === "de"
        ? loafWorkflow
          ? `Endgare ${input.fermentation.finalRiseHours}h bei etwa ${formatTemperature(input.fermentation.roomTempF, unit)}, bis der Teig auf sanften Druck langsam zurückkommt.`
          : `Temperieren ${input.fermentation.finalRiseHours}h bei etwa ${formatTemperature(input.fermentation.roomTempF, unit)} vor dem Backen.`
        : loafWorkflow
          ? `Final proof ${input.fermentation.finalRiseHours}h @ ${formatTemperature(input.fermentation.roomTempF, unit)} until the dough springs back slowly when pressed.`
          : `Temper ${input.fermentation.finalRiseHours}h @ ${formatTemperature(input.fermentation.roomTempF, unit)} before baking.`
    );
  }

  if (result.sauce) {
    steps.push(
      locale === "de"
        ? `Sauce vorbereiten: ${sauceOption?.name ?? result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, copy.de)}. Etwa ${result.sauce.perPizzaGrams}g pro Pizza verwenden, insgesamt ${result.sauce.totalGrams}g für den Batch.`
        : `Prepare the sauce: ${result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, copy.en)}. Use about ${result.sauce.perPizzaGrams}g per pizza, ${result.sauce.totalGrams}g total.`
    );

    if (sauceOption?.instructions.length) {
      for (const instruction of sauceOption.instructions) {
        steps.push(instruction);
      }
    }
  }

  steps.push(
    locale === "de"
      ? loafWorkflow
        ? tinLoaf
          ? `Backen mit ${bakeWindow}, bis der Kastenlaib gleichmäßig gebräunt ist. Danach aus der Form nehmen und vor dem Schneiden vollständig auskühlen lassen.`
          : `Den Laib einschneiden und mit ${bakeWindow} backen. Zu Beginn Dampf geben oder abdecken, dann ausbacken und vor dem Schneiden vollständig auskühlen lassen.`
        : `Backen mit ${bakeWindow}, bis Boden und Rand sauber ausgebacken sind und die Oberfläche die gewünschte Farbe hat.`
      : loafWorkflow
        ? tinLoaf
          ? `Bake with ${bakeWindow} until the pan loaf is evenly browned. De-pan and cool completely before slicing.`
          : `Score the loaf and bake with ${bakeWindow}. Start with steam or a cover, then finish the bake and cool completely before slicing.`
        : `Bake with ${bakeWindow} until the bottom is crisp and the top is properly browned.`
  );

  return steps;
}

function buildQualitySignals(
  result: DoughResult,
  input: CalculatorInput,
  settings: AppSettings,
  labels: CopyText
): QualitySignal[] {
  const hydrationScore = scoreAgainstRange(
    input.hydrationPercent,
    result.style.hydration.min,
    result.style.hydration.recommended,
    result.style.hydration.max
  );
  const saltScore = scoreAgainstRange(
    input.saltPercent,
    result.style.salt.min,
    result.style.salt.recommended,
    result.style.salt.max
  );
  const fermentDelta = Math.abs(result.totalFermentationHours - result.style.fermentationHours.recommended);
  const fermentScore =
    result.totalFermentationHours < result.style.fermentationHours.min ||
    result.totalFermentationHours > result.style.fermentationHours.max
      ? 50
      : Math.round(
          100 -
            clampTo(
              fermentDelta / Math.max(1, result.style.fermentationHours.max - result.style.fermentationHours.min),
              0,
              1
            ) *
              26
        );
  const flourScore =
    result.flourBlend.warningColor === "danger"
      ? 35
      : result.flourBlend.warningColor === "warning"
        ? 55
        : result.flourBlend.warningColor === "notice"
          ? 75
          : 94;
  const waterScore = result.waterTemperature.warning ? 64 : 94;

  return [
    {
      label: labels.hydrationFit,
      value: `${input.hydrationPercent}%`,
      score: hydrationScore,
      tone: toneForScore(hydrationScore),
      note: `${result.style.hydration.min}-${result.style.hydration.max}%`
    },
    {
      label: labels.saltBalance,
      value: `${input.saltPercent}%`,
      score: saltScore,
      tone: toneForScore(saltScore),
      note: `${result.style.salt.recommended}%`
    },
    {
      label: labels.fermentPlan,
      value: `${result.totalFermentationHours}h`,
      score: fermentScore,
      tone: toneForScore(fermentScore),
      note: `${result.effectiveFermentationHours}h adjusted`
    },
    {
      label: labels.flourStrength,
      value: result.flourBlend.blendedW ? `W${result.flourBlend.blendedW}` : "Off",
      score: flourScore,
      tone: toneForScore(flourScore),
      note: result.flourBlend.warning ?? result.flourBlend.description
    },
    {
      label: labels.mixTemperature,
      value: formatTemperature(result.waterTemperature.waterTempF, settings.temperatureUnit),
      score: waterScore,
      tone: toneForScore(waterScore),
      note:
        result.waterTemperature.warning ??
        `Targets ${formatTemperature(result.waterTemperature.targetFdtF, settings.temperatureUnit)}`
    }
  ];
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
  const prefermentMode = getPrefermentMode(normalizedInput);
  const naturalStarterSelected = isNaturalStarterPreferment(normalizedInput);
  const prefermentName = getPrefermentDisplayName(normalizedInput, settings.language);
  const prefermentFlourGrams = prefermentMode === "none" ? 0 : (result.ingredients.prefermentFlour ?? 0);
  const mainDoughFlourGrams = prefermentMode === "none" ? 0 : (result.ingredients.mainFlour ?? 0);
  const mainDoughWaterGrams = prefermentMode === "none" ? 0 : (result.ingredients.mainWater ?? 0);
  const mainDoughYeastGrams = prefermentMode === "none" ? 0 : (result.ingredients.mainYeast ?? 0);
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
    () => buildQualitySignals(result, normalizedInput, settings, t),
    [normalizedInput, result, settings, t]
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
  const timelineItems = useMemo<PlannerTimelineItem[]>(
    () =>
      localizedPlan.map((step) => ({
        id: `${step.label}-${step.time.toISOString()}`,
        timeLabel: formatDateTime(step.time.toISOString(), settings.language),
        title: step.label,
        description: step.description
      })),
    [localizedPlan, settings.language]
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
    const notices: Array<{ tone: "ok" | "notice" | "warning" | "danger"; message: string }> = [];
    const hydrationNotice = getHydrationWorkabilityNotice(normalizedInput, result, settings.language);

    if (hydrationNotice) {
      notices.push(hydrationNotice);
    }

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
  const blendTotal = useMemo(
    () => normalizedInput.flourBlend.reduce((sum, item) => sum + item.percentage, 0),
    [normalizedInput.flourBlend]
  );
  const blendBreakdown = useMemo<BlendBreakdownRow[]>(() => {
    if (!normalizedInput.flourBlendEnabled) return [];

    const totalGrams = allocateBlendGrams(normalizedInput.flourBlend, result.ingredients.totalFlour);
    const prefermentGrams =
      prefermentMode === "none"
        ? normalizedInput.flourBlend.map(() => 0)
        : allocateBlendGrams(normalizedInput.flourBlend, prefermentFlourGrams);
    const mainGrams =
      prefermentMode === "none"
        ? normalizedInput.flourBlend.map(() => 0)
        : allocateBlendGrams(normalizedInput.flourBlend, mainDoughFlourGrams);

    return normalizedInput.flourBlend.map((item, index) => ({
      flourId: item.flourId,
      percentage: item.percentage,
      flourLabel: getFlourLabel(item.flourId),
      totalGrams: totalGrams[index] ?? 0,
      prefermentGrams: prefermentGrams[index] ?? 0,
      mainDoughGrams: mainGrams[index] ?? 0
    }));
  }, [
    mainDoughFlourGrams,
    normalizedInput.flourBlend,
    normalizedInput.flourBlendEnabled,
    prefermentFlourGrams,
    prefermentMode,
    result.ingredients.totalFlour
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
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        preferment: {
          ...normalized.preferment,
          ...patch
        }
      };
    });
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

  const setBlendItem = (index: number, patch: Partial<FlourBlendItem>) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      const updatedBlend = normalized.flourBlend.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      );

      return {
        ...normalized,
        flourBlend:
          patch.percentage === undefined
            ? updatedBlend
            : rebalanceBlendPercentages(updatedBlend, index, patch.percentage)
      };
    });
  };

  const addBlendItem = () => {
    if (normalizedInput.flourBlend.length >= 4) return;
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      const nextBlend = [
        ...normalized.flourBlend,
        { flourId: "caputo-manitoba-oro", percentage: 0 }
      ];

      return {
        ...normalized,
        flourBlend: rebalanceBlendPercentages(nextBlend, nextBlend.length - 1, Math.max(10, Math.round(100 / nextBlend.length)))
      };
    });
  };

  const removeBlendItem = (index: number) => {
    setInput((current) => {
      const normalized = normalizeCalculatorInput(current);
      return {
        ...normalized,
        flourBlend: normalizeBlendAfterRemoval(
          normalized.flourBlend.filter((_, itemIndex) => itemIndex !== index)
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
      lines.push(
        `${prefermentName}: ${normalizedInput.preferment.flourPercent}% = ${prefermentFlourGrams}g ${t.flour.toLowerCase()}; ${t.mainDoughAdditions}: ${mainDoughFlourGrams}g ${t.additionalFlour}, ${mainDoughWaterGrams}g ${t.additionalWater}, ${mainDoughYeastGrams}g ${t.additionalYeast}`
      );
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
                    step={0.1}
                    slider={hydrationSlider}
                    onChange={(value) => setPartial({ hydrationPercent: numberValue(value) })}
                  />
                  <Field
                    label={t.salt}
                    value={normalizedInput.saltPercent}
                    suffix="%"
                    step={0.1}
                    slider={saltSlider}
                    onChange={(value) => setPartial({ saltPercent: numberValue(value) })}
                  />
                  <Field
                    label={t.oil}
                    value={normalizedInput.oilPercent}
                    suffix="%"
                    hint={getEnrichmentHint("oil", settings.language, result)}
                    step={0.1}
                    slider={oilSlider}
                    onChange={(value) => setPartial({ oilPercent: numberValue(value) })}
                  />
                  <Field
                    label={t.sugar}
                    value={normalizedInput.sugarPercent}
                    suffix="%"
                    hint={getEnrichmentHint("sugar", settings.language, result)}
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
                        step={0.1}
                        onChange={(value) => setPartial({ honeyPercent: numberValue(value) })}
                      />
                      <Field
                        label={t.malt}
                        value={normalizedInput.maltPercent}
                        suffix="%"
                        hint={getEnrichmentHint("malt", settings.language, result)}
                        step={0.1}
                        onChange={(value) => setPartial({ maltPercent: numberValue(value) })}
                      />
                      <Field
                        label={t.lard}
                        value={normalizedInput.lardPercent}
                        suffix="%"
                        hint={getEnrichmentHint("lard", settings.language, result)}
                        step={0.1}
                        onChange={(value) => setPartial({ lardPercent: numberValue(value) })}
                      />
                      <Field
                        label={t.milkPowder}
                        value={normalizedInput.milkPowderPercent}
                        suffix="%"
                        hint={getEnrichmentHint("milk-powder", settings.language, result)}
                        step={0.1}
                        onChange={(value) => setPartial({ milkPowderPercent: numberValue(value) })}
                      />
                    </>
                  ) : null}
                </div>
                <div className="fieldGrid compact">
                  {naturalStarterSelected ? <Notice tone="notice">{getNaturalStarterUiHint(settings.language)}</Notice> : null}
                  {!naturalStarterSelected ? (
                    <SelectField
                      label={t.yeastType}
                      value={normalizedInput.yeastType}
                      onChange={(value) => setPartial({ yeastType: value as YeastType })}
                    >
                      {localizedYeastOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectField>
                  ) : null}
                  <SelectField
                    label={t.mixerType}
                    value={normalizedInput.mixerType}
                    onChange={(value) => setPartial({ mixerType: value as CalculatorInput["mixerType"] })}
                  >
                    <option value="hand">Hand</option>
                    <option value="planetary">Planetary</option>
                    <option value="spiral">Spiral</option>
                  </SelectField>
                  {!isGuidedMode ? (
                    <>
                      {!naturalStarterSelected ? (
                        <Field
                          label={t.manualYeast}
                          value={normalizedInput.manualYeastPercent ?? ""}
                          suffix="%"
                          step={0.01}
                          onChange={(value) =>
                            setPartial({ manualYeastPercent: value === "" ? undefined : numberValue(value) })
                          }
                        />
                      ) : null}
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
                      <p className="sectionMeta fieldMeta">
                        {t.mainDoughAdditions}: {mainDoughFlourGrams}g {t.additionalFlour}, {mainDoughWaterGrams}g {t.additionalWater}
                        {isNaturalStarterPreferment(normalizedInput) ? "" : `, ${mainDoughYeastGrams}g ${t.additionalYeast}`}
                      </p>
                    </div>
                  ) : null}

                  {normalizedInput.flourBlendEnabled ? (
                    <div className="blendList">
                      <p className="sectionMeta">
                        {t.blendTotal}: {blendTotal}%
                      </p>
                      {normalizedInput.flourBlend.map((item, index) => {
                        const breakdown = blendBreakdown[index];
                        const flourSelectLabel = `${t.flour} ${index + 1}`;
                        const flourPercentLabel = `${t.flourBlend} % ${index + 1}`;

                        return (
                          <div className="blendRow" key={`${item.flourId}-${index}`}>
                            <select
                              aria-label={flourSelectLabel}
                              title={flourSelectLabel}
                              value={item.flourId}
                              onChange={(event) => setBlendItem(index, { flourId: event.target.value })}
                            >
                              {FLOURS.map((flour) => (
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
                              onChange={(event) => setBlendItem(index, { percentage: numberValue(event.target.value) })}
                            />
                            <button
                              className="iconButton"
                              type="button"
                              onClick={() => removeBlendItem(index)}
                              aria-label="Remove flour"
                            >
                              x
                            </button>
                            {breakdown ? (
                              <p className="sectionMeta blendMeta">
                                {breakdown.totalGrams}g {t.totalLabel}
                                {prefermentMode !== "none"
                                  ? `, ${breakdown.prefermentGrams}g ${prefermentName}, ${breakdown.mainDoughGrams}g ${t.mainDoughAdditions.toLowerCase()}`
                                  : ""}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                      <button className="ghostButton" type="button" onClick={addBlendItem}>
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
                planMode={planMode}
                readyByLabel={t.readyBy}
                readyByValue={readyBy}
                readyDateLabel={t.readyDate}
                readyNowLabel={t.today}
                quickScheduleLabel={t.quickSchedule}
                quickScheduleHint={isBreadMode ? t.breadQuickScheduleHint : t.quickScheduleHint}
                startLabel={t.startAt}
                startValue={planStartValue}
                bakeValue={planBakeValue}
                shortcuts={plannerShortcuts}
                timeline={timelineItems}
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
                        lines: [
                          `${prefermentName}: ${normalizedInput.preferment.flourPercent}% = ${prefermentFlourGrams}g ${t.flour.toLowerCase()}, ${result.ingredients.prefermentWater}g ${t.water.toLowerCase()}, ${result.ingredients.prefermentYeast}g ${t.yeast.toLowerCase()}`,
                          `${t.mainDoughAdditions}: ${mainDoughFlourGrams}g ${t.additionalFlour}, ${mainDoughWaterGrams}g ${t.additionalWater}, ${mainDoughYeastGrams}g ${t.additionalYeast}`
                        ]
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
      <section className="printSheet">
        <div className="printSheetHeader">
          <p className="printKicker">{waterSummary.useText}</p>
          <div className="printTitleRow">
            <div>
              <p className="eyebrow">{activeStyle.origin}</p>
              <h2>{displayRecipeName}</h2>
              <p className="printSubtitle">
                {activeStyle.name} · {activeStyle.flourType} · {batchDescriptor}
              </p>
            </div>
            <div className="printMetricRow">
              <div>
                <span>{t.flour}</span>
                <strong>{result.ingredients.totalFlour}g</strong>
              </div>
              <div>
                <span>{t.water}</span>
                <strong>{result.ingredients.totalWater}g</strong>
              </div>
              <div>
                <span>{t.waterTemp}</span>
                <strong>{formatTemperature(result.waterTemperature.waterTempF, settings.temperatureUnit)}</strong>
              </div>
              <div>
                <span>{t.bake}</span>
                <strong>{formatTemperature(result.oven.tempF, settings.temperatureUnit)}</strong>
              </div>
            </div>
          </div>
        </div>

        {normalizedInput.flourBlendEnabled ? (
          <section className="printSection">
            <h3>{t.flourBlend}</h3>
            <ul className="printBulletList">
              {blendBreakdown.map((item) => (
                <li key={`${item.flourId}-print`}>
                  <strong>{item.flourLabel}</strong>: {item.percentage}% · {item.totalGrams}g
                  {prefermentMode !== "none"
                    ? ` · ${item.prefermentGrams}g ${prefermentName} · ${item.mainDoughGrams}g ${t.mainDoughAdditions.toLowerCase()}`
                    : ""}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="printSection">
          <h3>{sauceUi.ingredients}</h3>
          <div className="printIngredients">
            <div className="printIngredientRow">
              <span>{t.flour}</span>
              <strong>{result.ingredients.totalFlour}g</strong>
              <em>100%</em>
            </div>
            <div className="printIngredientRow">
              <span>{t.water}</span>
              <strong>{result.ingredients.totalWater}g</strong>
              <em>{result.percentages.hydration}%</em>
            </div>
            <div className="printIngredientRow">
              <span>{t.salt}</span>
              <strong>{result.ingredients.totalSalt}g</strong>
              <em>{result.percentages.salt}%</em>
            </div>
            <div className="printIngredientRow">
              <span>{t.yeast}</span>
              <strong>{result.ingredients.totalYeast}g</strong>
              <em>{result.percentages.yeast}%</em>
            </div>
            {result.ingredients.totalOil > 0 ? (
              <div className="printIngredientRow">
                <span>{t.oil}</span>
                <strong>{result.ingredients.totalOil}g</strong>
                <em>{result.percentages.oil}%</em>
              </div>
            ) : null}
            {result.ingredients.totalSugar > 0 ? (
              <div className="printIngredientRow">
                <span>{t.sugar}</span>
                <strong>{result.ingredients.totalSugar}g</strong>
                <em>{result.percentages.sugar}%</em>
              </div>
            ) : null}
            {result.ingredients.totalHoney > 0 ? (
              <div className="printIngredientRow">
                <span>{t.honey}</span>
                <strong>{result.ingredients.totalHoney}g</strong>
                <em>{result.percentages.honey}%</em>
              </div>
            ) : null}
            {result.ingredients.totalMalt > 0 ? (
              <div className="printIngredientRow">
                <span>{t.malt}</span>
                <strong>{result.ingredients.totalMalt}g</strong>
                <em>{result.percentages.malt}%</em>
              </div>
            ) : null}
            {result.ingredients.totalLard > 0 ? (
              <div className="printIngredientRow">
                <span>{t.lard}</span>
                <strong>{result.ingredients.totalLard}g</strong>
                <em>{result.percentages.lard}%</em>
              </div>
            ) : null}
            {result.ingredients.totalMilkPowder > 0 ? (
              <div className="printIngredientRow">
                <span>{t.milkPowder}</span>
                <strong>{result.ingredients.totalMilkPowder}g</strong>
                <em>{result.percentages.milkPowder}%</em>
              </div>
            ) : null}
          </div>
          {prefermentMode !== "none" ? (
            <div className="printCallout">
              <strong>{t.prefermentSplit}</strong>
              <span>
                {prefermentName}: {normalizedInput.preferment.flourPercent}% = {prefermentFlourGrams}g {t.flour.toLowerCase()}, {result.ingredients.prefermentWater}g{" "}
                {t.water.toLowerCase()}, {result.ingredients.prefermentYeast}g {t.yeast.toLowerCase()}
              </span>
              <span>
                {t.mainDoughAdditions}: {mainDoughFlourGrams}g {t.additionalFlour}, {mainDoughWaterGrams}g {t.additionalWater}, {mainDoughYeastGrams}g{" "}
                {t.additionalYeast}
              </span>
            </div>
          ) : null}
        </section>

        <section className="printSection">
          <h3>{t.fermentation}</h3>
          <div className="printFermentGrid">
            {[
              {
                key: "bulk" as const,
                hours: normalizedInput.fermentation.roomTempHours,
                tempF: normalizedInput.fermentation.roomTempF
              },
              {
                key: "temper" as const,
                hours: normalizedInput.fermentation.finalRiseHours,
                tempF: normalizedInput.fermentation.roomTempF
              },
              {
                key: "cold-ball" as const,
                hours: normalizedInput.fermentation.coldBallHours,
                tempF: normalizedInput.fermentation.fridgeTempF
              },
              {
                key: "cold-bulk" as const,
                hours: normalizedInput.fermentation.coldBulkHours,
                tempF: normalizedInput.fermentation.fridgeTempF
              },
              {
                key: "cellar" as const,
                hours: normalizedInput.fermentation.cellarTempHours,
                tempF: normalizedInput.fermentation.cellarTempF
              }
            ].map((stage) => {
              const content = getFermentationStageContent(stage.key, settings.language);
              return (
                <div className="printFermentCard" key={stage.key}>
                  <strong>{content.title}</strong>
                  <span>{content.subtitle}</span>
                  <b>
                    {stage.hours}h @ {formatTemperature(stage.tempF, settings.temperatureUnit)}
                  </b>
                  {content.note ? <p>{content.note}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="printSection printColumns">
          <div>
            <h3>{waterSummary.title}</h3>
            <p>{waterSummary.useText}</p>
            <p>{waterSummary.targetText}</p>
            {result.waterTemperature.warning ? <p>{localizeWaterMessage(result.waterTemperature.warning, settings.language)}</p> : null}
          </div>
          <div>
            <h3>{t.bake}</h3>
            <p>{formatBakeWindow(result.oven, settings.language, settings.temperatureUnit, ovenDetail)}</p>
            {result.pan ? (
              <p>
                {t.panGeometry}: {formatArea(result.pan.areaSqIn, settings.sizeUnit)}, {t.depth.toLowerCase()} {normalizedInput.pan.depth}
                {getLengthSuffix(settings.sizeUnit)}
              </p>
            ) : null}
          </div>
        </section>

        <section className="printSection">
          <h3>{t.method}</h3>
          <ol className="printMethodList">
            {methodSteps.map((instruction) => (
              <li key={`print-${instruction}`}>{instruction}</li>
            ))}
          </ol>
        </section>

        {localizedSelectedSauceOption && result.sauce ? (
          <section className="printSection">
            <h3>
              {t.sauce}: {localizedSelectedSauceOption.name}
            </h3>
            <p className="printSauceMeta">
              {settings.language === "de"
                ? `${result.sauce.perPizzaGrams}g / Pizza · ${result.sauce.totalGrams}g gesamt`
                : settings.language === "it"
                  ? `${result.sauce.perPizzaGrams}g / pizza · ${result.sauce.totalGrams}g totali`
                  : `${result.sauce.perPizzaGrams}g / pizza · ${result.sauce.totalGrams}g total`}
              {localizedSelectedSauceOption.source ? ` · ${sauceUi.source}: ${localizedSelectedSauceOption.source}` : ""}
              {localizedSelectedSauceOption.yield ? ` · ${sauceUi.yield}: ${localizedSelectedSauceOption.yield}` : ""}
            </p>
            <p className="printSauceWarning">
              {localizeSauceSaltWarning(selectedSauceCollection?.saltWarning ?? SAUCE_SALT_WARNING, settings.language)}
            </p>
            <div className="printColumns">
              <div>
                <h4>{sauceUi.ingredients}</h4>
                <ul className="printBulletList">
                  {localizedSelectedSauceOption.ingredients.map((ingredient) => (
                    <li key={`print-sauce-${ingredient.item}`}>
                      <strong>{ingredient.item}</strong>: {ingredient.amount}
                      {ingredient.note ? ` - ${ingredient.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>{sauceUi.instructions}</h4>
                <ol className="printMethodList compact">
                  {localizedSelectedSauceOption.instructions.map((instruction) => (
                    <li key={`print-sauce-step-${instruction}`}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
            {localizedSelectedSauceOption.proTip ? (
              <div className="printCallout">
                <strong>{sauceUi.proTip}</strong>
                <span>{localizedSelectedSauceOption.proTip}</span>
              </div>
            ) : null}
          </section>
        ) : null}

        <footer className="printFooter">
          {sauceUi.madeWith} · v{APP_VERSION} · GPL-3.0
        </footer>
      </section>
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


