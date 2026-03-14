"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts";

const LATENCY_DATA = [
  { name: "Mnemonic", latency: 5 },
  { name: "Zep", latency: 800 },
  { name: "Cognee", latency: 1200 },
];

const CONTRADICTION_DATA = [
  { name: "Vector-Only", resolved: 0, total: 3 },
  { name: "Sync Graph", resolved: 2, total: 3 },
  { name: "Mnemonic", resolved: 3, total: 3 },
];

const PRECISION_DATA = Array.from({ length: 11 }, (_, i) => ({
  sessions: i * 5,
  mnemonic: 0.92 + (Math.random() - 0.5) * 0.02,
  vectorOnly: Math.max(0.5, 0.9 - i * 0.035 + (Math.random() - 0.5) * 0.03),
  syncGraph: Math.max(0.55, 0.88 - i * 0.025 + (Math.random() - 0.5) * 0.03),
}));

const LIGHT_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#0a0a0a",
  },
};

export function BenchmarkCharts() {
  return (
    <section className="bg-surface py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-text-primary mb-4">
            Benchmarks
          </h2>
          <p className="text-lg text-text-secondary">
            Performance comparison across key dimensions.
          </p>
          <p className="text-xs text-text-tertiary italic mt-2">
            Simulated benchmark — real evaluation in progress
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Latency Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[var(--radius)] border border-border bg-background p-6"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Ingestion Latency
            </h3>
            <p className="text-xs text-text-secondary mb-6">
              Lower is better (ms)
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={LATENCY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b6b6b", fontSize: 10 }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  tick={{ fill: "#6b6b6b", fontSize: 10 }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <Tooltip {...LIGHT_TOOLTIP_STYLE} />
                <Bar
                  dataKey="latency"
                  radius={[3, 3, 0, 0]}
                  fill="#0057FF"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Contradiction Resolution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-[var(--radius)] border border-border bg-background p-6"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Contradiction Resolution
            </h3>
            <p className="text-xs text-text-secondary mb-6">
              Out of 3 contradictions
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CONTRADICTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b6b6b", fontSize: 10 }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  domain={[0, 3]}
                  tick={{ fill: "#6b6b6b", fontSize: 10 }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <Tooltip {...LIGHT_TOOLTIP_STYLE} />
                <Bar
                  dataKey="resolved"
                  fill="#1a7f4b"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Retrieval Precision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-[var(--radius)] border border-border bg-background p-6"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Retrieval Precision
            </h3>
            <p className="text-xs text-text-secondary mb-6">Over 50 sessions</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={PRECISION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="sessions"
                  tick={{ fill: "#6b6b6b", fontSize: 10 }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  domain={[0.4, 1]}
                  tick={{ fill: "#6b6b6b", fontSize: 10 }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <Tooltip {...LIGHT_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: "10px", color: "#6b6b6b" }} />
                <Line
                  type="monotone"
                  dataKey="mnemonic"
                  stroke="#0057FF"
                  strokeWidth={2}
                  dot={false}
                  name="Mnemonic"
                />
                <Line
                  type="monotone"
                  dataKey="vectorOnly"
                  stroke="#d93025"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                  name="Vector-Only"
                />
                <Line
                  type="monotone"
                  dataKey="syncGraph"
                  stroke="#c07c00"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                  name="Sync Graph"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
