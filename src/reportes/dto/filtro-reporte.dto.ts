import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FiltroReporteDto {
  @ApiPropertyOptional({ description: 'ID de la sede UZDI para filtrar', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  uzdi_id?: number;

  @ApiPropertyOptional({ description: 'ID de la provincia', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  prov_id?: number;

  @ApiPropertyOptional({ description: 'ID del cantón', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cntn_id?: number;

  @ApiPropertyOptional({
    description: 'Estado procesal del expediente',
    example: 'En proceso',
    enum: ['En proceso', 'Atraso', 'Incomparecencia', 'Concluido', 'Archivado'],
  })
  @IsOptional()
  @IsString()
  estado_procesal?: string;
}
