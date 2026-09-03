'use client';

const MODELS = [
    ['Claude Fable 5', 1],
    ['Claude Opus 4.6 High', 2],
    ['Claude Fable 5.1 Max', 3],
    ['Claude Opus 4.7 High', 4],
    ['Muse Spark 1.2 xHigh', 5],
    ['Claude Opus 4.6', 6],
    ['Claude Opus 4.7', 7],
    ['Gemini 3.8 Flash High', 8],
    ['Claude Opus 5 High', 9],
    ['Muse Spark 1.1', 10],
    ['Gemini 3.7 Flash High', 11],
    ['Kimi K3 Max', 12],
    ['Muse Spark', 13],
    ['Claude Opus 5 Max', 14],
    ['Gemini 3.1 Pro Preview', 15],
] as const;

export default function FrontierModelChart() {
    return (
        <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="frontier-model-chart-title">
            <div className="border-b border-slate-100 bg-slate-950 px-5 py-5 text-white sm:px-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Comparable leaderboard snapshot</p>
                <h2 id="frontier-model-chart-title" className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">15 frontier models on Arena Text</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Lower rank is better. This is a human-preference Arena ranking, not a percentage accuracy score and not a substitute for Anthropic&apos;s task-specific evaluations.</p>
            </div>
            <div className="space-y-3 px-5 py-6 sm:px-7">
                {MODELS.map(([model, rank]) => {
                    const width = `${Math.max(7, 100 - ((rank - 1) / 14) * 84)}%`;
                    const isFable = model.toLowerCase().includes('fable');
                    return (
                        <div key={model} className="grid grid-cols-[1.25rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm">
                            <span className="text-right font-semibold tabular-nums text-slate-500">{rank}</span>
                            <div className="min-w-0">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <span className="truncate font-medium text-slate-800">{model}</span>
                                    {isFable && <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Anthropic</span>}
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${model}, Arena Text rank ${rank} of 15`}>
                                    <div className={`h-full rounded-full ${isFable ? 'bg-indigo-600' : 'bg-cyan-500'}`} style={{ width }} />
                                </div>
                            </div>
                            <span className="text-right text-xs font-semibold tabular-nums text-slate-500">#{rank}</span>
                        </div>
                    );
                })}
            </div>
            <figcaption className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500 sm:px-7">
                Source: <a className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900" href="https://arena.ai/leaderboard" target="_blank" rel="noopener noreferrer">Arena Text leaderboard</a>, accessed September 3, 2026. The chart preserves the displayed top-15 order; Arena scores and uncertainty intervals can change as votes accumulate. Anthropic&apos;s own announcement reports separate task benchmarks under different tools, effort levels, and safeguard conditions.
            </figcaption>
        </figure>
    );
}
