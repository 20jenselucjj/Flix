import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';

const router = Router();

router.get('/trending', mediaController.getTrending);
router.get('/popular/:type', mediaController.getPopular);
router.get('/search', mediaController.search);
router.get('/genres/:type', mediaController.getGenres);
router.get('/discover/:type', mediaController.discover);
router.get('/media/:type/:id', mediaController.getDetails);
router.get('/media/tv/:id/season/:seasonNumber', mediaController.getSeasonDetails);
router.get('/sources/:type/:id', mediaController.getSources);
router.get('/shorts', mediaController.getShorts);

export default router;
