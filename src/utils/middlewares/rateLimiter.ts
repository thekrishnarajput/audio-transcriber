import rateLimit from "express-rate-limit";
import { messages } from "../common/functions/message";

/**
 * Express middleware to limit repeated requests from the same IP address.
 *
 * @constant
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 *
 * @description
 * Allows up to 100 requests per IP address within a 15-minute window.
 * If the limit is exceeded, further requests are blocked and a message is returned.
 *
 * @example
 * app.use(limiter);
 *
 * // If an IP exceeds 100 requests in 15 minutes:
 * // Response: "100 requests exceeded from this IP, please try again after 15 minutes"
 */
export const limiter = rateLimit({
  max: 100000, // 100 Request limit per individual IP
  windowMs: 15 * 60000, // 15 Minutes rate limit for each IP address
  message: messages.rateLimitExceeded(), // Message to return when limit is exceeded
});
