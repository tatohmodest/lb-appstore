"use client";

import { useState } from "react";

/** Daily "Get" taps, single series. Hover a bar for the exact value. */
export function GetsChart({ days }: { days: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const W = 720;
  const H = 180;
  const gap = 2;
  const bw = W / days.length - gap;
  const h = hover !== null ? days[hover] : null;

  return (
    <div className="relative">
      <div className="mb-2 h-5 text-sm text-muted" aria-live="polite">
        {h ? (
          <>
            <span className="font-semibold text-ink tabular-nums">{h.count}</span> gets on{" "}
            {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </>
        ) : (
          "Hover a day for details"
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" role="img" aria-label="Gets per day, last 30 days" onMouseLeave={() => setHover(null)}>
        {[0.5, 1].map((t) => (
          <line key={t} x1={0} x2={W} y1={H - H * t} y2={H - H * t} stroke="var(--line)" strokeDasharray="3 4" />
        ))}
        <line x1={0} x2={W} y1={H} y2={H} stroke="var(--line)" />
        <text x={W} y={H - H + 12} textAnchor="end" fontSize="11" fill="var(--muted)">{max}</text>
        {days.map((d, i) => {
          const bh = Math.max(d.count ? 3 : 0, (d.count / max) * (H - 4));
          const x = i * (bw + gap);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              <rect x={x} y={0} width={bw + gap} height={H} fill="transparent" />
              <path
                d={bh ? `M${x},${H} v${-(bh - 4)} q0,-4 4,-4 h${bw - 8} q4,0 4,4 v${bh - 4} z` : ""}
                fill="var(--brand)"
                opacity={hover === null || hover === i ? 1 : 0.35}
              />
            </g>
          );
        })}
        <text x={0} y={H + 16} fontSize="11" fill="var(--muted)">30 days ago</text>
        <text x={W} y={H + 16} fontSize="11" fill="var(--muted)" textAnchor="end">Today</text>
      </svg>
    </div>
  );
}
