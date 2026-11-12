import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO para registrar un tipo de medida socioeducativa no privativa de libertad (CONA)
export class CreateMedidaSocioeducativaDto {
  // Nombre formal de la medida socioeducativa segun el CONA
  @ApiProperty({
    description: 'Nombre de la medida socioeducativa (ej. Servicio a la comunidad)',
    example: 'Servicio a la comunidad',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombre: string;

  // Duracion sugerida en meses para el cumplimiento de la medida
  @ApiPropertyOptional({
    description: 'Duracion estimada en meses (>=1)',
    example: 6,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  duracion_meses?: number;
}
