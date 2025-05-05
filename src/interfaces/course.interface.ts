import {UploadedFile} from "express-fileupload";

export interface BulkAssignCourseInterface {
  isIcsStaff: boolean;
  durationDays: number;
  file: UploadedFile;
  courseIds: string[];
}

export interface AssignCourseToUsersInterface {
  userId: string;
  courseIds: string[];
  durationDays?: number;
}

export interface CourseQueryOptions {
  options: {
    page: number;
    limit: number;
    sort: {
      [x: string]: number;
    };
    populate: string[] | {path: string; select?: string}[] | any;
  };
  query: Record<string, any>;
}
