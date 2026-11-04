import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    ok: false,
    message: 'Rota nao encontrada.'
  });
};

export const globalErrorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error('Unhandled API error', error);

  response.status(500).json({
    ok: false,
    message: 'Nao foi possivel concluir a solicitacao agora.'
  });
};
