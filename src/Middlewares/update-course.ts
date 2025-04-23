import Course from "../models/Course";

interface UpdateCourseInterface {
  courseId: string;
  updatePayload: any;
}

async function updateCourse({courseId, updatePayload}: UpdateCourseInterface) {
  await Course.findByIdAndUpdate(
    courseId,
    {
      $push: updatePayload,
    },
    {new: true}
  );
}
