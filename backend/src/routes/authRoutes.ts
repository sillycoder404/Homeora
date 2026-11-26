import { Router } from 'express';
import { body } from 'express-validator';
import { forgotPassword, login, register, resetPassword } from '../controllers/authController';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login,
);

router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email is required')], forgotPassword);

router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  resetPassword,
);

export default router;
