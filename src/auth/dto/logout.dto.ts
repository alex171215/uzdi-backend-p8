import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

/**
 * El logout cierra la sesión del propio token. `sesionId` se acepta solo por
 * compatibilidad con clientes antiguos y debe coincidir con la del token.
 * Para cerrar la sesión de otra persona: PATCH /sesion/:id/cerrar (ADM).
 */
export class LogoutDto {
  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt({ message: 'sesionId debe ser un número entero' })
  sesionId?: number;
}
