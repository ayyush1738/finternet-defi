import Router from 'express';
import { getInvoices } from '../controllers/invoice.controller.js';

const router = Router();

router.get('/list', getInvoices);

export default router;