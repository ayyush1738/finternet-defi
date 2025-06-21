import { Router } from 'express';
import { upload, getInvoices } from '../controllers/invoice.controller.js';
import multer from 'multer';
import { finalize } from '../controllers/finalize.controller.js';
import { purchaseInvoice } from '../controllers/invoice.controller.js';
import { confirmPurchase } from '../controllers/invoice.controller.js';
import { getMyPurchases } from '../controllers/invoice.controller.js';
import { getPendingPayments } from '../controllers/invoice.controller.js';
import { payInvoice } from '../controllers/invoice.controller.js';
import { confirmInvoicePayment } from '../controllers/invoice.controller.js';

const router = Router();
const uploadMiddleware = multer();

router.post('/upload', uploadMiddleware.single('file'), upload);
router.post('/finalize', finalize);
router.get('/list', getInvoices);
router.post('/purchase', purchaseInvoice);
router.post('/purchase/confirm', confirmPurchase);
router.get('/myPurchases', getMyPurchases);
router.get('/pending', getPendingPayments);
router.post('/pay', payInvoice);
router.post('/confirm-paid', confirmInvoicePayment);

export default router;
