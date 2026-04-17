import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export const success = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: ApiResponse['pagination']
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(pagination && { pagination })
  });
};

export const error = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: string[]
): Response<ApiResponse> => {
  const response: ApiResponse = {
    success: false,
    error: message
  };
  if (errors) {
    response.data = errors as unknown as undefined;
  }
  return res.status(statusCode).json(response);
};

export const paginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): Response<ApiResponse<T[]>> => {
  return success(res, data, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
};
