import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMedidaSocioeducativaDto } from './create-medida-socioeducativa.dto';

export class UpdateMedidaSocioeducativaDto extends PartialType(
  CreateMedidaSocioeducativaDto,
) {
  // para activar o desactivar la medida (V/F)
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
