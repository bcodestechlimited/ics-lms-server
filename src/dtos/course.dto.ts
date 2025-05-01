export class CourseDTO {
  id: string;
  _id: string;
  courseCode: string;
  title: string;
  description: string;
  image: string;
  summary: string;
  rating: any;
  updatedAt: Date;
  // courseBenchmark: Omit<CreateBenchmarkInterface, "courseId">;
  course_modules: any[];
  course_price: any;
  log: any;

  constructor(course: any) {
    (this.id = course._id), (this.courseCode = course._id);
    this._id = course._id;
    this.title = course.title;
    this.description = course.description;
    this.image = course.image;
    this.summary = course.summary;
    this.updatedAt = course.updatedAt;
    this.rating = course.rating;
    // this.courseBenchmark = {
    //   retakes: course.course_benchmark.retakes || 0,
    //   benchmark: course.course_benchmark.benchmark || 0,
    // };
    this.course_modules = course.course_modules.map((module: any) => {
      return {
        _id: module._id,
        title: module.title,
        description: module.description,
        updatedAt: module.updatedAt,
      };
    });
    this.course_price = {
      price: course.course_price,
    };
    this.log = function () {
      console.log(this);
    };
  }
}

export class CourseModulesDTO {
  id: string;
  _id: string;
  title: string;
  description: string;
  image: string;
  summary: string;
  rating: any;
  updatedAt: Date;
  courseCode: string;
  course: string;

  constructor(module: any) {
    (this.id = module._id), (this.courseCode = module._id);
    this._id = module._id;
    this.title = module.title;
    this.description = module.description;
    this.image = module.image;
    this.summary = module.summary;
    this.updatedAt = module.updatedAt;
    this.rating = module.rating;
    this.course = module.course;
  }
}
