import {Request} from "express";
import {FileArray, UploadedFile} from "express-fileupload";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CouponFilterOptions {
  discountType?: string;
  status?: string;
  courseId?: string;
  expirationDate?: {
    start?: Date;
    end?: Date;
  };
  percentageRange?: {
    min?: number;
    max?: number;
  };
}

export interface QueryOptions extends PaginationOptions, SortOptions {
  search?: string;
  filters?: CouponFilterOptions;
}

export interface QueryMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  sortBy?: string;
  sortOrder?: string;
  filters: Record<string, any>;
  search?: string;
}

export interface QueryResponse<T> {
  data: T[];
  meta: QueryMetadata;
}

export type RequestWithCourseImage = Request & {
  files: FileArray & {
    courseImage: UploadedFile | UploadedFile[];
  };
};
