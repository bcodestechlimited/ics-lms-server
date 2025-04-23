export interface UserCourseExtensionPayloadInterface {
  courseId: string;
  expiryDate: Date;
  reason: string;
  userId: string;
  extensionDays: number;
}
