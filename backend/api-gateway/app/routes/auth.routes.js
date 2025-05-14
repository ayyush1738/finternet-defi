// auth.routes.js
import { Router } from 'express';
import { enterpriseLogin, getNonce, login } from "../controllers/auth.controller.js";

const router = Router();

router.get("/nonce", getNonce);
router.post("/user", login);
router.post("/enterprise", enterpriseLogin);

export default router;
