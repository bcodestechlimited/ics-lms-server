import mongoose from "mongoose";
import "dotenv/config";
import { CourseModule } from "../models/course-module.model";

const connectToDB = async () => {
  await mongoose
    .connect("")
    .then(() => {
      console.log("DB connected successfully");
    })
    .catch(() => {
      console.log("DB connection failed");
    });
};

connectToDB();

async function deleteData() {
  try {
    const model = await CourseModule.deleteMany();
    console.log("Course module data deleted successfully");
  } catch (error) {
    console.log(error);
  }
}

async function importData() {
  try {
    const model = await CourseModule.create();
    console.log(model);
  } catch (error) {
    console.log(error);
  }
}

async function data() {
  if (process.argv[2] === "--delete") {
    await deleteData();
    process.exit();
  } else if (process.argv[2] === "--import") {
    await importData();
    process.exit();
  } else {
    process.exit();
  }
}

data();
