import { Router } from 'express';
import { getMyPurchases } from '../controllers/invoice.controller.js';

const router = Router();

router.post('/myPurchases', getMyPurchases);

export default router;
