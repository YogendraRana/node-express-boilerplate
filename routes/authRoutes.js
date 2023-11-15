import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.route('/register').post(authController.handleRegister);
router.route('/login').post(authController.handleLogin);
router.route('/logout').get(authController.handleLogout);

export default router;