# EPREL API Server (NestJS)

A modern, scalable API server built with NestJS for accessing and comparing EPREL smartphone data.

## Features

- 🚀 Built with NestJS framework for scalability and maintainability
- 📊 Complete EPREL smartphone data integration
- 🔄 In-memory caching with configurable TTL
- 🛡️ Rate limiting and security middleware
- 📚 Auto-generated Swagger documentation
- ✅ Input validation with class-validator
- 🎯 TypeScript for type safety
- 🔧 Comprehensive configuration management
- 📝 Structured logging
- 🧪 Ready for testing with Jest

## Architecture

```
src/
├── main.ts                    # Application entry point
├── app.module.ts             # Root module
├── app.controller.ts         # Health check controller
├── app.service.ts            # App-level services
├── config/                   # Configuration management
│   ├── configuration.ts      # Config loader
│   └── validation.ts         # Environment validation
├── common/                   # Shared utilities
│   ├── dto/                  # Data Transfer Objects
│   ├── filters/              # Exception filters
│   ├── interfaces/           # TypeScript interfaces
│   └── services/             # Shared services (cache)
└── modules/
    └── eprel/                # EPREL feature module
        ├── eprel.module.ts
        ├── eprel.controller.ts
        └── eprel.service.ts
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- EPREL API key

### Installation

1. **Clone and navigate to the NestJS directory:**
   ```bash
   cd EPRELComparator/eprel-api-server-nestjs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment variables in `.env`:**
   ```env
   # Required
   EPREL_API_KEY=your_eprel_api_key_here
   
   # Optional (defaults provided)
   PORT=3002
   NODE_ENV=development
   EPREL_BASE_URL=https://eprel.ec.europa.eu/api/public
   ALLOWED_ORIGINS=http://localhost:5173
   CACHE_TTL=300
   ```

5. **Start the development server:**
   ```bash
   npm run start:dev
   ```

The server will start on `http://localhost:3002`

## API Documentation

Once the server is running, access the interactive Swagger documentation at:
- **Swagger UI**: http://localhost:3002/api/docs

### Available Endpoints

#### Health Check
- `GET /health` - Server health status

#### EPREL Data
- `GET /api/brands` - Get all smartphone brands
- `GET /api/smartphones` - Get smartphones (with filtering & pagination)
- `GET /api/smartphones/:id` - Get specific smartphone by ID
- `GET /api/smartphones/search/:query` - Search smartphones

#### Cache Management
- `GET /api/cache/stats` - Get cache statistics
- `DELETE /api/cache` - Clear cache

### Example Requests

**Get all brands:**
```bash
curl http://localhost:3002/api/brands
```

**Get smartphones by brand:**
```bash
curl "http://localhost:3002/api/smartphones?brand=MEIZU&limit=10"
```

**Search smartphones:**
```bash
curl http://localhost:3002/api/smartphones/search/iPhone
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3002` | No |
| `EPREL_API_KEY` | EPREL API authentication key | - | **Yes** |
| `EPREL_BASE_URL` | EPREL API base URL | `https://eprel.ec.europa.eu/api/public` | No |
| `EPREL_TIMEOUT` | API request timeout (ms) | `10000` | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` | No |
| `CACHE_TTL` | Cache TTL in seconds | `300` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |

### Features Configuration

**Rate Limiting**: Prevents API abuse with configurable limits
**Caching**: In-memory cache with automatic expiration
**CORS**: Configurable cross-origin resource sharing
**Validation**: Automatic request/response validation
**Security**: Helmet.js security headers

## Development

### Scripts

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start with debugging

# Production
npm run build           # Build the application
npm run start:prod      # Start production server

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Project Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and external API calls
- **DTOs**: Define request/response data structures
- **Interfaces**: TypeScript type definitions
- **Modules**: Feature-based organization
- **Filters**: Global exception handling
- **Configuration**: Environment and validation setup

## Data Flow

1. **Client Request** → Controller validates input
2. **Controller** → Service processes business logic
3. **Service** → Cache check for existing data
4. **Service** → EPREL API call (if cache miss)
5. **Service** → Data transformation and caching
6. **Controller** → JSON response to client

## Caching Strategy

- **In-memory cache** with configurable TTL
- **Automatic cleanup** of expired entries
- **Cache keys** based on request parameters
- **Cache statistics** available via API endpoint

## Error Handling

- **Global exception filter** for consistent error responses
- **Structured error messages** with request context
- **Development vs production** error detail levels
- **Comprehensive logging** for debugging

## Monitoring

### Health Check Response
```json
{
  "status": "OK",
  "message": "EPREL API Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### Cache Statistics
```json
{
  "entries": 5,
  "keys": ["brands", "smartphones-{}", "smartphone-M512H"],
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3002
CMD ["node", "dist/main"]
```

## Comparison with Express Version

### Advantages of NestJS Version

- **Better Structure**: Modular architecture with dependency injection
- **Type Safety**: Full TypeScript integration with decorators
- **Auto Documentation**: Swagger generation from decorators
- **Built-in Validation**: Class-validator integration
- **Scalability**: Enterprise-ready framework patterns
- **Testing**: Built-in testing utilities and structure
- **Maintainability**: Clear separation of concerns

### Migration Notes

- All existing endpoints maintain the same API contract
- Response formats are identical to the Express version
- Environment variables remain the same
- Caching behavior is preserved

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details