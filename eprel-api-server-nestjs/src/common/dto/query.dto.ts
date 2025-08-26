import { IsOptional, IsString, IsInt, Min, Max, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items to return',
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of items to skip',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class SmartphonesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter smartphones by brand name',
    example: 'MEIZU',
  })
  @IsOptional()
  @IsString()
  brand?: string;
}

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query (minimum 2 characters)',
    example: 'iPhone',
    minLength: 2,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  query: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SmartphoneParamsDto {
  @ApiProperty({
    description: 'Smartphone model identifier',
    example: 'M512H',
  })
  @IsNotEmpty()
  @IsString()
  id: string;
}
