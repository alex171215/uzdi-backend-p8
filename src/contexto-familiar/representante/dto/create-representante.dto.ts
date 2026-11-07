import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRepresentanteDto {
  @ApiProperty({ example: 1, description: 'Identificador del cantón de residencia' })
  @IsNotEmpty({ message: 'El cantón es obligatorio' })
  @IsInt({ message: 'El id de cantón debe ser un número entero' })
  @Min(1, { message: 'El id de cantón debe ser mayor a 0' })
  cntn_id: number;

  @ApiProperty({ example: 'María Elena', description: 'Nombres del representante legal' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'López Morales', description: 'Apellidos del representante legal' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido: string;

  @ApiProperty({ example: '1801234567', description: 'Cédula o documento de identidad' })
  @IsNotEmpty({ message: 'La cédula es obligatoria' })
  @IsString({ message: 'La cédula debe ser una cadena de texto' })
  @MaxLength(20, { message: 'La cédula no puede exceder 20 caracteres' })
  cedula: string;

  @ApiProperty({
    example: '0991234567',
    description: 'Teléfono de contacto',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono?: string;

  @ApiProperty({
    example: 'Av. Cevallos y Montalvo',
    description: 'Dirección domiciliaria',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  direccion?: string;
}
