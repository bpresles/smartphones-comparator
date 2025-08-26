import {
  Controller,
  Get,
  Delete,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { EprelService } from './eprel.service';
import {
  SmartphonesQueryDto,
  SearchQueryDto,
  SmartphoneParamsDto,
} from '../../common/dto/query.dto';
import {
  BrandsResponse,
  SmartphonesResponse,
  SmartphoneResponse,
  SearchResponse,
  CacheStats,
} from '../../common/interfaces/smartphone.interface';

@ApiTags('eprel')
@Controller()
@UseGuards(ThrottlerGuard)
export class EprelController {
  constructor(private readonly eprelService: EprelService) {}

  @Get('brands')
  @ApiOperation({
    summary: 'Get all smartphone brands',
    description: 'Retrieve a list of all available smartphone brands from EPREL database',
  })
  @ApiResponse({
    status: 200,
    description: 'List of brands retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        brands: {
          type: 'array',
          items: { type: 'string' },
          example: ['MEIZU', 'AGM', 'FOSSIBOT'],
        },
        total: { type: 'number', example: 17 },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 502,
    description: 'EPREL API error',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Failed to communicate with EPREL API' },
        statusCode: { type: 'number', example: 502 },
      },
    },
  })
  async getBrands(): Promise<BrandsResponse> {
    return this.eprelService.getBrands();
  }

  @Get('smartphones')
  @ApiOperation({
    summary: 'Get smartphones',
    description: 'Retrieve smartphones with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    description: 'Filter by brand name',
    example: 'MEIZU',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items to return (1-100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of items to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Smartphones retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        smartphones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'M512H' },
              brand: { type: 'string', example: 'MEIZU' },
              modelName: { type: 'string', example: 'M512H' },
              deviceType: { type: 'string', example: 'SMARTPHONE' },
              eprelUrl: { type: 'string', nullable: true },
              metrics: {
                type: 'object',
                properties: {
                  energyClass: { type: 'string', example: 'B' },
                  repairabilityClass: { type: 'string', example: 'B' },
                  repairabilityIndex: { type: 'number', example: 3.58 },
                  batteryEnduranceInCycles: { type: 'number', example: 10 },
                  batteryEndurancePerCycle: { type: 'number', example: 2978 },
                  ipRating: { type: 'string', example: 'IP54' },
                  fallsWithoutDefect: { type: 'number', example: 180 },
                  ratedBatteryCapacity: { type: 'number', example: 5000 },
                  operatingSystem: { type: 'string', example: 'ANDROID' },
                },
              },
              lastUpdated: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            count: { type: 'number', example: 20 },
            limit: { type: 'number', nullable: true, example: 20 },
            offset: { type: 'number', example: 0 },
          },
        },
        filters: {
          type: 'object',
          properties: {
            brand: { type: 'string', nullable: true, example: 'MEIZU' },
          },
        },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getSmartphones(@Query() query: SmartphonesQueryDto): Promise<SmartphonesResponse> {
    return this.eprelService.getSmartphones(query);
  }

  @Get('smartphones/:id')
  @ApiOperation({
    summary: 'Get smartphone by ID',
    description: 'Retrieve a specific smartphone by its model identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Smartphone model identifier',
    example: 'M512H',
  })
  @ApiResponse({
    status: 200,
    description: 'Smartphone retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        smartphone: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'M512H' },
            brand: { type: 'string', example: 'MEIZU' },
            modelName: { type: 'string', example: 'M512H' },
            deviceType: { type: 'string', example: 'SMARTPHONE' },
            eprelUrl: { type: 'string', nullable: true },
            metrics: {
              type: 'object',
              properties: {
                energyClass: { type: 'string', example: 'B' },
                repairabilityClass: { type: 'string', example: 'B' },
                repairabilityIndex: { type: 'number', example: 3.58 },
                batteryEnduranceInCycles: { type: 'number', example: 10 },
                batteryEndurancePerCycle: { type: 'number', example: 2978 },
                ipRating: { type: 'string', example: 'IP54' },
                fallsWithoutDefect: { type: 'number', example: 180 },
                ratedBatteryCapacity: { type: 'number', example: 5000 },
                operatingSystem: { type: 'string', example: 'ANDROID' },
              },
            },
            lastUpdated: { type: 'string', format: 'date-time' },
          },
        },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Smartphone not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: "Smartphone with ID 'INVALID_ID' not found" },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  async getSmartphoneById(@Param() params: SmartphoneParamsDto): Promise<SmartphoneResponse> {
    return this.eprelService.getSmartphoneById(params.id);
  }

  @Get('smartphones/search/:query')
  @ApiOperation({
    summary: 'Search smartphones',
    description: 'Search smartphones by model name or brand (minimum 2 characters)',
  })
  @ApiParam({
    name: 'query',
    description: 'Search query (minimum 2 characters)',
    example: 'iPhone',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results (1-50)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'M512H' },
              brand: { type: 'string', example: 'MEIZU' },
              modelName: { type: 'string', example: 'M512H' },
              deviceType: { type: 'string', example: 'SMARTPHONE' },
              eprelUrl: { type: 'string', nullable: true },
              metrics: {
                type: 'object',
                properties: {
                  energyClass: { type: 'string', example: 'B' },
                  repairabilityClass: { type: 'string', example: 'B' },
                  repairabilityIndex: { type: 'number', example: 3.58 },
                  batteryEnduranceInCycles: { type: 'number', example: 10 },
                  batteryEndurancePerCycle: { type: 'number', example: 2978 },
                  ipRating: { type: 'string', example: 'IP54' },
                  fallsWithoutDefect: { type: 'number', example: 180 },
                  ratedBatteryCapacity: { type: 'number', example: 5000 },
                  operatingSystem: { type: 'string', example: 'ANDROID' },
                },
              },
              lastUpdated: { type: 'string', format: 'date-time' },
            },
          },
        },
        query: { type: 'string', example: 'iPhone' },
        total: { type: 'number', example: 5 },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Search query must be at least 2 characters long' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async searchSmartphones(
    @Param('query') query: string,
    @Query('limit') limit?: number,
  ): Promise<SearchResponse> {
    const searchQuery: SearchQueryDto = { query, limit };
    return this.eprelService.searchSmartphones(searchQuery);
  }

  @Get('cache/stats')
  @ApiTags('cache')
  @ApiOperation({
    summary: 'Get cache statistics',
    description: 'Retrieve current cache statistics for debugging purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        entries: { type: 'number', example: 5 },
        keys: {
          type: 'array',
          items: { type: 'string' },
          example: ['brands', 'smartphones-{}', 'smartphone-M512H'],
        },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  getCacheStats(): CacheStats {
    return this.eprelService.getCacheStats();
  }

  @Delete('cache')
  @ApiTags('cache')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cache',
    description: 'Clear all cached data',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache cleared successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cache cleared successfully' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  clearCache(): { message: string; timestamp: string } {
    return this.eprelService.clearCache();
  }
}
