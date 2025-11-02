import {CouponStatusEnum, DiscountType} from "../models/coupon.model";

export interface ProcessCouponInterface {
  couponCode: string;
  courseId: string;
}

export interface CouponCheckoutInterface extends ProcessCouponInterface {}

export type SortOrder = "asc" | "desc";

export interface CouponQueryParams {
  page?: string | number;
  limit?: string | number;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "couponCode"
    | "percentage"
    | "expirationDate";
  sortOrder?: "asc" | "desc";
  search?: string;

  discountType?: DiscountType;
  status?: CouponStatusEnum;
  courseId?: string;

  startDate?: string; // ISO
  endDate?: string; // ISO

  minPercentage?: string | number;
  maxPercentage?: string | number;
}

export const SORTABLE = new Set([
  "createdAt",
  "updatedAt",
  "couponCode",
  "percentage",
  "expirationDate",
]);
