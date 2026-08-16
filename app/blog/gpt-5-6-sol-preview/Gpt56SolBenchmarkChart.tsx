'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

const TERMINAL_BENCH_DATA = [
    { name: 'Sol Ultra', value: 91.9, group: 'GPT-5.6 family' },
    { name: 'Sol', value: 88.8, group: 'GPT-5.6 family' },
    { name: 'GPT-5.5', value: 88.0, group: 'Prior gen / rivals' },
    { name: 'Claude Mythos 5', value: 84.3, group: 'Prior gen / rivals' },
    { name: 'Claude Fable 5', value: 83.4, group: 'Prior gen / rivals' },
    { name: 'Claude Opus 4.8', value: 78.9, group: 'Prior gen / rivals' },
    { name: 'Gemini 3.1 Pro', value: 70.7, group: 'Prior gen / rivals' },
];

const PRICING_DATA = [
    { name: 'Luna', input: 1, output: 6 },
    { name: 'Terra', input: 2.5, output: 15 },
    { name: 'Sol', input: 5, output: 30 },
];

const BAR_COLOR = (group: string) =>
    group === 'GPT-5.6 family' ? '#10A37F' : '#C9C5BC';

export default function Gpt56SolBenchmarkChart() {
    return (
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900">
                    Terminal-Bench 2.1: GPT-5.6 Sol vs the field
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                    Widely reported readings of OpenAI&apos;s launch-day chart (June 26,
                    2026). OpenAI&apos;s post states Sol sets a new state of the art on this
                    benchmark; exact figures below come from outlets that reviewed the
                    published chart, not from OpenAI&apos;s running text.
                </p>
            </div>

            <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={TERMINAL_BENCH_DATA}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDEBE6" />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                            tick={{ fontSize: 12, fill: '#57544D' }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#57544D' }}
                            width={120}
                        />
                        <Tooltip
                            formatter={(value) => [`${value}%`, 'Terminal-Bench 2.1']}
                            contentStyle={{
                                borderRadius: 12,
                                border: '1px solid #EDEBE6',
                                fontSize: 13,
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {TERMINAL_BENCH_DATA.map((entry) => (
                                <Cell key={entry.name} fill={BAR_COLOR(entry.group)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#10A37F' }} />
                    GPT-5.6 family
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#C9C5BC' }} />
                    Prior-generation / rival models
                </span>
            </div>

            <div className="mt-8">
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                    GPT-5.6 pricing by tier ($ per million tokens)
                </h4>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={PRICING_DATA}
                            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                            barGap={4}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEBE6" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#57544D' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#57544D' }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip
                                formatter={(value) => [`$${value}`, '']}
                                contentStyle={{ borderRadius: 12, border: '1px solid #EDEBE6', fontSize: 13 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="input" name="Input / MTok" fill="#10A37F" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="output" name="Output / MTok" fill="#0B4C3D" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                Sources:{' '}
                <a
                    href="https://openai.com/index/previewing-gpt-5-6-sol/"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:text-neutral-600"
                >
                    OpenAI, &quot;Previewing GPT-5.6 Sol: a next-generation model&quot; (Jun 26, 2026)
                </a>
                , cross-referenced against third-party chart readings. GPT-5.6 is in a
                restricted preview at the time of writing — these figures may be
                revised when OpenAI publishes a full evaluation suite at general
                availability.
            </p>
        </div>
    );
}
