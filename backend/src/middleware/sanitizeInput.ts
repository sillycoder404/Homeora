import { NextFunction, Request, Response } from 'express';

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== 'object') return value;

  const clean: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    clean[key] = sanitize(child);
  }
  return clean;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  req.body = sanitize(req.body);
  next();
}
