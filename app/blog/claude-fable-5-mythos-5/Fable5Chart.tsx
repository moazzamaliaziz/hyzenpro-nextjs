'use client';

import { useState, useEffect, useRef } from 'react';

interface BenchRow {
    benchmark: string;
    sub: string;
    fable: number | null;
    opus: number | null;
    gpt: number | null;
    gemini: number | null;
    sota?: boolean;
    mythos?: boolean;
}

const DATA: BenchRow[] = [
    { benchmark: 'Agentic Coding', sub: 'SWE-Bench Pro', fable: 80.3, opus: 69.2, gpt: 58.6, gemini: 54.2, sota: true },
    { benchmark: 'Agentic Coding', sub: 'FrontierCode Diamond (xhigh)', fable: 29.3, opus: 13.4, gpt: 5.7, gemini: null, sota: true },
    { benchmark: 'Agentic Coding', sub: 'Terminal-Bench 2.1', fable: 88.0, opus: 82.7, gpt: 83.4, gemini: 70.7, sota: true },
    { benchmark: 'Knowledge Work', sub: 'GDPval-AA (score)', fable: 1932, opus: 1890, gpt: 1769, gemini: 1314 },
    { benchmark: 'Knowledge Work Vision', sub: 'GDP.pdf (no tools)', fable: 29.8, opus: 22.5, gpt: 24.9, gemini: 16.7 },
    { benchmark: 'Spatial Reasoning', sub: 'Blueprint-Bench 2', fable: 38.6, opus: 14.5, gpt: 36.2, gemini: 26.5, sota: true },
    { benchmark: 'Tool Use', sub: 'AutomationBench', fable: 17.4, opus: 15.5, gpt: 12.9, gemini: 9.6, sota: true },
    { benchmark: 'Computer Use', sub: 'OSWorld-Verified', fable: 85.0, opus: 83.4, gpt: 78.7, gemini: 76.2 },
    { benchmark: 'Computer Use (Mythos)', sub: 'OSWorld-Verified', fable: 85.4, opus: null, gpt: null, gemini: null, mythos: true },
    { benchmark: 'Legal', sub: 'Legal Agent Benchmark', fable: 13.3, opus: 10.4, gpt: 2.1, gemini: 0.0, sota: true },
    { benchmark: 'Multidisciplinary', sub: "Humanity's Last Exam (no tools)", fable: 59.0, opus: 49.8, gpt: 41.4, gemini: 44.4, sota: true },
    { benchmark: 'Cybersecurity', sub: 'ExploitBench (Cap%)', fable: 78.0, opus: 40.0, gpt: 34.0, gemini: null, sota: true },
    { benchmark: 'Health', sub: 'HealthBench Professional', fable: 66.0, opus: 56.9, gpt: 51.8, gemini: null, sota: true },
    { benchmark: 'Biology', sub: 'BioMysteryBench (human solved)', fable: 83.9, opus: 80.4, gpt: null, gemini: null, sota: true },
];

const COLORS = {
    fable: '#C9462A',
    opus: '#7A6FC9',
    gpt: '#3DAD79',
    gemini: '#F5A623',
};

function BarCell({ value, max, color }: { value: number | null; max: number; color: string }) {
    if (value === null) return <td className="py-3 px-3 text-sm text-gray-700">—</td>;
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <td className="py-3 px-3">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="text-xs font-bold min-w-[42px] text-right" style={{ color }}>{typeof value === 'number' && value % 1 !== 0 ? `${value}%` : value}</span>
            </div>
        </td>
    );
}

export default function Fable5Chart() {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold: 0.1 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className="bg-white border border-gray-200 rounded-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">Claude Fable 5 vs. the Competition — Full Benchmark Table</h3>
                <p className="text-xs text-gray-700">All scores sourced from Anthropic&apos;s June 9, 2026 announcement.</p>
            </div>

            <div className="px-6 py-3 flex gap-4 flex-wrap text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.fable }} />Fable 5 / Mythos 5</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.opus }} />Claude Opus 4.8</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.gpt }} />GPT 5.5</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.gemini }} />Gemini 3.1 Pro</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wide py-3 px-3 w-[200px]">Benchmark</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-3" style={{ color: COLORS.fable }}>Fable 5</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-3" style={{ color: COLORS.opus }}>Opus 4.8</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-3" style={{ color: COLORS.gpt }}>GPT 5.5</th>
                            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-3" style={{ color: COLORS.gemini }}>Gemini</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DATA.map((row, i) => {
                            const vals = [row.fable, row.opus, row.gpt, row.gemini].filter((v): v is number => v !== null);
                            const max = Math.max(...vals);
                            return (
                                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-3">
                                        <span className="font-semibold text-gray-900">{row.benchmark}</span>
                                        {row.sota && <span className="ml-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase" style={{ background: COLORS.fable, color: '#fff' }}>SOTA</span>}
                                        {row.mythos && <span className="ml-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase" style={{ background: '#1E3A5F', color: '#fff' }}>MYTHOS</span>}
                                        <br /><span className="text-xs text-gray-700 font-normal">{row.sub}</span>
                                    </td>
                                    <BarCell value={row.fable} max={max} color={COLORS.fable} />
                                    <BarCell value={row.opus} max={max} color={COLORS.opus} />
                                    <BarCell value={row.gpt} max={max} color={COLORS.gpt} />
                                    <BarCell value={row.gemini} max={max} color={COLORS.gemini} />
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-gray-700 px-6 py-4 border-t border-gray-100">
                * Cybersecurity, Biology, Health benchmarks show a larger gap because Fable 5 includes fallback routing to Opus 4.8 on sensitive inputs. Mythos 5 (no fallback) scores higher. Computer Use top score: Mythos 5 (85.4%) vs Fable 5 (85.0%).
            </p>
        </div>
    );
}
