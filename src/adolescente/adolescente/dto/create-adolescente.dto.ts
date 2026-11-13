import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsDateString,
  IsIn,
  IsInt,
  IsBoolean,
  Min,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateAdolescenteDto {
  @ApiProperty({
    description: 'Cédula de 10 dígitos o número de pasaporte',
    example: '1723456789',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Matches(/^(?:\d{10}|[A-Za-z0-9]{6,20})$/, {
    message:
      'cedula debe ser una cédula de 10 dígitos o un pasaporte alfanumérico de 6 a 20 caracteres',
  })
  cedula: string;

  @ApiProperty({
    description: 'Nombres del adolescente',
    example: 'Carlos Andrés',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nombre: string;

  @ApiProperty({
    description: 'Apellidos del adolescente',
    example: 'Pérez Gómez',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  apellido: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (formato ISO: YYYY-MM-DD)',
    example: '2008-05-14',
  })
  @IsDateString()
  fecha_nac: string;

  @ApiProperty({
    description: 'Sexo biológico registrado',
    example: 'M',
    enum: ['M', 'F', 'O'],
  })
  @IsString()
  @IsIn(['M', 'F', 'O'])
  sexo: string;

  @ApiProperty({
    description: 'Nivel educativo actual o alcanzado',
    example: 'Educación General Básica Superior',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nved_nombre?: string;

  @ApiProperty({
    description: 'Número de hijos que tiene el adolescente',
    example: 0,
    required: false,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  hijos?: number;

  @ApiProperty({
    description: 'Indica si es reincidente en el sistema de justicia juvenil',
    example: false,
    required: false,
    default: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  reincide?: boolean;

  @ApiProperty({
    description: 'Fecha de ingreso al programa UZDI (YYYY-MM-DD)',
    example: '2026-02-01',
  })
  @IsDateString()
  fecha_ingr: string;

  @ApiProperty({
    description: 'Indica si es hijo/a de una Persona Privada de la Libertad (PPL)',
    example: false,
    required: false,
    default: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  hijoPpl?: boolean;

  @ApiProperty({
    description: 'Observaciones generales del adolescente',
    example: 'Adolescente reside con abuela materna',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  observaciones?: string;

  // --- FKs a catálogos ---
  @ApiProperty({ description: 'ID de la nacionalidad catalogada', example: 1 })
  @IsInt()
  @Min(1)
  nacn_id: number;

  @ApiProperty({ description: 'ID del estado civil catalogado', example: 1 })
  @IsInt()
  @Min(1)
  etcv_id: number;

  @ApiProperty({ description: 'ID de la etnia o autoidentificación cultural', example: 1 })
  @IsInt()
  @Min(1)
  etna_id: number;

  @ApiProperty({ description: 'ID del cantón de residencia del adolescente', example: 1 })
  @IsInt()
  @Min(1)
  cntn_id: number;

  @ApiProperty({
    description: 'ID del Grupo Delictivo Organizado (GDO) al que se vincula (si aplica)',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  gdo_id?: number;
}
