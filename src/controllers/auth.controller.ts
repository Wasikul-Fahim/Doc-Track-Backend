import type { RequestHandler } from "express";
import { AUTH_COOKIE_NAME, env } from "../config/env";
import { login as loginUser } from "../services/auth.service";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import type { LoginInput } from "../validators/auth.validator";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.isProduction,
  path: "/",
};

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { token, user } = await loginUser(req.body as LoginInput);

  res.cookie(AUTH_COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: SEVEN_DAYS_MS,
  });

  sendSuccess(res, { user });
});

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions);
  sendSuccess(res, { message: "Signed out" });
};

export const me: RequestHandler = (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  sendSuccess(res, { user: req.user });
};
