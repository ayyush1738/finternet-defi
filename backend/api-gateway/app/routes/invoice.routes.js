// auth.routes.js
import { Router } from 'express';
import { upload } from '../controllers/invoice.controller.js'
const router = Router();

router.get("/upload", upload);

export default router;
