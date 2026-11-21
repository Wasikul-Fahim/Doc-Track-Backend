import { ApiError } from "./ApiError";

/**
 * Turns "name,-createdAt" into { name: 1, createdAt: -1 }.
 * Only whitelisted fields are allowed, so user input can never become
 * an arbitrary sort on the database.
 */
export function parseSort(
  sort: string | undefined,
  allowed: readonly string[],
  fallback = "-createdAt"
): Record<string, 1 | -1> {
  const tokens = (sort ?? fallback)
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const result: Record<string, 1 | -1> = {};

  for (const token of tokens.length > 0 ? tokens : [fallback]) {
    const descending = token.startsWith("-");
    const field = descending ? token.slice(1) : token;

    if (!allowed.includes(field)) {
      throw ApiError.badRequest(
        `Sorting by "${field}" is not supported. Allowed: ${allowed.join(", ")}`
      );
    }

    result[field] = descending ? -1 : 1;
  }

  return result;
}

/** Makes user text safe to drop into a RegExp (avoids `.*` injections). */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
