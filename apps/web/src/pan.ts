import type { CalculatorInput, SizeUnit } from "@pizza-geek/core";

function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function convertDimension(value: number, from: SizeUnit, to: SizeUnit, decimals = 1): number {
  if (from === to) return value;
  const converted = from === "in" ? value * 2.54 : value / 2.54;
  return roundTo(converted, decimals);
}

export function convertPanToUnit(pan: CalculatorInput["pan"], nextUnit: SizeUnit): CalculatorInput["pan"] {
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