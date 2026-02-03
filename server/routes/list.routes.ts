import { Router } from 'express';
import { getMyList, addToList, removeFromList } from '../controllers/list.controller.js';

const router = Router();

router.get('/:userId', getMyList);
router.post('/', addToList);
router.delete('/:userId/:mediaId', removeFromList);

export default router;
