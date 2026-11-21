import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { ApiError } from "../utils/ApiError";
import type { LoginInput } from "../validators/auth.validator";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

function toAuthUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
}): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as "admin" | "staff",
  };
}

function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export async function login(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email })
    .select("+passwordHash")
    .lean();

  // Same message for unknown email and wrong password: never reveal which.
  const passwordMatches = user
    ? await bcrypt.compare(input.password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  return {
    token: signToken(String(user._id), user.role),
    user: toAuthUser(user),
  };
}
