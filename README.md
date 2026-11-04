# Catrion Site

Base técnica do site institucional da Catrion. O frontend usa React, TypeScript, Vite e Tailwind. O backend Express mantém somente o recebimento do formulário de contato e um health check.

## Estrutura

- `frontend/src/pages`: Home temporária, contato e página não encontrada.
- `frontend/src/components`: primitivas visuais, logo oficial, BrandSlash e layout.
- `frontend/src/styles/tokens.css`: fonte de verdade para cores, tipografia, espaçamento, layout e motion.
- `frontend/src/assets/brand`: SVGs oficiais da marca; consulte `docs/brand/catrion-brand-spec.md` antes de aplicá-los.
- `backend/src`: API de contato e health.
- `docs`: orientações de publicação futura.

## Desenvolvimento local

```bash
npm run install:all
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run dev
```

Frontend: `http://localhost:5173`. API: `http://localhost:3333`.

## Rotas

Frontend: `/`, `/contato` e fallback 404.

API: `GET /health` e `POST /api/contact`.

O formulário envia nome, empresa opcional, contato e mensagem. A API valida os dados, aplica limite de requisições e grava em `backend/storage/contact-messages.jsonl`. Esse arquivo é armazenamento temporário local; mantenha backup se usar em produção. Nenhum e-mail é enviado.

## Validação

```bash
npm run build
```

O build da raiz compila frontend e backend. A Home atual é uma prévia da fundação visual; o Hero e a arquitetura definitiva de páginas serão definidos em outra etapa. A interface utiliza uma pilha de fontes do sistema, sem download de fonte externa.
