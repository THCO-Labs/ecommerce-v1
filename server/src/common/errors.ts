import type { NextFunction, Request, Response } from "express";

/** An error carrying the HTTP status the client should receive. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, fieldErrors?: Record<string, string[]>) =>
  new HttpError(400, message, fieldErrors);
export const unauthorized = (message = "Authentication required") => new HttpError(401, message);
export const forbidden = (message = "Staff access required") => new HttpError(403, message);
export const notFound = (message = "Not found") => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);

/** Terminal 404 for unmatched API routes. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(notFound(`No route matches ${req.method} ${req.originalUrl}`));
}

/**
 * Single error shape for the whole API: `{ error, fieldErrors? }`.
 * Express 5 forwards rejected promises here automatically.
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, fieldErrors: error.fieldErrors });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
