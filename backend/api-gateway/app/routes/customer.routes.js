import { Router } from 'express';
import { getPendingPayments } from '../controllers/customer.controller.js';
import { payInvoice } from '../controllers/customer.controller.js';
import { confirmInvoicePayment } from '../controllers/customer.controller.js';

const router = Router();

router.get('/pending', getPendingPayments);
router.post('/pay', payInvoice);
router.post('/confirm-paid', confirmInvoicePayment);

export default router;
