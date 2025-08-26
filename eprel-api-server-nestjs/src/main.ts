import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS configuration
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:5173')
    .split(',');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('EPREL API Server')
    .setDescription('API server for EPREL smartphone comparison data')
    .setVersion('1.0.0')
    .addTag('eprel', 'EPREL smartphone data')
    .addTag('health', 'Health check endpoints')
    .addTag('cache', 'Cache management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  const port = configService.get<number>('PORT', 3002);

  await app.listen(port);

  console.log(`🚀 EPREL API Server démarré sur le port ${port}`);
  console.log(`📋 Documentation API: http://localhost:${port}/api/docs`);
  console.log(`❤️  Health check: http://localhost:${port}/health`);
  console.log(`🔑 API Key configurée: ${configService.get('EPREL_API_KEY') ? 'OUI' : 'NON'}`);
  console.log(`🌐 CORS autorisé pour: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch((error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
  process.exit(1);
});
