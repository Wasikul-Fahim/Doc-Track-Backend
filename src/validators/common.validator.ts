import mongoose from "mongoose";
import { z } from "zod";
import { MAX_LIMIT } from "../utils/pagination";

export const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid id",
  });

export const idParamsSchema = z.object({ id: objectIdSchema });

export const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(10),
};

export const dateRangeFields = {
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
};

export const checkDateRange = (value: { from?: Date; to?: Date }) =>
  !value.from || !value.to || value.from <= value.to;
