import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { RolesGuard } from './roles.guard';
import { RbacService } from '../../seguridad/rbac/rbac.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ACCION_KEY } from '../../seguridad/rbac/requiere-accion.decorator';
import { Rol } from '../enums/rol.enum';

class AdolescenteController {}
Reflect.defineMetadata(PATH_METADATA, 'adolescente', AdolescenteController);

const handler = () => undefined;

function contexto(
  method: string,
  user: Record<string, unknown> | undefined,
  meta: Record<string, unknown> = {},
) {
  for (const k of [ROLES_KEY, IS_PUBLIC_KEY, ACCION_KEY])
    Reflect.deleteMetadata(k, handler);
  for (const [k, v] of Object.entries(meta))
    Reflect.defineMetadata(k, v, handler);
  const request = { method, user };
  return {
    getType: () => 'http',
    getHandler: () => handler,
    getClass: () => AdolescenteController,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard (RBAC dinámico contra seguridad.prms)', () => {
  const tsoc = { sub: 5, prfl_id: 4, rol_codigo: 'TSOC', sesion_id: 9 };
  let rbac: jest.Mocked<
    Pick<
      RbacService,
      'sesionVigente' | 'accionRegistrada' | 'perfilTieneAccion'
    >
  >;
  let guard: RolesGuard;

  beforeEach(() => {
    rbac = {
      sesionVigente: jest.fn().mockResolvedValue(true),
      accionRegistrada: jest.fn().mockResolvedValue(true),
      perfilTieneAccion: jest.fn().mockResolvedValue(true),
    };
    guard = new RolesGuard(new Reflector(), rbac as unknown as RbacService);
  });

  it('deja pasar rutas @Public sin consultar la BD', async () => {
    await expect(
      guard.canActivate(contexto('POST', undefined, { [IS_PUBLIC_KEY]: true })),
    ).resolves.toBe(true);
    expect(rbac.sesionVigente).not.toHaveBeenCalled();
  });

  it('rechaza con 401 si la sesión del token fue cerrada (logout)', async () => {
    rbac.sesionVigente.mockResolvedValue(false);
    await expect(
      guard.canActivate(contexto('GET', tsoc)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deduce la acción de la ruta: GET /adolescente → adolescente.consultar', async () => {
    await guard.canActivate(contexto('GET', tsoc));
    expect(rbac.perfilTieneAccion).toHaveBeenCalledWith(
      4,
      'adolescente.consultar',
    );
  });

  it('DELETE sin permiso en seguridad.prms → 403', async () => {
    rbac.perfilTieneAccion.mockResolvedValue(false);
    await expect(
      guard.canActivate(contexto('DELETE', tsoc)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(rbac.perfilTieneAccion).toHaveBeenCalledWith(
      4,
      'adolescente.eliminar',
    );
  });

  it('respeta @RequiereAccion explícita', async () => {
    await guard.canActivate(
      contexto('GET', tsoc, { [ACCION_KEY]: 'reportes.exportar' }),
    );
    expect(rbac.perfilTieneAccion).toHaveBeenCalledWith(4, 'reportes.exportar');
  });

  it('ADM tiene acceso transversal', async () => {
    rbac.perfilTieneAccion.mockResolvedValue(false);
    const adm = { sub: 1, prfl_id: 1, rol_codigo: 'ADM', sesion_id: 1 };
    await expect(guard.canActivate(contexto('DELETE', adm))).resolves.toBe(
      true,
    );
  });

  it('si la acción no está en seguridad.accn usa @Roles mapeado a códigos de perfil', async () => {
    rbac.accionRegistrada.mockResolvedValue(false);
    await expect(
      guard.canActivate(
        contexto('POST', tsoc, { [ROLES_KEY]: [Rol.TRABAJADOR_SOCIAL] }),
      ),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(
        contexto('POST', tsoc, { [ROLES_KEY]: [Rol.JURIDICO] }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
