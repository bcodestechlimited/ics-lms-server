import {boolean} from "zod";
import {CourseProgressInterface} from "../models/progress.model";

class UserDto {
  id: string;
  firstName: string;
  lastName: string;
  status: boolean;
  isActive: boolean;
  courses: any;
  progress: CourseProgressInterface[];
  constructor(user: any) {
    this.id = user._id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.courses = user.courses.map((course: any) => ({
      title: course.title,
      description: course.description,
    }));
    this.status = user.status;
    this.isActive = user.isActive;
    this.progress = user.progress.map((progress: CourseProgressInterface) => ({
      id: progress._id,
      status: progress.status,
      certificateIssued: progress.certificateIssued,
      // @ts-ignore
      course_title: progress.course.title,
      score: progress.score,
      progress_percentage: progress.progressPercentage,
    }));
  }
}

export default UserDto;
