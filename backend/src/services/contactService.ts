import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

type ContactPayload = {
  name?: unknown;
  company?: unknown;
  contact?: unknown;
  message?: unknown;
};

type ContactMessage = {
  name: string;
  company: string;
  contact: string;
  message: string;
  receivedAt: string;
};

const fieldLimits = {
  name: 120,
  company: 160,
  contact: 180,
  message: 2000
};

const fieldLabels = {
  name: 'nome',
  company: 'empresa',
  contact: 'contato',
  message: 'mensagem'
};

const storageDir = path.join(process.cwd(), 'storage');
const storageFile = path.join(storageDir, 'contact-messages.jsonl');

export class ContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContactValidationError';
  }
}

function normalizeField(value: unknown, field: keyof typeof fieldLimits) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new ContactValidationError('Preencha os campos do formulário corretamente.');
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length > fieldLimits[field]) {
    throw new ContactValidationError(
      `O campo ${fieldLabels[field]} está muito longo.`
    );
  }

  return trimmedValue;
}

function validateContactPayload(payload: ContactPayload): ContactMessage {
  const name = normalizeField(payload.name, 'name');
  const company = normalizeField(payload.company, 'company');
  const contact = normalizeField(payload.contact, 'contact');
  const message = normalizeField(payload.message, 'message');

  if (!name) {
    throw new ContactValidationError('Informe seu nome para enviar a mensagem.');
  }

  if (!contact) {
    throw new ContactValidationError('Informe um e-mail ou WhatsApp para contato.');
  }

  if (!message) {
    throw new ContactValidationError('Escreva uma mensagem antes de enviar.');
  }

  return {
    name,
    company,
    contact,
    message,
    receivedAt: new Date().toISOString()
  };
}

export async function saveContactMessage(payload: ContactPayload) {
  const contactMessage = validateContactPayload(payload);

  await mkdir(storageDir, { recursive: true });
  await appendFile(storageFile, `${JSON.stringify(contactMessage)}\n`, 'utf8');

  return contactMessage;
}
