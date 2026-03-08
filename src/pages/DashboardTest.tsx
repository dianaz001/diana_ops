import { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

// ── Colors ──────────────────────────────────────────
const COLORS = ['#4A3728', '#9DAFD0', '#282627', '#C4A882', '#D4763C', '#1a1a1a', '#E8DED1'];

// ── Dummy Data ──────────────────────────────────────
const barData = [
  { month: 'Jan', series1: 40, series2: 24, series3: 18, series4: 12, trend: 90 },
  { month: 'Feb', series1: 35, series2: 28, series3: 22, series4: 15, trend: 95 },
  { month: 'Mar', series1: 50, series2: 30, series3: 20, series4: 18, trend: 110 },
  { month: 'Apr', series1: 45, series2: 26, series3: 25, series4: 20, trend: 108 },
  { month: 'May', series1: 55, series2: 32, series3: 28, series4: 22, trend: 130 },
  { month: 'Jun', series1: 60, series2: 35, series3: 30, series4: 25, trend: 145 },
];

const pieData = [
  { name: 'Infrastructure', value: 28 },
  { name: 'Operations', value: 18 },
  { name: 'Development', value: 22 },
  { name: 'Marketing', value: 12 },
  { name: 'Sales', value: 10 },
  { name: 'Support', value: 6 },
  { name: 'Other', value: 4 },
];

const tableData = [
  { project: 'Alpha Tower', type: 'Commercial', region: 'North America', status: 'Active', fees: '$4.2M', progress: 78, start: '2024-03', end: '2026-06' },
  { project: 'Beta Campus', type: 'Mixed-Use', region: 'Europe', status: 'Planning', fees: '$8.1M', progress: 15, start: '2025-01', end: '2027-12' },
  { project: 'Gamma Hub', type: 'Residential', region: 'Asia Pacific', status: 'Active', fees: '$3.5M', progress: 52, start: '2024-09', end: '2026-03' },
  { project: 'Delta Center', type: 'Healthcare', region: 'Middle East', status: 'Complete', fees: '$12.8M', progress: 100, start: '2022-06', end: '2025-01' },
  { project: 'Epsilon Park', type: 'Industrial', region: 'South America', status: 'On Hold', fees: '$6.5M', progress: 33, start: '2024-11', end: '2027-08' },
];

const typologies = ['All', 'Commercial', 'Mixed-Use', 'Residential', 'Healthcare', 'Industrial'];
const regions = ['All', 'North America', 'Europe', 'Asia Pacific', 'Middle East', 'South America'];

// ── Components ──────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function TabGroup({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            active === tab
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function Select({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700',
    Planning: 'bg-blue-50 text-blue-700',
    Complete: 'bg-gray-100 text-gray-700',
    'On Hold': 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────

export function DashboardTest() {
  const [activeTab, setActiveTab] = useState('2025');
  const [typology, setTypology] = useState('All');
  const [region, setRegion] = useState('All');

  const filtered = tableData.filter((row) => {
    if (typology !== 'All' && row.type !== typology) return false;
    if (region !== 'All' && row.region !== region) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Test</h1>
            <p className="text-sm text-gray-500 mt-1">Recharts + Tailwind v4 — no Tremor dependency</p>
          </div>
          <TabGroup tabs={['2025', '2026']} active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Metric Card */}
        <Card>
          <p className="text-sm text-gray-500">Total Fees [USD]</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">$35.1M</p>
          <p className="text-sm text-emerald-600 mt-1">+12.3% from last year</p>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stacked Bar + Line */}
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Fee Breakdown by Month ({activeTab})</h2>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Bar dataKey="series1" stackId="a" fill={COLORS[0]} name="Infrastructure" />
                <Bar dataKey="series2" stackId="a" fill={COLORS[1]} name="Operations" />
                <Bar dataKey="series3" stackId="a" fill={COLORS[2]} name="Development" />
                <Bar dataKey="series4" stackId="a" fill={COLORS[3]} name="Marketing" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="trend" stroke={COLORS[4]} strokeWidth={2} dot={false} name="Trend" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Donut Chart */}
          <Card>
            <h2 className="text-sm font-medium text-gray-700 mb-4">Allocation</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: '0.7rem' }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Filters + Table */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <h2 className="text-sm font-medium text-gray-700 flex-1">Project Overview</h2>
            <Select label="Project Typology" options={typologies} value={typology} onChange={setTypology} />
            <Select label="Region" options={regions} value={region} onChange={setRegion} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Project', 'Type', 'Region', 'Status', 'Fees', 'Progress', 'Start', 'End'].map((h) => (
                    <th key={h} className="pb-3 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">No matching projects</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.project} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-gray-900">{row.project}</td>
                      <td className="py-3 pr-4 text-gray-600">{row.type}</td>
                      <td className="py-3 pr-4 text-gray-600">{row.region}</td>
                      <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                      <td className="py-3 pr-4 text-gray-900 font-medium">{row.fees}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{row.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{row.start}</td>
                      <td className="py-3 text-gray-500">{row.end}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
