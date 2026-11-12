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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ESTADOS_PROCESALES } from '../entities/expediente.entity';

// DTO para registrar un nuevo expediente judicial en el sistema
export class CreateExpedienteDto {
  // Clave foranea que relaciona el expediente con el adolescente
  @ApiProperty({ description: 'ID del adolescente infractor', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  adlc_id: number;

  // Clave foranea que indica la sede UZDI asignada
  @ApiProperty({ description: 'ID de la sede UZDI responsable', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  uzdi_id: number;

  // Clave foranea que tipifica el delito o infraccion cometida
  @ApiProperty({ description: 'ID de la infraccion tipificada', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  infc_id: number;

  // Numero institucional de la causa judicial segun juzgado
  @ApiPropertyOptional({
    description: 'Numero de causa judicial unico',
    example: 'EXP-2026-0042',
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

  // Estado legal del proceso judicial del menor
  @ApiPropertyOptional({
    description: 'Estado procesal de la causa',
    enum: ESTADOS_PROCESALES,
    example: 'En proceso',
  })
  @IsOptional()
  @IsString()
  @IsIn(ESTADOS_PROCESALES)
  estado_procesal?: string;

  // Notas u observaciones adicionales sobre el proceso
  @ApiPropertyOptional({
    description: 'Observaciones procesales del expediente',
    example: 'Causa derivada desde la Unidad Judicial Especializada',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
