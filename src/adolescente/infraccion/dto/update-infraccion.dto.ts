import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateInfraccionDto } from './create-infraccion.dto';

export class UpdateInfraccionDto extends PartialType(CreateInfraccionDto) {
  @ApiProperty({ description: 'Estado activo/inactivo de la infracción', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
