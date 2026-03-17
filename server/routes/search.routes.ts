import { Router } from 'express';
import { getSearchHistory, addToSearchHistory, clearSearchHistory } from '../controllers/history.controller.js';

const router = Router();

router.get('/:userId', getSearchHistory);
router.post('/', addToSearchHistory);
router.delete('/:userId', clearSearchHistory);

export default router;
