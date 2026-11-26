import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const typedError = err as Error & { statusCode?: number; code?: number };
  let statusCode = typedError.statusCode || 500;
  let message = typedError.message || 'Server error';

  if (err instanceof multer.MulterError) {
    const uploadError = err as multer.MulterError;
    statusCode = uploadError.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = uploadError.code === 'LIMIT_FILE_SIZE'
      ? 'Each image must be no larger than 1 MB after compression'
      : 'Choose up to four supported images';
  }

  if (typedError.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists';
  }

  res.status(statusCode).json({ success: false, message, data: null });
}
