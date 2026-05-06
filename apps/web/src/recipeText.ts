import { describeBlend, getSauceOption, type BakeStep, type CalculatorInput, type DoughResult, type TemperatureUnit } from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";
import { formatTemperature } from "./appHelpers";
import { copy, type CopyText } from "./copy";
import { getBakeDurationUnit } from "./locale";
import { getPrefermentDisplayName, getPrefermentLeaveningName } from "./preferment";
import { isLoafStyleId, isTinLoafStyleId } from "./productModes";
import { getSauceStyleLabel, localizeSauceOption } from "./sauceText";

export function getWaterSummaryText(result: DoughResult, locale: LocaleCode, unit: TemperatureUnit) {
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

function getFlourBlendInstruction(
  input: CalculatorInput,
  locale: LocaleCode,
  blend: CalculatorInput["prefermentFlourBlend"]
): string {
  if (!input.flourBlendEnabled || blend.length === 0) return "";

  const description = describeBlend(blend, input.customFlours ?? []);
  if (!description) return "";

  if (locale === "de") {
    return `Mehlauswahl: ${description}.`;
  }

  if (locale === "it") {
    return `Miscela di farine: ${description}.`;
  }

  return `Flour blend: ${description}.`;
}

export function getEnrichmentHint(
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

export function localizeWaterMessage(message: string, locale: LocaleCode): string {
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

export function getOvenDetailText(
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

export function localizePlanStep(
  step: BakeStep,
  input: CalculatorInput,
  locale: LocaleCode,
  unit: TemperatureUnit
): { label: string; description: string } {
  const prefermentName = getPrefermentDisplayName(input.preferment, locale);
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
                : "Preheat, score the loaf, start with steam or a cover, then bake and cool fully before slicing."
              : "Preheat, stretch, top, and bake."
          };
    default:
      return { label: step.label, description: step.description };
  }
}

export function getMethodSteps(
  input: CalculatorInput,
  result: DoughResult,
  locale: LocaleCode,
  unit: TemperatureUnit
): string[] {
  const steps: string[] = [];
  const water = result.waterTemperature;
  const ingredients = result.ingredients;
  const prefermentName = getPrefermentDisplayName(input.preferment, locale);
  const prefermentLeaveningName = getPrefermentLeaveningName(input.preferment, locale);
  const sauceOption = localizeSauceOption(getSauceOption(input.styleId, input.sauce.recipeId), locale);
  const waterSummary = getWaterSummaryText(result, locale, unit);
  const bakeDetail = getOvenDetailText(input, copy[locale], unit);
  const bakeWindow = formatBakeWindow(result.oven, locale, unit, bakeDetail);
  const loafWorkflow = isLoafStyleId(input.styleId);
  const tinLoaf = isTinLoafStyleId(input.styleId);
  const yeastLabel = getCommercialYeastLabel(input, locale);
  const prefermentFlourInstruction = getFlourBlendInstruction(input, locale, input.prefermentFlourBlend);
  const mainDoughFlourInstruction = getFlourBlendInstruction(input, locale, input.mainDoughFlourBlend);

  if (input.preferment.kind !== "none") {
    steps.push(
      locale === "de"
        ? `${prefermentName} mischen: ${ingredients.prefermentFlour}g Mehl (${input.preferment.flourPercent}% vom Gesamtmehl), ${ingredients.prefermentWater}g Wasser und ${ingredients.prefermentYeast}g ${prefermentLeaveningName} kombinieren.${prefermentFlourInstruction ? ` ${prefermentFlourInstruction}` : ""} ${input.preferment.roomHours}h bei Raumtemperatur reifen lassen${input.preferment.coldHours > 0 ? `, danach ${input.preferment.coldHours}h kalt führen` : ""}.`
        : locale === "it"
          ? `Prepara ${prefermentName}: unisci ${ingredients.prefermentFlour}g di farina (${input.preferment.flourPercent}% della farina totale), ${ingredients.prefermentWater}g di acqua e ${ingredients.prefermentYeast}g di ${prefermentLeaveningName}.${prefermentFlourInstruction ? ` ${prefermentFlourInstruction}` : ""} Lascia fermentare per ${input.preferment.roomHours}h a temperatura ambiente${input.preferment.coldHours > 0 ? `, poi ${input.preferment.coldHours}h al freddo` : ""}.`
          : `Mix ${prefermentName}: combine ${ingredients.prefermentFlour}g flour (${input.preferment.flourPercent}% of total flour), ${ingredients.prefermentWater}g water, and ${ingredients.prefermentYeast}g ${prefermentLeaveningName}.${prefermentFlourInstruction ? ` ${prefermentFlourInstruction}` : ""} Ferment ${input.preferment.roomHours}h at room temperature${input.preferment.coldHours > 0 ? `, then ${input.preferment.coldHours}h cold` : ""}.`
    );
  }

  if (input.yeastType === "ady" && water.adyProofing) {
    steps.push(
      locale === "de"
        ? `Aktive Trockenhefe in ${water.adyProofing.proofingWaterG}g Wasser bei ${formatTemperaturePair(water.adyProofing.proofingWaterTempF, unit)} aktivieren. Die restlichen ${water.adyProofing.remainingWaterG}g Wasser auf ${formatTemperaturePair(water.adyProofing.remainingWaterTempF, unit)} einstellen.`
        : locale === "it"
          ? `Attiva il lievito secco attivo in ${water.adyProofing.proofingWaterG}g di acqua a ${formatTemperaturePair(water.adyProofing.proofingWaterTempF, unit)}. Tieni i restanti ${water.adyProofing.remainingWaterG}g di acqua a ${formatTemperaturePair(water.adyProofing.remainingWaterTempF, unit)}.`
          : `Bloom ADY in ${water.adyProofing.proofingWaterG}g water at ${formatTemperaturePair(water.adyProofing.proofingWaterTempF, unit)}. Keep the remaining ${water.adyProofing.remainingWaterG}g water at ${formatTemperaturePair(water.adyProofing.remainingWaterTempF, unit)}.`
    );
  } else {
    steps.push(`${waterSummary.useText} ${waterSummary.targetText}`);
  }

  const flour = input.preferment.kind === "none" ? ingredients.totalFlour : ingredients.mainFlour;
  const waterAmount = input.preferment.kind === "none" ? ingredients.totalWater : ingredients.mainWater;
  const yeast = input.preferment.kind === "none" ? ingredients.totalYeast : ingredients.mainYeast;

  steps.push(
    locale === "de"
      ? `Hauptteig mischen mit ${flour}g ${input.preferment.kind === "none" ? "Mehl" : "zusätzlichem Mehl"}, ${waterAmount}g ${input.preferment.kind === "none" ? "Wasser" : "zusätzlichem Wasser"}, ${ingredients.totalSalt}g Salz${!yeast ? "" : ` und ${yeast}g ${input.preferment.kind === "none" ? yeastLabel : `zusätzlicher ${yeastLabel}`}`}${input.preferment.kind !== "none" ? `${!yeast ? " sowie dem reifen " : " plus dem reifen "}${prefermentName}` : ""}.${mainDoughFlourInstruction ? ` ${mainDoughFlourInstruction}` : ""}`
      : locale === "it"
        ? `Impasta il finale con ${flour}g di ${input.preferment.kind === "none" ? "farina" : "farina aggiuntiva"}, ${waterAmount}g di ${input.preferment.kind === "none" ? "acqua" : "acqua aggiuntiva"}, ${ingredients.totalSalt}g di sale${!yeast ? "" : ` e ${yeast}g di ${input.preferment.kind === "none" ? yeastLabel : `${yeastLabel} aggiuntivo`}`}${input.preferment.kind !== "none" ? `${!yeast ? ", più il " : ", poi aggiungi il "}${prefermentName} maturo` : ""}.${mainDoughFlourInstruction ? ` ${mainDoughFlourInstruction}` : ""}`
        : `Mix the final dough with ${flour}g ${input.preferment.kind === "none" ? "flour" : "fresh flour"}, ${waterAmount}g ${input.preferment.kind === "none" ? "water" : "fresh water"}, ${ingredients.totalSalt}g salt${!yeast ? "" : `, and ${yeast}g ${input.preferment.kind === "none" ? yeastLabel : `additional ${yeastLabel}`}`}${input.preferment.kind !== "none" ? `${!yeast ? ", plus the ripe " : " plus the ripe "}${prefermentName}` : ""}.${mainDoughFlourInstruction ? ` ${mainDoughFlourInstruction}` : ""}`
  );

  const enrichments = [
    ingredients.totalOil > 0 ? `${ingredients.totalOil}g ${locale === "de" ? "Öl" : locale === "it" ? "olio" : "oil"}` : null,
    ingredients.totalLard > 0 ? `${ingredients.totalLard}g ${locale === "de" ? "Schmalz" : locale === "it" ? "strutto" : "lard"}` : null,
    ingredients.totalSugar > 0 ? `${ingredients.totalSugar}g ${locale === "de" ? "Zucker" : locale === "it" ? "zucchero" : "sugar"}` : null,
    ingredients.totalHoney > 0 ? `${ingredients.totalHoney}g ${locale === "de" ? "Honig" : locale === "it" ? "miele" : "honey"}` : null,
    ingredients.totalMalt > 0 ? `${ingredients.totalMalt}g ${locale === "de" ? "Malz" : locale === "it" ? "malto" : "malt"}` : null,
    ingredients.totalMilkPowder > 0 ? `${ingredients.totalMilkPowder}g ${locale === "de" ? "Milchpulver" : locale === "it" ? "latte in polvere" : "milk powder"}` : null
  ].filter(Boolean);

  if (enrichments.length > 0) {
    steps.push(
      locale === "de"
        ? `Weitere Zutaten einarbeiten: ${enrichments.join(", ")}.`
        : locale === "it"
          ? `Aggiungi gli arricchimenti: ${enrichments.join(", ")}.`
          : `Add the enrichments: ${enrichments.join(", ")}.`
    );
  }

  if (input.mixerType === "hand") {
    steps.push(
      locale === "de"
        ? "20 Minuten ruhen lassen, dann kneten oder dehnen und falten, bis der Teig glatt und elastisch ist."
        : locale === "it"
          ? "Lascia riposare 20 minuti, poi impasta oppure fai pieghe finché l'impasto è liscio ed elastico."
          : "Rest 20 minutes, then knead or stretch-and-fold until the dough is smooth and elastic."
    );
  } else if (input.mixerType === "spiral") {
    steps.push(
      locale === "de"
        ? "Etwa 3 Minuten auf Stufe 1 mischen, dann 5-8 Minuten auf Stufe 2 bis zur guten Entwicklung."
        : locale === "it"
          ? "Impasta circa 3 minuti in prima velocità, poi 5-8 minuti in seconda finché l'impasto è ben sviluppato."
          : "Mix on speed 1 for about 3 minutes, then on speed 2 for 5-8 minutes until the dough is developed."
    );
  } else {
    steps.push(
      locale === "de"
        ? "Auf niedriger Stufe mischen, dann auf mittlerer Stufe auskneten, bis sich der Teig sauber von der Schüssel löst."
        : locale === "it"
          ? "Impasta a bassa velocità finché gli ingredienti si uniscono, poi a velocità medio-bassa finché l'impasto si stacca bene dalla ciotola."
          : "Mix on low until combined, then on medium-low until the dough clears the bowl and feels cohesive."
    );
  }

  if (input.fermentation.roomTempHours > 0) {
    steps.push(
      locale === "de"
        ? `Stockgare ${input.fermentation.roomTempHours}h bei etwa ${formatTemperature(input.fermentation.roomTempF, unit)}.`
        : locale === "it"
          ? `Puntata di ${input.fermentation.roomTempHours}h a circa ${formatTemperature(input.fermentation.roomTempF, unit)}.`
          : `Bulk ferment ${input.fermentation.roomTempHours}h @ ${formatTemperature(input.fermentation.roomTempF, unit)}.`
    );
  }

  if (input.fermentation.cellarTempHours > 0) {
    steps.push(
      locale === "de"
        ? `Danach ${input.fermentation.cellarTempHours}h bei Kellerbedingungen um ${formatTemperature(input.fermentation.cellarTempF, unit)}.`
        : locale === "it"
          ? `Poi ${input.fermentation.cellarTempHours}h in cantina a circa ${formatTemperature(input.fermentation.cellarTempF, unit)}.`
          : `Cellar ferment ${input.fermentation.cellarTempHours}h @ ${formatTemperature(input.fermentation.cellarTempF, unit)}.`
    );
  }

  if (input.fermentation.coldBulkHours > 0) {
    steps.push(
      locale === "de"
        ? `Kalte Stockgare ${input.fermentation.coldBulkHours}h im Kühlschrank bei etwa ${formatTemperature(input.fermentation.fridgeTempF, unit)}.${loafWorkflow ? " Danach locker vorformen und entspannen lassen." : " Danach teilen und rundschleifen."}`
        : locale === "it"
          ? `Puntata in frigo per ${input.fermentation.coldBulkHours}h a circa ${formatTemperature(input.fermentation.fridgeTempF, unit)}.${loafWorkflow ? " Poi fai una preforma leggera e lascia rilassare l'impasto." : " Poi dividi e fai le palline."}`
          : `Cold bulk ${input.fermentation.coldBulkHours}h @ ${formatTemperature(input.fermentation.fridgeTempF, unit)} as one mass${loafWorkflow ? ", then pre-shape and rest." : ", then divide and ball."}`
    );
  }

  if (loafWorkflow) {
    steps.push(
      locale === "de"
        ? input.doughBalls > 1
          ? `In ${input.doughBalls} Stücke zu je etwa ${input.ballWeight}g teilen, locker vorformen und 20 Minuten entspannen lassen.`
          : "Den Teig locker vorformen und 20 Minuten entspannen lassen."
        : locale === "it"
          ? input.doughBalls > 1
            ? `Dividi in ${input.doughBalls} pezzi da circa ${input.ballWeight}g, fai una preforma delicata e lascia riposare 20 minuti.`
            : "Fai una preforma delicata e lascia riposare l'impasto 20 minuti."
          : input.doughBalls > 1
            ? `Divide into ${input.doughBalls} pieces around ${input.ballWeight}g each, pre-shape gently, and rest 20 minutes.`
            : "Pre-shape the dough gently, then rest it for 20 minutes."
    );
    steps.push(
      locale === "de"
        ? tinLoaf
          ? "Danach straff zu einem Kastenlaib formen und mit dem Schluss nach unten in die gefettete Form setzen."
          : "Danach straff formen und mit dem Schluss nach oben in den bemehlten Garkorb oder in eine ausgelegte Schüssel legen."
        : locale === "it"
          ? tinLoaf
            ? "Dai la forma finale a cassetta e metti l'impasto nello stampo unto con la chiusura verso il basso."
            : "Dai una forma stretta e metti il filone con la chiusura verso l'alto in un banneton infarinato o in una ciotola foderata."
          : tinLoaf
            ? "Final-shape into a tight pan loaf and place it seam-side down in the greased tin."
            : "Final-shape tightly and place the loaf seam-side up in a floured banneton or lined bowl."
    );
  } else if (!result.style.panStyle) {
    const divideStep =
      locale === "de"
        ? `In ${input.doughBalls} Teigling${input.doughBalls === 1 ? "" : "e"} zu je etwa ${input.ballWeight}g teilen und rundschleifen.`
        : locale === "it"
          ? `Dividi in ${input.doughBalls} pall${input.doughBalls === 1 ? "a" : "e"} da circa ${input.ballWeight}g e fai la pirlatura.`
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
        : locale === "it"
          ? loafWorkflow
            ? `Appretto in frigo per ${input.fermentation.coldBallHours}h a circa ${formatTemperature(input.fermentation.fridgeTempF, unit)} dopo la formatura.`
            : `Appretto in frigo per ${input.fermentation.coldBallHours}h a circa ${formatTemperature(input.fermentation.fridgeTempF, unit)} dopo la divisione.`
          : loafWorkflow
            ? `Cold proof ${input.fermentation.coldBallHours}h @ ${formatTemperature(input.fermentation.fridgeTempF, unit)} after shaping.`
            : `Cold ball ${input.fermentation.coldBallHours}h @ ${formatTemperature(input.fermentation.fridgeTempF, unit)} after dividing.`
    );
  }

  if (result.style.panStyle && !tinLoaf) {
    steps.push(
      locale === "de"
        ? "Die Form großzügig ölen, den Teig einlegen und vor dem finalen Ausziehen entspannt aufgehen lassen."
        : locale === "it"
          ? "Ungere bene la teglia, sistemare l'impasto dentro e lasciarlo rilassare prima della stesura finale."
          : "Oil the pan generously, place the dough in it, and proof until relaxed before the final stretch."
    );
  }

  if (input.fermentation.finalRiseHours > 0) {
    steps.push(
      locale === "de"
        ? loafWorkflow
          ? `Endgare ${input.fermentation.finalRiseHours}h bei etwa ${formatTemperature(input.fermentation.roomTempF, unit)}, bis der Teig auf sanften Druck langsam zurückkommt.`
          : `Temperieren ${input.fermentation.finalRiseHours}h bei etwa ${formatTemperature(input.fermentation.roomTempF, unit)} vor dem Backen.`
        : locale === "it"
          ? loafWorkflow
            ? `Appretto finale di ${input.fermentation.finalRiseHours}h a circa ${formatTemperature(input.fermentation.roomTempF, unit)} finché l'impasto ritorna lentamente se premuto.`
            : `Rimetti in temperatura per ${input.fermentation.finalRiseHours}h a circa ${formatTemperature(input.fermentation.roomTempF, unit)} prima della cottura.`
          : loafWorkflow
            ? `Final proof ${input.fermentation.finalRiseHours}h @ ${formatTemperature(input.fermentation.roomTempF, unit)} until the dough springs back slowly when pressed.`
            : `Temper ${input.fermentation.finalRiseHours}h @ ${formatTemperature(input.fermentation.roomTempF, unit)} before baking.`
    );
  }

  if (result.sauce) {
    steps.push(
      locale === "de"
        ? `Sauce vorbereiten: ${sauceOption?.name ?? result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, copy.de)}. Etwa ${result.sauce.perPizzaGrams}g pro Pizza verwenden, insgesamt ${result.sauce.totalGrams}g für den Batch.`
        : locale === "it"
          ? `Prepara il sugo: ${sauceOption?.name ?? result.sauce.recipeName ?? getSauceStyleLabel(result.sauce.style, copy.it)}. Usa circa ${result.sauce.perPizzaGrams}g per pizza, ${result.sauce.totalGrams}g in totale.`
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
      : locale === "it"
        ? loafWorkflow
          ? tinLoaf
            ? `Cuoci ${bakeWindow} finché il pane in cassetta è ben dorato. Toglilo dallo stampo e lascialo raffreddare completamente prima di tagliarlo.`
            : `Incidi il filone e cuoci ${bakeWindow}. Parti con vapore o coperchio, termina la cottura e fai raffreddare completamente prima di tagliare.`
          : `Cuoci ${bakeWindow} finché il fondo è croccante e la superficie è ben colorita.`
        : loafWorkflow
          ? tinLoaf
            ? `Bake with ${bakeWindow} until the pan loaf is evenly browned. De-pan and cool completely before slicing.`
            : `Score the loaf and bake with ${bakeWindow}. Start with steam or a cover, then finish the bake and cool completely before slicing.`
          : `Bake with ${bakeWindow} until the bottom is crisp and the top is properly browned.`
  );

  return steps;
}

function formatTemperaturePair(tempF: number, unit: TemperatureUnit): string {
  const secondaryUnit: TemperatureUnit = unit === "F" ? "C" : "F";
  return `${formatTemperature(tempF, unit)} (${formatTemperature(tempF, secondaryUnit)})`;
}

export function formatBakeWindow(
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

function getCommercialYeastLabel(input: CalculatorInput, locale: LocaleCode): string {
  if (locale === "de") {
    if (input.yeastType === "none") return "keiner zusätzlichen Hefe";
    if (input.yeastType === "ady") return "aktive Trockenhefe";
    if (input.yeastType === "fresh") return "Frischhefe";
    return "Instant-Trockenhefe";
  }

  if (locale === "it") {
    if (input.yeastType === "none") return "nessun lievito aggiuntivo";
    if (input.yeastType === "ady") return "lievito secco attivo";
    if (input.yeastType === "fresh") return "lievito fresco";
    return "lievito secco istantaneo";
  }

  if (input.yeastType === "none") return "no commercial yeast";
  if (input.yeastType === "ady") return "active dry yeast";
  if (input.yeastType === "fresh") return "fresh yeast";
  return "instant dry yeast";
}
