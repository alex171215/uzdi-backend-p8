import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
  Min,
  Matches,
  IsEmail,
} from 'class-validator';

export class CreateUzdiDto {
  @ApiProperty({
    description: 'ID del cantón donde se ubica la sede UZDI',
    example: 1,
  })
  @IsInt()
  @Min(1)
  cntn_id: number;

  @ApiProperty({
    description: 'Nombre descriptivo de la unidad zonal UZDI',
    example: 'UZDI Centro Norte Quito',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Matches(/^[\p{L}\p{M}\p{N} ./'-]+$/u)
  nombre: string;

  @ApiProperty({
    description: 'Zona administrativa o territorial',
    example: 'Zona 9 - DMQ',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M}\p{N} ./'-]+$/u)
  zona: string;

  @ApiProperty({
    description: 'Dirección física de la sede',
    example: 'Av. 10 de Agosto N25-32 y Colón',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  direccion?: string;

  @ApiProperty({
    description: 'Teléfono de contacto institucional',
    example: '022567890',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @Length(0, 20)
  @Matches(/^\+?[0-9 ()-]+$/)
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'uzdi.pichincha@snai.gob.ec',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  @IsEmail()
  correo?: string;
}
