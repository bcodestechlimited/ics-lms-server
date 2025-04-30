import Plan from "../models/plan.model";
import {CreatePlanInterface} from "../Schema/plan.schema";

class PlanService {
  //todo: handle pagination
  async fetchAllPlans() {
    const plans = await Plan.find();
    return {success: true, data: plans};
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
