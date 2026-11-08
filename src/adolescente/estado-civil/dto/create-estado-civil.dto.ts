import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstadoCivilDto {
  @ApiProperty({ example: 'Soltero', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nombre: string;
}
