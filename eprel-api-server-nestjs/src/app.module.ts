import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EprelModule } from './modules/eprel/eprel.module';
import { configurationLoader } from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurationLoader],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
            limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
          },
        ],
      }),
    }),

    // Feature modules
    EprelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
