import express from "express";
import { sendVerificationCode, verifyCode } from "../controllers/emailController.js";

const router = express.Router();

router.post("/send", sendVerificationCode);
router.post("/verify", verifyCode);

export default router;