export interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  total?: number;
}

/**
 * Calculate pagination values for list endpoints
 * @param page - Current page number (default: 1)
 * @param limit - Items per page (default: 20, max: 100)
 * @param total - Total number of items
 */
export const calculatePagination = (
  page: number = 1,
  limit: number = 20,
  total: number = 0
): PaginationResult => {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const safeTotal = Math.max(0, Math.floor(total));

  const totalPages = Math.ceil(safeTotal / safeLimit);
  const skip = (safePage - 1) * safeLimit;

  return {
    skip,
    limit: safeLimit,
    page: safePage,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1
  };
};