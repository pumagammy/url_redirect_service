import { STATUS_CODES } from "./response-code";

export const createSuccessResponse = (
  res: any,
  data: any,
  message: string = "Success",
  statusCode: number = STATUS_CODES.ok.code,
  status: string = STATUS_CODES.ok.name
) => {
  return res.status(statusCode).json({
    statusCode,
    status,
    success: true,
    message,
    data,
  });
};

export const createErrorResponse = (
  res: any,
  message: string = "Something went wrong",
  statusCode: number = STATUS_CODES.internalServerError.code,
  status: string = STATUS_CODES.internalServerError.name,
  errors: any = null
) => {
  return res.status(statusCode).json({
    statusCode,
    status,
    success: false,
    message,
    errors,
  });
};
