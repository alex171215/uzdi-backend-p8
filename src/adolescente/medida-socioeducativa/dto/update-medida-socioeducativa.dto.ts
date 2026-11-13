import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMedidaSocioeducativaDto } from './create-medida-socioeducativa.dto';

export class UpdateMedidaSocioeducativaDto extends PartialType(
  CreateMedidaSocioeducativaDto,
) {
  @ApiProperty({
    description: 'Estado activo/inactivo de la medida socioeducativa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
