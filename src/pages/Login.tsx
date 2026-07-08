import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, saveSession } from '../api/client';

function extrairErroLogin(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as {
      erro?: string;
      detail?: string;
      non_field_errors?: string[];
    };
    if (data.erro) return data.erro;
    if (data.non_field_errors?.[0]) return data.non_field_errors[0];
    if (typeof data.detail === 'string') return data.detail;
  }
  return 'Usuário ou senha inválidos.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const data = await login(username, password);
      if (!data.pode_gestor && !data.is_superuser) {
        setErro('Usuário sem permissão para o painel gestor.');
        return;
      }
      saveSession(data.token, data);
      navigate('/');
    } catch (err) {
      setErro(extrairErroLogin(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-mesh">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-accent/10 items-center justify-center mb-4 shadow-glow">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Oneira Gestor</h1>
          <p className="text-muted text-sm mt-1">Painel mobile para gestores de lojas</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          {erro && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {erro}
            </div>
          )}
          <div>
            <label className="text-xs text-muted uppercase tracking-wide">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field mt-1"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wide">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-1"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
