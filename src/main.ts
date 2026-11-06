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
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman, curl, Swagger o apps móviles)
      if (!origin) return callback(null, true);

      // Permitir localhost, 127.0.0.1, y cualquier IP de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const allowedPatterns = [
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
        /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/,
      ];

      const isAllowed =
        allowedPatterns.some((pattern) => pattern.test(origin)) ||
        (process.env.CORS_ORIGIN &&
          (process.env.CORS_ORIGIN === '*' ||
            process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).includes(origin)));

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Bloqueado por política de CORS UZDI'), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-usuario-id', 'x-user-id'],
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
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor Backend UZDI ejecutándose en: http://localhost:${port}/api/v1`);
  console.log(`🌐 Acceso en red local disponible en: http://0.0.0.0:${port}/api/v1`);
  console.log(`📖 Documentación Swagger interactiva lista en: http://localhost:${port}/api/docs`);
}
bootstrap();
