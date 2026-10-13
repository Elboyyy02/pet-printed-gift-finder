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

const variantFor = (product: CatalogProduct, budget?: string) =>
  [...product.variants].filter((v) => !budget || matchesBudget(v.price, budget)).sort((a, b) => a.price - b.price)[0];

const matchOf = (product: CatalogProduct, answers: Answers, budget?: string): GiftMatch[] => {
  const variant = variantFor(product, budget);
  if (!variant) return [];
  return [{ product, price: variant.price, variant: variant.label, score: scoreProduct(product, answers) }];
};

const byScore = (a: GiftMatch, b: GiftMatch) => b.score - a.score || a.price - b.price;

const collect = (answers: Answers, excludeIds: string[], opts: { type: boolean; budget: boolean }): GiftMatch[] => {
  const excluded = new Set(excludeIds);
  const budget = opts.budget ? answers.budget : undefined;
  return PRODUCTS.flatMap((product) => {
    if (excluded.has(product.id) || !petAllowed(product, answers) || !occasionAllowed(product, answers)) return [];
    if (opts.type && answers.productType && !product.categories.includes(answers.productType)) return [];
    return matchOf(product, answers, budget);
  }).sort(byScore);
};

/** Gifts that fit every answer, ranked best first. */
export function findMatches(answers: Answers): GiftMatch[] {
  return collect(answers, [], { type: true, budget: true }).slice(0, 5);
}

/** Five more gifts. The pet and occasion rules stay firm; product type and budget widen as needed so the shopper always sees choices. */
export function findSuggestions(answers: Answers, excludeIds: string[], count = 5): GiftMatch[] {
  const out: GiftMatch[] = [];
  const seen = new Set(excludeIds);
  for (const tier of [
    collect(answers, excludeIds, { type: true, budget: true }),
    collect(answers, excludeIds, { type: false, budget: true }),
    collect(answers, excludeIds, { type: false, budget: false }),
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
