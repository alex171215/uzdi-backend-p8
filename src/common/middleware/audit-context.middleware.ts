import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

export interface AuthenticatedRequest extends Request {
  user?: {
    id?: number;
    rol?: string;
    [key: string]: any;
  };
  usuarioId?: number;
}

/**
 * Middleware para la captura e inyección del contexto de auditoría (usuario autenticado)
 * hacia la base de datos PostgreSQL, garantizando que la variable de sesión
 * `app.usuario_id` esté disponible para los triggers de `seguridad.historial`.
 */
@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    // 1. Extraer identificador de usuario desde el token JWT, headers o fallback administrativo en desarrollo
    const headerUserId = req.headers['x-usuario-id'] || req.headers['x-user-id'];
    const userId = headerUserId ? Number(headerUserId) : (req.user?.id ?? 1);
    
    req.usuarioId = userId;

    // 2. Propagar la variable de sesión local a PostgreSQL si el pool de conexiones está listo
    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.query(`SET app.usuario_id = '${userId}'`);
      }
    } catch {
      // No interrumpe el flujo si la conexión aún está inicializándose
    }

    next();
  }
}

