# Oneira Painel Gestor (React + Vite)

Painel mobile para donos de loja — consome a API Django do sistema PDV.

## Desenvolvimento local

```bash
cd painel_gestor
npm install
cp .env.example .env
# Edite .env: VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

Certifique-se de que o Django está rodando (`python manage.py runserver`).

Login: usuário com `perm_dashboard` ou `perm_relatorios` (ou superuser).

## Deploy na Vercel

1. Importe a pasta `painel_gestor` como projeto na Vercel
2. Variável de ambiente: `VITE_API_URL=https://preapdev.pythonanywhere.com`
3. Build command: `npm run build`
4. Output directory: `dist`

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
