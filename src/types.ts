export interface Loja {
  id: number;
  nome: string;
  nome_unidade: string;
}

export interface Kpis {
  faturamento_periodo: number;
  faturamento_hoje?: number;
  faturamento_ontem: number | null;
  variacao_pct: number | null;
  vendas_qtd: number;
  ticket_medio: number;
  fiado_aberto: number;
}

export interface GraficoDia {
  data: string;
  label: string;
  total: number;
}

export interface PorLoja {
  loja_id: number;
  nome: string;
  nome_unidade: string;
  total: number;
  qtd_vendas: number;
}

export interface PorPagamento {
  codigo: string;
  nome: string;
  total: number;
  qtd: number;
}

export interface Financeiro {
  receitas_vendas: number;
  receitas_fiado: number;
  receitas_extras: number;
  total_receber: number;
  total_pagar: number;
  saldo: number;
}

export interface Alertas {
  estoque_baixo: { nome: string; cheios: number; vazios?: number }[];
  entregas_pendentes: number;
}

export interface ResumoGestor {
  periodo: string;
  data_inicio: string;
  data_fim: string;
  loja_id: string;
  lojas: Loja[];
  kpis: Kpis;
  grafico_7_dias: GraficoDia[];
  por_loja: PorLoja[];
  por_pagamento: PorPagamento[];
  financeiro: Financeiro;
  alertas: Alertas;
}

export interface VendaResumo {
  id: number;
  data: string;
  cliente: string;
  loja: string;
  itens_resumo: string;
  total: number;
  status: string;
  status_label: string;
  forma_pagamento: string;
  eh_fiado: boolean;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  email: string;
  nome: string;
  is_superuser: boolean;
  pode_gestor: boolean;
}

export type Periodo = 'hoje' | 'ontem' | '7d' | 'mes' | 'custom';
