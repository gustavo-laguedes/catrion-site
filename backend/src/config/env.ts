import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3333),
  corsOrigin:
    process.env.CORS_ORIGIN ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  trustProxy: process.env.TRUST_PROXY === 'true',
  jsonBodyLimit: process.env.JSON_BODY_LIMIT ?? '100kb',
  contactRateLimitWindowMs: Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? 60_000),
  contactRateLimitMax: Number(process.env.CONTACT_RATE_LIMIT_MAX ?? 5)
};
