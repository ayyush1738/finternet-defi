import Router from 'express';
import { purchaseInvoice } from '../controllers/investor.controller.js';
import { confirmPurchase } from '../controllers/investor.controller.js';
import { getMyPurchases } from '../controllers/investor.controller.js';

const router = Router();

router.post('/purchase', purchaseInvoice);
router.post('/purchase/confirm', confirmPurchase);
router.get('/myPurchases', getMyPurchases);

export default router;