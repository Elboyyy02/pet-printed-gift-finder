import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Cake,
  Cat,
  Dog,
  Gift,
  Heart,
  PawPrint,
  Rabbit,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Star,
  TreePine,
} from "lucide-react";

import productCanvas from "@/assets/product-canvas.jpg";
import productMug from "@/assets/product-mug.jpg";
import productBlanket from "@/assets/product-blanket.jpg";
import productSocks from "@/assets/product-socks.jpg";
import productPhonecase from "@/assets/product-phonecase.jpg";
import productTote from "@/assets/product-tote.jpg";
import productOrnament from "@/assets/product-ornament.jpg";
import productMemorial from "@/assets/product-memorial.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pet Printed US — Find the Perfect Pet Gift" },
      {
        name: "description",
        content:
          "Answer a few quick questions and we'll match you with the perfect personalized pet gift from Pet Printed US.",
      },
      { property: "og:title", content: "Pet Printed US — Find the Perfect Pet Gift" },
      {
        property: "og:description",
        content:
          "A 60-second gift finder quiz for personalized pet portraits, mugs, blankets and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Answers = {
  pet?: string;
  occasion?: string;
  budget?: string;
  style?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  blurb: string;
  tags: {
    occasion: string[];
    budget: string[];
    style: string[];
  };
};

const PRODUCTS: Product[] = [
  {
    id: "canvas",
    name: "Custom Pet Portrait Canvas",
    price: 59,
    image: productCanvas,
    blurb: "A gallery-worthy illustrated portrait of their best friend, ready to hang.",
    tags: { occasion: ["birthday", "just-because", "holiday"], budget: ["50-plus"], style: ["elegant", "cozy"] },
  },
  {
    id: "mug",
    name: "Pet Portrait Mug",
    price: 24,
    image: productMug,
    blurb: "Morning coffee tastes better with their pet's face on it.",
    tags: { occasion: ["birthday", "just-because", "holiday"], budget: ["under-25", "25-50"], style: ["funny", "cozy"] },
  },
  {
    id: "blanket",
    name: "Photo Fleece Blanket",
    price: 49,
    image: productBlanket,
    blurb: "Ultra-soft fleece with a full-color print of their furry companion.",
    tags: { occasion: ["holiday", "birthday", "just-because"], budget: ["25-50"], style: ["cozy"] },
  },
  {
    id: "socks",
    name: "Custom Pet Face Socks",
    price: 19,
    image: productSocks,
    blurb: "The stocking stuffer that always gets a laugh — and gets worn.",
    tags: { occasion: ["holiday", "birthday", "just-because"], budget: ["under-25"], style: ["funny"] },
  },
  {
    id: "phonecase",
    name: "Pet Portrait Phone Case",
    price: 29,
    image: productPhonecase,
    blurb: "Their pet, protected and on display everywhere they go.",
    tags: { occasion: ["birthday", "just-because", "holiday"], budget: ["25-50"], style: ["funny", "elegant"] },
  },
  {
    id: "tote",
    name: "Line-Art Pet Tote Bag",
    price: 27,
    image: productTote,
    blurb: "Minimalist line-art of their pet on a sturdy everyday canvas tote.",
    tags: { occasion: ["birthday", "just-because"], budget: ["25-50"], style: ["elegant"] },
  },
  {
    id: "ornament",
    name: "Holiday Pet Ornament",
    price: 22,
    image: productOrnament,
    blurb: "A hand-finished ceramic ornament to hang their memory on the tree.",
    tags: { occasion: ["holiday", "memorial"], budget: ["under-25"], style: ["cozy", "elegant"] },
  },
  {
    id: "memorial",
    name: "Framed Memorial Portrait",
    price: 69,
    image: productMemorial,
    blurb: "A gentle watercolor tribute in a gold frame, personalized with name and dates.",
    tags: { occasion: ["memorial"], budget: ["50-plus"], style: ["elegant", "cozy"] },
  },
];

const STEPS = [
  {
    key: "pet" as const,
    title: "Who are you shopping for?",
    subtitle: "Tell us about the lucky pet (or pet parent).",
    options: [
      { value: "dog", label: "A dog", icon: Dog },
      { value: "cat", label: "A cat", icon: Cat },
      { value: "other", label: "Another pet", icon: Rabbit },
      { value: "parent", label: "A pet parent", icon: Heart },
    ],
  },
  {
    key: "occasion" as const,
    title: "What's the occasion?",
    subtitle: "We'll match the gift to the moment.",
    options: [
      { value: "birthday", label: "Birthday", icon: Cake },
      { value: "holiday", label: "Holiday", icon: TreePine },
      { value: "memorial", label: "Memorial", icon: Heart },
      { value: "just-because", label: "Just because", icon: Sparkles },
    ],
  },
  {
    key: "budget" as const,
    title: "What's your budget?",
    subtitle: "Great gifts at every price point.",
    options: [
      { value: "under-25", label: "Under $25", icon: ShoppingBag },
      { value: "25-50", label: "$25 – $50", icon: Gift },
      { value: "50-plus", label: "$50+", icon: Star },
      { value: "any", label: "No limit", icon: Sparkles },
    ],
  },
  {
    key: "style" as const,
    title: "What vibe fits them best?",
    subtitle: "Last one — pick the personality.",
    options: [
      { value: "funny", label: "Fun & playful", icon: Sparkles },
      { value: "elegant", label: "Elegant & refined", icon: Star },
      { value: "cozy", label: "Warm & cozy", icon: Heart },
    ],
  },
];

function scoreProduct(p: Product, answers: Answers): number {
  let score = 0;
  if (answers.occasion && p.tags.occasion.includes(answers.occasion)) score += 3;
  if (answers.budget && answers.budget !== "any" && p.tags.budget.includes(answers.budget)) score += 2;
  if (answers.budget === "any") score += 1;
  if (answers.style && p.tags.style.includes(answers.style)) score += 2;
  return score;
}

function Index() {
  const [step, setStep] = useState(0); // 0 = intro, 1..4 = questions, 5 = results
  const [answers, setAnswers] = useState<Answers>({});

  const results = useMemo(() => {
    return [...PRODUCTS]
      .map((p) => ({ p, score: scoreProduct(p, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.p);
  }, [answers]);

  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  const currentStep = step >= 1 && step <= 4 ? STEPS[step - 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Pet Printed <span className="text-primary">US</span>
            </span>
          </div>
          <span className="hidden text-sm font-medium text-muted-foreground sm:block">
            Gift Finder
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:py-16">
        {/* Intro */}
        {step === 0 && (
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              60-second gift finder
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Find the perfect gift for the{" "}
              <span className="text-primary">pet lover</span> in your life
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Answer four quick questions and we'll match you with personalized
              pet gifts they'll actually love — from custom portraits to cozy
              blankets.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
            >
              Start the quiz
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[productCanvas, productMug, productSocks, productBlanket].map(
                (img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Personalized pet gift example"
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="aspect-square w-full rounded-2xl object-cover shadow-md"
                  />
                ),
              )}
            </div>
          </div>
        )}

        {/* Questions */}
        {currentStep && (
          <div className="mx-auto max-w-2xl">
            {/* Progress */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>
                  Question {step} of {STEPS.length}
                </span>
                <span>{Math.round((step / STEPS.length) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(step / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {currentStep.title}
            </h2>
            <p className="mt-2 text-muted-foreground">{currentStep.subtitle}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {currentStep.options.map((opt) => {
                const Icon = opt.icon;
                const selected = answers[currentStep.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, [currentStep.key]: opt.value }));
                      setTimeout(() => setStep((s) => s + 1), 200);
                    }}
                    className={`flex items-center gap-4 rounded-2xl border-2 bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md ${
                      selected ? "border-primary shadow-md" : "border-border"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-secondary"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-lg font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        )}

        {/* Results */}
        {step === 5 && (
          <div>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                <Gift className="h-4 w-4 text-primary" />
                Your matches
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                We found their perfect gift
              </h2>
              <p className="mt-3 text-muted-foreground">
                Based on your answers, these personalized picks are the best fit.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p, i) => (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="aspect-square w-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                        Best match
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold leading-snug">{p.name}</h3>
                      <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
                        ${p.price}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                    <button className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
                      Personalize this gift
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:border-primary"
              >
                <RotateCcw className="h-4 w-4" />
                Start over
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <PawPrint className="h-4 w-4 text-primary" />
            Pet Printed US
          </div>
          <p>Personalized gifts for the pets we love.</p>
        </div>
      </footer>
    </div>
  );
}
