import { NextFunction, Request, Response } from 'express';

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
  err: Error & { statusCode?: number; code?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists';
  }

  res.status(statusCode).json({ success: false, message, data: null });
}
