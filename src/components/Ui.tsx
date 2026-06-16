import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: 'teal' | 'purple' | 'amber';
}

const accentBorder = {
  teal: 'border-t-accent',
  purple: 'border-t-accent2',
  amber: 'border-t-amber-400',
};

export function KpiCard({ label, value, sub, accent = 'teal' }: Props) {
  return (
    <div
      className={`glass-card border-t-4 ${accentBorder[accent]} p-4 flex flex-col gap-1 min-w-0`}
    >
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <span className="text-xl font-bold text-white truncate">{value}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}

export function SectionTitle({ children, icon }: { children: ReactNode; icon?: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
      {icon && <span>{icon}</span>}
      {children}
    </h2>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="glass-card border border-red-500/40 text-red-300 p-4 text-sm rounded-xl">
      {message}
    </div>
  );
}
