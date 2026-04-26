import { STYLE_IDS } from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";

export type ProductMode = "pizza" | "bread";

export type BreadProfile = {
  id: string;
  styleId: string;
  title: string;
  description: string;
  note: string;
};

export const DEFAULT_STYLE_ID_BY_PRODUCT: Record<ProductMode, string> = {
  pizza: STYLE_IDS.NEAPOLITAN,
  bread: STYLE_IDS.FOCACCIA
};

const BREAD_STYLE_IDS = new Set<string>([
  STYLE_IDS.FOCACCIA,
  STYLE_IDS.COUNTRY_LOAF,
  STYLE_IDS.SANDWICH_LOAF,
  STYLE_IDS.COCA,
  STYLE_IDS.FLAMMKUCHEN
]);

const LOAF_STYLE_IDS = new Set<string>([STYLE_IDS.COUNTRY_LOAF, STYLE_IDS.SANDWICH_LOAF]);
const TIN_LOAF_STYLE_IDS = new Set<string>([STYLE_IDS.SANDWICH_LOAF]);

export function isBreadStyleId(styleId: string) {
  return BREAD_STYLE_IDS.has(styleId);
}

export function isLoafStyleId(styleId: string) {
  return LOAF_STYLE_IDS.has(styleId);
}

export function isTinLoafStyleId(styleId: string) {
  return TIN_LOAF_STYLE_IDS.has(styleId);
}

export function getProductModeForStyleId(styleId: string): ProductMode {
  return isBreadStyleId(styleId) ? "bread" : "pizza";
}

export function getFallbackStyleIdForProductMode(mode: ProductMode, recentStyleId?: string) {
  if (recentStyleId && getProductModeForStyleId(recentStyleId) === mode) {
    return recentStyleId;
  }

  return DEFAULT_STYLE_ID_BY_PRODUCT[mode];
}

export function getBreadProfiles(locale: LocaleCode): BreadProfile[] {
  if (locale === "de") {
    return [
      {
        id: "focaccia-pan",
        styleId: STYLE_IDS.FOCACCIA,
        title: "Focaccia",
        description: "Luftig, oelreich und auf Blech oder in der Form zuhause.",
        note: "Sehr stark fuer Blech, Form und olivenoelbetonte Teige."
      },
      {
        id: "country-loaf",
        styleId: STYLE_IDS.COUNTRY_LOAF,
        title: "Country Loaf",
        description: "Freigeschobener Laib mit offener Krume, Dampfstart und kraeftiger Kruste.",
        note: "Passt fuer Banneton-, Dampf- und Sauerteig-nahe Ablaufe mit Hefeteig."
      },
      {
        id: "sandwich-loaf",
        styleId: STYLE_IDS.SANDWICH_LOAF,
        title: "Sandwich Loaf",
        description: "Weicher Kastenlaib fuer Scheiben, Toast und alltagstaugliche Sandwichbrote.",
        note: "Nutzt Formgeometrie und eine sanftere Backkurve fuer Kastenbrote."
      },
      {
        id: "coca-flatbread",
        styleId: STYLE_IDS.COCA,
        title: "Coca",
        description: "Olivenoel-Fladenbrot mit knusprigem Rand und zarter Mitte.",
        note: "Gut fuer Gemuese, Zwiebeln und herzhafte Blechbrote."
      },
      {
        id: "flammkuchen-flatbread",
        styleId: STYLE_IDS.FLAMMKUCHEN,
        title: "Flammkuchen",
        description: "Sehr duennes Fladenbrot fuer schnelle, heisse Backe.",
        note: "Praktisch fuer knusprige Flatbreads und schnelle Tests."
      }
    ];
  }

  return [
    {
      id: "focaccia-pan",
      styleId: STYLE_IDS.FOCACCIA,
      title: "Focaccia",
      description: "Airy, oil-rich pan bread with a golden base and pillowy crumb.",
      note: "Great for trays, pans, and olive-oil-rich doughs."
    },
    {
      id: "country-loaf",
      styleId: STYLE_IDS.COUNTRY_LOAF,
      title: "Country Loaf",
      description: "Freeform hearth loaf with open crumb, a steamed start, and a crackling crust.",
      note: "Built for banneton proofing, scoring, and a true steam-first bake."
    },
    {
      id: "sandwich-loaf",
      styleId: STYLE_IDS.SANDWICH_LOAF,
      title: "Sandwich Loaf",
      description: "Soft tin-baked loaf for slices, toast, and everyday sandwiches.",
      note: "Uses pan geometry and a gentler bake curve for square tin loaves."
    },
    {
      id: "coca-flatbread",
      styleId: STYLE_IDS.COCA,
      title: "Coca",
      description: "Olive-oil flatbread with crisp edges and a tender center.",
      note: "Great for vegetable-topped slabs and savory bakes."
    },
    {
      id: "flammkuchen-flatbread",
      styleId: STYLE_IDS.FLAMMKUCHEN,
      title: "Flammkuchen",
      description: "Ultra-thin flatbread for fast, hot bakes.",
      note: "Useful for crisp flatbread workflows and quick tests."
    }
  ];
}
