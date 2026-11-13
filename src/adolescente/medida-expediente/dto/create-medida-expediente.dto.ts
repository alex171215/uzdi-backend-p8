import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ESTADOS_CUMPLIMIENTO } from '../entities/medida-expediente.entity';

// DTO para asignar una medida socioeducativa a un expediente judicial
export class CreateMedidaExpedienteDto {
  // Clave foranea del expediente judicial contenedor
  @ApiProperty({
    description: 'ID del expediente judicial al que se asigna la medida',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  expe_id: number;

  // Clave foranea del tipo de medida socioeducativa
  @ApiProperty({
    description: 'ID del catálogo de medidas socioeducativas',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  mdso_id: number;

  // orden de cumplimiento segun el CONA (1, 2, 3...)
  // si dos medidas tienen el mismo orden se cumplen al mismo tiempo
  @ApiProperty({
    description: 'Orden de cumplimiento secuencial o simultáneo (1, 2, ...)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  orden: number;

  // Fecha de inicio de aplicacion de la medida socioeducativa
  @ApiProperty({
    description: 'Fecha de inicio dispuesta judicialmente (YYYY-MM-DD)',
    example: '2026-03-01',
  })
  @IsDateString()
  fecha_inicio: string;

  // Fecha estimada o real de finalizacion de la medida
  @ApiProperty({
    description: 'Fecha de finalización o cumplimiento (YYYY-MM-DD)',
    example: '2026-09-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  // Estado del cumplimiento de la medida socioeducativa
  @ApiProperty({
    description: 'Estado de cumplimiento de la medida',
    example: 'Cumpliendo',
    enum: ESTADOS_CUMPLIMIENTO,
    required: false,
    default: 'Cumpliendo',
  })
  @IsOptional()
  @IsString()
  @IsIn(ESTADOS_CUMPLIMIENTO)
  estado_cumplimiento?: string;

  // Observaciones sobre la ejecucion y seguimiento de la medida
  @ApiProperty({
    description: 'Observaciones de avance o seguimiento',
    example: 'Adolescente asiste puntualmente a las sesiones semanales',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
