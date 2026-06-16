import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { GraficoDia, PorPagamento } from '../types';
import { formatBRL } from '../api/client';

const CORES = ['#03dac6', '#bb86fc', '#ffb74d', '#ef5350', '#42a5f5', '#66bb6a'];

export function ChartVendas({ data }: { data: GraficoDia[] }) {
  if (!data.length) {
    return <p className="text-muted text-sm text-center py-8">Sem dados no período</p>;
  }
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#03dac6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#03dac6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#121826', border: '1px solid rgba(3,218,198,0.3)', borderRadius: 8 }}
            formatter={(v: number) => [formatBRL(v), 'Faturamento']}
          />
          <Area type="monotone" dataKey="total" stroke="#03dac6" fill="url(#gradVendas)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartPagamentos({ data }: { data: PorPagamento[] }) {
  const filtered = data.filter((d) => d.total > 0);
  if (!filtered.length) {
    return <p className="text-muted text-sm text-center py-8">Sem pagamentos no período</p>;
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="total"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
            >
              {filtered.map((_, i) => (
                <Cell key={i} fill={CORES[i % CORES.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#121826', border: '1px solid rgba(3,218,198,0.3)', borderRadius: 8 }}
              formatter={(v: number) => formatBRL(v)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2">
        {filtered.map((item, i) => (
          <li key={item.codigo} className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: CORES[i % CORES.length] }} />
              {item.nome}
            </span>
            <span className="text-white font-medium">{formatBRL(item.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
