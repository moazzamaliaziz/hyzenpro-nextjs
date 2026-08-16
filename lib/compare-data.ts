import { readFileSync } from 'fs';
import { join } from 'path';

export interface ComparisonModel {
    id: string;
    dataKey: string;
    name: string;
    vendor: string;
    releaseDate: string;
    tagline: string;
    modelString: string;
    contextWindow: string;
}

export interface ComparisonBenchmark {
    benchmark: string;
    [key: string]: string | number | null;
}

export interface ComparisonReview {
    modelId: string;
    source: string;
    url: string;
    paraphrase: string;
    sentiment: 'positive' | 'mixed' | 'negative';
}

export interface ComparisonFaq {
    q: string;
    a: string;
}

export interface ComparisonEntry {
    slug: string;
    url: string;
    lastVerified: string;
    seo: {
        title: string;
        metaDescription: string;
        keywords: string[];
        schemaType: string;
        canonical: string;
    };
    hero: {
        headline: string;
        subheadline: string;
        verdictOneLiner: string;
    };
    models: ComparisonModel[];
    overview: string;
    featureComparisonTable: Record<string, string>[];
    bestFor: Record<string, string[]>;
    prosCons: Record<string, { pros: string[]; cons: string[] }>;
    pricing: Record<string, Record<string, string>>;
    apiCostExample: string;
    whereToUse: string[];
    roles: string[];
    keyFeatures: Record<string, string[]>;
    benchmarks: {
        chartType: string;
        unit: string;
        data: ComparisonBenchmark[];
        sourceNote: string;
    };
    humanReviews: ComparisonReview[];
    faq: ComparisonFaq[];
}

let cachedData: ComparisonEntry[] | null = null;

function loadData(): ComparisonEntry[] {
    if (cachedData) return cachedData;
    const filePath = join(process.cwd(), 'data', 'hyzenpro-compare-data.json');
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    cachedData = parsed.comparisons;
    return cachedData!;
}

export function getAllComparisons(): ComparisonEntry[] {
    return loadData();
}

export function getComparisonBySlug(slug: string): ComparisonEntry | undefined {
    return loadData().find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
    return loadData().map((c) => c.slug);
}
