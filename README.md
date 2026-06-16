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
