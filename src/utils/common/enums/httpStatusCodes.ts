/* HTTP Status Codes */

/**
 * An object containing standard HTTP status codes, grouped by their categories:
 * - Informational (1xx)
 * - Success (2xx)
 * - Redirection (3xx)
 * - Client Errors (4xx)
 * - Server Errors (5xx)
 *
 * Each property represents a specific HTTP status code, mapped to its numeric value.
 * Use these constants to improve code readability and avoid magic numbers when handling HTTP responses.
 *
 * @example
 * ```typescript
 * if (response.status === HttpStatus.Ok) {
 *   // Handle successful response
 * }
 * ```
 */
export enum HttpStatus {
  // Informational 1xx
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,

  // Success 2xx
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,

  // Redirection 3xx
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,

  // Client Errors 4xx
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  RequestTimeout = 408,
  Conflict = 409,
  UnProcessableEntity = 422,

  // Server Errors 5xx
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}
