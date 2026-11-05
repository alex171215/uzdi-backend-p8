import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Rol } from '../enums/rol.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.rol) {
        throw new ForbiddenException('No tienes un rol asignado o no has iniciado sesión.');
    }

    const hasRole = requiredRoles.includes(user.rol);
    if (!hasRole) {
        throw new ForbiddenException(`Acceso denegado. Se requiere alguno de estos roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
