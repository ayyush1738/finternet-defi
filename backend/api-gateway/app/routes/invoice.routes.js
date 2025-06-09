import { Router } from 'express';
import { upload, getInvoices } from '../controllers/invoice.controller.js';
import multer from 'multer';
import { finalize } from '../controllers/finalize.controller.js';
import { purchaseInvoice } from '../controllers/invoice.controller.js';
import { confirmPurchase } from '../controllers/invoice.controller.js';


const router = Router();
const uploadMiddleware = multer();

router.post('/upload', uploadMiddleware.single('file'), upload);
router.post('/finalize', finalize);
router.get('/list', getInvoices);
router.post('/purchase', purchaseInvoice);
router.post('/purchase/confirm', confirmPurchase);

export default router;
