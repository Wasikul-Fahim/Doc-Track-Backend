import type { PaginationMeta } from "./response";

export const MAX_LIMIT = 100;

export function buildMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
