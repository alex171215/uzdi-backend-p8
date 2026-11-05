import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  ok: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Interceptor global para estandarizar todas las respuestas HTTP de la API UZDI
 * según las directrices institucionales y requerimientos del docente:
 * {
 *   "ok": true,
 *   "message": "Operación realizada correctamente",
 *   "data": { ... },
 *   "timestamp": "2026-11-05T..."
 * }
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((res) => {
        let message = 'Operación realizada correctamente';
        let data: any = res;

        if (res && typeof res === 'object') {
          // Si el servicio ya retornó un objeto estructurado { message, data }
          if ('message' in res && 'data' in res) {
            message = res.message;
            data = res.data;
          } else if ('message' in res && !Array.isArray(res)) {
            message = res.message;
            const { message: _m, ...rest } = res;
            data = Object.keys(rest).length > 0 ? rest : null;
          }
        }

        return {
          ok: true,
          message,
          data: data !== undefined ? data : null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

