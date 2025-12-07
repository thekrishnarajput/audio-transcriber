import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateTranscriptionRequest = [
  body('audioUrl')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('audioUrl must be a valid HTTP/HTTPS URL')
    .notEmpty()
    .withMessage('audioUrl is required'),
];

export const validateAzureTranscriptionRequest = [
  body('audioUrl')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('audioUrl must be a valid HTTP/HTTPS URL')
    .notEmpty()
    .withMessage('audioUrl is required'),
  body('language')
    .optional()
    .isString()
    .matches(/^[a-z]{2}-[A-Z]{2}$/)
    .withMessage('language must be in format like en-US, fr-FR'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: errors.array(),
      },
    });
    return;
  }
  next();
};

