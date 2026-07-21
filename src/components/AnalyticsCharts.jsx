'use client';

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

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  fontSize: 12,
  fontWeight: 600,
};

/** 60-day completion trend (area). */
export function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          interval={9}
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => (v == null ? ['no habits yet', 'Completion'] : [`${v}%`, 'Completion'])}
          labelFormatter={(l) => `Date: ${l}`}
        />
        <Area type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2.5} fill="url(#trendFill)" connectNulls />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Daily (week view) or weekly (month view) completion bars. */
export function CompletionBars({ data, dataKey = 'pct', labelKey = 'day' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey={labelKey} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Completion']} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Bar dataKey={dataKey} radius={[6, 6, 2, 2]} maxBarSize={44}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.isFuture ? '#eef2f7' : d.pct >= 80 ? '#10b981' : d.pct >= 50 ? '#6366f1' : '#c7d2fe'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const FALLBACK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#94a3b8'];

/** Category share of check-ins (donut). */
export function CategoryDonut({ data }) {
  const chartData = data.filter((c) => c.done > 0);
  if (!chartData.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No check-ins in this period yet.
      </div>
    );
  }
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
          {chartData.map((c, i) => (
            <Cell key={c.name} fill={c.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [`${v} check-ins`, name]} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
