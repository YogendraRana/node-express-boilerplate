import express from "express";
import * as adminController from "../controllers/adminController.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/admin').get(authMiddleware.verifyAccessToken, adminController.getUsers);

export default router;