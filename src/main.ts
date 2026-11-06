import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Configuración de OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sistema SNAI - UZDI API REST')
    .setDescription(
      'Documentación interactiva de la API REST para el Sistema de Gestión Integral UZDI (SNAI - PUCE). ' +
      'Permite consultar, registrar y probar endpoints operativos de Adolescentes, Expedientes, Medidas, ' +
      'Estructura Institucional, Contexto Familiar y Seguridad.',
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el token JWT en formato: Bearer <token>',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación y ciclo de vida de sesiones')
    .addTag('Adolescentes', 'Registro y gestión sociodemográfica de adolescentes')
    .addTag('Expedientes', 'Gestión procesal de causas judiciales')
    .addTag('Medidas Expediente', 'Asociación y control secuencial de medidas según el CONA')
    .addTag('Infracciones', 'Catálogo de infracciones tipificadas')
    .addTag('Medidas Socioeducativas', 'Catálogo de medidas socioeducativas no privativas de libertad')
    .addTag('Estructura Institucional', 'Gestión geográfica (Provincias, Cantones y UZDIs)')
    .addTag('Usuarios y Seguridad', 'Administración de usuarios, roles y auditoría')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'SNAI UZDI — API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor Backend UZDI ejecutándose en: http://localhost:${port}/api/v1`);
  console.log(`📖 Documentación Swagger interactiva lista en: http://localhost:${port}/api/docs`);
}
bootstrap();
