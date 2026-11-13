import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedidaSocioeducativaDto {
  @ApiProperty({
    description: 'Nombre de la medida socioeducativa según el Código de la Niñez',
    example: 'Amonestación e imposición de reglas de conducta',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombre: string;

  @ApiProperty({
    description: 'Duración referencial en meses',
    example: 6,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  duracion_meses?: number;
}
