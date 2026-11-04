# Publicação futura em VPS

O frontend compila para `frontend/dist` e pode ser servido pelo Nginx. A API Express compila para `backend/dist` e pode rodar como processo Node com o arquivo `ecosystem.config.cjs`.

Configure `VITE_API_URL` com a origem pública da API e `CORS_ORIGIN` com a origem do site. Use `frontend/.env.example` e `backend/.env.example` como referência. O exemplo em `docs/nginx.example.conf` contém as rotas de frontend e API; ajuste domínios e TLS antes de publicar.

O contato grava em `backend/storage/contact-messages.jsonl`. Planeje backup e um destino permanente para essas mensagens antes de receber contatos reais. A implantação depende de decisão separada.
