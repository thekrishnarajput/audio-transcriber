import { HttpStatus } from "../common/enums/httpStatusCodes";
import { messages } from "../common/functions/message";
import {
  INextFunction,
  IRequest,
  IResponse,
} from "../common/interfaces/types.interface";
import { response } from "./response";

/**
 * Express middleware to handle requests to undefined routes.
 *
 * @function urlNotFound
 *
 * @description
 * Sends a standardized 404 Not Found response when a request is made to an unknown URL.
 *
 * @param {IRequest} req - The Express request object.
 * @param {IResponse} res - The Express response object.
 * @param {INextFunction} next - The Express next middleware function.
 * @returns {void}
 *
 * @example
 * app.use(urlNotFound);
 * // Response: { "success": false, "message": "URL not found!", "data": null }
 */
export const urlNotFound = async (
  req: IRequest,
  res: IResponse,
  next: INextFunction
) => {
  next(response(res, HttpStatus.NotFound, false, messages.urlNotFound(), null));
};
