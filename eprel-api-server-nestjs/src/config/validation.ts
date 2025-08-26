import * as Joi from "joi";

export const validationSchema = Joi.object({
  // Server configuration
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().port().default(3002),

  // EPREL API configuration
  EPREL_API_KEY: Joi.string()
    .required()
    .description("EPREL API key is required"),
  EPREL_BASE_URL: Joi.string()
    .uri()
    .default("https://eprel.ec.europa.eu/api/public"),
  EPREL_TIMEOUT: Joi.number().positive().default(10000),

  // CORS configuration
  ALLOWED_ORIGINS: Joi.string().default("http://localhost:5173"),

  // Cache configuration
  CACHE_TTL: Joi.number().positive().default(300),

  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: Joi.number().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().positive().default(100),
});
