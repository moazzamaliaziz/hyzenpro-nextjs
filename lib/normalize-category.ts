const CATEGORY_MAP: Record<string, string[]> = {
    'ai automation': ['AI Automation'],
    'ai benchmarks': ['AI Benchmarks'],
    'ai chatbots': ['AI Chatbots'],
    'ai coding tools': ['AI Coding Tools'],
    'ai image tools': ['AI Image Tools'],
    'ai marketing tools': ['AI Marketing Tools'],
    'ai tools': ['AI Tools'],
    'ai tools for business': ['AI Tools for Business'],
    'ai video tools': ['AI Video Tools'],
    'ai writing tools': ['AI Writing Tools'],
    'agentic ai': ['Agentic AI'],
    'llm comparison': ['LLM Comparison'],
    review: ['Reviews'],
    reviews: ['Reviews'],
    comparison: ['Comparisons'],
    comparisons: ['Comparisons'],
    tutorial: ['Tutorials'],
    tutorials: ['Tutorials'],
    'ai-agentic-tools': ['Agentic AI'],
    'ai-use-cases': ['AI Tools for Business'],
    'reviews & comparisons': ['Reviews', 'Comparisons'],
};

function toTitleCase(value: string) {
    const titled = value
        .trim()
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

    return titled
        .replace(/\bAi\b/g, 'AI')
        .replace(/\bLlm\b/g, 'LLM')
        .replace(/\bFor\b/g, 'for');
}

export function normalizeCategory(category: string) {
    const key = category.trim().toLowerCase();
    const mapped = CATEGORY_MAP[key];
    return mapped ? mapped[0] : toTitleCase(category);
}

export function normalizeCategories(categories: unknown) {
    const values = Array.isArray(categories) ? categories : [];
    const normalized = values.flatMap((category) => {
        if (typeof category !== 'string') return [];

        const key = category.trim().toLowerCase();
        return CATEGORY_MAP[key] || [toTitleCase(category)];
    });

    return Array.from(new Set(normalized.filter(Boolean)));
}
