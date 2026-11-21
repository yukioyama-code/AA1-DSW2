# Vendinha por Confiança · AA2

Base da aplicação em React, com Vite, React Router e o tema Tailwind da AA1.

## Executar localmente

Com Node.js 24 de referência, execute a partir da pasta `AA1-DSW2`:

```bash
cd aa2
npm ci
npm run dev
```

Em outro terminal, também a partir de `aa2`, inicie a API:

```bash
npm run dev:api
```

Abra o endereço exibido pelo Vite. O navegador usa esse mesmo endereço para as chamadas a `/api`. O Vite encaminha essas chamadas ao JSON Server, que roda localmente na porta 3001. Para gerar o build, execute `npm run build`.

| Rota | Tela |
| --- | --- |
| `/` | Início |
| `/produto/cafe-coado` | Café coado, com dados carregados da API |
| `/pagamento/cafe-coado?quantidade=2` | Tela provisória que recebe o produto e a quantidade |
| `/vendedor` | Painel do vendedor |

O JSON Server carrega `server/seed.json` na primeira execução e grava os avisos em `server/db.json`. Para voltar aos dados iniciais, pare a API e remova o arquivo local `server/db.json`. O próximo início recria o arquivo a partir da carga inicial.

A página do produto consulta `GET /api/produtos/:id` e `GET /api/vendedores/:id`. O formulário envia `produtoId`, `estoqueExibido`, `quantidadeEncontrada` e `observacao` para `POST /api/avisosEstoque`. O servidor valida a quantidade e a observação, verifica se o estoque exibido ainda é atual e registra o aviso como pendente.
