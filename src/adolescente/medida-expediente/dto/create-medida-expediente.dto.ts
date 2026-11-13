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

export class CreateMedidaExpedienteDto {
  @ApiProperty({
    description: 'ID del expediente judicial al que se asigna la medida',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  expe_id: number;

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

  @ApiProperty({
    description: 'Fecha de inicio dispuesta judicialmente (YYYY-MM-DD)',
    example: '2026-03-01',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    description: 'Fecha de finalización o cumplimiento (YYYY-MM-DD)',
    example: '2026-09-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

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

  @ApiProperty({
    description: 'Observaciones de avance o seguimiento',
    example: 'Adolescente asiste puntualmente a las sesiones semanales',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
