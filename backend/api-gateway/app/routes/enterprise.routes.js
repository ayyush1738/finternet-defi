import { Router } from 'express';
import { upload } from '../controllers/enterprise.controller.js';
import multer from 'multer';
import { finalize } from '../controllers/finalize.controller.js';

const router = Router();
const uploadMiddleware = multer();

router.post('/upload', uploadMiddleware.single('file'), upload);
router.post('/finalize', finalize);


export default router;
