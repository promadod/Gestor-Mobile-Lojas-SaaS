import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchCampanha,
  fetchClientes,
  getStoredUser,
  logout,
  type ResumoParams,
} from '../api/client';
import type { StatsClientes } from '../types';
import { ErrorBox, KpiCard, LoadingSpinner, SectionTitle } from '../components/Ui';

export default function ClientesPage() {
  const user = getStoredUser();
  const [lojaId, setLojaId] = useState('todas');
  const [stats, setStats] = useState<StatsClientes | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [campanhaLinks, setCampanhaLinks] = useState<
    { nome: string; bairro: string; whatsapp_link: string }[]
  >([]);
  const [campanhaPublico, setCampanhaPublico] = useState<'ativos' | 'inativos' | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const params: ResumoParams = { loja_id: lojaId };
      const data = await fetchClientes(params);
      setStats(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { erro?: string } } }).response?.data?.erro
          : null;
      setErro(msg || 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, [lojaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function gerarCampanha(publico: 'ativos' | 'inativos') {
    setCampanhaPublico(publico);
    try {
      const data = await fetchCampanha(publico, { loja_id: lojaId });
      setCampanhaLinks(data.links);
    } catch {
      setCampanhaLinks([]);
    }
  }

  function sair() {
    logout();
    window.location.href = '/login';
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
            <Link to="/" className="text-xs text-accent hover:underline">Dashboard</Link>
            <button onClick={sair} className="text-xs text-muted hover:text-accent transition">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        <h1 className="text-xl font-bold text-white">Clientes</h1>

        {loading && <LoadingSpinner />}
        {erro && <ErrorBox message={erro} />}

        {!loading && stats && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <KpiCard label="Total" value={String(stats.total)} accent="teal" />
              <KpiCard label="Ativos 30d" value={String(stats.ativos_30d)} accent="teal" />
              <KpiCard label="Inativos 60d+" value={String(stats.inativos_60d)} accent="amber" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="chip flex-1 chip-active"
                onClick={() => gerarCampanha('ativos')}
              >
                Campanha Ativos
              </button>
              <button
                type="button"
                className="chip flex-1"
                onClick={() => gerarCampanha('inativos')}
              >
                Campanha Inativos
              </button>
            </div>

            {campanhaPublico && campanhaLinks.length > 0 && (
              <section className="glass-card p-4">
                <SectionTitle icon="📣">
                  Campanha — {campanhaPublico} ({campanhaLinks.length})
                </SectionTitle>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {campanhaLinks.map((l) => (
                    <li key={l.nome + l.bairro} className="flex justify-between text-sm">
                      <span className="text-muted truncate">{l.nome}</span>
                      <a
                        href={l.whatsapp_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-400 shrink-0 ml-2"
                      >
                        Enviar
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {stats.por_bairro.map((b) => (
              <section key={b.bairro} className="glass-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <SectionTitle icon="📍">{b.bairro}</SectionTitle>
                  <span className="text-xs text-muted">
                    {b.total} · <span className="text-accent">{b.ativos} ativos</span> ·{' '}
                    <span className="text-amber-300">{b.inativos} inativos</span>
                  </span>
                </div>
                <ul className="space-y-2">
                  {b.clientes.slice(0, 8).map((c) => (
                    <li key={c.id} className="flex justify-between text-sm border-t border-white/5 pt-2">
                      <div>
                        <p className="text-white">{c.nome}</p>
                        <p className="text-xs text-muted">
                          {c.ultima_compra ? `Última: ${c.ultima_compra}` : 'Sem compras'}
                        </p>
                      </div>
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-400 text-xs"
                        >
                          Zap
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
