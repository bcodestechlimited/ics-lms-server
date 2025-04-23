import Course from "../models/Course";
import {Template} from "../models/course-template.model";

class TemplateService {
  async createTemplateFromCourse(id: string) {
    const course = await Course.findById({_id: id})
      .populate("module")
      .populate("course_assessment")
      .populate("course_price")
      .populate("course_benchmark")
      .exec();

    if (!course) {
      return {
        success: false,
        message: "No course found",
        data: null,
      };
    }

    const templateData = {
      name: `Template from ${course.title}`,
      description: `Template created from course ${course.title}`,
      courseData: {
        title: course.title,
        description: course.description,
        caption: course.caption,
        skillLevel: course.skillLevel,
        duration: course.duration,
        courseDuration: course.courseDuration,
        amount: course.amount,
        image: course.image,
        certificate: course.certificate,
        benefits: course.benefits,
        language: course.language,
        softwares: course.softwares,
        status: course.status,
        isPublished: course.isPublished,
      },
      modules: course.course_modules.map((mod: any) => ({
        title: mod.title,
        description: mod.description,
        order: mod.order,
        contentSections: mod.contentSections,
      })),
      assessments: course.course_assessment.map((assess: any) => ({
        question: assess.question,
        type: assess.type,
        options: assess.options,
      })),
      pricing: course.course_price
        ? {
            coursePricing: (course.course_price as any).coursePricing,
            courseCoupon: (course.course_price as any).courseCoupon,
          }
        : undefined,
      benchmark: course.course_benchmark
        ? {
            retakes: (course.course_benchmark as any).retakes,
            benchmark: (course.course_benchmark as any).benchmark,
          }
        : undefined,
    };

    const template = new Template(templateData);
    await template.save();

    return {
      success: true,
      message: "Template created",
      data: template,
    };
  }

  async createCourseFromTemplate(id: string, userId: string) {
    const template = await Template.findById({_id: id});
    if (!template) {
      return {
        success: false,
        message: "No template found",
        data: null,
      };
    }
    const newCourse = new Course({
      ...template.courseData,
      user: userId,
      status: "active",
      isPublished: false,
      module: [],
      course_assessment: [],
    });

    await newCourse.save();

    // Create modules
    // const newModules = await Promise.all(
    //   template.modules.map(async (mod) => {
    //     const newMod = new CourseModule({
    //       ...mod,
    //       courseId: newCourse._id,
    //     });
    //     await newMod.save();
    //     return newMod._id;
    //   })
    // );

    // Create assessments
    // const newAssessments = await Promise.all(
    //   template.assessments.map(async (assess) => {
    //     const newAssess = new CourseAssessment({
    //       ...assess,
    //       courseId: newCourse._id,
    //     });
    //     await newAssess.save();
    //     return newAssess._id;
    //   })
    // );

    // Create pricing
    // let newPricingId = null;
    // if (template.pricing) {
    //   const newPricing = new CoursePricing({
    //     ...template.pricing,
    //     courseId: newCourse._id,
    //   });
    //   await newPricing.save();
    //   newPricingId = newPricing._id as any;
    // }

    // Create benchmark
    // let newBenchmarkId = null;
    // if (template.benchmark) {
    //   const newBenchmark = new CourseBenchmark({
    //     ...template.benchmark,
    //     courseId: newCourse._id,
    //   });
    //   await newBenchmark.save();
    //   newBenchmarkId = newBenchmark._id as any;
    // }

    // Update course with new references
    // newCourse.module = newModules as any;
    // newCourse.course_assessment = newAssessments as any;
    // newCourse.course_price = newPricingId as any;
    // newCourse.course_benchmark = newBenchmarkId;

    await newCourse.save();

    return {
      success: true,
      message: "Course created",
      data: newCourse,
    };
  }

  async fetchAllTemplates() {
    const templates = await Template.find({}).exec();
    if (!templates) {
      return {
        success: false,
        message: "No templates found",
        data: null,
      };
    }
    return {
      success: true,
      message: "Templates found",
      data: templates,
    };
  }

  async fetchTemplateById(id: string) {
    const template = await Template.findById(id);
    if (!template) {
      return {
        success: false,
        message: "No template found",
        data: null,
      };
    }
    return {
      success: true,
      message: "Template found",
      data: template,
    };
  }
}

export const templateService = new TemplateService();
export default TemplateService;
