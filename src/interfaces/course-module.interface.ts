export interface BaseSection {
  sectionId: string;
  type: "list" | "image" | "video" | "quote" | "knowledge-check";
  content: any;
}

export interface ListSection extends BaseSection {
  type: "list";
  content: string;
}

export interface ImageSection extends BaseSection {
  type: "image";
  content: string;
}

export interface VideoSection extends BaseSection {
  type: "video";
  content: string;
}

export interface QuoteSection extends BaseSection {
  type: "quote";
  content: {
    quoteText: string;
    authorName: string;
    avatar: string | null;
  };
}

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface KnowledgeCheckSection extends BaseSection {
  type: "knowledge-check";
  content: {
    question: string;
    type: "single" | "multiple";
    options: Option[];
  };
}

export type ContentSection =
  | ListSection
  | ImageSection
  | VideoSection
  | QuoteSection
  | KnowledgeCheckSection;

export interface ICourseModule {
  courseId: string;
  title: string;
  description?: string;
  order: number;
  contentSections: ContentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedSection {
  content: any;
}