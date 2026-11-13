import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMedidaSocioeducativaDto } from './create-medida-socioeducativa.dto';

// DTO para actualizar los datos de una medida socioeducativa
export class UpdateMedidaSocioeducativaDto extends PartialType(
  CreateMedidaSocioeducativaDto,
) {
  // Estado logico de la medida (true=activa, false=inactiva)
  @ApiProperty({
    description: 'Estado activo/inactivo de la medida socioeducativa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
