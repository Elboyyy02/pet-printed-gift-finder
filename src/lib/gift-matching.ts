import { PRODUCTS, type CatalogProduct } from "./gift-catalog";

export type Answers = { pet?: string; occasion?: string; productType?: string; budget?: string; style?: string };
export type GiftMatch = { product: CatalogProduct; price: number; variant: string; score: number; reason: string; exact: boolean };

export function matchesBudget(price: number, budget?: string) {
  if (budget === "under-25") return price < 25;
  if (budget === "25-50") return price >= 25 && price < 50;
  if (budget === "50-plus") return price >= 50;
  return true;
}

const isMemorial = (product: CatalogProduct) => product.occasions.includes("memorial");
const isHolidayOnly = (product: CatalogProduct) => product.occasions.length === 1 && product.occasions[0] === "holiday";

const petAllowed = (product: CatalogProduct, answers: Answers) =>
  !answers.pet || answers.pet === "parent" || product.pets.includes(answers.pet);

const occasionAllowed = (product: CatalogProduct, answers: Answers) => {
  if (answers.occasion === "memorial") return isMemorial(product);
  if (isMemorial(product)) return false;
  if (answers.occasion !== "holiday" && isHolidayOnly(product)) return false;
  return true;
};

const scoreProduct = (product: CatalogProduct, answers: Answers) =>
  (answers.style && product.styles.includes(answers.style) ? 5 : 0)
  + (answers.occasion && product.occasions.includes(answers.occasion) ? 3 : 0)
  + (answers.occasion === "holiday" && isHolidayOnly(product) ? 2 : 0);

const variantFor = (product: CatalogProduct, budget?: string) =>
  [...product.variants].filter((v) => !budget || matchesBudget(v.price, budget)).sort((a, b) => a.price - b.price)[0];

const typeAllowed = (product: CatalogProduct, answers: Answers) =>
  !answers.productType || answers.productType === "anything" || product.categories.includes(answers.productType);

const typeNames: Record<string, string> = {
  apparels: "apparel", accessories: "accessories", drinkware: "drinkware", doormats: "doormats",
  "home-decor": "home décor", memorials: "memorials", keepsakes: "keepsakes", "wall-arts": "wall art", puzzles: "puzzles",
};

function reasonFor(product: CatalogProduct, answers: Answers, price: number) {
  const item = product.name.replace(/^Personalized /, "").split(" - ")[0].toLowerCase();
  const pet = answers.pet === "dog" ? "dog lover" : answers.pet === "cat" ? "cat lover" : "pet lover";
  const occasion = answers.occasion === "memorial" ? "to remember a cherished pet" : answers.occasion === "birthday" ? "for their birthday" : answers.occasion === "holiday" ? "for the holidays" : "for an everyday treat";
  const fit = answers.productType && typeNames[answers.productType] && typeAllowed(product, answers)
    ? `Fits your ${typeNames[answers.productType]} choice` : `A personalized ${item}`;
  const deviations = [
    !typeAllowed(product, answers) ? `an alternative to ${typeNames[answers.productType ?? ""] ?? "your chosen type"}` : "",
    !matchesBudget(price, answers.budget) ? "outside your selected budget" : "",
  ].filter(Boolean);
  return `${fit} ${occasion}, made for a ${pet}.${deviations.length ? ` Note: ${deviations.join("; ")}.` : answers.budget && answers.budget !== "any" ? " This variant fits your budget." : ""}`;
}

const matchOf = (product: CatalogProduct, answers: Answers, budget?: string): GiftMatch[] => {
  const variant = variantFor(product, budget);
  if (!variant) return [];
  return [{ product, price: variant.price, variant: variant.label, score: scoreProduct(product, answers),
    reason: reasonFor(product, answers, variant.price), exact: typeAllowed(product, answers) && matchesBudget(variant.price, answers.budget) }];
};

const byScore = (a: GiftMatch, b: GiftMatch) => b.score - a.score || a.price - b.price;

const collect = (answers: Answers, excludeIds: string[], opts: { type: boolean; budget: boolean; pet: boolean }): GiftMatch[] => {
  const excluded = new Set(excludeIds);
  const budget = opts.budget ? answers.budget : undefined;
  return PRODUCTS.flatMap((product) => {
    if (excluded.has(product.id) || (opts.pet && !petAllowed(product, answers)) || !occasionAllowed(product, answers)) return [];
    if (opts.type && !typeAllowed(product, answers)) return [];
    return matchOf(product, answers, budget);
  }).sort(byScore);
};

/** Gifts that fit every answer, ranked best first. */
export function findMatches(answers: Answers): GiftMatch[] {
  return collect(answers, [], { type: true, budget: true, pet: true }).slice(0, 5);
}

/** Prefer the chosen type, then clearly explained alternatives; pet and memorial eligibility never widen. */
export function findSuggestions(answers: Answers, excludeIds: string[], count = 5): GiftMatch[] {
  const out: GiftMatch[] = [];
  const seen = new Set(excludeIds);
  for (const tier of [
    collect(answers, excludeIds, { type: true, budget: true, pet: true }),
    collect(answers, excludeIds, { type: true, budget: false, pet: true }),
    collect(answers, excludeIds, { type: false, budget: true, pet: true }),
    collect(answers, excludeIds, { type: false, budget: false, pet: true }),
  ]) {
    for (const match of tier) {
      if (out.length >= count) break;
      if (seen.has(match.product.id)) continue;
      seen.add(match.product.id);
      out.push(match);
    }
    if (out.length >= count) break;
  }
  return out;
}
