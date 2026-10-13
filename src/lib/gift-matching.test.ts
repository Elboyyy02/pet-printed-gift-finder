import { describe, expect, it } from "vitest";
import { findMatches, findSuggestions, matchesBudget } from "./gift-matching";

describe("store gift matching", () => {
  it("uses exact budget boundaries", () => {
    expect(matchesBudget(24.95, "under-25")).toBe(true);
    expect(matchesBudget(25, "under-25")).toBe(false);
    expect(matchesBudget(50, "25-50")).toBe(false);
    expect(matchesBudget(59.95, "50-plus")).toBe(true);
  });
  it("only recommends memorial products for memorial occasions", () => {
    const results = findMatches({ pet: "cat", occasion: "memorial", budget: "under-25", style: "elegant" });
    expect(results.length).toBeGreaterThan(0);
    for (const { product, price } of results) {
      expect(product.occasions).toContain("memorial");
      expect(product.pets).toContain("cat");
      expect(price).toBeLessThan(25);
    }
  });
  it("does not recommend dog-only products to cat owners", () => {
    for (const { product } of findMatches({ pet: "cat", occasion: "birthday", style: "funny" })) {
      expect(product.pets).toContain("cat");
      expect(product.occasions).not.toContain("memorial");
    }
  });
  it("uses a real larger variant for a $50+ budget", () => {
    const results = findMatches({ pet: "dog", occasion: "birthday", budget: "50-plus", style: "cozy" });
    expect(results.length).toBeGreaterThan(0);
    for (const match of results) {
      expect(match.price).toBeGreaterThanOrEqual(50);
      expect(match.product.variants.some((v) => v.price === match.price && v.label === match.variant)).toBe(true);
    }
  });
  it("keeps unsupported combinations empty rather than ignoring the budget", () => {
    expect(findMatches({ pet: "other", occasion: "birthday", budget: "50-plus" })).toEqual([]);
  });
  it("shows five matched gifts for a broad selection", () => {
    expect(findMatches({ pet: "dog", occasion: "just-because", productType: "home", budget: "any" })).toHaveLength(5);
  });
  it("suggests five more gifts that also fit the answers and skips the shown ones", () => {
    const answers = { pet: "dog", occasion: "just-because", productType: "home", budget: "any" };
    const shown = findMatches(answers).map((m) => m.product.id);
    const extra = findSuggestions(answers, shown, 5);
    expect(extra).toHaveLength(5);
    for (const { product, price } of extra) {
      expect(shown).not.toContain(product.id);
      expect(product.pets).toContain("dog");
      expect(product.occasions).not.toContain("memorial");
      expect(matchesBudget(price, "any")).toBe(true);
    }
    expect(extra.filter(({ product }) => product.categories.includes("home")).length).toBeGreaterThan(0);
  });
  it("still offers five suggestions when no gift fits every answer", () => {
    const answers = { pet: "other", occasion: "birthday", productType: "wearables", budget: "50-plus" };
    expect(findMatches(answers)).toEqual([]);
    const extra = findSuggestions(answers, [], 5);
    expect(extra).toHaveLength(5);
    for (const { product } of extra) {
      expect(product.pets).toContain("other");
      expect(product.occasions).not.toContain("memorial");
    }
    expect(new Set(extra.map((m) => m.product.id)).size).toBe(5);
  });
  it("keeps pet and memorial rules firm when widening the budget", () => {
    const extra = findSuggestions({ pet: "cat", occasion: "memorial", productType: "wearables", budget: "under-25" }, [], 5);
    expect(extra).toHaveLength(5);
    for (const { product, price } of extra) {
      expect(product.pets).toContain("cat");
      expect(product.occasions).toContain("memorial");
      expect(price).toBeGreaterThan(0);
    }
  });
  it("never repeats a suggested gift", () => {
    const answers = { pet: "dog", occasion: "holiday", productType: "fun", budget: "any" };
    const shown = findMatches(answers).map((m) => m.product.id);
    const extra = findSuggestions(answers, shown, 5);
    expect(extra).toHaveLength(5);
    expect(shown.filter((id) => extra.some((m) => m.product.id === id))).toEqual([]);
  });
});
