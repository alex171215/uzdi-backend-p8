import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateInfraccionDto } from './create-infraccion.dto';

// DTO para actualizar los datos de una infraccion tipificada
export class UpdateInfraccionDto extends PartialType(CreateInfraccionDto) {
  // Estado logico de la infraccion (true=activa, false=inactiva)
  @ApiProperty({ description: 'Estado activo/inactivo de la infracción', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
