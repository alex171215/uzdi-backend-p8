import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTallerDto {
  @ApiProperty({ example: 1, description: 'ID de la sede UZDI organizadora' })
  @IsNotEmpty({ message: 'El id de la sede UZDI es obligatorio' })
  @IsInt({ message: 'El id de UZDI debe ser un número entero' })
  @Min(1, { message: 'El id de UZDI debe ser mayor a 0' })
  uzdi_id: number;

  @ApiProperty({ example: 1, description: 'ID del profesional responsable del taller' })
  @IsNotEmpty({ message: 'El id del profesional responsable es obligatorio' })
  @IsInt({ message: 'El id del responsable debe ser un número entero' })
  @Min(1, { message: 'El id del responsable debe ser mayor a 0' })
  prsn_id: number;

  @ApiProperty({
    example: 'Taller de Habilidades para la Vida',
    description: 'Nombre del taller formativo',
  })
  @IsNotEmpty({ message: 'El nombre del taller es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  nombre: string;

  @ApiProperty({
    example: 'Manejo del Estrés y Resolución Asertiva',
    description: 'Tema central de la sesión',
  })
  @IsNotEmpty({ message: 'El tema del taller es obligatorio' })
  @IsString({ message: 'El tema debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El tema no puede exceder 255 caracteres' })
  tema: string;

  @ApiProperty({
    example: 'Desarrollar capacidades socioemocionales de afrontamiento',
    description: 'Objetivo pedagógico o terapéutico del taller',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El objetivo debe ser una cadena de texto' })
  objetivo?: string;

  @ApiProperty({ example: '2026-03-15', description: 'Fecha de impartición (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha: string;

  @ApiProperty({ example: '09:00:00', description: 'Hora de inicio (HH:MM o HH:MM:SS)' })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString({ message: 'La hora de inicio debe ser una cadena de texto' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'La hora de inicio debe tener formato HH:MM o HH:MM:SS',
  })
  hora_inicio: string;

  @ApiProperty({ example: '11:00:00', description: 'Hora de finalización (HH:MM o HH:MM:SS)' })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @IsString({ message: 'La hora de fin debe ser una cadena de texto' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'La hora de fin debe tener formato HH:MM o HH:MM:SS',
  })
  hora_fin: string;

  @ApiProperty({
    example: 'Auditorio Principal UZDI Ambato',
    description: 'Lugar o espacio físico de ejecución',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El lugar debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El lugar no puede exceder 255 caracteres' })
  lugar?: string;

  @ApiProperty({
    example: 'Se contó con la presencia de observadores pedagógicos',
    description: 'Observaciones generales del taller',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}
