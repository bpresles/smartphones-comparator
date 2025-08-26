# Migration Guide: Express to NestJS

This guide explains how to migrate from the Express-based EPREL API server to the new NestJS version.

## Overview

The NestJS version provides the same API endpoints and functionality as the Express version, but with improved architecture, better maintainability, and additional features.

## Quick Migration Steps

### 1. Stop the Express Server
```bash
# If running the Express server, stop it first
# Usually Ctrl+C in the terminal where it's running
```

### 2. Navigate to NestJS Directory
```bash
cd EPRELComparator/eprel-api-server-nestjs
```

### 3. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 4. Configure Environment
```bash
# Copy your existing .env file or create a new one
cp ../eprel-api-server/.env .env
# or
cp .env.example .env
```

### 5. Update Environment Variables
Edit the `.env` file and ensure you have:
```env
EPREL_API_KEY=your_actual_api_key_here
PORT=3002
NODE_ENV=development
```

### 6. Start the NestJS Server
```bash
# Using the startup script (recommended)
./start-dev.sh

# Or manually
pnpm run start:dev
```

## API Compatibility

### ✅ Identical Endpoints
All endpoints work exactly the same:

| Endpoint | Express | NestJS | Status |
|----------|---------|---------|--------|
| `GET /health` | ✅ | ✅ | **Identical** |
| `GET /api/brands` | ✅ | ✅ | **Identical** |
| `GET /api/smartphones` | ✅ | ✅ | **Identical** |
| `GET /api/smartphones/:id` | ✅ | ✅ | **Identical** |
| `GET /api/smartphones/search/:query` | ✅ | ✅ | **Identical** |
| `GET /api/cache/stats` | ✅ | ✅ | **Identical** |
| `DELETE /api/cache` | ✅ | ✅ | **Identical** |

### ✅ Response Formats
All response formats are identical:
```json
// Brands endpoint - same format
{
  "brands": ["MEIZU", "AGM", "FOSSIBOT"],
  "total": 17,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}

// Smartphones endpoint - same format
{
  "smartphones": [...],
  "pagination": {...},
  "filters": {...},
  "lastUpdated": "..."
}
```

## New Features in NestJS Version

### 🆕 Enhanced Features

1. **Interactive API Documentation**
   - Access at: `http://localhost:3002/api/docs`
   - Swagger UI for testing endpoints
   - Auto-generated from code annotations

2. **Better Error Handling**
   - Structured error responses
   - Detailed validation messages
   - Development vs production error levels

3. **Input Validation**
   - Automatic request validation
   - Type-safe parameters
   - Clear validation error messages

4. **Enhanced Logging**
   - Structured logging with context
   - Request/response logging
   - Better debugging information

5. **Type Safety**
   - Full TypeScript integration
   - Compile-time error checking
   - Better IDE support

## Environment Variables

### Same Variables
All existing environment variables work the same:

```env
# Core configuration (unchanged)
PORT=3002
NODE_ENV=development
EPREL_API_KEY=your_key_here
EPREL_BASE_URL=https://eprel.ec.europa.eu/api/public
ALLOWED_ORIGINS=http://localhost:5173

# Cache configuration (unchanged)
CACHE_TTL=300

# Rate limiting (unchanged)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### New Optional Variables
```env
# New optional variables (with defaults)
EPREL_TIMEOUT=10000
```

## Frontend Compatibility

### ✅ No Changes Required
Your existing frontend code will work without any modifications:

```typescript
// This code works with both Express and NestJS versions
const response = await fetch('http://localhost:3002/api/brands');
const data = await response.json();
```

### ✅ Same CORS Configuration
CORS settings are identical, so your frontend will connect without issues.

## Development Workflow

### Express Version
```bash
cd eprel-api-server
npm install
npm start
```

### NestJS Version
```bash
cd eprel-api-server-nestjs
pnpm install
./start-dev.sh
# or
pnpm run start:dev
```

## Testing Migration

### 1. Health Check
```bash
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "EPREL API Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. API Documentation
Visit: `http://localhost:3002/api/docs`

### 3. Test Brands Endpoint
```bash
curl http://localhost:3002/api/brands
```

### 4. Test with Frontend
Start your frontend application and verify all functionality works.

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Stop the Express server first
pkill -f "node.*server.js"

# Or use a different port
echo "PORT=3003" >> .env
```

#### 2. API Key Issues
```bash
# Check if API key is set
cat .env | grep EPREL_API_KEY

# Update API key
echo "EPREL_API_KEY=your_new_key" >> .env
```

#### 3. Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
pnpm install
```

#### 4. Build Issues
```bash
# Clean build
npx nest build --clean
```

### Getting Help

1. **Check Logs**: NestJS provides detailed error messages
2. **API Documentation**: Use Swagger UI at `/api/docs`
3. **Health Check**: Verify server status at `/health`
4. **Configuration**: Ensure `.env` file is properly configured

## Performance Comparison

| Aspect | Express | NestJS | Notes |
|--------|---------|---------|-------|
| Startup Time | ~1s | ~2s | Slightly slower due to DI container |
| Memory Usage | Lower | Slightly Higher | More features, better structure |
| Request Latency | ~50ms | ~50ms | Nearly identical |
| Maintainability | Good | Excellent | Better structure and patterns |
| Type Safety | Partial | Full | Complete TypeScript integration |

## Rollback Plan

If you need to rollback to the Express version:

1. Stop NestJS server
2. Navigate to Express directory: `cd ../eprel-api-server`
3. Start Express server: `npm start`

Your data and configuration will be preserved.

## Next Steps

Once migration is complete:

1. ✅ Verify all endpoints work
2. ✅ Test with your frontend application
3. ✅ Explore the Swagger documentation
4. ✅ Consider the enhanced error handling
5. ✅ Optionally remove the old Express server

## Benefits Summary

### For Development
- Better debugging with structured logging
- Type safety prevents runtime errors
- Auto-generated API documentation
- Better IDE support and autocomplete

### For Production
- More robust error handling
- Better validation and security
- Scalable architecture
- Enterprise-ready patterns

### For Maintenance
- Clear separation of concerns
- Dependency injection for testability
- Modular architecture
- Better code organization

The NestJS version is a drop-in replacement that provides the same functionality with significant improvements in maintainability, developer experience, and future scalability.