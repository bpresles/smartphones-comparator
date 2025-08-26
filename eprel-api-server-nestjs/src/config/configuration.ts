export const configurationLoader = () => ({
  // Server configuration
  port: parseInt(process.env.PORT, 10) || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',

  // EPREL API configuration
  eprel: {
    apiKey: process.env.EPREL_API_KEY,
    baseUrl: process.env.EPREL_BASE_URL || 'https://eprel.ec.europa.eu/api/public',
    productGroup: 'smartphonestablets20231669',
    timeout: parseInt(process.env.EPREL_TIMEOUT, 10) || 10000,
  },

  // CORS configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes in seconds
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Application metadata
  app: {
    name: 'EPREL API Server',
    version: '1.0.0',
    description: 'API server for EPREL smartphone comparison data',
  },
});

export type Configuration = ReturnType<typeof configurationLoader>;
