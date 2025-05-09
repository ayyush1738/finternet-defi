// auth.routes.js
import { Router } from 'express';
import { getNonce, login, register } from "../controllers/auth.controller.js";

const router = Router();

router.get("/nonce", getNonce);
router.post("/login", login);
router.post("/register", register);

export default router;
