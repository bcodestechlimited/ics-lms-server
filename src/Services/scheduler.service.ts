import Agenda from "agenda";
import "dotenv/config";
import {courseService} from "./course.service";

const mongoConnectionString = process.env.MONGO_URI as string;

export const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    collection: "agendaJobs",
  },
  processEvery: "1 days",
});

agenda.define("expire courses", async (job) => {
  console.log("✅ Running course expiration job...");
  try {
    await courseService.processCourseExpirations();
    console.log("✅ Course expiration check completed.");
  } catch (error) {
    console.error("❌ Error running expiration job:", error);
  }
});

export async function startAgenda() {
  await agenda.start();
  console.log("✅ Agenda started.");

  await agenda.every("0 8 * * *", "expire courses");
}
