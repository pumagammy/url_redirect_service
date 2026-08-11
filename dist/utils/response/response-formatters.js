"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = void 0;
const response_code_1 = require("./response-code");
const createSuccessResponse = (res, data, message = "Success", statusCode = response_code_1.STATUS_CODES.ok.code, status = response_code_1.STATUS_CODES.ok.name) => {
    return res.status(statusCode).json({
        statusCode,
        status,
        success: true,
        message,
        data,
    });
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (res, message = "Something went wrong", statusCode = response_code_1.STATUS_CODES.internalServerError.code, status = response_code_1.STATUS_CODES.internalServerError.name, errors = null) => {
    return res.status(statusCode).json({
        statusCode,
        status,
        success: false,
        message,
        errors,
    });
};
exports.createErrorResponse = createErrorResponse;
