import {
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ESTADOS_CUMPLIMIENTO } from '../entities/medida-expediente.entity';

// DTO para asignar una medida socioeducativa a un expediente judicial
export class CreateMedidaExpedienteDto {
  // Clave foranea del expediente judicial contenedor
  @ApiProperty({ description: 'ID del expediente judicial', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  expe_id: number;

  // Clave foranea del tipo de medida socioeducativa
  @ApiProperty({ description: 'ID del tipo de medida socioeducativa', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  mdso_id: number;

  // Orden secuencial de la medida segun el CONA (mismo orden = simultaneas, distinto = sucesivas)
  @ApiProperty({ description: 'Orden secuencial de ejecucion segun CONA (>=1)', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  orden: number;

  // Fecha de inicio de aplicacion de la medida socioeducativa
  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)', example: '2026-03-01' })
  @IsDateString()
  fecha_inicio: string;

  // Fecha estimada o real de finalizacion de la medida
  @ApiPropertyOptional({ description: 'Fecha de fin (YYYY-MM-DD)', example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  // Estado del cumplimiento de la medida socioeducativa
  @ApiPropertyOptional({
    description: 'Estado de cumplimiento de la medida',
    enum: ESTADOS_CUMPLIMIENTO,
    example: 'En proceso',
  })
  @IsOptional()
  @IsString()
  @IsIn(ESTADOS_CUMPLIMIENTO)
  estado_cumplimiento?: string;

  // Observaciones sobre la ejecucion y seguimiento de la medida
  @ApiPropertyOptional({
    description: 'Observaciones de la medida',
    example: 'Asignado a programa de orientacion y apoyo familiar',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
