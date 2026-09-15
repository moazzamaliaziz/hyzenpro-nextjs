"use client";

import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// ─── Brand configs ───────────────────────────────────────────────────────────
const MODELS = [
  {
    id: "gpt55",
    name: "GPT-5.5",
    vendor: "OpenAI",
    color: "#111827",
    bg: "#f9fafb",
    accent: "#111827",
    badges: ["Math Leader", "All-Rounder"],
    benchmarks: {
      "AIME 2025": 95.2,
      "SWE-Bench": 74.9,
      "MMLU-Pro": 88.5,
      "ARC-AGI-2": 71.0,
      "Tool Use": 72.0,
    },
  },
  {
    id: "claudeopus",
    name: "Claude Opus 4.7",
    vendor: "Anthropic",
    color: "#374151",
    bg: "#f3f4f6",
    accent: "#374151",
    badges: ["Writing #1", "Agentic #1"],
    benchmarks: {
      "AIME 2025": 82.0,
      "SWE-Bench": 74.0,
      "MMLU-Pro": 87.0,
      "ARC-AGI-2": 70.0,
      "Tool Use": 77.3,
    },
  },
  {
    id: "gemini",
    name: "Gemini 3.1 Pro",
    vendor: "Google",
    color: "#71717a",
    bg: "#f4f4f5",
    accent: "#52525b",
    badges: ["Reasoning #1", "1M Context"],
    benchmarks: {
      "AIME 2025": 78.0,
      "SWE-Bench": 69.0,
      "MMLU-Pro": 85.0,
      "ARC-AGI-2": 77.1,
      "Tool Use": 70.0,
    },
  },
  {
    id: "grok4",
    name: "Grok 4",
    vendor: "xAI",
    color: "#a1a1aa",
    bg: "#fafafa",
    accent: "#71717a",
    badges: ["Coding #1", "Real-Time Web"],
    benchmarks: {
      "AIME 2025": 80.0,
      "SWE-Bench": 75.0,
      "MMLU-Pro": 86.0,
      "ARC-AGI-2": 68.0,
      "Tool Use": 69.0,
    },
  },
  {
    id: "deepseek",
    name: "DeepSeek V4-Pro",
    vendor: "DeepSeek",
    color: "#b45309",
    bg: "#fffbeb",
    accent: "#92400e",
    badges: ["Open-Weight #1", "Self-Hostable"],
    benchmarks: {
      "AIME 2025": 76.0,
      "SWE-Bench": 82.6,
      "MMLU-Pro": 83.0,
      "ARC-AGI-2": 65.0,
      "Tool Use": 68.0,
    },
  },
];

const BENCHMARKS = ["AIME 2025", "SWE-Bench", "MMLU-Pro", "ARC-AGI-2", "Tool Use"] as const;

type BenchmarkKey = typeof BENCHMARKS[number];
type ChartTab = "overview" | "benchmark";

type BarTooltipPayload = Array<{
  value: number;
  payload: {
    name: string;
    color: string;
  };
}>;

const radarData = BENCHMARKS.map((bm) => ({
  benchmark: bm.replace(" 2025", "").replace("-", " "),
  ...Object.fromEntries(MODELS.map((m) => [m.id, m.benchmarks[bm]])),
}));

const getBarData = (bm: BenchmarkKey) =>
  MODELS.map((m) => ({
    name: m.name.replace(" 4.7", "").replace(" 3.1 Pro", " Pro").replace(" V4-Pro", " V4"),
    score: m.benchmarks[bm],
    color: m.color,
    id: m.id,
  })).sort((a, b) => b.score - a.score);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; color: string; value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="benchmark-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span className="tooltip-name">{MODELS.find((m) => m.id === p.dataKey)?.name}</span>
          <span className="tooltip-value">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload }: { active?: boolean; payload?: BarTooltipPayload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="benchmark-tooltip">
      <p className="tooltip-label">{d.payload.name}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: d.payload.color }} />
        <span className="tooltip-value">{d.value}%</span>
      </div>
    </div>
  );
};

export default function AIBenchmarkChart() {
  const [activeTab, setActiveTab] = useState<ChartTab>("overview");
  const [activeBenchmark, setActiveBenchmark] = useState<BenchmarkKey>("SWE-Bench");

  return (
    <>
      <style>{`
        .bmc-root {
          font-family: 'Space Grotesk', sans-serif;
          background: #ffffff;
          color: #111827;
          border-radius: 24px;
          overflow: hidden;
          padding: 0;
          border: 1px solid #e5e7eb;
          box-shadow: 0 24px 60px rgba(17,24,39,0.08);
        }

        .bmc-header {
          padding: 32px 36px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
        }

        .bmc-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #71717a;
          margin-bottom: 8px;
        }

        .bmc-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #111827;
          margin: 0 0 4px;
        }

        .bmc-subtitle {
          font-size: 13px;
          color: #71717a;
          margin: 0;
        }

        .model-cards {
          display: flex;
          gap: 10px;
          padding: 24px 36px;
          overflow-x: auto;
          scrollbar-width: none;
          border-bottom: 1px solid #e5e7eb;
        }

        .model-cards::-webkit-scrollbar { display: none; }

        .model-card {
          flex: 1;
          min-width: 130px;
          border-radius: 14px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          background: #fafafa;
        }

        .model-card:hover {
          border-color: #111827;
          transform: translateY(-2px);
        }

        .card-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
        }

        .card-name {
          font-size: 12px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2px;
        }

        .card-vendor {
          font-size: 10px;
          color: #71717a;
          margin-bottom: 10px;
          font-family: 'JetBrains Mono', monospace;
        }

        .card-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .card-badge {
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          font-family: 'JetBrains Mono', monospace;
        }

        .tab-row {
          display: flex;
          gap: 4px;
          padding: 16px 36px 0;
        }

        .tab-btn {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          background: transparent;
          color: #71717a;
          font-family: 'Space Grotesk', sans-serif;
        }

        .tab-btn.active {
          background: #111827;
          color: #ffffff;
          border: 1px solid #111827;
        }

        .chart-area {
          padding: 28px 36px 36px;
        }

        .chart-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #71717a;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 20px;
        }

        .bm-selector {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .bm-btn {
          padding: 6px 14px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.15s;
          background: #ffffff;
          color: #71717a;
        }

        .bm-btn.active {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .bmc-footer {
          padding: 16px 36px;
          border-top: 1px solid #e5e7eb;
          font-size: 10px;
          color: #a1a1aa;
          font-family: 'JetBrains Mono', monospace;
        }

        .benchmark-tooltip {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12px;
          box-shadow: 0 12px 30px rgba(17,24,39,0.12);
        }

        .tooltip-label {
          font-weight: 700;
          color: #71717a;
          margin: 0 0 8px;
          font-size: 11px;
        }

        .tooltip-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .tooltip-value {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          color: #111827;
        }

        @media (max-width: 640px) {
          .bmc-header, .model-cards, .tab-row, .chart-area, .bmc-footer { padding-left: 16px; padding-right: 16px; }
        }
      `}</style>

      <div className="bmc-root">
        <div className="bmc-header">
          <p className="bmc-eyebrow">Benchmark analysis · May 2026</p>
          <h2 className="bmc-title">Frontier AI Model Rankings</h2>
          <p className="bmc-subtitle">Verified scores from SWE-Bench, AIME 2025, ARC-AGI-2 &amp; more · May 2026</p>
        </div>

        <div className="model-cards">
          {MODELS.map((m) => (
            <div key={m.id} className="model-card" style={{ color: m.color }}>
              <div className="card-icon" style={{ color: m.color }}>—†</div>
              <div className="card-name">{m.name}</div>
              <div className="card-vendor">{m.vendor}</div>
              <div className="card-badges">
                {m.badges.map((b) => (
                  <span key={b} className="card-badge" style={{ color: m.accent }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="tab-row">
          {([
            { id: "overview", label: "Overview — Radar" },
            { id: "benchmark", label: "By Benchmark" },
          ] as const).map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="chart-area">
          {activeTab === "overview" && (
            <>
              <p className="chart-section-title">All-Model Radar — 5 Benchmarks</p>
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="benchmark" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[55, 100]} tick={{ fill: "#a1a1aa", fontSize: 9 }} />
                  {MODELS.map((m) => (
                    <Radar
                      key={m.id}
                      name={m.name}
                      dataKey={m.id}
                      stroke={m.color}
                      fill={m.color}
                      fillOpacity={0.06}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </>
          )}

          {activeTab === "benchmark" && (
            <>
              <p className="chart-section-title">Score by Benchmark</p>
              <div className="bm-selector">
                {BENCHMARKS.map((bm) => (
                  <button
                    key={bm}
                    className={`bm-btn ${activeBenchmark === bm ? "active" : ""}`}
                    onClick={() => setActiveBenchmark(bm)}
                  >
                    {bm}
                  </button>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getBarData(activeBenchmark)} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 10 }} />
                  <YAxis domain={[60, 100]} tick={{ fill: "#a1a1aa", fontSize: 9 }} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {getBarData(activeBenchmark).map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        <div className="bmc-footer">
          * Scores verified against Artificial Analysis, BenchLM & SWE-Bench · May 2026
        </div>
      </div>
    </>
  );
}
