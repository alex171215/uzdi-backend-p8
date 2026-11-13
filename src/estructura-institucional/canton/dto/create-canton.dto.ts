import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateCantonDto {
  @ApiProperty({
    description: 'ID de la provincia a la que pertenece el cantón',
    example: 1,
  })
  @IsInt()
  @Min(1)
  prov_id: number;

  @ApiProperty({
    description: 'Nombre oficial del cantón',
    example: 'Quito',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nombre: string;
}
