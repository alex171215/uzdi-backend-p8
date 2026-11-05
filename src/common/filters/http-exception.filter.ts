import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * Filtro global de excepciones para estandarizar las respuestas de error
 * garantizando coherencia con el interceptor de respuestas exitosas:
 * {
 *   "ok": false,
 *   "statusCode": 400,
 *   "message": "...",
 *   "errors": [...],
 *   "path": "/api/v1/...",
 *   "timestamp": "2026-11-05T..."
 * }
 */
@Catch()
export class CustomHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, any>;
        message = resObj.message || exception.message || message;
        // Formateo específico para errores de validación de class-validator
        if (Array.isArray(resObj.message)) {
          errors = resObj.message;
          message = 'Error de validación en la solicitud';
        } else if (resObj.errors) {
          errors = resObj.errors;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Error no controlado: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      ok: false,
      statusCode: status,
      message,
      errors: errors || null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

