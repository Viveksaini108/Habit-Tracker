'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/** Read the active theme's CSS variables (+ re-read when the theme changes). */
function useThemeColors() {
  const read = () => {
    if (typeof window === 'undefined') return null;
    const cs = getComputedStyle(document.documentElement);
    const tri = (name, fallback) => {
      const v = cs.getPropertyValue(name).trim();
      return v || fallback;
    };
    return {
      accent: `rgb(${tri('--accent', '99 102 241')})`,
      accentSoft: `rgb(${tri('--accent', '99 102 241')} / 0.45)`,
      accentFaint: `rgb(${tri('--accent', '99 102 241')} / 0.12)`,
      grid: `rgb(${tri('--line', '226 232 240')})`,
      tick: `rgb(${tri('--faint', '148 163 184')})`,
      card: `rgb(${tri('--card', '255 255 255')})`,
      ink: `rgb(${tri('--ink', '15 23 42')})`,
    };
  };

  const [colors, setColors] = useState(read);
  useEffect(() => {
    setColors(read());
    const onTheme = () => setColors(read());
    window.addEventListener('hf-theme-change', onTheme);
    return () => window.removeEventListener('hf-theme-change', onTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return colors;
}

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 10px 28px rgba(15,23,42,0.16)',
  fontSize: 12,
  fontWeight: 600,
};

/** 60-day completion trend (area). */
export function TrendChart({ data }) {
  const c = useThemeColors();
  if (!c) return <div className="h-[220px]" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={c.accent} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: c.tick }} interval={9} />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: c.tick }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ ...TOOLTIP_STYLE, backgroundColor: c.card, color: c.ink }}
          formatter={(v) => (v == null ? ['no habits yet', 'Completion'] : [`${v}%`, 'Completion'])}
          labelFormatter={(l) => `Date: ${l}`}
        />
        <Area type="monotone" dataKey="pct" stroke={c.accent} strokeWidth={2.5} fill="url(#trendFill)" connectNulls />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Daily (week view) or weekly (month view) completion bars. */
export function CompletionBars({ data, dataKey = 'pct', labelKey = 'day' }) {
  const c = useThemeColors();
  if (!c) return <div className="h-[220px]" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
        <XAxis dataKey={labelKey} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: c.tick }} />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: c.tick }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ ...TOOLTIP_STYLE, backgroundColor: c.card, color: c.ink }}
          formatter={(v) => [`${v}%`, 'Completion']}
          cursor={{ fill: c.accentFaint }}
        />
        <Bar dataKey={dataKey} radius={[6, 6, 2, 2]} maxBarSize={44}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.isFuture ? c.grid : d.pct >= 80 ? '#10b981' : d.pct >= 50 ? c.accent : c.accentSoft}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Category share of check-ins (donut). */
export function CategoryDonut({ data }) {
  const c = useThemeColors();
  const chartData = data.filter((x) => x.done > 0);
  if (!chartData.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted">
        No check-ins in this period yet.
      </div>
    );
  }
  if (!c) return <div className="h-[220px]" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="done"
          nameKey="name"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={3}
          strokeWidth={0}
        >
          {chartData.map((x) => (
            <Cell key={x.name} fill={x.color || c.accent} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ ...TOOLTIP_STYLE, backgroundColor: c.card, color: c.ink }}
          formatter={(v, name) => [`${v} check-ins`, name]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: c.tick, fontWeight: 600 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
