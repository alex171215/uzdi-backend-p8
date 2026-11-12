import { OmitType, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMedidaExpedienteDto } from './create-medida-expediente.dto';

// DTO para actualizar una medida socioeducativa (no permite cambiar de expediente)
export class UpdateMedidaExpedienteDto extends PartialType(
  OmitType(CreateMedidaExpedienteDto, ['expe_id'] as const),
) {
  // Estado logico de la asignacion de la medida (V=activa, F=inactiva)
  @ApiPropertyOptional({ description: 'Estado logico de la medida', example: true })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
