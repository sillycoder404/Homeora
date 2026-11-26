import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { sendEmail } from '../utils/sendEmail';

function signToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as jwt.SignOptions['expiresIn'],
  });
}

function validateRequest(req: Request): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    validateRequest(req);
    const { name, email, phone, password } = req.body;
    const user = await User.create({ name, email: email.toLowerCase().trim(), phone, password });
    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    validateRequest(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = signToken(user.id);
    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } },
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    validateRequest(req);
    const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, '');
    if (!frontendUrl) throw new ApiError(503, 'Password reset email is not configured');

    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user) throw new ApiError(404, 'No account exists with that email');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    try {
      await sendEmail(
        user.email,
        'Reset your Homeora password',
        `Use this link within 30 minutes to reset your password:\n\n${resetUrl}`,
      );
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Password reset email delivery failed:', error instanceof Error ? error.message : 'Unknown email error');
      throw new ApiError(503, 'Password reset email could not be sent. Please try again later.');
    }

    res.json({ success: true, message: 'Password reset email sent. Check your inbox and spam folder.', data: null });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    validateRequest(req);
    const tokenParam = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    const tokenHash = crypto.createHash('sha256').update(tokenParam).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) throw new ApiError(400, 'Reset token is invalid or expired');
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully', data: null });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    message: 'Current user',
    data: { id: req.user!._id.toString(), name: req.user!.name, email: req.user!.email, phone: req.user!.phone, role: req.user!.role },
  });
}
