import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMedidaSocioeducativaDto } from './create-medida-socioeducativa.dto';

// DTO para actualizar los datos de una medida socioeducativa
export class UpdateMedidaSocioeducativaDto extends PartialType(
  CreateMedidaSocioeducativaDto,
) {
  // Estado logico de la medida (V=activa, F=inactiva)
  @ApiPropertyOptional({ description: 'Estado logico de la medida', example: true })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
