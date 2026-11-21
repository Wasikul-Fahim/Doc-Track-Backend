import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

interface Validators {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Parses and strips the request against zod schemas.
 * zod errors are forwarded to the central error middleware, which turns
 * them into a 400 with per-field details.
 */
export const validate =
  (validators: Validators): RequestHandler =>
  (req, _res, next) => {
    try {
      if (validators.params) {
        req.params = validators.params.parse(req.params);
      }
      if (validators.query) {
        req.query = validators.query.parse(req.query);
      }
      if (validators.body) {
        req.body = validators.body.parse(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
