import type { CalculatorInput, SauceRecipeOption } from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";

type SauceLabels = {
  sauceClassic: string;
  sauceRaw: string;
  sauceCooked: string;
  sauceWhite: string;
};

export function getSauceStyleLabel(style: CalculatorInput["sauce"]["style"], labels: SauceLabels): string {
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

export function getSauceUiCopy(locale: LocaleCode) {
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
  },
  it: {
    "neapolitan-primary": {
      cookType: "a crudo",
      ingredients: [
        { item: "Pomodori San Marzano (DOP)", amount: "400g", note: "Interi, pelati" },
        { item: "Sale marino", amount: "Quanto basta", note: "Assaggia prima se i pomodori sono già salati" },
        { item: "Foglie di basilico fresco", amount: "4-5 foglie", note: "Spezzate a mano, non tritate" },
        { item: "Olio extravergine d'oliva", amount: "Un filo", note: "Di buona qualità" }
      ],
      instructions: [
        "Schiaccia i pomodori a mano direttamente in una ciotola, senza usare blender o robot da cucina. La salsa deve restare rustica, non diventare una purea.",
        "Aggiungi il sale con moderazione e solo dopo aver assaggiato i pomodori, perché molti sono già salati.",
        "Spezza le foglie di basilico con le mani e incorporale delicatamente.",
        "Aggiungi un filo d'olio solo poco prima dell'utilizzo.",
        "Usa subito oppure conserva in frigorifero fino a 3 giorni. Non cuocere."
      ],
      proTip:
        "La vera salsa napoletana resta cruda. Nei 90 secondi di cottura in forno molto caldo cuoce perfettamente sulla pizza; precuocerla prima ne spegne il sapore e la cuoce troppo."
    }
  }
};

export function localizeSauceOption(option: SauceRecipeOption | undefined, locale: LocaleCode): SauceRecipeOption | undefined {
  if (!option || locale === "en") return option;
  const localized = LOCALIZED_SAUCE_OPTIONS[locale]?.[option.id];
  return localized ? { ...option, ...localized } : option;
}

export function localizeSauceSaltWarning(message: string, locale: LocaleCode): string {
  if (locale === "en") return message;

  const translations: Record<string, string> = {
    "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.":
      locale === "de"
        ? "Vor dem Salzen immer das Etikett der Dosentomaten prüfen. Viele Marken (Cento, La Valle usw.) enthalten bereits Salz. Erst probieren, dann anpassen."
        : "Controlla sempre l'etichetta dei pomodori in scatola prima di aggiungere sale. Molti marchi (Cento, La Valle ecc.) contengono già sale. Assaggia prima, regola dopo."
  };

  return translations[message] ?? message;
}