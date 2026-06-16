import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchResumo,
  fetchVendas,
  formatBRL,
  getStoredUser,
  logout,
  type ResumoParams,
} from '../api/client';
import type { Periodo, ResumoGestor, VendaResumo } from '../types';
import { ChartPagamentos, ChartVendas } from '../components/Charts';
import { ErrorBox, KpiCard, LoadingSpinner, SectionTitle } from '../components/Ui';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'ontem', label: 'Ontem' },
  { id: '7d', label: '7 dias' },
  { id: 'mes', label: 'Mês' },
  { id: 'custom', label: 'Personalizado' },
];

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'FINALIZADO':
      return 'bg-accent/20 text-accent border border-accent/30';
    case 'EM_PREPARACAO':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    case 'FIADO':
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    default:
      return 'bg-white/10 text-white border border-white/10';
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [periodo, setPeriodo] = useState<Periodo>('hoje');
  const [customInicio, setCustomInicio] = useState(hojeISO);
  const [customFim, setCustomFim] = useState(hojeISO);
  const [lojaId, setLojaId] = useState('todas');
  const [resumo, setResumo] = useState<ResumoGestor | null>(null);
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState<'home' | 'vendas'>('home');

  const buildParams = useCallback((): ResumoParams => {
    const params: ResumoParams = { periodo, loja_id: lojaId };
    if (periodo === 'custom') {
      params.data_inicio = customInicio;
      params.data_fim = customFim;
    }
    return params;
  }, [periodo, lojaId, customInicio, customFim]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const params = buildParams();
      const [r, v] = await Promise.all([
        fetchResumo(params),
        fetchVendas({ ...params, limite: '30' }),
      ]);
      setResumo(r);
      setVendas(v.vendas);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { erro?: string } } }).response?.data?.erro
          : null;
      setErro(msg || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    if (periodo === 'custom') return;
    carregar();
  }, [periodo, lojaId, carregar]);

  function sair() {
    logout();
    navigate('/login');
  }

  const kpis = resumo?.kpis;
  const variacao = kpis?.variacao_pct;
  const variacaoTxt =
    variacao != null
      ? `${variacao >= 0 ? '+' : ''}${variacao}% vs ontem`
      : undefined;

  return (
    <div className="min-h-screen pb-24 bg-mesh">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-surface/80 border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs text-muted">Olá,</p>
            <p className="font-semibold text-white">{user?.nome || 'Gestor'}</p>
          </div>
          <button onClick={sair} className="text-xs text-muted hover:text-accent transition">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* Filtros de período */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`chip ${periodo === p.id ? 'chip-active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {periodo === 'custom' && (
          <div className="glass-card p-4 space-y-3">
            <p className="text-xs text-muted uppercase tracking-wide">Período personalizado</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted">De</label>
                <input
                  type="date"
                  value={customInicio}
                  onChange={(e) => setCustomInicio(e.target.value)}
                  className="input-field mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Até</label>
                <input
                  type="date"
                  value={customFim}
                  onChange={(e) => setCustomFim(e.target.value)}
                  className="input-field mt-1 text-sm"
                />
              </div>
            </div>
            <button type="button" onClick={carregar} className="btn-primary w-full text-sm">
              Aplicar período
            </button>
          </div>
        )}

        {resumo && resumo.lojas.length > 1 && (
          <select
            value={lojaId}
            onChange={(e) => setLojaId(e.target.value)}
            className="input-field text-sm"
          >
            <option value="todas">Todas as lojas</option>
            {resumo.lojas.map((l) => (
              <option key={l.id} value={String(l.id)}>
                {l.nome}
                {l.nome_unidade ? ` — ${l.nome_unidade}` : ''}
              </option>
            ))}
          </select>
        )}

        {loading && <LoadingSpinner />}
        {erro && <ErrorBox message={erro} />}
        {!loading && resumo && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="Faturamento"
                value={formatBRL(kpis?.faturamento_periodo ?? 0)}
                sub={variacaoTxt}
                accent="teal"
              />
              <KpiCard
                label="Vendas"
                value={String(kpis?.vendas_qtd ?? 0)}
                sub={`Ticket ${formatBRL(kpis?.ticket_medio ?? 0)}`}
                accent="purple"
              />
              <KpiCard
                label="Fiado em aberto"
                value={formatBRL(kpis?.fiado_aberto ?? 0)}
                accent="amber"
              />
              <KpiCard
                label="Saldo período"
                value={formatBRL(resumo.financeiro.saldo)}
                sub={`Receber ${formatBRL(resumo.financeiro.total_receber)}`}
                accent="teal"
              />
            </div>

            {(resumo.alertas.entregas_pendentes > 0 || resumo.alertas.estoque_baixo.length > 0) && (
              <section className="glass-card p-4 border border-amber-500/20">
                <SectionTitle icon="⚠️">Alertas</SectionTitle>
                {resumo.alertas.entregas_pendentes > 0 && (
                  <p className="text-sm text-amber-200 mb-2">
                    {resumo.alertas.entregas_pendentes} entrega(s) pendente(s)
                  </p>
                )}
                {resumo.alertas.estoque_baixo.slice(0, 5).map((item) => (
                  <div key={item.nome} className="flex justify-between text-sm py-1 border-t border-white/5">
                    <span className="text-muted">{item.nome}</span>
                    <span className="text-white">
                      {item.cheios} cheios
                      {item.vazios != null ? ` · ${item.vazios} vazios` : ''}
                    </span>
                  </div>
                ))}
              </section>
            )}

            <div className="flex gap-2">
              <button
                className={`chip flex-1 ${aba === 'home' ? 'chip-active' : ''}`}
                onClick={() => setAba('home')}
              >
                Visão geral
              </button>
              <button
                className={`chip flex-1 ${aba === 'vendas' ? 'chip-active' : ''}`}
                onClick={() => setAba('vendas')}
              >
                Vendas
              </button>
            </div>

            {aba === 'home' && (
              <>
                <section className="glass-card p-4">
                  <SectionTitle icon="📈">Últimos 7 dias</SectionTitle>
                  <ChartVendas data={resumo.grafico_7_dias} />
                </section>

                {resumo.por_loja.length > 1 && (
                  <section className="glass-card p-4">
                    <SectionTitle icon="🏪">Por loja</SectionTitle>
                    <ul className="space-y-3">
                      {resumo.por_loja.map((loja, i) => (
                        <li key={loja.loja_id} className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-bold">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{loja.nome}</p>
                            <p className="text-xs text-muted">{loja.qtd_vendas} vendas</p>
                          </div>
                          <span className="text-accent font-semibold text-sm">
                            {formatBRL(loja.total)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="glass-card p-4">
                  <SectionTitle icon="💳">Formas de pagamento</SectionTitle>
                  <ChartPagamentos data={resumo.por_pagamento} />
                </section>

                <section className="glass-card p-4">
                  <SectionTitle icon="💰">Financeiro</SectionTitle>
                  <div className="space-y-2 text-sm">
                    <Row label="Vendas finalizadas" value={formatBRL(resumo.financeiro.receitas_vendas)} />
                    <Row label="Recebimentos fiado" value={formatBRL(resumo.financeiro.receitas_fiado)} />
                    <Row label="Outras receitas" value={formatBRL(resumo.financeiro.receitas_extras)} />
                    <Row label="Despesas" value={formatBRL(resumo.financeiro.total_pagar)} negative />
                    <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                      <span className="text-white">Saldo</span>
                      <span className={resumo.financeiro.saldo >= 0 ? 'text-accent' : 'text-red-400'}>
                        {formatBRL(resumo.financeiro.saldo)}
                      </span>
                    </div>
                  </div>
                </section>
              </>
            )}

            {aba === 'vendas' && (
              <section className="glass-card p-4">
                <SectionTitle icon="🧾">Vendas do período</SectionTitle>
                {vendas.length === 0 ? (
                  <p className="text-muted text-sm text-center py-6">Nenhuma venda no período</p>
                ) : (
                  <ul className="space-y-4">
                    {vendas.map((v) => (
                      <li key={v.id} className="border-b border-white/5 pb-4 last:border-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span
                                className={`text-sm font-bold px-2.5 py-1 rounded-lg ${statusBadgeClass(v.status)}`}
                              >
                                {v.status_label}
                              </span>
                              {v.forma_pagamento && (
                                <span className="text-xs text-muted">{v.forma_pagamento}</span>
                              )}
                            </div>
                            <p className="text-white text-sm font-semibold leading-snug">
                              {v.itens_resumo || '—'}
                            </p>
                            <p className="text-xs text-muted mt-1.5 truncate">{v.cliente}</p>
                            <p className="text-xs text-muted/80 mt-0.5">
                              #{v.id} · {v.data} · {v.loja}
                            </p>
                          </div>
                          <span className="text-accent font-bold text-base shrink-0">
                            {formatBRL(v.total)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <button
        onClick={carregar}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-accent text-surface shadow-glow flex items-center justify-center text-xl"
        aria-label="Atualizar"
      >
        ↻
      </button>
    </div>
  );
}

function Row({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={negative ? 'text-red-400' : 'text-white'}>{value}</span>
    </div>
  );
}
