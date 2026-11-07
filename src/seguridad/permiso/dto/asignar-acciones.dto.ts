import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class AsignarAccionesDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Lista de accn_id a habilitar para el perfil',
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe enviar al menos una acción' })
  @ArrayMaxSize(500)
  @IsInt({ each: true, message: 'Cada accn_id debe ser un entero' })
  @Min(1, { each: true })
  accn_ids: number[];
}
