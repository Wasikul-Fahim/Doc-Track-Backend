import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AUTH_COOKIE_NAME, env } from "../config/env";
import { UserModel } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export interface TokenPayload {
  sub: string;
  role: string;
}

export const requireAuth: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];

    if (typeof token !== "string" || token.length === 0) {
      throw ApiError.unauthorized();
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw ApiError.unauthorized("Your session has expired. Please sign in again.");
    }

    const user = await UserModel.findById(payload.sub)
      .select("name email role")
      .lean();

    if (!user) {
      throw ApiError.unauthorized("Your session is no longer valid.");
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "staff",
    };

    next();
  }
);
