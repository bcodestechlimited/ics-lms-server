export class ApiError extends Error {
  statusCode: number;
  status: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = `ApiError [Status ${statusCode}]`;
    this.statusCode = statusCode;
    this.status = this.getStatusMessage(statusCode);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  static methodNotAllowed(message: string): ApiError {
    return new ApiError(405, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static gone(message: string): ApiError {
    return new ApiError(410, message);
  }

  static internalServerError(message: string): ApiError {
    return new ApiError(500, message);
  }

  static unprocessableEntity(message: string): ApiError {
    return new ApiError(422, message);
  }

  static serviceUnavailable(message: string): ApiError {
    return new ApiError(503, message);
  }

  static internal(message: string): ApiError {
    return new ApiError(500, message);
  }

  private getStatusMessage(statusCode: number): string {
    const statuses: {[key: number]: string} = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      405: "Method Not Allowed",
      409: "Conflict",
      422: "Unprocessable Entity",
      500: "Internal Server Error",
      503: "Service Unavailable",
    };
    return statuses[statusCode] || "Error";
  }
}

export class ApiSuccess<T = any> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;

  constructor(statusCode: number, message: string, data: T = {} as T) {
    this.success = true;
    this.status_code = statusCode;
    this.message = message;
    this.data = data;
  }

  static ok<T = any>(message: string, data?: T): ApiSuccess<T> {
    return new ApiSuccess<T>(200, message, data ?? ({} as T));
  }

  static created<T = any>(message: string, data?: T): ApiSuccess<T> {
    return new ApiSuccess<T>(201, message, data ?? ({} as T));
  }

  static noContent<T = any>(
    message: string = "No content",
    data?: T
  ): ApiSuccess<T> {
    return new ApiSuccess<T>(204, message, data ?? ({} as T));
  }

  static accepted<T = any>(message: string, data?: T): ApiSuccess<T> {
    return new ApiSuccess<T>(202, message, data ?? ({} as T));
  }

  static resetContent<T = any>(
    message: string = "Content reset",
    data?: T
  ): ApiSuccess<T> {
    return new ApiSuccess<T>(205, message, data ?? ({} as T));
  }
}
