import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { auditContextStorage } from '../context/audit-context.storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id?: number;
    sub?: number;
    rol?: string;
    [key: string]: any;
  };
  usuarioId?: number;
}

/**
 * Middleware para la captura e inyección del contexto de auditoría.
 * Extrae el ID real del usuario desde el JWT autenticado de forma estricta.
 * Bloquea cualquier intento de suplantación mediante cabeceras externas (x-usuario-id).
 */
@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    // 1. Prevenir suplantación: eliminar cualquier cabecera x-usuario-id / x-user-id enviada por el cliente
    delete req.headers['x-usuario-id'];
    delete req.headers['x-user-id'];

    let userId: number | undefined;

    // 2. Extraer y verificar el usuario real directamente desde el token JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = this.jwtService.verify(token) as { sub?: number; id?: number };
        if (payload) {
          const rawId = payload.sub ?? payload.id;
          if (rawId && Number.isInteger(Number(rawId)) && Number(rawId) > 0) {
            userId = Number(rawId);
          }
        }
      } catch {
        // Token inválido, expirado o con firma no válida
      }
    }

    // Fallback: si req.user ya fue establecido previamente (ej. pruebas unitarias)
    if (!userId && req.user) {
      const fallbackId = req.user.sub ?? req.user.id;
      if (fallbackId && Number.isInteger(Number(fallbackId)) && Number(fallbackId) > 0) {
        userId = Number(fallbackId);
      }
    }

    req.usuarioId = userId;

    // 3. Propagar la variable de sesión a PostgreSQL en caso de que esté inicializado
    if (userId && this.dataSource && this.dataSource.isInitialized) {
      try {
        await this.dataSource.query('SELECT set_config($1, $2, false)', [
          'app.usuario_id',
          String(userId),
        ]);
      } catch {
        // Silencioso si la conexión no está lista
      }
    }

    // 4. Envolver la ejecución en AsyncLocalStorage para que AuditSubscriber capture
    // exactamente la conexión transaccional de TypeORM en cada INSERT/UPDATE/DELETE
    if (userId) {
      auditContextStorage.run(userId, () => next());
    } else {
      next();
    }
  }
}
