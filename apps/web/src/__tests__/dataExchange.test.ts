import { createDefaultInput, STYLE_IDS } from "@pizza-geek/core";
import { describe, expect, it } from "vitest";
import {
  createPortableDataBundle,
  createPortableDataFileName,
  mergeBakeLog,
  mergeSavedRecipes,
  parsePortableDataBundle,
  serializePortableDataBundle,
  type BakeLogEntry,
  type SavedRecipe
} from "../dataExchange";

function makeRecipe(id: string, createdAt: string): SavedRecipe {
  return {
    id,
    name: `Recipe ${id}`,
    createdAt,
    input: createDefaultInput(STYLE_IDS.NEAPOLITAN)
  };
}

function makeBakeLog(id: string, date: string): BakeLogEntry {
  return {
    id,
    date,
    recipeName: `Recipe ${id}`,
    rating: 5,
    outcome: "keeper",
    notes: "Nice bake."
  };
}

describe("dataExchange", () => {
  it("round-trips a portable backup bundle", () => {
    const bundle = createPortableDataBundle(
      [makeRecipe("recipe-1", "2026-04-24T10:00:00.000Z")],
      [makeBakeLog("log-1", "2026-04-25T18:00:00.000Z")],
      "2026-04-26T09:00:00.000Z"
    );

    const parsed = parsePortableDataBundle(serializePortableDataBundle(bundle));

    expect(parsed).toEqual(bundle);
  });

  it("rejects invalid backup payloads", () => {
    expect(() => parsePortableDataBundle('{"version":2}')).toThrow("Unsupported backup format.");
    expect(() => parsePortableDataBundle("{not-json}")).toThrow("Invalid backup JSON.");
  });

  it("accepts legacy backup payloads without a version field", () => {
    const parsed = parsePortableDataBundle(
      JSON.stringify({
        exportedAt: "2026-04-20T12:00:00.000Z",
        savedRecipes: [makeRecipe("recipe-1", "2026-04-19T10:00:00.000Z")],
        bakeLog: [makeBakeLog("log-1", "2026-04-20T18:00:00.000Z")]
      })
    );

    expect(parsed.version).toBe(1);
    expect(parsed.savedRecipes).toHaveLength(1);
    expect(parsed.bakeLog).toHaveLength(1);
  });

  it("normalizes partially malformed backup entries instead of rejecting the whole backup", () => {
    const parsed = parsePortableDataBundle(
      JSON.stringify({
        version: 1,
        exportedAt: "2026-04-26T09:00:00.000Z",
        savedRecipes: [
          makeRecipe("recipe-2", "2026-04-24T10:00:00.000Z"),
          { id: "broken", name: 42 }
        ],
        bakeLog: [
          { id: "log-2", recipeName: "Recipe 2", rating: 7, outcome: "unknown", notes: 9 },
          { nope: true }
        ]
      })
    );

    expect(parsed.savedRecipes.map((recipe) => recipe.id)).toEqual(["recipe-2"]);
    expect(parsed.bakeLog).toEqual([
      expect.objectContaining({
        id: "log-2",
        rating: 5,
        outcome: "tweak",
        notes: ""
      })
    ]);
  });

  it("merges imported saved recipes without duplicating matching ids", () => {
    const merged = mergeSavedRecipes(
      [makeRecipe("recipe-1", "2026-04-22T10:00:00.000Z"), makeRecipe("recipe-2", "2026-04-20T10:00:00.000Z")],
      [makeRecipe("recipe-1", "2026-04-25T10:00:00.000Z"), makeRecipe("recipe-3", "2026-04-24T10:00:00.000Z")]
    );

    expect(merged.map((recipe) => recipe.id)).toEqual(["recipe-1", "recipe-3", "recipe-2"]);
    expect(merged[0]?.createdAt).toBe("2026-04-25T10:00:00.000Z");
  });

  it("merges imported bake logs in reverse chronological order", () => {
    const merged = mergeBakeLog(
      [makeBakeLog("log-1", "2026-04-21T18:00:00.000Z")],
      [makeBakeLog("log-2", "2026-04-26T18:00:00.000Z"), makeBakeLog("log-1", "2026-04-25T18:00:00.000Z")]
    );

    expect(merged.map((entry) => entry.id)).toEqual(["log-2", "log-1"]);
    expect(merged[1]?.date).toBe("2026-04-25T18:00:00.000Z");
  });

  it("creates a stable backup filename", () => {
    expect(createPortableDataFileName(new Date("2026-04-26T14:30:00.000Z"))).toBe("pizza-geek-backup-2026-04-26.json");
  });
});
