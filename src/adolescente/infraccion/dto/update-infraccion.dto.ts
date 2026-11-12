import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateInfraccionDto } from './create-infraccion.dto';

// DTO para actualizar los datos de una infraccion tipificada
export class UpdateInfraccionDto extends PartialType(CreateInfraccionDto) {
  // Estado logico de la infraccion (V=activa, F=inactiva)
  @ApiPropertyOptional({ description: 'Estado logico de la infraccion', example: true })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
