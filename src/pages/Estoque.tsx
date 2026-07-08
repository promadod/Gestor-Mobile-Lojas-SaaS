import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEstoque, getStoredUser, isAuthError, logout, type ResumoParams } from '../api/client';
import type { EstoqueGestor } from '../types';
import { ErrorBox, KpiCard, LoadingSpinner, SectionTitle } from '../components/Ui';

export default function EstoquePage() {
  const user = getStoredUser();
  const [lojaId, setLojaId] = useState('todas');
  const [dados, setDados] = useState<EstoqueGestor | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [somenteBaixo, setSomenteBaixo] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const params: ResumoParams = { loja_id: lojaId };
      const data = await fetchEstoque(params);
      setDados(data);
    } catch (err: unknown) {
      if (isAuthError(err)) return;
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { erro?: string } } }).response?.data?.erro
          : null;
      setErro(msg || 'Erro ao carregar estoque.');
    } finally {
      setLoading(false);
    }
  }, [lojaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const itensFiltrados = useMemo(() => {
    if (!dados) return [];
    let lista = dados.itens;
    if (somenteBaixo) lista = lista.filter((i) => i.estoque_baixo);
    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      lista = lista.filter((i) => i.nome.toLowerCase().includes(q));
    }
    return lista;
  }, [dados, busca, somenteBaixo]);

  function sair() {
    logout();
    window.location.href = '/login';
  }

  function formatQtd(val: number, unidade: string): string {
    if (unidade === 'UN') return String(Math.floor(val));
    return val.toFixed(3).replace(/\.?0+$/, '');
  }

  return (
    <div className="min-h-screen pb-24 bg-mesh">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-surface/80 border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs text-muted">Olá,</p>
            <p className="font-semibold text-white">{user?.nome || 'Gestor'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-accent hover:underline">
              Dashboard
            </Link>
            <Link to="/clientes" className="text-xs text-accent hover:underline">
              Clientes
            </Link>
            <button onClick={sair} className="text-xs text-muted hover:text-accent transition">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        <h1 className="text-xl font-bold text-white">Estoque</h1>

        <div className="flex gap-2 flex-wrap">
          <input
            type="search"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 min-w-[140px] rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-muted"
          />
          <button
            type="button"
            className={`chip ${somenteBaixo ? 'chip-active' : ''}`}
            onClick={() => setSomenteBaixo((v) => !v)}
          >
            Só baixo
          </button>
        </div>

        {loading && <LoadingSpinner />}
        {erro && <ErrorBox message={erro} />}

        {!loading && dados && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <KpiCard label="Itens" value={String(dados.total_itens)} accent="teal" />
              <KpiCard label="Estoque baixo" value={String(dados.itens_baixo)} accent="amber" />
              <KpiCard
                label="Exibindo"
                value={String(itensFiltrados.length)}
                accent="teal"
              />
            </div>

            <section className="glass-card p-4">
              <SectionTitle icon="📦">Produtos em estoque</SectionTitle>
              {itensFiltrados.length === 0 ? (
                <p className="text-sm text-muted mt-3">Nenhum item encontrado.</p>
              ) : (
                <ul className="space-y-2 mt-3 max-h-[60vh] overflow-y-auto">
                  {itensFiltrados.map((item) => (
                    <li
                      key={`${item.loja_id ?? 'x'}-${item.id}`}
                      className="flex justify-between items-start text-sm border-t border-white/5 pt-2 first:border-t-0 first:pt-0"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-white truncate">{item.nome}</p>
                        {dados.multi_loja && item.loja && (
                          <p className="text-xs text-muted">{item.loja}</p>
                        )}
                        <p className="text-xs text-muted">
                          Cheios:{' '}
                          <span className={item.estoque_baixo ? 'text-amber-300' : 'text-accent'}>
                            {formatQtd(item.cheios, item.unidade)} {item.unidade}
                          </span>
                          {item.controla_vasilhame_vazio && item.vazios != null && (
                            <>
                              {' '}
                              · Vazios: {formatQtd(item.vazios, item.unidade)} {item.unidade}
                            </>
                          )}
                        </p>
                      </div>
                      {item.estoque_baixo && (
                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                          Baixo
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
