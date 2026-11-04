import { Router } from 'express';
import { contactRoutes } from './contactRoutes.js';
import { healthRoutes } from './healthRoutes.js';

export const routes = Router();

routes.use(healthRoutes);
routes.use(contactRoutes);
