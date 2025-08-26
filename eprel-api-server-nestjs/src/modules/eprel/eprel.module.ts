import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EprelController } from './eprel.controller';
import { EprelService } from './eprel.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  imports: [ConfigModule],
  controllers: [EprelController],
  providers: [EprelService, CacheService],
  exports: [EprelService],
})
export class EprelModule {}
