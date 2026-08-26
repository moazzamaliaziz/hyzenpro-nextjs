"use client";

import { useState, useEffect } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
    BarChart,
    Bar,
} from "recharts";

interface BenchmarkRow {
    model: string;
    score: number;
    cost: number;
    highlight: boolean;
}

const BENCHMARK_DATA: BenchmarkRow[] = [
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
];

const ScatterTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: BenchmarkRow }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className={`bg-white border rounded-lg shadow-lg p-3 text-sm ${d.highlight ? 'border-orange-400' : 'border-gray-200'}`}>
            <p className={`font-bold mb-1 ${d.highlight ? 'text-orange-500' : 'text-gray-900'}`}>{d.model}</p>
            <p className="text-gray-700">Score: <strong className="text-gray-800">{d.score}%</strong></p>
            <p className="text-gray-700">Avg cost: <strong className="text-gray-800">${d.cost}</strong></p>
        </div>
    );
};

export default function Composer25Chart() {
    const [view, setView] = useState<"scatter" | "bar">("scatter");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // The chart reads browser dimensions only after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    const barData = BENCHMARK_DATA
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((d) => ({
            ...d,
            shortName: d.model.length > 14 ? d.model.slice(0, 13) + "…" : d.model,
        }));

    if (!isMounted) {
        return (
            <div className="my-8 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-gray-50 h-96 animate-pulse" />
        );
    }

    return (
        <div className="my-8 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-wrap justify-between items-start gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-0.5">
                        AI Coding Daily Leaderboard
                    </p>
                    <h3 className="font-heading text-base text-black">
                        AI Coding Benchmark: Score % vs. Average Cost per Task (USD)
                    </h3>
                </div>
                <div className="flex gap-2">
                    {(["scatter", "bar"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`text-[11px] px-3 py-1.5 rounded-full font-medium border transition-colors ${
                                view === v
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                            }`}
                        >
                            {v === "scatter" ? "Score vs Cost" : "Score Ranking"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white px-6 py-6">
                {/* SCATTER */}
                {view === "scatter" && (
                    <>
                        <p className="text-xs text-gray-700 mb-4">
                            Top-right = best value. The <span className="font-bold text-orange-500">orange dot</span> (Composer 2.5) shows frontier-level score at near-zero cost.
                        </p>
                        <ResponsiveContainer width="100%" height={340}>
                            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                                <CartesianGrid stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="cost"
                                    type="number"
                                    name="Avg Cost ($)"
                                    domain={[0, 12]}
                                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                                    label={{ value: "Avg Cost per Task ($)", position: "insideBottom", offset: -12, fill: "#9ca3af", fontSize: 11 }}
                                />
                                <YAxis
                                    dataKey="score"
                                    type="number"
                                    name="Score (%)"
                                    domain={[28, 68]}
                                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                                    label={{ value: "Score (%)", angle: -90, position: "insideLeft", offset: 14, fill: "#9ca3af", fontSize: 11 }}
                                />
                                <Tooltip content={<ScatterTooltip />} />
                                <ReferenceLine x={2} stroke="#e5e7eb" strokeDasharray="4 4" />
                                <ReferenceLine y={60} stroke="#e5e7eb" strokeDasharray="4 4" />
                                <Scatter data={BENCHMARK_DATA} name="Models">
                                    {BENCHMARK_DATA.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={entry.highlight ? "#f97316" : "#d1d5db"}
                                            stroke={entry.highlight ? "#ea580c" : "#9ca3af"}
                                            strokeWidth={entry.highlight ? 2 : 1}
                                            r={entry.highlight ? 9 : 6}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                        <div className="flex gap-5 mt-3">
                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
                                Composer 2.5
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                                Other models
                            </div>
                        </div>
                    </>
                )}

                {/* BAR */}
                {view === "bar" && (
                    <>
                        <p className="text-xs text-gray-700 mb-4">
                            Composer 2.5 sits in the top 3, above all Opus-4.7 and GPT-5.5 mid-tier variants.
                        </p>
                        <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 10 }}>
                                <CartesianGrid horizontal={false} stroke="#f3f4f6" />
                                <XAxis
                                    type="number"
                                    domain={[25, 68]}
                                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                                    label={{ value: "Score (%)", position: "insideBottom", offset: -4, fill: "#9ca3af", fontSize: 11 }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="shortName"
                                    width={115}
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload as BenchmarkRow & { shortName: string };
                                        return (
                                            <div className="bg-white border border-gray-200 rounded-lg shadow p-3 text-xs">
                                                <p className="font-bold text-gray-900 mb-1">{d.model}</p>
                                                <p className="text-gray-700">Score: <strong className={d.highlight ? "text-orange-500" : "text-gray-800"}>{d.score}%</strong></p>
                                                <p className="text-gray-700">Cost: <strong className="text-gray-800">${d.cost}</strong></p>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                    {barData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={entry.highlight ? "#f97316" : "#e5e7eb"}
                                            stroke={entry.highlight ? "#ea580c" : "transparent"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-6 py-3">
                <p className="text-[11px] text-gray-700">
                    Source: AI Coding Daily — Independent benchmark across Laravel/PHP projects (5 runs each, automated test suites).
                </p>
            </div>
        </div>
    );
}
