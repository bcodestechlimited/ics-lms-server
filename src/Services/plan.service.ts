import Plan, {IPlan} from "../models/plan.model";
import {CreatePlanInterface} from "../Schema/plan.schema";
import {DefaultSortBy, IQueryParams} from "../shared/query.interface";
import {coerceNumber} from "../utils/course-helpers";
import {paginate} from "../utils/paginate";
import {ApiSuccess} from "../utils/response-handler";

class PlanService {
  async fetchAllPlans(query: IQueryParams) {
    const page = coerceNumber(query.page, 1);
    const limit = coerceNumber(query.limit, 20);
    const search = (query.search ?? "").trim();
    const sortBy = (query.sortBy ?? "createdAt") as DefaultSortBy;
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = {};

    const filterQuery: Record<string, any> = {};
    if (search) {
      filterQuery.$or = [
        {name: {$regex: search, $options: "i"}},
        {description: {$regex: search, $options: "i"}},
        {planType: {$regex: search, $options: "i"}},
        {features: {$regex: search, $options: "i"}},
      ];
    }

    switch (sortBy) {
      case "createdAt":
        sort.createdAt = sortOrder;
        break;
      default:
        sort.createdAt = -1;
        break;
    }

    const {documents: plans, pagination} = await paginate<IPlan>({
      model: Plan,
      query: filterQuery,
      page,
      limit,
      sort,
    });
    return ApiSuccess.ok("Plans retrieved", {plans, pagination});
  }

  public async createPlan({
    description,
    duration,
    features,
    name,
    planType,
    price,
  }: CreatePlanInterface) {
    const plan = await Plan.create({
      description,
      duration,
      features,
      name,
      planType,
      price: price,
    });
    if (!plan) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: plan,
    };
  }

  public async updatePlan(
    id: string,
    {
      name,
      description,
      planType,
      price,
      duration,
      features,
    }: CreatePlanInterface
  ) {
    const updatedPlan = await Plan.findByIdAndUpdate(
      {_id: id},
      {name, description, features, price, duration, planType}
    );
    if (!updatedPlan) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: updatedPlan,
    };
  }

  async deletePlanById(id: string) {
    const deletedPlan = await Plan.findByIdAndDelete(id);
    if (!deletedPlan) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      message: "Plan deleted successfully",
    };
  }
}

export default PlanService;
