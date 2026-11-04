# Checklist de publicação

- [ ] Definir hospedagem, domínios e TLS.
- [ ] Configurar `VITE_API_URL` e `CORS_ORIGIN` para as origens publicadas.
- [ ] Executar `npm run install:all` e `npm run build`.
- [ ] Servir `frontend/dist` com fallback para `index.html`.
- [ ] Iniciar `backend/dist/server.js` e testar `GET /health`.
- [ ] Testar `/`, `/contato`, fallback 404 e envio válido e inválido do formulário.
- [ ] Garantir persistência e backup de `backend/storage/contact-messages.jsonl` enquanto o contato usar arquivo local.
