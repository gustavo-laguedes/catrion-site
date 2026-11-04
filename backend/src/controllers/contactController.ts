import type { Request, Response } from 'express';
import {
  ContactValidationError,
  saveContactMessage
} from '../services/contactService.js';

export async function createContactMessage(request: Request, response: Response) {
  try {
    await saveContactMessage(request.body);

    response.json({
      ok: true,
      message: 'Mensagem recebida com sucesso.'
    });
  } catch (error) {
    if (error instanceof ContactValidationError) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }

    console.error('Failed to save contact message', error);

    response.status(500).json({
      ok: false,
      message: 'Nao foi possivel receber sua mensagem agora. Tente novamente em instantes.'
    });
  }
}
