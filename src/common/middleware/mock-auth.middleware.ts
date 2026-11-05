import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Rol } from '../enums/rol.enum';

@Injectable()
export class MockAuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      (req as Request & { user?: { id: number; rol: Rol } }).user = {
        id: 1,
        rol: Rol.ADMINISTRADOR,
      };
    }
    next();
  }
}
