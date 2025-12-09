import swaggerJsDocs from "swagger-jsdoc";
/**
 * Express middleware to serve Swagger UI.
 * @external swaggerUIExpress
 * @see {@link https://www.npmjs.com/package/swagger-ui-express}
 */
export const swaggerUIExpress = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VoiceOwl APIs",
      version: "1.0.0",
      description: "VoiceOwl API with Swagger documentation",
    },
  },
  apis: ["src/**/*.ts)"], // Path to the API docs (e.g., JSDoc comments in TypeScript files)
};

/**
 * Generates Swagger/OpenAPI specifications from the provided options.
 * @type {object}
 * @constant
 * @external specs
 * @see {@link https://www.npmjs.com/package/swagger-jsdoc}
 */
export const specs = swaggerJsDocs(options);

// Export the generated specs and the swaggerUIExpress middleware
module.exports = {
  specs,
  swaggerUIExpress,
};
