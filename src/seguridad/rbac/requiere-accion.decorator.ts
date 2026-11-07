import { SetMetadata } from '@nestjs/common';

export const ACCION_KEY = 'rbac:accion';

/**
 * Declara explícitamente la acción de seguridad.accn que exige un endpoint.
 * Si no se usa, el guard la deduce de la ruta: `<controlador>.<operación>`
 * (GET → consultar, POST → crear, PUT/PATCH → actualizar, DELETE → eliminar).
 *
 * @example @RequiereAccion('reportes.exportar')
 */
export const RequiereAccion = (accion: string) =>
  SetMetadata(ACCION_KEY, accion);
