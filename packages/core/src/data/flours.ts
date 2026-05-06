import type { Flour } from "../domain/types";

function flour(
  id: string,
  brand: string,
  name: string,
  type: Flour["type"],
  proteinPercent: number,
  wStrength: string | undefined,
  absorptionAdjustment: number,
  regions: string[]
): Flour {
  return {
    id,
    brand,
    name,
    type,
    proteinPercent,
    wStrength,
    absorptionAdjustment,
    regions
  };
}

export const FLOURS: Flour[] = [
  flour("caputo-pizzeria", "Caputo", "Pizzeria (Blue Bag)", "tipo00", 12.5, "W260-280", 0, ["GLOBAL", "EU", "US"]),
  flour("caputo-chef-red", "Caputo", "Chef's Flour (Red Bag)", "tipo00", 13, "W300-320", 1, ["GLOBAL", "EU", "US"]),
  flour("caputo-cuoco-gold", "Caputo", "Cuoco (Gold Bag)", "tipo00", 12.5, "W260-280", 1, ["GLOBAL", "EU", "US"]),
  flour("caputo-nuvola", "Caputo", "Nuvola", "tipo0", 13.5, "W280-300", 2, ["GLOBAL", "EU", "US"]),
  flour("caputo-nuvola-super", "Caputo", "Nuvola Super", "tipo0", 13.5, "W320-340", 4, ["GLOBAL", "EU", "US"]),
  flour("caputo-americana", "Caputo", "00 Americana", "high-gluten", 14.25, "W360-380", 5, ["GLOBAL", "EU", "US"]),
  flour("caputo-manitoba-oro", "Caputo", "Manitoba Oro", "manitoba", 14.5, "W360-390", 5, ["GLOBAL", "EU", "US"]),

  flour("molino-grassi-pizza", "Molino Grassi", "Tipo 00 Pizza Flour", "tipo00", 12, "W260", -1, ["GLOBAL", "EU", "US"]),
  flour("molino-grassi-organic", "Molino Grassi", "Tipo 00 Organic", "tipo00", 11.5, "W230", -2, ["GLOBAL", "EU"]),
  flour("molino-grassi-manitoba-organic", "Molino Grassi", "Manitoba Organic", "manitoba", 13, "W380-400", 5, ["GLOBAL", "EU"]),
  flour("le-5-stagioni-napoletana", "Le 5 Stagioni", "Pizza Napoletana", "tipo00", 13, "W300", 1, ["GLOBAL", "EU", "US"]),
  flour("le-farine-magiche-pizza", "Le Farine Magiche", 'Pizza', "tipo0", 12.4, "W280", 1, ["GLOBAL", "EU"]),

  flour("polselli-classica", "Polselli", "Classica Tipo 00", "tipo00", 12, "W270", 0, ["GLOBAL", "EU"]),
  flour("polselli-super", "Polselli", "Super Tipo 00", "tipo00", 12.5, "W300", 2, ["GLOBAL", "EU"]),
  flour("polselli-rinforzato", "Polselli", "Tipo 00 Rinforzato", "tipo00", 13.5, "W350", 5, ["GLOBAL", "EU"]),

  flour("dallagiovanna-napoletana", "Dallagiovanna", "La Napoletana Tipo 00", "tipo00", 12.5, "W310", 2, ["GLOBAL", "EU"]),
  flour("dallagiovanna-rossa", "Dallagiovanna", "Rossa Tipo 00", "tipo00", 14, "W390", 5, ["GLOBAL", "EU"]),
  flour("dallagiovanna-pizza", "Dallagiovanna", "Pizza Tipo 00", "tipo00", 10, "W210", -2, ["GLOBAL", "EU"]),
  flour("dallagiovanna-uniqua-blue", "Dallagiovanna", "Uniqua Blue (Tipo 1)", "tipo0", 14, "W380", 5, ["GLOBAL", "EU"]),

  flour("petra-5063", "Petra (Molino Quaglia)", "5063 Special Tipo 00", "tipo00", 12.5, "W260-280", 1, ["GLOBAL", "EU"]),
  flour("petra-0102-hp", "Petra (Molino Quaglia)", "0102 HP Tipo 1", "tipo0", 13.5, "W320-340", 4, ["GLOBAL", "EU"]),
  flour("petra-3", "Petra (Molino Quaglia)", "3 Tipo 1", "tipo0", 12, "W240-260", 0, ["GLOBAL", "EU"]),

  flour("pivetti-tipo-00", "Pivetti", "Tipo 00", "tipo00", 10, "W180-220", -2, ["GLOBAL", "EU"]),
  flour("pivetti-manitoba", "Pivetti", "Manitoba Tipo 0", "manitoba", 14, "W350", 5, ["GLOBAL", "EU"]),
  flour("molino-spadoni-pz1", "Molino Spadoni", "PZ1 Tipo 00 Al Taglio", "tipo00", 14, "W160-180", 1, ["GLOBAL", "EU"]),
  flour("molino-spadoni-pizza", "Molino Spadoni", "Farina 00 per Pizza", "tipo00", 12, "W250", 0, ["GLOBAL", "EU"]),

  flour("aurora-pizzamehl", "Aurora", "Pizzamehl Tipo 00", "tipo00", 12, "W260", 0, ["GLOBAL", "EU"]),
  flour("diamant-405", "Diamant", "Type 405 Weizenmehl", "all-purpose", 10.5, undefined, -2, ["GLOBAL", "EU"]),
  flour("diamant-550", "Diamant", "Type 550 Weizenmehl", "bread", 12, undefined, 0, ["GLOBAL", "EU"]),
  flour("friessinger-la-verace", "Friessinger Muhle", "La Verace Pizzamehl", "tipo00", 12.5, "W280", 1, ["GLOBAL", "EU"]),
  flour("rosselmuhle-tipo-00", "Rosselmuhle", "Pizzamehl Tipo 00", "tipo00", 11.5, "W240", -1, ["GLOBAL", "EU"]),
  flour("aldi-goldahren", "Aldi (Goldahren)", "Pizzamehl", "tipo00", 11, undefined, -2, ["GLOBAL", "EU"]),
  flour("lidl-belbake", "Lidl (Belbake)", "Pizzamehl Tipo 00", "tipo00", 11.5, undefined, -2, ["GLOBAL", "EU"]),
  flour("le-moulin-1704-pizza", "Le Moulin 1704", "Pizza 1 kg", "tipo00", 11.5, undefined, -2, ["GLOBAL", "EU"]),

  flour("ooni-tipo-00", "Ooni", "Type 00 Pizza Flour", "tipo00", 11.8, "W320", 2, ["GLOBAL", "EU", "US"]),
  flour("king-arthur-bread", "King Arthur", "Bread Flour", "bread", 12.7, "W290", 2, ["GLOBAL", "US"]),
  flour("king-arthur-ap", "King Arthur", "All-Purpose", "all-purpose", 11.7, "W250", 0, ["GLOBAL", "US"]),
  flour("all-trumps", "Gold Medal (General Mills)", "All Trumps", "high-gluten", 14.2, undefined, 5, ["GLOBAL", "US"]),
  flour("sir-lancelot", "King Arthur", "Sir Lancelot", "high-gluten", 14.2, "W360-390", 5, ["GLOBAL", "US"]),
  flour("store-brand-bread", "Generic", "Store Brand Bread Flour", "bread", 12.5, undefined, 1, ["GLOBAL", "US"]),

  flour("manitoba", "Generic", "Manitoba", "manitoba", 14, "W350+", 5, ["GLOBAL", "EU"]),
  flour("plain-flour", "Generic", "Plain / AP Flour", "all-purpose", 10.5, "W200", -2, ["GLOBAL", "EU"]),
  flour("semolina-fine", "Generic", "Semolina (Durum) - Fine", "bread", 13.5, undefined, 1, ["GLOBAL"]),
  flour("whole-wheat", "Generic", "Whole Wheat", "whole-grain", 13.5, undefined, 5, ["GLOBAL"]),
  flour("tipo-00-generic", "Generic", "Tipo 00", "tipo00", 10.5, "W180-220", -2, ["GLOBAL"])
];

export function getFlourById(id: string): Flour | undefined {
  return FLOURS.find((flour) => flour.id === id);
}

export function getFloursByRegion(region: string): Flour[] {
  const normalized = region.toUpperCase();
  return FLOURS.filter((flour) => flour.regions.includes("GLOBAL") || flour.regions.includes(normalized));
}
