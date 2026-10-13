import { PRODUCTS, type CatalogProduct } from "./gift-catalog";

export type Answers = { pet?: string; occasion?: string; productType?: string; budget?: string; style?: string };
export type GiftMatch = { product: CatalogProduct; price: number; variant: string; score: number };

export function matchesBudget(price: number, budget?: string) {
  if (budget === "under-25") return price < 25;
  if (budget === "25-50") return price >= 25 && price < 50;
  if (budget === "50-plus") return price >= 50;
  return true;
}

export function findMatches(answers: Answers): GiftMatch[] {
  return PRODUCTS.flatMap((product) => {
    if (answers.pet && answers.pet !== "parent" && !product.pets.includes(answers.pet)) return [];
    if (answers.productType && !product.categories.includes(answers.productType)) return [];
    if (answers.occasion === "memorial" && !product.occasions.includes("memorial")) return [];
    if (answers.occasion !== "memorial" && product.occasions.includes("memorial")) return [];
    if (answers.occasion !== "holiday" && product.occasions.length === 1 && product.occasions[0] === "holiday") return [];
    const variant = [...product.variants].filter((v) => matchesBudget(v.price, answers.budget)).sort((a, b) => a.price - b.price)[0];
    if (!variant) return [];
    const score = (answers.style && product.styles.includes(answers.style) ? 5 : 0)
      + (answers.occasion && product.occasions.includes(answers.occasion) ? 3 : 0)
      + (answers.occasion === "holiday" && product.occasions.length === 1 ? 2 : 0);
    return [{ product, price: variant.price, variant: variant.label, score }];
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}