import { IResponse } from "../common/interfaces/types.interface";

/**
 * Sends a standardized JSON HTTP response.
 *
 * @param {IResponse} res - The Express response object.
 * @param {number} statusCode - The HTTP status code to send.
 * @param {boolean} isStatus - Indicates the success status of the response.
 * @param {string} message - A message describing the response.
 * @param {any} result - The data to include in the response.
 * @returns {Promise<void>} The response is sent as JSON.
 *
 * @example
 * await response(res, 200, true, "Request successful", { user: userData });
 * Success response example: {
 * "success": true,
 * "message": "OTP resent successfully",
 * "data": null
 * }
 * Failed response example: {
 * "success": false,
 * "message": "No data found",
 * "data": null
 * }
 */
export const response = (
  res: IResponse,
  statusCode: number,
  isStatus: boolean,
  message: string,
  result: any
): void => {
  if (res.headersSent) return; // Prevent double response
  res.status(statusCode).json({
    success: isStatus,
    message: message,
    data: result,
  });
  return;
};
