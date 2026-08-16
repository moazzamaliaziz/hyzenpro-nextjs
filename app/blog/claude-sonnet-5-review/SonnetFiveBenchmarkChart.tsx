'use client';

import { useState } from 'react';
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

const BENCHMARK_DATA = [
    {
        key: 'swebench',
        label: 'SWE-bench Pro (agentic coding)',
        short: 'SWE-bench Pro',
        'Sonnet 5': 63.2,
        'Sonnet 4.6': 58.1,
        'Opus 4.8': 69.2,
    },
    {
        key: 'terminal',
        label: 'Terminal-Bench 2.1 (tool & terminal use)',
        short: 'Terminal-Bench 2.1',
        'Sonnet 5': 80.4,
        'Sonnet 4.6': 67.0,
        'Opus 4.8': 82.7,
    },
    {
        key: 'osworld',
        label: 'OSWorld-Verified (computer use)',
        short: 'OSWorld-Verified',
        'Sonnet 5': 81.2,
        'Sonnet 4.6': 78.5,
        'Opus 4.8': 83.4,
    },
    {
        key: 'hle-notools',
        label: "Humanity's Last Exam (no tools)",
        short: 'HLE (no tools)',
        'Sonnet 5': 43.2,
        'Sonnet 4.6': 34.6,
        'Opus 4.8': 49.8,
    },
    {
        key: 'hle-tools',
        label: "Humanity's Last Exam (with tools)",
        short: 'HLE (with tools)',
        'Sonnet 5': 57.4,
        'Sonnet 4.6': 46.8,
        'Opus 4.8': 57.9,
    },
];

const GDPVAL_DATA = [
    { name: 'Sonnet 4.6', value: 1395 },
    { name: 'Sonnet 5', value: 1618 },
    { name: 'Opus 4.8', value: 1615 },
];

const COLORS: Record<string, string> = {
    'Sonnet 5': '#D97757',
    'Sonnet 4.6': '#B4B0A7',
    'Opus 4.8': '#6B5B4F',
};

const GDPVAL_COLORS: Record<string, string> = {
    'Sonnet 4.6': '#B4B0A7',
    'Sonnet 5': '#D97757',
    'Opus 4.8': '#6B5B4F',
};

export default function SonnetFiveBenchmarkChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900">
                    Claude Sonnet 5 vs Sonnet 4.6 vs Opus 4.8
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                    Percentage-based evaluations published by Anthropic at launch (June 30,
                    2026). Opus 4.8 is shown as the reference ceiling.
                </p>
            </div>

            <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={BENCHMARK_DATA}
                        margin={{ top: 10, right: 10, left: -10, bottom: 60 }}
                        barGap={4}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEBE6" />
                        <XAxis
                            dataKey="short"
                            angle={-25}
                            textAnchor="end"
                            interval={0}
                            tick={{ fontSize: 11, fill: '#57544D' }}
                            height={70}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                            tick={{ fontSize: 12, fill: '#57544D' }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value}%`, '']}
                            labelFormatter={(_, payload) =>
                                payload && payload[0] ? payload[0].payload.label : ''
                            }
                            contentStyle={{
                                borderRadius: 12,
                                border: '1px solid #EDEBE6',
                                fontSize: 13,
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                        <Bar
                            dataKey="Sonnet 4.6"
                            fill={COLORS['Sonnet 4.6']}
                            radius={[4, 4, 0, 0]}
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                        />
                        <Bar
                            dataKey="Sonnet 5"
                            fill={COLORS['Sonnet 5']}
                            radius={[4, 4, 0, 0]}
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                        />
                        <Bar
                            dataKey="Opus 4.8"
                            fill={COLORS['Opus 4.8']}
                            radius={[4, 4, 0, 0]}
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8">
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                    GDPval-AA v2 — professional knowledge work (Elo-style score)
                </h4>
                <p className="text-xs text-neutral-500 mb-3">
                    This is the one headline metric where Sonnet 5 (1618) edges past Opus 4.8
                    (1615). It is scored on an Elo-style scale, not a percentage, so it&apos;s
                    charted on its own axis.
                </p>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={GDPVAL_DATA}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDEBE6" />
                            <XAxis type="number" domain={[1300, 1700]} tick={{ fontSize: 12, fill: '#57544D' }} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#57544D' }}
                                width={90}
                            />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #EDEBE6', fontSize: 13 }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {GDPVAL_DATA.map((entry) => (
                                    <Cell key={entry.name} fill={GDPVAL_COLORS[entry.name]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                Sources:{' '}
                <a
                    href="https://www.anthropic.com/news/claude-sonnet-5"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:text-neutral-600"
                >
                    Anthropic, &quot;Introducing Claude Sonnet 5&quot; (Jun 30, 2026)
                </a>{' '}
                and the{' '}
                <a
                    href="https://www.anthropic.com/claude-sonnet-5-system-card"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:text-neutral-600"
                >
                    Claude Sonnet 5 System Card
                </a>
                . SWE-bench Pro is the harder &quot;Pro&quot; variant, not SWE-bench Verified — don&apos;t
                confuse the two when comparing against other published numbers.
            </p>
        </div>
    );
}
