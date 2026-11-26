import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { propertyUpload } from '../middleware/upload';
import {
  createProperty,
  deleteProperty,
  getMyProperties,
  getProperties,
  getProperty,
  propertyValidation,
  updateProperty,
} from '../controllers/propertyController';

const router = Router();

router.get('/my', requireAuth, getMyProperties);
router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', requireAuth, propertyUpload.array('images', 4), propertyValidation, createProperty);
router.put('/:id', requireAuth, propertyUpload.array('images', 4), propertyValidation, updateProperty);
router.delete('/:id', requireAuth, deleteProperty);

export default router;
