'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface BenchmarkRow {
    benchmark: string;
    [key: string]: string | number | null;
}

interface ComparisonBenchmarkChartProps {
    data: BenchmarkRow[];
    unit: string;
    sourceNote: string;
    models: { id: string; name: string; vendor: string }[];
}

const MODEL_COLORS: Record<string, string> = {
    'Claude Opus 4.8': '#374151',
    'Codex / GPT-5.5': '#111827',
    'Claude Sonnet 5': '#6b7280',
    'GLM-5.2': '#b45309',
    'Claude Fable 5': '#4b5563',
    'Claude Mythos 5': '#1f2937',
    'Claude Opus 4.8 (reference)': '#9ca3af',
    'GPT-5.5 (reference)': '#d1d5db',
};

function getModelKeys(data: BenchmarkRow[]): string[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => k !== 'benchmark');
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload) return null;
    return (
        <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-sm">
            <p className="font-medium text-foreground mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-foreground/70">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2" style={{ background: entry.color }} />
                    {entry.name}: <span className="font-mono font-medium text-foreground">{entry.value}{entry.value != null ? '%' : ' —'}</span>
                </p>
            ))}
        </div>
    );
}

export default function ComparisonBenchmarkChart({ data, unit, sourceNote, models }: ComparisonBenchmarkChartProps) {
    const modelKeys = getModelKeys(data);

    return (
        <div>
            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.012 70)" vertical={false} />
                        <XAxis
                            dataKey="benchmark"
                            tick={{ fontSize: 12, fill: 'oklch(0.48 0.015 60)' }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={0}
                            height={60}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12, fill: 'oklch(0.48 0.015 60)' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: number) => `${v}${unit}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.95 0.012 70 / 0.5)' }} />
                        <Legend
                            wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
                            formatter={(value: string) => (
                                <span className="text-foreground/80">{value}</span>
                            )}
                        />
                        {modelKeys.map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={MODEL_COLORS[key] || '#6b7280'}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={48}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {sourceNote && (
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{sourceNote}</p>
            )}
        </div>
    );
}
