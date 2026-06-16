# Oneira Gestor — Painel Mobile para Lojas

Painel web mobile-first para **gestores de lojas** acompanharem faturamento, vendas, formas de pagamento e financeiro em tempo real.

Parte do ecossistema **Oneira PDV** (SaaS multi-loja). O frontend roda na **Vercel**; os dados vêm da API

## Stacks

| Camada | Tecnologia |
|--------|------------|
| UI | React 18 + TypeScript |
| Build | Vite 6 |
| Roteamento | React Router 6 |
| HTTP | Axios |
| Gráficos | Recharts |
| Estilo | Tailwind CSS 3 |
| PWA | vite-plugin-pwa |
| Deploy | Vercel |
| Backend | Django REST Framework + Token Auth |


## API endpoints (Django)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/login/` | Login → Token |
| GET | `/api/gestor/resumo/` | Dashboard completo |
| GET | `/api/gestor/lojas/` | Lojas permitidas |
| GET | `/api/gestor/financeiro/` | Financeiro do período |
| GET | `/api/gestor/vendas/` | Lista de vendas |

Query params: `periodo` (hoje|ontem|7d|mes), `loja_id` (todas|id), `data_inicio`, `data_fim`

Status de faturamento: `FINALIZADO`, `EM_PREPARACAO`, `FIADO`
