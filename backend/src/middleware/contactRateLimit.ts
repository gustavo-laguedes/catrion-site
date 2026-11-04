import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const contactRateLimit = rateLimit({
  windowMs: env.contactRateLimitWindowMs,
  limit: env.contactRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.'
  }
});
