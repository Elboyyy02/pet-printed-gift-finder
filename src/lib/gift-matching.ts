import { PRODUCTS, type CatalogProduct } from "./gift-catalog";

export type Answers = { pet?: string; occasion?: string; productType?: string; budget?: string; style?: string };
export type GiftMatch = { product: CatalogProduct; price: number; variant: string; score: number };

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

const matchOf = (product: CatalogProduct, answers: Answers): GiftMatch[] => {
  const variant = [...product.variants].filter((v) => matchesBudget(v.price, answers.budget)).sort((a, b) => a.price - b.price)[0];
  if (!variant) return [];
  return [{ product, price: variant.price, variant: variant.label, score: scoreProduct(product, answers) }];
};

const byScore = (a: GiftMatch, b: GiftMatch) => b.score - a.score || a.price - b.price;

const strictMatches = (answers: Answers, excludeIds: string[]) => {
  const excluded = new Set(excludeIds);
  return PRODUCTS.flatMap((product) => {
    if (excluded.has(product.id) || !petAllowed(product, answers) || !occasionAllowed(product, answers)) return [];
    if (answers.productType && !product.categories.includes(answers.productType)) return [];
    return matchOf(product, answers);
  }).sort(byScore);
};

export function findMatches(answers: Answers): GiftMatch[] {
  return strictMatches(answers, []).slice(0, 5);
}

/** Extra gifts that fit the same answers. Falls back to the shopper's pet, budget and occasion rules when the chosen product type runs out. */
export function findSuggestions(answers: Answers, excludeIds: string[], count = 5): GiftMatch[] {
  const strict = strictMatches(answers, excludeIds);
  if (strict.length >= count) return strict.slice(0, count);
  const taken = new Set([...excludeIds, ...strict.map((m) => m.product.id)]);
  const relaxed = PRODUCTS.flatMap((product) => {
    if (taken.has(product.id) || !petAllowed(product, answers) || !occasionAllowed(product, answers)) return [];
    return matchOf(product, answers);
  }).sort(byScore);
  return [...strict, ...relaxed].slice(0, count);
}
