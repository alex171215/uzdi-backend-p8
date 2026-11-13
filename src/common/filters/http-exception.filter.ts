import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

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
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
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
    } else if (exception instanceof QueryFailedError) {
      // Errores de PostgreSQL traducidos a mensajes claros para el frontend
      const pg = exception.driverError as {
        code?: string;
        detail?: string;
        column?: string;
      };
      const campo = /\(([^)]+)\)=\(([^)]*)\)/.exec(pg.detail ?? '');
      switch (pg.code) {
        case '23505': // unique_violation
          status = HttpStatus.CONFLICT;
          message = campo
            ? `Ya existe un registro con ${campo[1]} = "${campo[2]}"`
            : 'El registro ya existe (valor duplicado)';
          break;
        case '23503': // foreign_key_violation
          status = HttpStatus.CONFLICT;
          message = /is still referenced/.test(pg.detail ?? '')
            ? 'No se puede eliminar: el registro está siendo usado por otros datos'
            : campo
              ? `El registro relacionado no existe: ${campo[1]} = ${campo[2]}`
              : 'El registro relacionado no existe';
          break;
        case '23502': // not_null_violation
          status = HttpStatus.BAD_REQUEST;
          message = `El campo ${pg.column ?? ''} es obligatorio`.trim();
          break;
        case '23514': // check_violation
        case '22P02': // invalid_text_representation
        case '22001': // string_data_right_truncation
        case '22007': // invalid_datetime_format
        case '22008': // datetime_field_overflow
          status = HttpStatus.BAD_REQUEST;
          message =
            'Uno de los valores enviados no es válido para la base de datos';
          break;
        default:
          this.logger.error(
            `Error de base de datos: ${exception.message}`,
            exception.stack,
          );
          message = 'Error interno de base de datos';
      }
      if (status !== HttpStatus.INTERNAL_SERVER_ERROR && pg.detail)
        errors = [pg.detail];
    } else if (exception instanceof Error) {
      this.logger.error(
        `Error no controlado: ${exception.message}`,
        exception.stack,
      );
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
