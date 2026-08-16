/**
 * HyzenPro — Blog Post
 * Cursor Composer 2.5: Frontier-Level Coding at a Fraction of the Cost
 *
 * Drop into:  /app/blog/cursor-composer-2-5-review/page.tsx
 * Requires:   Next.js 14+ (App Router), Tailwind CSS, recharts
 * Companion:  ./Composer25Shell.tsx  (client component)
 */

import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Fraunces } from "next/font/google";
import Composer25Shell from "./Composer25Shell";

/* ── FONTS ─────────────────────────────────────────── */
// Editorial serif for display / punchy numbers
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

// Clean grotesque for body
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* ── SEO METADATA ───────────────────────────────────── */
export const metadata: Metadata = {
  title: "Cursor Composer 2.5 Review: Frontier Scores at $0.55 Per Task",
  description:
    "Cursor Composer 2.5 hits 63.2% on AI coding benchmarks — near Opus-4.7 max — at just $0.55 avg cost. Full review: benchmarks, training, pricing, and the Theo controversy.",
  keywords: [
    "Cursor Composer 2.5",
    "Composer 2.5 review",
    "best AI coding model 2026",
    "Cursor AI coding tool",
    "Composer 2.5 vs Opus 4.7",
    "Composer 2.5 vs GPT-5.5",
    "Kimi K2.5 Cursor",
    "AI coding benchmark 2026",
    "Cursor SpaceX AI",
    "cheap AI coding model",
  ],
  authors: [{ name: "HyzenPro Editorial", url: "https://hyzenpro.com" }],
  alternates: {
    canonical: "https://hyzenpro.com/blog/cursor-composer-2-5-review/",
  },
  openGraph: {
    type: "article",
    url: "https://hyzenpro.com/blog/cursor-composer-2-5-review/",
    title: "Cursor Composer 2.5 Review: Frontier Scores at $0.55 Per Task",
    description:
      "Composer 2.5 ranks #3 in our AI coding leaderboard — just behind Opus-4.7 max — at 20x less cost. Here's the full breakdown.",
    siteName: "HyzenPro",
    publishedTime: "2026-05-20T12:00:00+00:00",
    modifiedTime: "2026-05-20T12:00:00+00:00",
    section: "AI Tools",
    tags: [
      "Cursor",
      "Composer 2.5",
      "AI Coding",
      "Benchmarks",
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hyzenpro",
    title: "Cursor Composer 2.5: Frontier-Level Coding at $0.55 Per Task",
    description:
      "Ranked #3 on our leaderboard. Nearly as good as Opus-4.7 max. 20x cheaper. Here's everything you need to know.",
  },
  robots: { index: true, follow: true },
};

/* ── JSON-LD ────────────────────────────────────────── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ReviewNewsArticle",
      "@id": "https://hyzenpro.com/blog/cursor-composer-2-5-review/#article",
      headline: "Cursor Composer 2.5 Review: Frontier Scores at $0.55 Per Task",
      description:
        "Composer 2.5 ranks #3 in AI coding benchmarks with a 63.2% score at just $0.55 average cost per task — near Opus-4.7 max territory.",
      datePublished: "2026-05-20T12:00:00+00:00",
      dateModified: "2026-05-20T12:00:00+00:00",
      author: { "@type": "Organization", name: "HyzenPro", url: "https://hyzenpro.com" },
      publisher: {
        "@type": "Organization",
        name: "HyzenPro",
        url: "https://hyzenpro.com",
        logo: { "@type": "ImageObject", url: "https://hyzenpro.com/logo.png" },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://hyzenpro.com/blog/cursor-composer-2-5-review/",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "4.7",
        bestRating: "5",
        worstRating: "1",
      },
      about: {
        "@type": "SoftwareApplication",
        name: "Cursor Composer 2.5",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Windows, macOS, Linux",
        url: "https://cursor.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://hyzenpro.com" },
        { "@type": "ListItem", position: 2, name: "AI Tools", item: "https://hyzenpro.com/ai-tools" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Cursor Composer 2.5 Review",
          item: "https://hyzenpro.com/blog/cursor-composer-2-5-review/",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How does Cursor Composer 2.5 compare to Opus-4.7 and GPT-5.5?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "In independent benchmarks by AI Coding Daily, Composer 2.5 scores 63.2% — just behind Opus-4.7 max (64.8%) and GPT-5.5 xhigh (64.3%) — at an average cost of $0.55 per task, making it 8–20x cheaper than those frontier models.",
          },
        },
        {
          "@type": "Question",
          name: "What model is Cursor Composer 2.5 based on?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Composer 2.5 is built on the same open-source checkpoint as Composer 2: Moonshot's Kimi K2.5. Cursor applied additional RL training with textual feedback and 25x more synthetic data on top of that base.",
          },
        },
        {
          "@type": "Question",
          name: "What does Cursor Composer 2.5 cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The standard variant is $0.50/M input tokens and $2.50/M output tokens. The faster variant is $3.00/M input and $15.00/M output. Both are significantly cheaper than comparable frontier models.",
          },
        },
      ],
    },
  ],
};

/* ── PAGE DATA ──────────────────────────────────────── */
export const POST_DATA = {
  meta: {
    published: "May 20, 2026",
    readTime: "10 min read",
    author: "HyzenPro Editorial",
    score: 4.7,
  },
  // Benchmark data from AI Coding Daily leaderboard (sourced from image)
  benchmarkData: [
    { model: "Opus-4.7 max",    score: 64.8, cost: 11.02, highlight: false },
    { model: "GPT-5.5 xhigh",   score: 64.3, cost: 4.37,  highlight: false },
    { model: "Composer 2.5",    score: 63.2, cost: 0.55,  highlight: true  },
    { model: "GPT-5.5 high",    score: 62.6, cost: 3.59,  highlight: false },
    { model: "Opus-4.7 xhigh",  score: 61.6, cost: 7.11,  highlight: false },
    { model: "Opus-4.7 high",   score: 59.4, cost: 5.01,  highlight: false },
    { model: "GPT-5.5 medium",  score: 59.2, cost: 2.22,  highlight: false },
    { model: "Opus-4.7 medium", score: 52.7, cost: 2.93,  highlight: false },
    { model: "Composer 2",      score: 52.2, cost: 0.56,  highlight: false },
    { model: "Gemini 3.5 Flash",score: 49.8, cost: 1.94,  highlight: false },
    { model: "GPT-5.5 low",     score: 48.8, cost: 1.19,  highlight: false },
    { model: "Kimi 2.6",        score: 47.6, cost: 1.27,  highlight: false },
    { model: "Kimi 2.5",        score: 31.9, cost: 0.87,  highlight: false },
  ],
  toc: [
    { id: "what-is",       label: "What Is Composer 2.5?" },
    { id: "benchmarks",    label: "Benchmark Results" },
    { id: "how-it-works",  label: "How Cursor Trained It" },
    { id: "speed",         label: "Speed in Practice" },
    { id: "pricing",       label: "Pricing Breakdown" },
    { id: "controversy",   label: "The Theo Controversy" },
    { id: "who-for",       label: "Who Should Use It?" },
    { id: "verdict",       label: "Editorial Verdict" },
  ],
  tags: [
    "Cursor AI", "Composer 2.5", "AI Coding Tools", "LLM Benchmarks",
    "Kimi K2.5", "SpaceX AI", "Agentic Coding",
  ],
};

/* ── SERVER COMPONENT ───────────────────────────────── */
export default function Composer25Page() {
  return (
    <>
      <Script
        id="json-ld-composer25"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Composer25Shell
        data={POST_DATA}
        fontVariables={`${fraunces.variable} ${grotesk.variable}`}
      />
    </>
  );
}
