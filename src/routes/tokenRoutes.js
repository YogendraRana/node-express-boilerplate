import express from 'express';
import * as tokenController from '../controllers/tokenControllers.js';

const router = express.Router();

router.route('/refresh-token').get(tokenController.handleRefreshToken);

export default router;