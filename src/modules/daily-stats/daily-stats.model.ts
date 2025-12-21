import mongoose from "mongoose";
import { DailyUploadStatsInterface } from "./daily-stats.interface";

const dailyUploadSchema = new mongoose.Schema<DailyUploadStatsInterface>(
  {
    date: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const DailyUploadStats = mongoose.model<DailyUploadStatsInterface>(
  "DailyUploadStats",
  dailyUploadSchema,
);
export default DailyUploadStats;
