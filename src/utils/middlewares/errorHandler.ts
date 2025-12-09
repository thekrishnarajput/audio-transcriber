import { HttpStatus } from "../common/enums/httpStatusCodes";
import { messages } from "../common/functions/message";
import { IResponse } from "../common/interfaces/types.interface";
import { response } from "./response";

/**
 * Express error-handling middleware for standardized API error responses.
 *
 * @function errorHandler
 * @param {any} error - The error object thrown in the application.
 * @param {import("express").Request} req - The Express request object.
 * @param {IResponse} res - The custom response object implementing IResponse.
 * @param {import("express").NextFunction} next - The Express next middleware function.
 *
 * @remarks
 * - Should be registered as the last middleware in app.ts using `app.use(errorHandler)`.
 * - Handles and formats errors from the application.
 * - Sends a standardized JSON response using the `response` utility.
 * - If response headers are already sent, the handler returns early.
 */
export const errorHandler = (
  error: any,
  req: any,
  res: IResponse,
  _next: any
) => {
  if (res.headersSent) return;

  let statusCode = error.statusCode || HttpStatus.InternalServerError;
  let message = error.message || messages.errorMessage();
  let data = error.data || null;

  response(res, statusCode, false, message, data);
};
