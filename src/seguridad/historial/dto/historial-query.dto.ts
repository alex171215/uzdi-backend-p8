import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class HistorialQueryDto {
  @ApiPropertyOptional({ example: 'seguridad.prsn' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tabla?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  registro_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Usuario que hizo el cambio',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usuario_id?: number;

  @ApiPropertyOptional({ enum: ['INSERT', 'UPDATE', 'DELETE'] })
  @IsOptional()
  @IsIn(['INSERT', 'UPDATE', 'DELETE'])
  accion?: string;

  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsOptional()
  @IsDateString({}, { message: 'desde debe ser una fecha ISO (AAAA-MM-DD)' })
  desde?: string;

  @ApiPropertyOptional({ example: '2026-11-30' })
  @IsOptional()
  @IsDateString({}, { message: 'hasta debe ser una fecha ISO (AAAA-MM-DD)' })
  hasta?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({ example: 50, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limite?: number;
}
