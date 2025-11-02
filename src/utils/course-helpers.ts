import mongoose from "mongoose";

export const normalizeCategory = (c?: string) => (c ?? "").trim().toLowerCase();

export const coerceNumber = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// note: this code will become relevant after implementing the ratings feature
// export const getCourseIdsByMinAvgRating = async (
//   minAvg: number
// ): Promise<mongoose.Types.ObjectId[]> => {
//   if (!Number.isFinite(minAvg) || minAvg <= 0) return [];
//   const rows = await Rating.aggregate<{
//     _id: mongoose.Types.ObjectId;
//     avg: number;
//   }>([
//     {$match: {stars: {$gte: 1, $lte: 5}}},
//     {$group: {_id: "$course", avg: {$avg: "$stars"}}},
//     {$match: {avg: {$gte: minAvg}}},
//     {$project: {_id: 1}},
//   ]);
//   return rows.map((r) => r._id);
// };
