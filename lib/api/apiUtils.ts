/**
 * Common error handling and response utilities for API routes
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Validates that required fields exist in the request body
 */
export function validateRequestBody<T>(
  data: unknown,
  requiredFields: string[],
): T {
  if (!data || typeof data !== "object") {
    throw new ApiError(400, "Invalid request body");
  }

  const body = data as Record<string, unknown>;

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === "" || body[field] === null) {
      throw new ApiError(400, `Missing required field: ${field}`);
    }
  }

  return body as T;
}

/**
 * Validates a file upload
 */
export function validateFileUpload(
  file: File | null,
  allowedMimeTypes: string[] = ["application/pdf"],
): File {
  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  if (!allowedMimeTypes.includes(file.type)) {
    throw new ApiError(
      400,
      `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
    );
  }

  return file;
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred",
): {
  statusCode: number;
  body: Record<string, unknown>;
} {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: { error: error.message },
    };
  }

  console.error(defaultMessage, error);
  return {
    statusCode: 500,
    body: { error: defaultMessage },
  };
}

/**
 * Creates a response with error in a specific field
 * Useful for APIs that return errors in a named field
 */
export function fieldErrorResponse(
  field: string,
  defaultValue: unknown,
  error: unknown,
  defaultMessage: string = "An error occurred",
): {
  statusCode: number;
  body: Record<string, unknown>;
} {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: { [field]: defaultValue },
    };
  }

  console.error(defaultMessage, error);
  return {
    statusCode: 500,
    body: { [field]: defaultValue },
  };
}
