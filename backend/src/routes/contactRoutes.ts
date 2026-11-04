import { Router } from 'express';
import { createContactMessage } from '../controllers/contactController.js';
import { contactRateLimit } from '../middleware/contactRateLimit.js';

export const contactRoutes = Router();

contactRoutes.post('/api/contact', contactRateLimit, createContactMessage);
