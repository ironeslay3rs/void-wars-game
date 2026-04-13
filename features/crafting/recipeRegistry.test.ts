import { describe, expect, it } from "vitest";

import {
  craftRecipes,
  craftingCategoryLabels,
  getRecipeById,
  getRecipesByCategory,
  listRecipeIds,
  type CraftRecipe,
  type CraftingCategory,
} from "@/features/crafting/recipeRegistry";

describe("recipeRegistry — re-exports", () => {
  it("re-exports the underlying craftRecipes array (reference-equal)", () => {
    expect(Array.isArray(craftRecipes)).toBe(true);
    expect(craftRecipes.length).toBeGreaterThan(0);
  });

  it("re-exports craftingCategoryLabels covering every category key", () => {
    const categories = new Set<CraftingCategory>(
      craftRecipes.map((r) => r.category),
    );
    for (const c of categories) {
      expect(typeof craftingCategoryLabels[c]).toBe("string");
      expect(craftingCategoryLabels[c].length).toBeGreaterThan(0);
    }
  });
});

describe("getRecipeById", () => {
  it("returns the recipe matching a known id", () => {
    const r = getRecipeById("moss-ration");
    expect(r).toBeDefined();
    expect(r?.id).toBe("moss-ration");
    expect(r?.name).toBe("Moss Ration");
  });

  it("returns undefined for an unknown id", () => {
    expect(getRecipeById("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getRecipeById("")).toBeUndefined();
  });

  it("returned recipe is the same object reference as in craftRecipes", () => {
    const r = getRecipeById("scrap-blade");
    const expected = craftRecipes.find((x) => x.id === "scrap-blade");
    expect(r).toBe(expected);
  });
});

describe("getRecipesByCategory", () => {
  it("returns only recipes in the requested category", () => {
    const arcane = getRecipesByCategory("arcane");
    expect(arcane.length).toBeGreaterThan(0);
    expect(arcane.every((r) => r.category === "arcane")).toBe(true);
  });

  it("returns structural recipes distinct from arcane", () => {
    const structural = getRecipesByCategory("structural");
    const arcane = getRecipesByCategory("arcane");
    const sIds = new Set(structural.map((r) => r.id));
    const aIds = new Set(arcane.map((r) => r.id));
    for (const id of sIds) expect(aIds.has(id)).toBe(false);
  });

  it("returns empty array for a category with no recipes", () => {
    const bogus = getRecipesByCategory(
      "not-a-category" as unknown as CraftingCategory,
    );
    expect(bogus).toEqual([]);
  });

  it("covers every canonical category with at least one recipe", () => {
    const cats: CraftingCategory[] = [
      "organic",
      "structural",
      "arcane",
      "hybrid",
      "refining",
    ];
    for (const c of cats) {
      expect(getRecipesByCategory(c).length).toBeGreaterThan(0);
    }
  });

  it("does not mutate the underlying registry", () => {
    const before = craftRecipes.length;
    const slice = getRecipesByCategory("refining");
    slice.push({} as CraftRecipe);
    expect(craftRecipes.length).toBe(before);
  });
});

describe("listRecipeIds", () => {
  it("returns every recipe id in definition order", () => {
    const ids = listRecipeIds();
    expect(ids).toEqual(craftRecipes.map((r) => r.id));
  });

  it("has no duplicate ids (registry integrity)", () => {
    const ids = listRecipeIds();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not mutate the underlying registry when caller mutates the returned array", () => {
    const before = craftRecipes.length;
    const ids = listRecipeIds();
    ids.push("junk");
    expect(craftRecipes.length).toBe(before);
  });
});

describe("recipeRegistry — data integrity", () => {
  it("every recipe has a positive success chance <= 1", () => {
    for (const r of craftRecipes) {
      expect(r.successChance).toBeGreaterThan(0);
      expect(r.successChance).toBeLessThanOrEqual(1);
    }
  });

  it("every recipe has at least one material requirement", () => {
    for (const r of craftRecipes) {
      const entries = Object.entries(r.materials).filter(
        ([, v]) => typeof v === "number" && v > 0,
      );
      expect(entries.length).toBeGreaterThan(0);
    }
  });

  it("uses Pure never Spirit in names (canon-naming)", () => {
    for (const r of craftRecipes) {
      expect(r.name.toLowerCase()).not.toContain("spirit");
      expect(r.id.toLowerCase()).not.toContain("spirit");
    }
  });
});
