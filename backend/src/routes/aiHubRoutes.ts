import { Router } from 'express';
import { aiSearchValidation, searchAiListings } from '../controllers/aiHubController';

const router = Router();
router.post('/search', aiSearchValidation, searchAiListings);

export default router;
