import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateInfraccionDto } from './create-infraccion.dto';

export class UpdateInfraccionDto extends PartialType(CreateInfraccionDto) {
  // para activar o desactivar la infraccion (V/F)
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
