'use client';

import { useState } from 'react';
import { BarChart3, Loader2, AlertCircle, CheckCircle, TrendingUp, Eye, Pen } from 'lucide-react';

interface Scores {
    overall: number;
    seo: {
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
    };
    readability: {
        score: number;
        fleschKincaid: number;
        gradeLevel: string;
        issues: string[];
    };
    quality: {
        score: number;
        wordCount: number;
        headingCount: number;
        hasIntroduction: boolean;
        hasConclusion: boolean;
        lexicalDiversity: number;
        issues: string[];
    };
}

interface ContentScorerProps {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{score}</span>
        </div>
    );
}

export default function ContentScorer({ title, excerpt, content, tags }: ContentScorerProps) {
    const [loading, setLoading] = useState(false);
    const [scores, setScores] = useState<Scores | null>(null);
    const [error, setError] = useState('');

    const analyze = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/posts/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, excerpt, content, tags }),
            });
            if (!res.ok) throw new Error('Failed to analyze');
            setScores(await res.json());
        } catch {
            setError('Failed to analyze content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent" /> Content Score
                </h3>
                <button
                    onClick={analyze}
                    disabled={loading || !content}
                    className="px-4 py-1.5 bg-accent/10 text-accent text-xs font-semibold rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Analyze'}
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> {error}
                </div>
            )}

            {scores && (
                <div className="space-y-4">
                    {/* Overall score */}
                    <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl">
                        <ScoreRing score={scores.overall} size={56} />
                        <div>
                            <div className="text-sm font-semibold text-white">
                                {scores.overall >= 80 ? 'Excellent' : scores.overall >= 60 ? 'Good' : scores.overall >= 40 ? 'Needs Work' : 'Poor'}
                            </div>
                            <div className="text-xs text-white/40">Overall Score</div>
                        </div>
                    </div>

                    {/* Category scores */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white/[0.02] rounded-xl text-center">
                            <ScoreRing score={scores.seo.score} size={40} />
                            <div className="text-[10px] text-white/40 mt-1 flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" /> SEO
                            </div>
                        </div>
                        <div className="p-3 bg-white/[0.02] rounded-xl text-center">
                            <ScoreRing score={scores.readability.score} size={40} />
                            <div className="text-[10px] text-white/40 mt-1 flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3" /> Readability
                            </div>
                        </div>
                        <div className="p-3 bg-white/[0.02] rounded-xl text-center">
                            <ScoreRing score={scores.quality.score} size={40} />
                            <div className="text-[10px] text-white/40 mt-1 flex items-center justify-center gap-1">
                                <Pen className="w-3 h-3" /> Quality
                            </div>
                        </div>
                    </div>

                    {/* SEO details */}
                    <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">SEO Checks</div>
                        {[
                            { ok: scores.seo.titleOk, label: `Title length (${scores.seo.titleLength} chars)` },
                            { ok: scores.seo.excerptOk, label: 'Meta description' },
                            { ok: scores.seo.headingStructure, label: 'Heading structure' },
                            { ok: scores.seo.imageAltText, label: 'Image alt text' },
                            { ok: scores.seo.contentLengthOk, label: `Content length (${scores.seo.contentLength} words)` },
                            { ok: scores.seo.internalLinks > 0, label: `Internal links (${scores.seo.internalLinks})` },
                        ].map((check, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                {check.ok ? (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                ) : (
                                    <AlertCircle className="w-3 h-3 text-amber-400" />
                                )}
                                <span className={check.ok ? 'text-white/60' : 'text-amber-400/80'}>{check.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Readability */}
                    <div className="p-3 bg-white/[0.02] rounded-xl">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Readability</div>
                        <div className="text-xs text-white/60">
                            Grade Level: <span className="text-white font-medium">{scores.readability.gradeLevel}</span>
                            <span className="text-white/30 ml-2">(FK: {scores.readability.fleschKincaid})</span>
                        </div>
                    </div>

                    {/* Issues */}
                    {[...scores.seo.issues, ...scores.seo.suggestions, ...scores.readability.issues, ...scores.quality.issues].length > 0 && (
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Issues & Suggestions</div>
                            {[...scores.seo.issues, ...scores.seo.suggestions, ...scores.readability.issues, ...scores.quality.issues].map((issue, i) => (
                                <div key={i} className="text-xs text-amber-400/80 flex items-start gap-1.5">
                                    <span className="text-amber-400/40 mt-0.5">-</span> {issue}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!scores && !loading && !error && (
                <p className="text-white/30 text-xs text-center py-4">Click "Analyze" to score your content</p>
            )}
        </div>
    );
}
