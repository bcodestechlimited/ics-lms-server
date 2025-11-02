interface GenericQueryParamsInterface {
  search?: string;
  page?: number;
  limit?: number;
  fields?: string;
  startDate?: string; // ISO format string
  endDate?: string;
  sort?: "asc" | "desc";
}

type SkillLevel = {
  beginner: string;
  intermediate: string;
  advanced: string;
};

export type SortBy =
  | "createdAt"
  | "title"
  | "amount"
  | "mostRated"
  | "topRated";

export interface CourseQueryParams extends GenericQueryParamsInterface {
  category?: string; // e.g. "technology"
  rating?: number | null; // minimum average stars (1..5)
  skillLevel?: SkillLevel | "all";
  isPublished?: boolean;
  organisation?: string; // organisation userId
  priceMin?: number;
  priceMax?: number;
  sortBy?: SortBy;
  sortOrder?: "asc" | "desc";
}

export type UserSortBy = "email" | "firstName" | "createdAt";

export type DefaultSortBy = "createdAt";

export interface IQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  fields?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: UserSortBy;
}
