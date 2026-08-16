import { stripHtml } from '@/lib/utils';

export interface ContentScore {
    overall: number;
    seo: SeoScore;
    readability: ReadabilityScore;
    quality: QualityScore;
}

export interface SeoScore {
    score: number;
    titleLength: number;
    titleOk: boolean;
    excerptLength: number;
    excerptOk: boolean;
    headingStructure: boolean;
    imageAltText: boolean;
    internalLinks: number;
    externalLinks: number;
    keywordDensity: number;
    contentLength: number;
    contentLengthOk: boolean;
    issues: string[];
    suggestions: string[];
}

export interface ReadabilityScore {
    score: number;
    fleschKincaid: number;
    gradeLevel: string;
    avgSentenceLength: number;
    avgWordLength: number;
    passiveVoice: number;
    complexWords: number;
    issues: string[];
}

export interface QualityScore {
    score: number;
    wordCount: number;
    paragraphCount: number;
    headingCount: number;
    listCount: number;
    hasIntroduction: boolean;
    hasConclusion: boolean;
    uniqueWords: number;
    lexicalDiversity: number;
    issues: string[];
}

function countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    let count = 0;
    const vowels = 'aeiouy';
    let prevVowel = false;

    for (const char of word) {
        const isVowel = vowels.includes(char);
        if (isVowel && !prevVowel) count++;
        prevVowel = isVowel;
    }

    if (word.endsWith('e') && count > 1) count--;
    return Math.max(1, count);
}

function scoreSeo(title: string, excerpt: string, content: string, tags: string[]): SeoScore {
    const text = stripHtml(content);
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Title analysis
    const titleLength = title.length;
    const titleOk = titleLength >= 30 && titleLength <= 60;
    if (!titleOk) {
        issues.push(titleLength < 30 ? 'Title is too short' : 'Title is too long');
    }

    // Excerpt analysis
    const excerptLength = (excerpt || '').length;
    const excerptOk = excerptLength >= 120 && excerptLength <= 160;
    if (!excerptOk && excerptLength > 0) {
        issues.push(excerptLength < 120 ? 'Excerpt is too short' : 'Excerpt is too long');
    }
    if (excerptLength === 0) {
        suggestions.push('Add a meta description for better SEO');
    }

    // Content length
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const contentLengthOk = wordCount >= 300;
    if (!contentLengthOk) {
        issues.push('Content is too short (aim for 300+ words)');
    }

    // Heading structure
    const hasH2 = /<h2/i.test(content);
    const hasH3 = /<h3/i.test(content);
    const headingStructure = hasH2;
    if (!headingStructure) {
        suggestions.push('Add H2 headings to improve structure');
    }

    // Image alt text
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    const imgsWithAlt = imgMatches.filter(img => /alt="[^"]+"/i.test(img) && !/alt=""/i.test(img));
    const imageAltText = imgMatches.length === 0 || imgsWithAlt.length > 0;
    if (imgMatches.length > 0 && !imageAltText) {
        suggestions.push('Add alt text to images');
    }

    // Links
    const internalLinks = (content.match(/href="\/[^"]*"/gi) || []).length;
    const externalLinks = (content.match(/href="https?:\/\/[^"]*"/gi) || []).length;
    if (internalLinks === 0) {
        suggestions.push('Add internal links to related content');
    }

    // Keyword analysis (basic)
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    let keywordCount = 0;
    for (const tag of tags) {
        const tagWords = tag.toLowerCase().split(/\s+/);
        for (const tw of tagWords) {
            if (tw.length > 3) {
                keywordCount += words.filter(w => w === tw).length;
            }
        }
    }
    const keywordDensity = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;

    // Calculate score
    let score = 100;
    if (!titleOk) score -= 15;
    if (!excerptOk) score -= 10;
    if (!contentLengthOk) score -= 20;
    if (!headingStructure) score -= 10;
    if (!imageAltText) score -= 10;
    if (internalLinks === 0) score -= 10;
    if (keywordDensity > 3) score -= 10;

    return {
        score: Math.max(0, Math.min(100, score)),
        titleLength,
        titleOk,
        excerptLength,
        excerptOk,
        headingStructure,
        imageAltText,
        internalLinks,
        externalLinks,
        keywordDensity,
        contentLength: wordCount,
        contentLengthOk,
        issues,
        suggestions,
    };
}

function scoreReadability(content: string): ReadabilityScore {
    const text = stripHtml(content);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const issues: string[] = [];

    if (sentences.length === 0 || words.length === 0) {
        return { score: 0, fleschKincaid: 0, gradeLevel: 'N/A', avgSentenceLength: 0, avgWordLength: 0, passiveVoice: 0, complexWords: 0, issues: ['No content to analyze'] };
    }

    const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = totalSyllables / words.length;

    // Flesch-Kincaid Grade Level
    const fleschKincaid = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

    // Flesch Reading Ease
    const readingEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    const score = Math.max(0, Math.min(100, readingEase));

    // Grade level interpretation
    let gradeLevel = 'College';
    if (fleschKincaid < 6) gradeLevel = 'Elementary';
    else if (fleschKincaid < 8) gradeLevel = 'Middle School';
    else if (fleschKincaid < 10) gradeLevel = 'High School';
    else if (fleschKincaid < 12) gradeLevel = 'High School+';
    else if (fleschKincaid < 14) gradeLevel = 'College';

    // Passive voice detection (basic)
    const passiveMatches = text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || [];
    const passiveVoice = passiveMatches.length;

    if (passiveVoice > sentences.length * 0.1) {
        issues.push('Too much passive voice');
    }

    if (avgSentenceLength > 25) {
        issues.push('Sentences are too long on average');
    }

    const complexWords = words.filter(w => countSyllables(w) >= 4).length;

    return {
        score,
        fleschKincaid: Math.round(fleschKincaid * 10) / 10,
        gradeLevel,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        avgWordLength: Math.round((words.join('').length / words.length) * 10) / 10,
        passiveVoice,
        complexWords,
        issues,
    };
}

function scoreQuality(content: string): QualityScore {
    const text = stripHtml(content);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = content.split(/<\/p>/i).filter(p => stripHtml(p).trim().length > 0);
    const headings = (content.match(/<h[1-6][^>]*>/gi) || []).length;
    const lists = (content.match(/<[ou]l[^>]*>/gi) || []).length;
    const issues: string[] = [];

    const wordCount = words.length;

    // Check for introduction and conclusion
    const firstParagraph = paragraphs[0] ? stripHtml(paragraphs[0]) : '';
    const lastParagraph = paragraphs[paragraphs.length - 1] ? stripHtml(paragraphs[paragraphs.length - 1]) : '';
    const hasIntroduction = firstParagraph.length > 100;
    const hasConclusion = lastParagraph.length > 50;

    if (!hasIntroduction) issues.push('Introduction could be longer');
    if (!hasConclusion) issues.push('Add a conclusion');
    if (headings < 2) issues.push('Add more headings');
    if (wordCount < 300) issues.push('Content is too short');

    // Lexical diversity
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const lexicalDiversity = words.length > 0 ? uniqueWords / words.length : 0;

    if (lexicalDiversity < 0.4) {
        issues.push('Low vocabulary diversity');
    }

    // Calculate score
    let score = 100;
    if (!hasIntroduction) score -= 10;
    if (!hasConclusion) score -= 10;
    if (headings < 2) score -= 10;
    if (wordCount < 300) score -= 20;
    if (wordCount < 1000) score -= 5;
    if (lexicalDiversity < 0.4) score -= 10;

    return {
        score: Math.max(0, Math.min(100, score)),
        wordCount,
        paragraphCount: paragraphs.length,
        headingCount: headings,
        listCount: lists,
        hasIntroduction,
        hasConclusion,
        uniqueWords,
        lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
        issues,
    };
}

export function analyzeContent(title: string, excerpt: string, content: string, tags: string[]): ContentScore {
    const seo = scoreSeo(title, excerpt, content, tags);
    const readability = scoreReadability(content);
    const quality = scoreQuality(content);

    const overall = Math.round((seo.score * 0.4 + readability.score * 0.3 + quality.score * 0.3));

    return { overall, seo, readability, quality };
}
