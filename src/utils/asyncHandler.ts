import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Express 4 does not forward rejected promises to the error middleware.
 * This wrapper does, so controllers can simply `throw ApiError...`.
 */
export const asyncHandler =
  (fn: AsyncRoute): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
