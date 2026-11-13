import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Rol } from '../enums/rol.enum';
import type { UsuarioToken } from '../decorators/usuario-actual.decorator';
import { RbacService } from '../../seguridad/rbac/rbac.service';
import { ACCION_KEY } from '../../seguridad/rbac/requiere-accion.decorator';

/** Equivalencia entre el enum `Rol` usado en los controladores y prfl.prflcdgo de la BD. */
export const ROL_A_PERFIL: Record<Rol, string> = {
  [Rol.ADMINISTRADOR]: 'ADM',
  [Rol.SUPERADMINISTRADOR]: 'ADM',
  [Rol.COORDINADOR]: 'CORD',
  [Rol.JURIDICO]: 'LEGAL',
  [Rol.JUEZ]: 'JUEZ',
  [Rol.TRABAJADOR_SOCIAL]: 'TSOC',
  [Rol.PSICOLOGO]: 'PSIC',
  [Rol.EDUCADOR]: 'EDUC',
  [Rol.USUARIO]: 'CONS',
  [Rol.JUEZ]: 'JUEZ',
};

const OPERACION_POR_METODO: Record<string, string> = {
  GET: 'consultar',
  HEAD: 'consultar',
  POST: 'crear',
  PUT: 'actualizar',
  PATCH: 'actualizar',
  DELETE: 'eliminar',
};

/** Perfil con acceso transversal (superusuario). */
const PERFIL_ADMIN = 'ADM';
interface PeticionAutenticada {
  method: string;
  user?: Partial<UsuarioToken>;
  rbacEvaluado?: boolean;
}

/**
 * Tarea 5.3 — Autorización dinámica RBAC contra la base de datos.
 *
 * Orden de evaluación (después de JwtAuthGuard):
 *  1. Rutas @Public() pasan.
 *  2. La sesión del token (sesion_id) debe seguir abierta en seguridad.sesn y el
 *     usuario activo → si no, 401. Así el logout invalida el token al instante.
 *  3. El perfil ADM tiene acceso total.
 *  4. Se obtiene la acción del endpoint: @RequiereAccion('x.y') o, si no hay,
 *     `<controlador>.<operación>` (ej. GET /adolescente → adolescente.consultar).
 *  5. Si la acción está registrada en seguridad.accn → se exige que el perfil del
 *     token la tenga en seguridad.prms (consulta en tiempo real, caché 60 s).
 *  6. Si no está registrada → se usa @Roles(...) del controlador como respaldo.
 *  7. Sin acción registrada ni @Roles → basta con estar autenticado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbac: RbacService,
  ) {}

  private accionDelEndpoint(
    context: ExecutionContext,
    metodo: string,
  ): string | null {
    const explicita = this.reflector.getAllAndOverride<string>(ACCION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (explicita) return explicita;

    const ruta: unknown = Reflect.getMetadata(
      PATH_METADATA,
      context.getClass(),
    );
    const base: unknown = Array.isArray(ruta) ? ruta[0] : ruta;
    const recurso =
      typeof base === 'string'
        ? base.replace(/^\/+|\/+$/g, '').split('/')[0]
        : undefined;
    const operacion = OPERACION_POR_METODO[metodo.toUpperCase()];
    return recurso && operacion ? `${recurso}.${operacion}` : null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const request = context.switchToHttp().getRequest<PeticionAutenticada>();

    // El guard es global y además algunos controladores lo declaran con @UseGuards:
    // se evalúa una sola vez por petición.
    if (request.rbacEvaluado) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const user = request.user;
    if (!user?.sub) {
      throw new UnauthorizedException('No has iniciado sesión.');
    }

    // 2. Sesión vigente
    const sesionId = Number(user.sesion_id);
    if (
      !sesionId ||
      !(await this.rbac.sesionVigente(sesionId, Number(user.sub)))
    ) {
      throw new UnauthorizedException(
        'La sesión fue cerrada o el usuario está inactivo. Inicie sesión nuevamente.',
      );
    }

    const codigoPerfil = String(user.rol_codigo ?? '').toUpperCase();

    // 3. Superusuario
    if (codigoPerfil === PERFIL_ADMIN) {
      request.rbacEvaluado = true;
      return true;
    }

    // 4–5. Matriz RBAC en BD
    const accion = this.accionDelEndpoint(context, request.method);
    if (accion && (await this.rbac.accionRegistrada(accion))) {
      if (!(await this.rbac.perfilTieneAccion(Number(user.prfl_id), accion))) {
        throw new ForbiddenException(
          `Acceso denegado: el perfil ${codigoPerfil || 'sin perfil'} no tiene habilitada la acción "${accion}".`,
        );
      }
      request.rbacEvaluado = true;
      return true;
    }

    // 6. Respaldo: @Roles del controlador
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles?.length) {
      const permitido = requiredRoles.some(
        (r) => ROL_A_PERFIL[r] === codigoPerfil,
      );
      if (!permitido) {
        throw new ForbiddenException(
          `Acceso denegado. Se requiere alguno de estos perfiles: ${[
            ...new Set(requiredRoles.map((r) => ROL_A_PERFIL[r] ?? r)),
          ].join(', ')}`,
        );
      }
    }

    request.rbacEvaluado = true;
    return true;
  }
}
