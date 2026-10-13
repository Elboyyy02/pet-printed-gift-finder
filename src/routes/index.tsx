import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Cake, Cat, Dog, Frame, Gift, Heart, Home, Puzzle, Rabbit, RotateCcw, ShoppingBag, Sparkles, Shirt, Star, TreePine, ExternalLink, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/store/logo.svg.asset.json";
import { PRODUCTS, CATALOG_CHECKED } from "@/lib/gift-catalog";
import { findMatches, type Answers } from "@/lib/gift-matching";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Pet Printed — Personalized Pet Gift Finder" },
    { name: "description", content: "Find a personalized Pet Printed gift for dog lovers, cat lovers and other pet parents. Shop real mugs, posters, blankets and keepsakes matched to your budget." },
    { property: "og:title", content: "Pet Printed — Personalized Pet Gift Finder" },
    { property: "og:description", content: "Discover real Pet Printed gifts matched to your pet, occasion, budget and style." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});

type Option = { value: string; label: string; icon: LucideIcon; desc?: string };
type Step = { key: keyof Answers; title: string; subtitle: string; options: Option[] };

const STEPS: Step[] = [
  { key: "pet", title: "Who are you shopping for?", subtitle: "A little something for their favorite pet lover.", options: [
    { value: "dog", label: "A dog lover", icon: Dog }, { value: "cat", label: "A cat lover", icon: Cat },
    { value: "other", label: "Another pet lover", icon: Rabbit }, { value: "parent", label: "Any pet parent", icon: Heart },
  ] },
  { key: "occasion", title: "What's the occasion?", subtitle: "Celebrate a happy moment or remember a cherished friend.", options: [
    { value: "birthday", label: "Birthday", icon: Cake }, { value: "holiday", label: "Christmas & holidays", icon: TreePine },
    { value: "memorial", label: "Memorial and Keepsakes", icon: Heart }, { value: "just-because", label: "Treat Myself", icon: Sparkles },
  ] },
  { key: "productType", title: "What type of product are you looking for?", subtitle: "Pick the kind of gift that suits them best.", options: [
    { value: "wearables", label: "Wearables & Accessories", desc: "Apparel and accessories", icon: Shirt },
    { value: "home", label: "Home & Drinkware", desc: "Drinkware, doormats, and home décor", icon: Home },
    { value: "memorial", label: "Memorial & Personalized Gifts", desc: "Memorials, keepsakes, and wall art", icon: Frame },
    { value: "fun", label: "Fun & Unique Gifts", desc: "Puzzles and a mix of other gifts", icon: Puzzle },
  ] },
  { key: "budget", title: "What's your budget?", subtitle: "A thoughtful gift, at a price that feels right.", options: [
    { value: "under-25", label: "Under $25", icon: ShoppingBag }, { value: "25-50", label: "$25 – under $50", icon: Gift },
    { value: "50-plus", label: "$50+", icon: Star }, { value: "any", label: "Any budget", icon: Sparkles },
  ] },
  { key: "style", title: "What vibe fits them best?", subtitle: "Pick the personality that feels most like them.", options: [
    { value: "funny", label: "Fun & playful", icon: Sparkles }, { value: "elegant", label: "Elegant & artistic", icon: Star },
    { value: "cozy", label: "Warm & cozy", icon: Heart },
  ] },
];
const money = (value: number) => `$${value.toFixed(2)}`;
const showcase = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[5], PRODUCTS[6]].filter((p) => p !== undefined);

function Index() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const results = useMemo(() => findMatches(answers), [answers]);
  const currentStep = step >= 1 && step <= STEPS.length ? STEPS[step - 1] : undefined;
  const restart = () => { setAnswers({}); setStep(0); };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <a href="https://pet-printed.com/" aria-label="Pet Printed store"><img src={logo.url} alt="Pet Printed" width={170} height={40} className="h-10 w-[170px] object-contain" /></a>
          <Button asChild variant="ghost" className="text-muted-foreground"><a href="https://pet-printed.com/collections/all" target="_blank" rel="noopener noreferrer">Visit store <ExternalLink /></a></Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
        {step === 0 && <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"><Gift className="h-4 w-4" /> A gift as unique as their pet</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">Pet Printed <span className="text-primary">gift finder</span></h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Find a one-of-a-kind gift for your favorite pet lover — from personalized portraits to mugs, cozy blankets and heartfelt keepsakes.</p>
          <Button onClick={() => setStep(1)} size="lg" className="mt-7 h-12 px-8 text-base font-bold">Find their gift <ArrowRight /></Button>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {showcase.map((p) => <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="group text-left">
              <img src={p.image} alt={p.name} width={800} height={800} className="aspect-square w-full rounded-lg object-cover transition-opacity group-hover:opacity-90" />
              <p className="mt-2 text-sm font-semibold leading-snug">{p.name.replace("Personalized ", "")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.priceVaries ? "From " : ""}{money(Math.min(...p.variants.map((v) => v.price)))}</p>
            </a>)}
          </div>
        </div>}
        {currentStep && <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="mb-3 flex justify-between text-sm font-medium text-muted-foreground"><span>Question {step} of {STEPS.length}</span><span>{Math.round(step / STEPS.length * 100)}%</span></div>
            <div className="flex gap-2" aria-label={`Question ${step} of ${STEPS.length}`}>{STEPS.map((s, i) => <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`} />)}</div>
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl">{currentStep.title}</h2>
          <p className="mt-3 text-muted-foreground">{currentStep.subtitle}</p>
          <div className="mt-8 grid auto-rows-fr gap-3 sm:grid-cols-2">{currentStep.options.map((opt) => {
            const Icon = opt.icon; const selected = answers[currentStep.key] === opt.value;
            return <Button key={opt.value} variant="outline" aria-pressed={selected} onClick={() => { setAnswers((a) => ({ ...a, [currentStep.key]: opt.value })); setStep(step + 1); }} className={`h-auto min-h-24 justify-start gap-4 whitespace-normal rounded-lg border-2 bg-card p-5 text-left ${selected ? "border-primary" : "border-border"}`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-secondary"><Icon className="!h-6 !w-6" /></span><span><span className="block text-base font-semibold">{opt.label}</span>{opt.desc && <span className="mt-1 block text-sm font-normal leading-snug text-muted-foreground">{opt.desc}</span>}</span>
            </Button>;
          })}</div>
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} className="mt-8 text-muted-foreground"><ArrowLeft />Back</Button>
        </div>}
        {step === STEPS.length + 1 && <div>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"><Gift className="h-4 w-4" />Your Pet Printed picks</span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{results.length ? "Something made just for them" : "Let's find another match"}</h2>
            <p className="mt-3 text-muted-foreground">{results.length ? "Personalized gifts for their pet, their moment, and your budget." : "No gifts in this selection fit every answer. Try another budget or browse the full store."}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{results.map(({ product: p, price, variant }, i) => <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="relative"><a href={p.url} target="_blank" rel="noopener noreferrer"><img src={p.image} alt={p.name} width={800} height={800} className="aspect-square w-full object-cover" /></a>{i === 0 && <span className="absolute left-3 top-3 rounded-md bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">Best match</span>}</div>
            <div className="flex flex-col p-5">
              <h3 className="min-h-14 text-lg font-bold leading-snug">{p.name}</h3>
              <p className="mt-3 text-lg font-bold text-foreground">{money(price)} <span className="text-xs font-normal text-muted-foreground">USD</span></p>
              <p className="mt-1 min-h-10 text-xs leading-relaxed text-muted-foreground">{variant}</p>
              <p className="mt-3 text-sm text-secondary">{answers.occasion === "memorial" ? "A keepsake for a cherished friend" : answers.style && p.styles.includes(answers.style) ? { funny: "For their playful side", elegant: "A thoughtful, artistic touch", cozy: "A little everyday comfort" }[answers.style] : "Personalized with their pet"}</p>
              <Button asChild className="mt-5 h-11 w-full font-semibold"><a href={p.url} target="_blank" rel="noopener noreferrer">Personalize this gift <ExternalLink /></a></Button>
            </div>
          </article>)}</div>
          <p className="mt-6 text-center text-xs text-muted-foreground">Catalog checked {CATALOG_CHECKED}. Prices and availability may change; final options and pricing are shown in the store.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={() => setStep(4)}><ArrowLeft />Change budget</Button><Button variant="ghost" onClick={restart}><RotateCcw />Start over</Button><Button asChild variant="ghost"><a href="https://pet-printed.com/collections/all" target="_blank" rel="noopener noreferrer">Browse all gifts <ExternalLink /></a></Button></div>
        </div>}
      </main>
      <footer className="border-t border-border bg-card"><div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-center text-sm text-muted-foreground"><a href="https://pet-printed.com/" aria-label="Pet Printed home"><img src={logo.url} alt="Pet Printed" width={127} height={30} className="h-[30px] w-[127px] object-contain" /></a><p>Unique gifts for all pet lovers.</p></div></footer>
    </div>
  );
}
