import { STYLE_IDS, isBreadStyleId as isCoreBreadStyleId, isLoafStyleId as isCoreLoafStyleId, isTinLoafStyleId as isCoreTinLoafStyleId } from "@pizza-geek/core";
import type { LocaleCode } from "./appConfig";

export type ProductMode = "pizza" | "bread";

export type BreadProfile = {
  id: string;
  styleId: string;
  title: string;
  kicker: string;
  description: string;
  note: string;
  tags: string[];
};

export const DEFAULT_STYLE_ID_BY_PRODUCT: Record<ProductMode, string> = {
  pizza: STYLE_IDS.NEAPOLITAN,
  bread: STYLE_IDS.FOCACCIA
};

export function isBreadStyleId(styleId: string) {
  return isCoreBreadStyleId(styleId);
}

export function isLoafStyleId(styleId: string) {
  return isCoreLoafStyleId(styleId);
}

export function isTinLoafStyleId(styleId: string) {
  return isCoreTinLoafStyleId(styleId);
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
        kicker: "Blechbrot",
        description: "Luftig, oelreich und auf Blech oder in der Form zuhause.",
        note: "Sehr stark fuer Blech, Form und olivenoelbetonte Teige.",
        tags: ["78% Hydration", "12h Zielgare", "Blech / Form"]
      },
      {
        id: "country-loaf",
        styleId: STYLE_IDS.COUNTRY_LOAF,
        title: "Country Loaf",
        kicker: "Freigeschobener Laib",
        description: "Freigeschobener Laib mit offener Krume, Dampfstart und kraeftiger Kruste.",
        note: "Passt fuer Banneton-, Dampf- und Sauerteig-nahe Ablaufe mit Hefeteig.",
        tags: ["74% Hydration", "18h Zielgare", "Herdlaib"]
      },
      {
        id: "sandwich-loaf",
        styleId: STYLE_IDS.SANDWICH_LOAF,
        title: "Sandwich Loaf",
        kicker: "Kastenbrot",
        description: "Weicher Kastenlaib fuer Scheiben, Toast und alltagstaugliche Sandwichbrote.",
        note: "Nutzt Formgeometrie und eine sanftere Backkurve fuer Kastenbrote.",
        tags: ["68% Hydration", "12h Zielgare", "Kastenform"]
      },
      {
        id: "ciabatta",
        styleId: STYLE_IDS.CIABATTA,
        title: "Ciabatta",
        kicker: "Schlanke Brote / Stuecke",
        description: "Sehr feuchte, gefaltete Teiglinge mit offener Krume und duenn bemehlter Kruste.",
        note: "Ideal fuer Stretch-and-Fold, weiche Teigfuehrung und rustikale Sandwiches.",
        tags: ["78% Hydration", "18h Zielgare", "Freigeschoben"]
      },
      {
        id: "semolina-loaf",
        styleId: STYLE_IDS.SEMOLINA_LOAF,
        title: "Semolina Loaf",
        kicker: "Durum-Laib",
        description: "Goldgelber Laib mit feiner Griesnote, elastischer Krume und klarer Schnittfuehrung.",
        note: "Stark fuer Sesam, Hartweizengriess und goldene Krustenfarben.",
        tags: ["70% Hydration", "18h Zielgare", "Herdlaib"]
      },
      {
        id: "milk-bread",
        styleId: STYLE_IDS.MILK_BREAD,
        title: "Milk Bread",
        kicker: "Weicher Pullman-Stil",
        description: "Flauschiger, leicht suesser Kastenlaib fuer Toast, Sandwiches und weiche Brotscheiben.",
        note: "Gut fuer alltagstaugliche Brote mit zarter Kruste und pull-apart Krume.",
        tags: ["66% Hydration", "10h Zielgare", "Kastenform"]
      },
      {
        id: "whole-grain-hearth",
        styleId: STYLE_IDS.WHOLE_GRAIN_HEARTH,
        title: "Whole Grain Hearth",
        kicker: "Rustikaler Vollkornlaib",
        description: "Mehr Vollkornaroma, etwas kraeftigerer Biss und stabile Gare fuer herzhafte Laibe.",
        note: "Praktisch fuer taegliche Brote mit mehr Aroma, Farbe und Saatenoptionen.",
        tags: ["73% Hydration", "20h Zielgare", "Herdlaib"]
      },
      {
        id: "schiacciata",
        styleId: STYLE_IDS.SCHIACCIATA,
        title: "Schiacciata",
        kicker: "Duennes Blechbrot",
        description: "Flacher als Focaccia, knuspriger im Rand und sehr stark fuer belegte Scheiben.",
        note: "Hilfreich fuer Lunch-Brote, gefuellte Scheiben und knackige Olivenoel-Teige.",
        tags: ["72% Hydration", "12h Zielgare", "Blech / Form"]
      },
      {
        id: "coca-flatbread",
        styleId: STYLE_IDS.COCA,
        title: "Coca",
        kicker: "Mediterranes Fladenbrot",
        description: "Olivenoel-Fladenbrot mit knusprigem Rand und zarter Mitte.",
        note: "Gut fuer Gemuese, Zwiebeln und herzhafte Blechbrote.",
        tags: ["62% Hydration", "2h Zielgare", "Fladenbrot"]
      },
      {
        id: "flammkuchen-flatbread",
        styleId: STYLE_IDS.FLAMMKUCHEN,
        title: "Flammkuchen",
        kicker: "Sehr duennes Fladenbrot",
        description: "Sehr duennes Fladenbrot fuer schnelle, heisse Backe.",
        note: "Praktisch fuer knusprige Flatbreads und schnelle Tests.",
        tags: ["55% Hydration", "2h Zielgare", "Fladenbrot"]
      }
    ];
  }

  return [
    {
      id: "focaccia-pan",
      styleId: STYLE_IDS.FOCACCIA,
      title: "Focaccia",
      kicker: "Pan bread",
      description: "Airy, oil-rich pan bread with a golden base and pillowy crumb.",
      note: "Great for trays, pans, and olive-oil-rich doughs.",
      tags: ["78% hydration", "12h target", "Pan bake"]
    },
    {
      id: "country-loaf",
      styleId: STYLE_IDS.COUNTRY_LOAF,
      title: "Country Loaf",
      kicker: "Hearth loaf",
      description: "Freeform hearth loaf with open crumb, a steamed start, and a crackling crust.",
      note: "Built for banneton proofing, scoring, and a true steam-first bake.",
      tags: ["74% hydration", "18h target", "Steam-first"]
    },
    {
      id: "sandwich-loaf",
      styleId: STYLE_IDS.SANDWICH_LOAF,
      title: "Sandwich Loaf",
      kicker: "Tin loaf",
      description: "Soft tin-baked loaf for slices, toast, and everyday sandwiches.",
      note: "Uses pan geometry and a gentler bake curve for square tin loaves.",
      tags: ["68% hydration", "12h target", "Tin bake"]
    },
    {
      id: "ciabatta",
      styleId: STYLE_IDS.CIABATTA,
      title: "Ciabatta",
      kicker: "Rustic slipper bread",
      description: "Very wet folded dough pieces with open crumb and a lightly floured crust.",
      note: "Built for stretch-and-fold strength, open crumb, and sandwich-friendly slabs.",
      tags: ["78% hydration", "18h target", "Folded dough"]
    },
    {
      id: "semolina-loaf",
      styleId: STYLE_IDS.SEMOLINA_LOAF,
      title: "Semolina Loaf",
      kicker: "Durum hearth loaf",
      description: "Golden loaf with mild semolina sweetness, elastic crumb, and a crisp shell.",
      note: "Great for sesame-coated crusts, durum blends, and deep golden color.",
      tags: ["70% hydration", "18h target", "Hearth bake"]
    },
    {
      id: "milk-bread",
      styleId: STYLE_IDS.MILK_BREAD,
      title: "Milk Bread",
      kicker: "Soft enriched loaf",
      description: "Feathery pull-apart tin loaf with gentle sweetness and a soft bite.",
      note: "Useful for toast, buns, and everyday sandwich loaves that stay soft.",
      tags: ["66% hydration", "10h target", "Tin bake"]
    },
    {
      id: "whole-grain-hearth",
      styleId: STYLE_IDS.WHOLE_GRAIN_HEARTH,
      title: "Whole Grain Hearth",
      kicker: "Rustic whole-grain loaf",
      description: "Hearty hearth loaf with deeper grain flavor, steady spring, and fuller color.",
      note: "A good fit for seeded variations, daily loaves, and stronger whole-grain flavor.",
      tags: ["73% hydration", "20h target", "Hearth bake"]
    },
    {
      id: "schiacciata",
      styleId: STYLE_IDS.SCHIACCIATA,
      title: "Schiacciata",
      kicker: "Thin tray bread",
      description: "Flatter than focaccia, crisp at the edge, and ideal for sliced sandwich slabs.",
      note: "Useful for lunch breads, filled slices, and crisp olive-oil-rich doughs.",
      tags: ["72% hydration", "12h target", "Tray bake"]
    },
    {
      id: "coca-flatbread",
      styleId: STYLE_IDS.COCA,
      title: "Coca",
      kicker: "Mediterranean flatbread",
      description: "Olive-oil flatbread with crisp edges and a tender center.",
      note: "Great for vegetable-topped slabs and savory bakes.",
      tags: ["62% hydration", "2h target", "Flatbread"]
    },
    {
      id: "flammkuchen-flatbread",
      styleId: STYLE_IDS.FLAMMKUCHEN,
      title: "Flammkuchen",
      kicker: "Ultra-thin flatbread",
      description: "Ultra-thin flatbread for fast, hot bakes.",
      note: "Useful for crisp flatbread workflows and quick tests.",
      tags: ["55% hydration", "2h target", "Flatbread"]
    }
  ];
}
