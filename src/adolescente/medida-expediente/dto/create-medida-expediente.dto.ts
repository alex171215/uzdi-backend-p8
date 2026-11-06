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
  @IsInt()
  @Min(1)
  @Type(() => Number)
  expe_id: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  mdso_id: number;

  // orden de cumplimiento segun el CONA (1, 2, 3...)
  // si dos medidas tienen el mismo orden se cumplen al mismo tiempo
  @IsInt()
  @Min(1)
  @Type(() => Number)
  orden: number;

  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  @IsIn(ESTADOS_CUMPLIMIENTO)
  estado_cumplimiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
