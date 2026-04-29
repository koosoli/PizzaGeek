import { describe, expect, it } from "vitest";
import { convertDimension, convertPanToUnit } from "../pan";

describe("pan conversions", () => {
  it("converts dimensions between inches and centimeters with the expected precision", () => {
    expect(convertDimension(10, "in", "cm")).toBe(25.4);
    expect(convertDimension(25.4, "cm", "in", 2)).toBe(10);
  });

  it("returns the same pan object when the unit does not change", () => {
    const pan = {
      enabled: true,
      shape: "rectangular" as const,
      length: 9,
      width: 13,
      diameter: 0,
      depth: 2,
      unit: "in" as const
    };

    expect(convertPanToUnit(pan, "in")).toBe(pan);
  });

  it("converts all pan dimensions when switching units", () => {
    const pan = {
      enabled: true,
      shape: "rectangular" as const,
      length: 9,
      width: 4,
      diameter: 0,
      depth: 4,
      unit: "in" as const
    };

    expect(convertPanToUnit(pan, "cm")).toEqual({
      ...pan,
      unit: "cm",
      length: 22.9,
      width: 10.2,
      diameter: 0,
      depth: 10.2
    });
  });
});