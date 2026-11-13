import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'ID del adolescente asociado al expediente judicial',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  adlc_id: number;

  @ApiProperty({
    description: 'ID de la sede UZDI responsable del seguimiento',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  uzdi_id: number;

  @ApiProperty({
    description: 'ID de la infracción tipificada en la causa',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  infc_id: number;

  // numero de causa judicial, ej: EXP-2026-0042. Se guarda en mayusculas
  @ApiProperty({
    description: 'Número de causa judicial (formato alfanumérico)',
    example: 'EXP-2026-0042',
    required: false,
    maxLength: 100,
  })
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

  @ApiProperty({
    description: 'Estado procesal actual del expediente',
    example: 'En proceso',
    enum: ESTADOS_PROCESALES,
    required: false,
    default: 'En proceso',
  })
  @IsOptional()
  @IsString()
  @IsIn(ESTADOS_PROCESALES)
  estado_procesal?: string;

  @ApiProperty({
    description: 'Observaciones procesales o institucionales adicionales',
    example: 'Expediente remitido por la Unidad Judicial de Familia, Mujer, Niñez y Adolescencia',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
