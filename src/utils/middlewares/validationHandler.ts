import { body, validationResult } from "express-validator";
import { response } from "./response";
import { HttpStatus } from "../common/enums/httpStatusCodes";
import { messages } from "../common/functions/message";
import {
  INextFunction,
  IRequest,
  IResponse,
} from "../common/interfaces/types.interface";
import { RequestHandler } from "express";

/**
 * Express middleware for validating request fields using express-validator.
 *
 * @module validationHandler
 *
 * @description
 * Provides reusable validation rules for common fields
 * and a handler to return standardized error responses if validation fails.
 *
 * @example
 * // Usage in a route:
 * router.post(
 *   "/transcription",
 *   validations(["audioUrl"]),
 *   controller.createTranscription
 * );
 *
 * // If validation fails:
 * // Response: { "success": false, "message": "Validation error", "data": [ ...error details... ] }
 */

/**
 * Validation rules for common fields.
 */
export const validator = {
  audioUrl: body("audioUrl")
    .notEmpty()
    .withMessage("Audio URL is required!")
    .isURL({ protocols: ["http", "https"] })
    .withMessage("Audio URL must be a valid HTTP/HTTPS URL!"),
  language: body("language")
    .optional()
    .isString()
    .withMessage("Language must be a string!")
    .matches(/^[a-z]{2}-[A-Z]{2}$/)
    .withMessage("Language must be in format like en-US, fr-FR!"),
};

/**
 * Middleware to handle validation errors and send a standardized response.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {void}
 */
const validationError: RequestHandler = (
  req: IRequest,
  res: IResponse,
  next: INextFunction
): void => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    response(
      res,
      HttpStatus.Forbidden,
      false,
      messages.validationError(),
      errors.array()
    );
    return;
  }
  next();
};

/**
 * Returns an array of validation middlewares for the specified fields,
 * followed by the validation error handler.
 *
 * @param {Array<keyof typeof validator>} fields - The fields to validate.
 * @returns {Array} Array of validation middlewares.
 *
 * @example
 * app.post("/transcription", validations(["audioUrl"]), controller.createTranscription);
 */
export const validations = (fields: (keyof typeof validator)[]) => {
  const allValidations = fields.map((field) => validator[field]);
  return [...allValidations, validationError];
};
