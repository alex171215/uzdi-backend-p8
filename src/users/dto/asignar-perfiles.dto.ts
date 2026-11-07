import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class AsignarPerfilesDto {
  @ApiProperty({
    example: [3, 7],
    description: 'prfl_id de los perfiles que tendrá el usuario',
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'El usuario debe tener al menos un perfil institucional',
  })
  @ArrayMaxSize(20)
  @IsInt({ each: true, message: 'Cada prfl_id debe ser un entero' })
  @Min(1, { each: true })
  perfiles_ids: number[];
}
