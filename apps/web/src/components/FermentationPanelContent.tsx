import type { CalculatorInput, FermentationPresetKey, TemperatureUnit } from "@pizza-geek/core";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import type { LocaleCode } from "../appConfig";
import { Field } from "./Controls";

type FermentationLabels = {
  totalTime: string;
  advancedSchedule: string;
  roomTemp: string;
  cellarTemp: string;
  fridgeTemp: string;
  roomHumidity: string;
  cellarHumidity: string;
  fridgeHumidity: string;
};

type EnvironmentPresetId = "dry-home" | "balanced-kitchen" | "humid-summer" | "proofing-box";

const ENVIRONMENT_PRESETS: Record<
  EnvironmentPresetId,
  Pick<
    CalculatorInput["fermentation"],
    "roomTempF" | "roomHumidityPercent" | "cellarTempF" | "cellarHumidityPercent" | "fridgeTempF" | "fridgeHumidityPercent"
  >
> = {
  "dry-home": {
    roomTempF: 70,
    roomHumidityPercent: 38,
    cellarTempF: 55,
    cellarHumidityPercent: 62,
    fridgeTempF: 38,
    fridgeHumidityPercent: 38
  },
  "balanced-kitchen": {
    roomTempF: 72,
    roomHumidityPercent: 60,
    cellarTempF: 55,
    cellarHumidityPercent: 70,
    fridgeTempF: 39,
    fridgeHumidityPercent: 45
  },
  "humid-summer": {
    roomTempF: 78,
    roomHumidityPercent: 74,
    cellarTempF: 60,
    cellarHumidityPercent: 80,
    fridgeTempF: 40,
    fridgeHumidityPercent: 55
  },
  "proofing-box": {
    roomTempF: 80,
    roomHumidityPercent: 78,
    cellarTempF: 58,
    cellarHumidityPercent: 75,
    fridgeTempF: 39,
    fridgeHumidityPercent: 50
  }
};

function numberValue(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

function displayTemperatureValue(tempF: number, unit: TemperatureUnit): number {
  return unit === "F" ? Math.round(tempF) : fahrenheitToCelsius(tempF);
}

function parseTemperatureInput(value: string, unit: TemperatureUnit, fallbackF: number): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallbackF;
  return unit === "F" ? parsed : celsiusToFahrenheit(parsed);
}

function createMobileSlider(min: number, max: number, step = 1) {
  return { min, max, step, mobileOnly: true };
}

function createTemperatureSlider(minF: number, maxF: number, unit: TemperatureUnit, step = 1) {
  return createMobileSlider(displayTemperatureValue(minF, unit), displayTemperatureValue(maxF, unit), step);
}

export function getFermentationStageContent(
  key: "bulk" | "temper" | "cold-ball" | "cold-bulk" | "cellar",
  locale: LocaleCode
): { title: string; subtitle: string; note?: string } {
  const en = {
    bulk: { title: "Bulk Ferment", subtitle: "room temp" },
    temper: { title: "Temper", subtitle: "warm up before baking" },
    "cold-ball": { title: "Cold Ball", subtitle: "shaped balls in fridge" },
    "cold-bulk": {
      title: "Cold Bulk",
      subtitle: "bulk dough in fridge",
      note: "Ferment as one mass, then divide and ball after. Better structure retention for long ferments at high hydration."
    },
    cellar: {
      title: "Cellar Ferment",
      subtitle: "50-65°F / 10-18°C",
      note: "European method - slower than room temp, warmer than fridge."
    }
  } as const;

  const de = {
    bulk: { title: "Stockgare", subtitle: "bei Raumtemperatur" },
    temper: { title: "Temperieren", subtitle: "vor dem Backen akklimatisieren" },
    "cold-ball": { title: "Kalte Stückgare", subtitle: "geformte Teiglinge im Kühlschrank" },
    "cold-bulk": {
      title: "Kalte Stockgare",
      subtitle: "Teig als Masse im Kühlschrank",
      note: "Erst als Masse kalt führen, danach teilen und rundschleifen. Das bringt bei langen, weichen Teigen oft mehr Struktur."
    },
    cellar: {
      title: "Kellergare",
      subtitle: "10-18°C / 50-65°F",
      note: "Europäische Methode - langsamer als Raumtemperatur, wärmer als der Kühlschrank."
    }
  } as const;

  const it = {
    bulk: { title: "Puntata", subtitle: "a temperatura ambiente" },
    temper: { title: "Temperare", subtitle: "riportare in temperatura prima della cottura" },
    "cold-ball": { title: "Appretto frigo", subtitle: "panetti formati in frigorifero" },
    "cold-bulk": {
      title: "Puntata frigo",
      subtitle: "impasto in massa in frigorifero",
      note: "Fermenta in massa, poi dividi e pirlala dopo. Tiene meglio la struttura nelle fermentazioni lunghe e molto idratate."
    },
    cellar: {
      title: "Fermentazione in cantina",
      subtitle: "10-18°C / 50-65°F",
      note: "Metodo europeo: più lento della temperatura ambiente, più caldo del frigorifero."
    }
  } as const;

  if (locale === "de") return de[key];
  if (locale === "it") return it[key];
  return en[key];
}

function getHumidityHint(zone: "room" | "cellar" | "fridge", locale: LocaleCode) {
  if (locale === "de") {
    if (zone === "room") return "Unter 45% verhautet der Teig schneller. Gut abdecken.";
    if (zone === "cellar") return "Hohe Feuchte bremst Austrocknung, macht den Teig aber klebriger.";
    return "Trockene Kühlschränke ziehen Feuchte stark. Boxen gut schließen.";
  }

  if (locale === "it") {
    if (zone === "room") return "Sotto il 45% UR l'impasto asciuga più in fretta. Coprilo bene.";
    if (zone === "cellar") return "Più umidità riduce l'asciugatura ma può rendere l'impasto più appiccicoso.";
    return "I frigoriferi asciutti tirano via umidità velocemente. I contenitori ben chiusi contano molto.";
  }

  if (zone === "room") return "Below 45% RH the dough skins faster. Keep it covered.";
  if (zone === "cellar") return "Higher humidity reduces drying but can make the dough tackier.";
  return "Dry fridges pull moisture fast. Covered boxes matter most here.";
}

function getEnvironmentPresetCopy(id: EnvironmentPresetId, locale: LocaleCode) {
  if (locale === "de") {
    const labels: Record<EnvironmentPresetId, { label: string; note: string }> = {
      "dry-home": { label: "Trockene Wohnung", note: "Winterluft, mehr Hautbildung" },
      "balanced-kitchen": { label: "Normale Küche", note: "Ausgewogener Standard" },
      "humid-summer": { label: "Schwüler Sommer", note: "Warm und feucht" },
      "proofing-box": { label: "Gärbox", note: "Warm und kontrolliert" }
    };
    return labels[id];
  }

  if (locale === "it") {
    const labels: Record<EnvironmentPresetId, { label: string; note: string }> = {
      "dry-home": { label: "Casa secca", note: "aria invernale, più crosta" },
      "balanced-kitchen": { label: "Cucina equilibrata", note: "buon punto di partenza" },
      "humid-summer": { label: "Estate umida", note: "caldo e appiccicoso" },
      "proofing-box": { label: "Box di lievitazione", note: "caldo e controllato" }
    };
    return labels[id];
  }

  const labels: Record<EnvironmentPresetId, { label: string; note: string }> = {
    "dry-home": { label: "Dry home", note: "winter air, more skinning" },
    "balanced-kitchen": { label: "Balanced kitchen", note: "good default" },
    "humid-summer": { label: "Humid summer", note: "warm and sticky" },
    "proofing-box": { label: "Proofing box", note: "warm and controlled" }
  };
  return labels[id];
}

type FermentationPanelContentProps = {
  locale: LocaleCode;
  temperatureUnit: TemperatureUnit;
  presetKeys: FermentationPresetKey[];
  preset: FermentationPresetKey;
  totalFermentationHours: number;
  showFermentationDetails: boolean;
  fermentation: CalculatorInput["fermentation"];
  labels: FermentationLabels;
  onPresetChange: (key: FermentationPresetKey) => void;
  onToggleDetails: () => void;
  onFermentationChange: (patch: Partial<CalculatorInput["fermentation"]>) => void;
  getPresetLabel: (key: FermentationPresetKey) => string;
};

export function FermentationPanelContent({
  locale,
  temperatureUnit,
  presetKeys,
  preset,
  totalFermentationHours,
  showFermentationDetails,
  fermentation,
  labels,
  onPresetChange,
  onToggleDetails,
  onFermentationChange,
  getPresetLabel
}: FermentationPanelContentProps) {
  return (
    <>
      <div className="presetScroller">
        {presetKeys.map((key) => (
          <button className={preset === key ? "chip active" : "chip"} key={key} type="button" onClick={() => onPresetChange(key)}>
            {getPresetLabel(key)}
          </button>
        ))}
      </div>
      <div className="panelMetaRow">
        <span className="sectionMeta">
          {getPresetLabel(preset)} · {totalFermentationHours}h {labels.totalTime.toLowerCase()}
        </span>
        <button className={`subtleDisclosure ${showFermentationDetails ? "open" : ""}`} type="button" onClick={onToggleDetails}>
          <span>{labels.advancedSchedule}</span>
          <ChevronDown size={16} />
        </button>
      </div>
      {showFermentationDetails ? (
        <>
          <div className="panelMetaRow">
            <strong>{locale === "de" ? "Umgebung" : locale === "it" ? "Ambiente" : "Environment"}</strong>
            <span className="sectionMeta">
              {locale === "de"
                ? "Schnellprofile für Temperatur und Luftfeuchte."
                : locale === "it"
                  ? "Profili rapidi per temperatura e umidità."
                  : "Quick profiles for temperature and humidity."}
            </span>
          </div>
          <div className="plannerShortcutGrid">
            {(Object.keys(ENVIRONMENT_PRESETS) as EnvironmentPresetId[]).map((presetId) => {
              const presetCopy = getEnvironmentPresetCopy(presetId, locale);
              return (
                <button key={presetId} className="plannerShortcut" type="button" onClick={() => onFermentationChange(ENVIRONMENT_PRESETS[presetId])}>
                  <strong>{presetCopy.label}</strong>
                  <span>{presetCopy.note}</span>
                </button>
              );
            })}
          </div>
          <div className="fermentGrid">
            <FermentationStageCard {...getFermentationStageContent("bulk", locale)}>
              <Field
                label={locale === "de" ? "Dauer" : locale === "it" ? "Ore" : "Hours"}
                value={fermentation.roomTempHours}
                suffix="h"
                step={0.5}
                slider={createMobileSlider(0, Math.max(24, fermentation.roomTempHours), 0.5)}
                onChange={(value) => onFermentationChange({ roomTempHours: numberValue(value) })}
              />
              <Field
                label={labels.roomTemp}
                value={displayTemperatureValue(fermentation.roomTempF, temperatureUnit)}
                suffix={`°${temperatureUnit}`}
                slider={createTemperatureSlider(60, 86, temperatureUnit)}
                onChange={(value) => onFermentationChange({ roomTempF: parseTemperatureInput(value, temperatureUnit, fermentation.roomTempF) })}
              />
              <Field
                label={labels.roomHumidity}
                value={fermentation.roomHumidityPercent}
                suffix="%"
                step={1}
                hint={getHumidityHint("room", locale)}
                slider={createMobileSlider(30, 90, 1)}
                onChange={(value) => onFermentationChange({ roomHumidityPercent: numberValue(value, fermentation.roomHumidityPercent) })}
              />
            </FermentationStageCard>
            <FermentationStageCard {...getFermentationStageContent("temper", locale)}>
              <Field
                label={locale === "de" ? "Dauer" : locale === "it" ? "Ore" : "Hours"}
                value={fermentation.finalRiseHours}
                suffix="h"
                step={0.5}
                slider={createMobileSlider(0, Math.max(24, fermentation.finalRiseHours), 0.5)}
                onChange={(value) => onFermentationChange({ finalRiseHours: numberValue(value) })}
              />
              <Field
                label={labels.roomTemp}
                value={displayTemperatureValue(fermentation.roomTempF, temperatureUnit)}
                suffix={`°${temperatureUnit}`}
                slider={createTemperatureSlider(60, 86, temperatureUnit)}
                onChange={(value) => onFermentationChange({ roomTempF: parseTemperatureInput(value, temperatureUnit, fermentation.roomTempF) })}
              />
              <Field
                label={labels.roomHumidity}
                value={fermentation.roomHumidityPercent}
                suffix="%"
                step={1}
                hint={getHumidityHint("room", locale)}
                slider={createMobileSlider(30, 90, 1)}
                onChange={(value) => onFermentationChange({ roomHumidityPercent: numberValue(value, fermentation.roomHumidityPercent) })}
              />
            </FermentationStageCard>
            <FermentationStageCard {...getFermentationStageContent("cold-ball", locale)}>
              <Field
                label={locale === "de" ? "Dauer" : locale === "it" ? "Ore" : "Hours"}
                value={fermentation.coldBallHours}
                suffix="h"
                step={0.5}
                slider={createMobileSlider(0, Math.max(96, fermentation.coldBallHours), 1)}
                onChange={(value) => onFermentationChange({ coldBallHours: numberValue(value) })}
              />
              <Field
                label={labels.fridgeTemp}
                value={displayTemperatureValue(fermentation.fridgeTempF, temperatureUnit)}
                suffix={`°${temperatureUnit}`}
                slider={createTemperatureSlider(33, 45, temperatureUnit)}
                onChange={(value) => onFermentationChange({ fridgeTempF: parseTemperatureInput(value, temperatureUnit, fermentation.fridgeTempF) })}
              />
              <Field
                label={labels.fridgeHumidity}
                value={fermentation.fridgeHumidityPercent}
                suffix="%"
                step={1}
                hint={getHumidityHint("fridge", locale)}
                slider={createMobileSlider(30, 80, 1)}
                onChange={(value) => onFermentationChange({ fridgeHumidityPercent: numberValue(value, fermentation.fridgeHumidityPercent) })}
              />
            </FermentationStageCard>
            <FermentationStageCard {...getFermentationStageContent("cold-bulk", locale)}>
              <Field
                label={locale === "de" ? "Dauer" : locale === "it" ? "Ore" : "Hours"}
                value={fermentation.coldBulkHours}
                suffix="h"
                step={0.5}
                slider={createMobileSlider(0, Math.max(96, fermentation.coldBulkHours), 1)}
                onChange={(value) => onFermentationChange({ coldBulkHours: numberValue(value) })}
              />
              <Field
                label={labels.fridgeTemp}
                value={displayTemperatureValue(fermentation.fridgeTempF, temperatureUnit)}
                suffix={`°${temperatureUnit}`}
                slider={createTemperatureSlider(33, 45, temperatureUnit)}
                onChange={(value) => onFermentationChange({ fridgeTempF: parseTemperatureInput(value, temperatureUnit, fermentation.fridgeTempF) })}
              />
              <Field
                label={labels.fridgeHumidity}
                value={fermentation.fridgeHumidityPercent}
                suffix="%"
                step={1}
                hint={getHumidityHint("fridge", locale)}
                slider={createMobileSlider(30, 80, 1)}
                onChange={(value) => onFermentationChange({ fridgeHumidityPercent: numberValue(value, fermentation.fridgeHumidityPercent) })}
              />
            </FermentationStageCard>
            <FermentationStageCard {...getFermentationStageContent("cellar", locale)}>
              <Field
                label={locale === "de" ? "Dauer" : locale === "it" ? "Ore" : "Hours"}
                value={fermentation.cellarTempHours}
                suffix="h"
                step={0.5}
                slider={createMobileSlider(0, Math.max(72, fermentation.cellarTempHours), 0.5)}
                onChange={(value) => onFermentationChange({ cellarTempHours: numberValue(value) })}
              />
              <Field
                label={labels.cellarTemp}
                value={displayTemperatureValue(fermentation.cellarTempF, temperatureUnit)}
                suffix={`°${temperatureUnit}`}
                slider={createTemperatureSlider(45, 68, temperatureUnit)}
                onChange={(value) => onFermentationChange({ cellarTempF: parseTemperatureInput(value, temperatureUnit, fermentation.cellarTempF) })}
              />
              <Field
                label={labels.cellarHumidity}
                value={fermentation.cellarHumidityPercent}
                suffix="%"
                step={1}
                hint={getHumidityHint("cellar", locale)}
                slider={createMobileSlider(45, 90, 1)}
                onChange={(value) => onFermentationChange({ cellarHumidityPercent: numberValue(value, fermentation.cellarHumidityPercent) })}
              />
            </FermentationStageCard>
          </div>
        </>
      ) : null}
    </>
  );
}

function FermentationStageCard({
  title,
  subtitle,
  note,
  children
}: {
  title: string;
  subtitle: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="fermentCard">
      <div className="fermentCardHeader">
        <strong>{title}</strong>
        <span>({subtitle})</span>
      </div>
      <div className="fermentCardFields">{children}</div>
      {note ? <p className="fermentCardNote">{note}</p> : null}
    </div>
  );
}