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

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || (!user.rol && !user.rol_codigo)) {
      throw new ForbiddenException('No tienes un rol asignado o no has iniciado sesión.');
    }

    const userRole = (user.rol || '').toString().toLowerCase();
    const userRoleCode = (user.rol_codigo || '').toString().toLowerCase();

    // Perfiles con privilegios de administración tienen acceso transversal
    if (
      userRole === 'administrador' ||
      userRole === 'superadministrador' ||
      userRoleCode === 'adm'
    ) {
      return true;
    }

    const hasRole = requiredRoles.some((r) => {
      const rStr = r.toString().toLowerCase();
      return rStr === userRole || rStr === userRoleCode;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere alguno de estos roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
