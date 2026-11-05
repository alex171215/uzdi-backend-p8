import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import { ResponseTransformInterceptor } from './common/interceptors/transform.interceptor';
import { CustomHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-usuario-id', 'x-user-id'],
    credentials: true,
  });

  // Configurar prefijo global para versionamiento
  app.setGlobalPrefix('api/v1');

  // Interceptor global para unificar respuestas HTTP ({ ok: true, message, data })
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Manejador global de excepciones para respuestas de error unificadas ({ ok: false, ... })
  app.useGlobalFilters(new CustomHttpExceptionFilter());

  // Capa de sanitización separada (DOMPurify)
  app.useGlobalPipes(new SanitizationPipe());

  // Capa de validación declarativa con DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor Backend UZDI ejecutándose en: http://localhost:${port}/api/v1`);
}
bootstrap();
