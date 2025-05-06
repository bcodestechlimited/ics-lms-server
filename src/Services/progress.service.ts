import {StatusCodes} from "http-status-codes";
import Progress from "../models/progress.model";
import {ServiceResponse} from "../utils/service-response";

class ProgressService {
  async getProgressByCourse(userId: string, courseId: string) {
    const progress = await Progress.findOne({user: userId, course: courseId})
      .populate("modules.module", "title")
      .lean();

    if (!progress) {
      return ServiceResponse.failure(
        "Progress not found",
        null,
        StatusCodes.NOT_FOUND
      );
    }

    return ServiceResponse.success(
      "Progress fetched",
      {data: progress},
      StatusCodes.OK
    );
  }
}

export default new ProgressService();
