import axios from 'axios';
import type { LoginResponse, ResumoGestor, VendaResumo } from './types';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gestor_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/login/', { username, password });
  return data;
}

export interface ResumoParams {
  loja_id?: string;
  periodo?: string;
  data_inicio?: string;
  data_fim?: string;
}

export async function fetchResumo(params: ResumoParams = {}): Promise<ResumoGestor> {
  const { data } = await api.get<ResumoGestor>('/api/gestor/resumo/', { params });
  return data;
}

export async function fetchVendas(params: ResumoParams = {}): Promise<{ vendas: VendaResumo[] }> {
  const { data } = await api.get('/api/gestor/vendas/', { params });
  return data;
}

export function logout() {
  localStorage.removeItem('gestor_token');
  localStorage.removeItem('gestor_user');
}

export function saveSession(token: string, user: LoginResponse) {
  localStorage.setItem('gestor_token', token);
  localStorage.setItem('gestor_user', JSON.stringify(user));
}

export function getStoredUser(): LoginResponse | null {
  const raw = localStorage.getItem('gestor_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
