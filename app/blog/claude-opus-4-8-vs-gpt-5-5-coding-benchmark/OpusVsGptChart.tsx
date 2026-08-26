'use client';

import { useState, useEffect, useRef } from 'react';

type BenchmarkKey = 'swe' | 'terminal' | 'computer' | 'reasoning' | 'chinese';

interface BenchModel {
    name: string;
    score: number;
    color: string;
    winner?: boolean;
}

const BENCHMARKS: Record<BenchmarkKey, { title: string; source: string; models: BenchModel[] }> = {
    swe: {
        title: 'SWE-Bench Pro — Agentic Coding',
        source: 'Source: Anthropic launch data, May 28 2026',
        models: [
            { name: 'Claude Opus 4.8', score: 69.2, color: '#c94f2a', winner: true },
            { name: 'DeepSeek V4-Pro ★', score: 62.0, color: '#ef4444' },
            { name: 'Claude Opus 4.7', score: 64.3, color: '#e07a5f' },
            { name: 'GPT-5.5', score: 58.6, color: '#10a37f' },
            { name: 'Qwen 3.7 Max ★', score: 57.0, color: '#d97706' },
            { name: 'Gemini 3.1 Pro', score: 54.2, color: '#4285f4' },
            { name: 'Claude Opus 4.6 ★', score: 53.4, color: '#9ca3af' },
            { name: 'Kimi 2.6 ★', score: 47.6, color: '#8b5cf6' },
        ],
    },
    terminal: {
        title: 'Terminal-Bench 2.1 — CLI Coding',
        source: '⚠ Harness caveat applies — see note below',
        models: [
            { name: 'GPT-5.5', score: 78.2, color: '#10a37f', winner: true },
            { name: 'Gemini 3.1 Pro', score: 70.3, color: '#4285f4' },
            { name: 'Claude Opus 4.8', score: 74.6, color: '#c94f2a' },
            { name: 'Claude Opus 4.7', score: 66.1, color: '#e07a5f' },
            { name: 'DeepSeek V4-Pro ★', score: 65.0, color: '#ef4444' },
        ],
    },
    computer: {
        title: 'Agentic Computer Use — OSWorld-Verified',
        source: 'Source: Anthropic launch data, May 28 2026',
        models: [
            { name: 'Claude Opus 4.8', score: 83.4, color: '#c94f2a', winner: true },
            { name: 'Claude Opus 4.7', score: 82.8, color: '#e07a5f' },
            { name: 'GPT-5.5', score: 78.7, color: '#10a37f' },
            { name: 'Gemini 3.1 Pro', score: 76.2, color: '#4285f4' },
        ],
    },
    reasoning: {
        title: 'Multidisciplinary Reasoning — HLE with Tools',
        source: "Source: Humanity's Last Exam, Anthropic launch data",
        models: [
            { name: 'Claude Opus 4.8', score: 57.9, color: '#c94f2a', winner: true },
            { name: 'Claude Opus 4.7', score: 54.7, color: '#e07a5f' },
            { name: 'GPT-5.5', score: 52.2, color: '#10a37f' },
            { name: 'Gemini 3.1 Pro', score: 51.4, color: '#4285f4' },
            { name: 'Qwen 3.7 Max ★', score: 50.0, color: '#d97706' },
        ],
    },
    chinese: {
        title: 'SWE-Bench Pro — Including Chinese Models',
        source: '★ = third-party estimates from AI Coding Daily & reported API results',
        models: [
            { name: 'Claude Opus 4.8', score: 69.2, color: '#c94f2a', winner: true },
            { name: 'DeepSeek V4-Pro ★', score: 62.0, color: '#ef4444' },
            { name: 'GPT-5.5', score: 58.6, color: '#10a37f' },
            { name: 'Qwen 3.7 Max ★', score: 57.0, color: '#d97706' },
            { name: 'Gemini 3.1 Pro', score: 54.2, color: '#4285f4' },
            { name: 'Kimi 2.6 ★', score: 47.6, color: '#8b5cf6' },
            { name: 'Kimi 2.5 ★', score: 31.9, color: '#6b7280' },
        ],
    },
};

const TAB_LABELS: Record<BenchmarkKey, string> = {
    swe: 'SWE-Bench Pro',
    terminal: 'Terminal Coding',
    computer: 'Computer Use',
    reasoning: 'Reasoning',
    chinese: '+ Chinese Models',
};

export default function OpusVsGptChart() {
    const [activeTab, setActiveTab] = useState<BenchmarkKey>('swe');
    const [animated, setAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting && !animated) {
                    setAnimated(true);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [animated]);

    const bench = BENCHMARKS[activeTab];
    const maxScore = Math.max(...bench.models.map((m) => m.score));

    const handleTab = (key: BenchmarkKey) => {
        setActiveTab(key);
        setAnimated(false);
        setTimeout(() => setAnimated(true), 80);
    };

    return (
        <div ref={ref} className="bg-white border border-gray-200 rounded-xl overflow-hidden my-8">
            <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                {(Object.keys(TAB_LABELS) as BenchmarkKey[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => handleTab(key)}
                        className={`flex-1 min-w-[100px] px-3 py-2.5 text-xs font-semibold font-heading tracking-wide border-b-3 transition-colors ${
                            activeTab === key
                                ? key === 'swe' || key === 'computer' || key === 'reasoning' || key === 'chinese'
                                    ? 'text-[#c94f2a] border-[#c94f2a]'
                                    : 'text-[#10a37f] border-[#10a37f]'
                                : 'text-gray-700 border-transparent hover:text-gray-700'
                        }`}
                    >
                        {TAB_LABELS[key]}
                    </button>
                ))}
            </div>

            <div className="px-5 py-4">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <span className="text-xs font-bold font-heading tracking-widest uppercase text-gray-800">{bench.title}</span>
                    <span className="text-[10px] text-gray-700">{bench.source}</span>
                </div>

                <div className="flex flex-col gap-3">
                    {bench.models.map((model) => (
                        <div key={model.name} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[13px] font-semibold text-gray-700">
                                    {model.name}
                                    {model.winner && (
                                        <span className="ml-1.5 inline-block text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm uppercase" style={{ background: `${model.color}15`, color: model.color, border: `1px solid ${model.color}40` }}>
                                            WINNER
                                        </span>
                                    )}
                                </span>
                                <span className="text-sm font-bold font-heading" style={{ color: model.color }}>
                                    {model.score}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: animated ? `${(model.score / maxScore) * 100}%` : '0%',
                                        background: model.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-[11px] text-gray-700 mt-4 pt-3 border-t border-gray-100">
                    {activeTab === 'terminal'
                        ? '⚠ Harness caveat: GPT-5.5 scores 78.2% using the Terminus-2 public harness. Using OpenAI\'s own Codex CLI, the score rises to 83.4%.'
                        : activeTab === 'swe'
                        ? '★ = third-party or estimated score. All bars scaled relative to max score in panel.'
                        : '★ = third-party or estimated score. All scores from official launch data where available.'}
                </p>
            </div>
        </div>
    );
}
