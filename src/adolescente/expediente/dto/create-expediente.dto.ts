import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Length,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ESTADOS_PROCESALES } from '../entities/expediente.entity';

export class CreateExpedienteDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  adlc_id: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  uzdi_id: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  infc_id: number;

  // numero de causa judicial, ej: EXP-2026-0042. Se guarda en mayusculas
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(1, 100)
  @Matches(/^[A-Z0-9][A-Z0-9\-./ ]*$/, {
    message:
      'numero_causa solo admite letras, dígitos, guiones, puntos, barras y espacios',
  })
  numero_causa?: string;

  @IsOptional()
  @IsString()
  @IsIn(ESTADOS_PROCESALES)
  estado_procesal?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
