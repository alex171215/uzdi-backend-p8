import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Payload del JWT emitido en /auth/login. */
export interface UsuarioToken {
  sub: number;
  username: string;
  email?: string;
  prfl_id: number;
  rol: string;
  rol_codigo: string;
  sesion_id: number;
}

/** Inyecta en el controlador el usuario autenticado (payload del JWT). */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken =>
    ctx.switchToHttp().getRequest<{ user: UsuarioToken }>().user,
);
