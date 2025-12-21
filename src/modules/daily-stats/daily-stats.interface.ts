import { Document } from "mongoose";

export interface DailyUploadStatsInterface extends Document {
  date: string;
  count: number;
}
