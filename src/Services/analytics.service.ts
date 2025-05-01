import mongoose from "mongoose";
import User from "../models/User";

class AnalyticsService {
  public async fetchCourseAnalytics(id: string) {
    const statsArr = await User.aggregate([
      // 1) pick out the user
      {$match: {_id: new mongoose.Types.ObjectId(id)}},

      // 2) pull in their Progress docs
      {
        $lookup: {
          from: "progresses", // matches your Progress model's collection name
          localField: "progress",
          foreignField: "_id",
          as: "progressData",
        },
      },

      // 3) build all of your counts, guarding against missing arrays
      {
        $project: {
          // total number of enrolled courses
          totalCourses: {
            $size: {$ifNull: ["$courseEnrollments", []]},
          },

          // how many in-progress
          enrolledCourses: {
            $size: {
              $filter: {
                input: {$ifNull: ["$progressData", []]},
                as: "p",
                cond: {$eq: ["$$p.status", "in-progress"]},
              },
            },
          },

          // how many completed
          completedCourses: {
            $size: {
              $filter: {
                input: {$ifNull: ["$progressData", []]},
                as: "p",
                cond: {$eq: ["$$p.status", "completed"]},
              },
            },
          },

          // how many certificates issued
          certifiedCourses: {
            $size: {
              $filter: {
                input: {$ifNull: ["$progressData", []]},
                as: "p",
                cond: {$eq: ["$$p.certificateIssued", true]},
              },
            },
          },
        },
      },
    ]);

    if (!statsArr.length) {
      return {success: false, message: "No user found"};
    }

    // there will only ever be one entry
    return {success: true, data: statsArr[0]};
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
