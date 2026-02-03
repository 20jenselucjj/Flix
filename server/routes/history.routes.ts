import { Router } from 'express';
import { getHistory, saveProgress } from '../controllers/history.controller.js';

const router = Router();

router.get('/:userId', getHistory);
router.post('/', saveProgress);

export default router;
