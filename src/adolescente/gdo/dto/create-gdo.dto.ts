import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGdoDto {
  @ApiProperty({ example: 'Grupo de referencia 1', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Matches(/^[\p{L}\p{M}\p{N} ./'-]+$/u)
  nombre: string;
}
