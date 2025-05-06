import {Response} from "express";
import progressService from "../Services/progress.service";
import {ExtendedRequest} from "../interfaces/auth.interface";

class ProgressController {
  public async getCourseProgress(req: ExtendedRequest, res: Response) {
    const userId = req.user?._id as string;
    const {courseId} = req.params;

    const response = await progressService.getProgressByCourse(
      userId,
      courseId
    );
    res.status(response.statusCode).json(response);
  }
}

export const progressController = new ProgressController();
