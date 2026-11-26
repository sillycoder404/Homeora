import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required', data: null });
      return;
    }

    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is missing');

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found', data: null });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
  }
}
