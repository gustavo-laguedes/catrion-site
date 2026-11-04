import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import { routes } from './routes/index.js';

export const app = express();

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin
  })
);
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(routes);
app.use(notFoundHandler);
app.use(globalErrorHandler);
