import type { RequestHandler } from "express";
import { getOverview } from "../services/analytics.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const overview: RequestHandler = asyncHandler(async (_req, res) => {
  sendSuccess(res, await getOverview());
});
