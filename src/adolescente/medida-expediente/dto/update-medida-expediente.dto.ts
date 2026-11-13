import { OmitType, PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMedidaExpedienteDto } from './create-medida-expediente.dto';

// DTO para actualizar una medida socioeducativa (no permite cambiar de expediente)
export class UpdateMedidaExpedienteDto extends PartialType(
  OmitType(CreateMedidaExpedienteDto, ['expe_id'] as const),
) {
  // Estado logico de la asignacion de la medida (true=activa, false=inactiva)
  @ApiProperty({
    description: 'Estado activo/inactivo de la medida en el expediente',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
