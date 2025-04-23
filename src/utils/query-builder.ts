import { FilterQuery, Model } from "mongoose";
import { QueryOptions, QueryResponse } from "../interfaces/query";
import { ICoupon } from "../models/coupon.model";

export class QueryBuilder<T extends ICoupon> {
  private model: Model<T>;
  private queryOptions: QueryOptions;
  private baseQuery: FilterQuery<T>;

  constructor(
    model: Model<T>,
    queryOptions: QueryOptions,
    baseQuery: FilterQuery<T> = {}
  ) {
    this.model = model;
    this.queryOptions = queryOptions;
    this.baseQuery = baseQuery;
  }

  private buildSearchQuery(): FilterQuery<T> {
    const { search } = this.queryOptions;
    if (!search) return {};

    return {
      $or: [
        { couponCode: { $regex: search, $options: "i" } },
        { discountType: { $regex: search, $options: "i" } },
      ],
    };
  }

  private buildSortOptions(): { [key: string]: 1 | -1 } {
    const { sortBy = "createdAt", sortOrder = "desc" } = this.queryOptions;
    return { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  }

  private buildFilterQuery(): FilterQuery<T> {
    const { filters } = this.queryOptions;
    if (!filters) return {};

    const filterQuery: FilterQuery<T> = {};

    if (filters.discountType) {
      filterQuery.discountType = filters.discountType;
    }

    if (filters.status) {
      filterQuery.status = filters.status;
    }

    if (filters.courseId) {
      filterQuery.courseId = filters.courseId;
    }

    if (filters.expirationDate?.start || filters.expirationDate?.end) {
      filterQuery.expirationDate = {};
      if (filters.expirationDate.start) {
        filterQuery.expirationDate.$gte = filters.expirationDate.start;
      }
      if (filters.expirationDate.end) {
        filterQuery.expirationDate.$lte = filters.expirationDate.end;
      }
    }

    if (
      filters.percentageRange?.min !== undefined ||
      filters.percentageRange?.max !== undefined
    ) {
      filterQuery.percentage = {};
      if (filters.percentageRange.min !== undefined) {
        filterQuery.percentage.$gte = filters.percentageRange.min;
      }
      if (filters.percentageRange.max !== undefined) {
        filterQuery.percentage.$lte = filters.percentageRange.max;
      }
    }

    return filterQuery;
  }

  public async execute(): Promise<QueryResponse<T>> {
    const page = Math.max(1, this.queryOptions.page || 1);
    const limit = Math.max(1, Math.min(this.queryOptions.limit || 10, 100));
    const skip = (page - 1) * limit;

    const query = {
      ...this.baseQuery,
      ...this.buildSearchQuery(),
      ...this.buildFilterQuery(),
    };

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort(this.buildSortOptions())
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        sortBy: this.queryOptions.sortBy,
        sortOrder: this.queryOptions.sortOrder,
        filters: this.queryOptions.filters || {},
        search: this.queryOptions.search,
      },
    };
  }
}
