import { Router } from 'express';
import { upload } from '../controllers/enterprise.controller.js';
import multer from 'multer';


import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

const uploadMiddleware = multer(); 

router.post('/upload', uploadMiddleware.single('file'), upload);


export default router;