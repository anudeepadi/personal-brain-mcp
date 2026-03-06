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
  { name: "Subconscious", latency: 5, fill: "#34D399" },
  { name: "Zep", latency: 800, fill: "#818CF8" },
  { name: "Cognee", latency: 1200, fill: "#9CA3AF" },
];

const CONTRADICTION_DATA = [
  { name: "Vector-Only", resolved: 0, total: 3 },
  { name: "Sync Graph", resolved: 2, total: 3 },
  { name: "Subconscious", resolved: 3, total: 3 },
];

const PRECISION_DATA = Array.from({ length: 11 }, (_, i) => ({
  sessions: i * 5,
  subconscious: 0.92 + (Math.random() - 0.5) * 0.02,
  vectorOnly: Math.max(0.5, 0.9 - i * 0.035 + (Math.random() - 0.5) * 0.03),
  syncGraph: Math.max(0.55, 0.88 - i * 0.025 + (Math.random() - 0.5) * 0.03),
}));

const DARK_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#111827",
    border: "1px solid #1F2937",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#E5E7EB",
  },
};

export function BenchmarkCharts() {
  return (
    <section className="bg-[#0A0E1A] py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-[#E5E7EB] mb-4"
        >
          Benchmarks
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-center text-[#9CA3AF] mb-4"
        >
          Performance comparison across key dimensions.
        </motion.p>
        <p className="text-xs text-center text-[#6B7280] italic mb-16">
          Simulated benchmark — real evaluation in progress
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Latency Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6"
          >
            <h3 className="text-sm font-semibold text-[#E5E7EB] mb-1">
              Ingestion Latency
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-6">Lower is better (ms)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={LATENCY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "#1F2937" }}
                />
                <YAxis
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "#1F2937" }}
                />
                <Tooltip {...DARK_TOOLTIP_STYLE} />
                <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                  {LATENCY_DATA.map((entry) => (
                    <rect key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Contradiction Resolution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6"
          >
            <h3 className="text-sm font-semibold text-[#E5E7EB] mb-1">
              Contradiction Resolution
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-6">Out of 3 contradictions</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CONTRADICTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "#1F2937" }}
                />
                <YAxis
                  domain={[0, 3]}
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "#1F2937" }}
                />
                <Tooltip {...DARK_TOOLTIP_STYLE} />
                <Bar dataKey="resolved" fill="#34D399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Retrieval Precision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6"
          >
            <h3 className="text-sm font-semibold text-[#E5E7EB] mb-1">
              Retrieval Precision
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-6">Over 50 sessions</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={PRECISION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis
                  dataKey="sessions"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "#1F2937" }}
                />
                <YAxis
                  domain={[0.4, 1]}
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  axisLine={{ stroke: "#1F2937" }}
                />
                <Tooltip {...DARK_TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: "10px", color: "#9CA3AF" }}
                />
                <Line
                  type="monotone"
                  dataKey="subconscious"
                  stroke="#34D399"
                  strokeWidth={2}
                  dot={false}
                  name="Subconscious"
                />
                <Line
                  type="monotone"
                  dataKey="vectorOnly"
                  stroke="#F87171"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                  name="Vector-Only"
                />
                <Line
                  type="monotone"
                  dataKey="syncGraph"
                  stroke="#FBBF24"
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
