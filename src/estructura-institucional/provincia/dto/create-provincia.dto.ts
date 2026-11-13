import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateProvinciaDto {
  @ApiProperty({
    description: 'Nombre oficial de la provincia',
    example: 'Pichincha',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nombre: string;
}
