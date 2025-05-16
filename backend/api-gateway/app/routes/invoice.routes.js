import { Router } from 'express';
import { upload, getInvoices } from '../controllers/invoice.controller.js';
import multer from 'multer';

const router = Router();
const uploadMiddleware = multer();

router.post('/upload', uploadMiddleware.single('file'), upload);
router.get('/list', getInvoices);

export default router;
