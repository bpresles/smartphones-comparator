import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        message: { type: 'string', example: 'EPREL API Server is running' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealthStatus();
  }
}
