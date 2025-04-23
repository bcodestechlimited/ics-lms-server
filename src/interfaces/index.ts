export interface EmailDataInterface {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
}

export interface CreateCourseInterface {
  courseTitle: string;
  courseDescription: string;
  courseImage: string;
  courseSummary: string;
  courseCategory: string;
  skillLevel: string;
}

export interface CreateAssessmentInterface {
  courseId: string;
  questions: {
    question: string;
    type: "single" | "multiple";
    options: {
      id: number;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface CreateBenchmarkInterface {
  courseId: string;
  retakes: number;
  benchmark: number;
}

