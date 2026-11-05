"use client";

import { motion } from "motion/react";
import { useId, useState } from "react";

export function AreaChart({
  data,
  color = "#8b5cf6",
  height = 200,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const pad = 14;
  const max = Math.max(1, ...data.map((d) => d.value));
  const pts = data.map((d, i) => ({
    x: pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1),
    y: H - pad - (d.value / max) * (H - pad * 2 - 10),
  }));
  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");
  const area = `${line} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`a${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
        ))}
        <motion.path d={area} fill={`url(#a${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.6 }} />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={p.x - 20} y={0} width={40} height={H} fill="transparent" />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 6 : 3.5}
              fill="#05060f"
              stroke={color}
              strokeWidth="2.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.04 }}
            />
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="glass pointer-events-none absolute -top-2 -translate-x-1/2 rounded-lg px-2.5 py-1 text-xs text-white"
          style={{ left: `${(pts[hover].x / W) * 100}%` }}
        >
          {data[hover].label}: <b>{data[hover].value}</b>
        </div>
      )}
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function Donut({
  parts,
  size = 150,
  center,
}: {
  parts: { label: string; value: number; color: string }[];
  size?: number;
  center?: string;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = 52;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" className="-rotate-90" width={size} height={size}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
        {parts.map((p, i) => {
          const len = (p.value / total) * C;
          const off = acc;
          acc += len;
          return (
            <motion.circle
              key={p.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth="14"
              strokeDasharray={`${Math.max(0, len - 3)} ${C}`}
              strokeDashoffset={-off}
              strokeLinecap="round"
              initial={{ opacity: 0, strokeDasharray: `0 ${C}` }}
              animate={{ opacity: 1, strokeDasharray: `${Math.max(0, len - 3)} ${C}` }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
            />
          );
        })}
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold text-white">{total === 1 && parts.every((p) => !p.value) ? 0 : total}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400">{center ?? "records"}</div>
      </div>
    </div>
  );
}

export function Sparkline({ values, color = "#22d3ee" }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values);
  const W = 100;
  const H = 30;
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / Math.max(1, values.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-full" preserveAspectRatio="none">
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}
