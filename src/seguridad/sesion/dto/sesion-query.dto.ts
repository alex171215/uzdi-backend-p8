import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class SesionQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'true = solo sesiones abiertas',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  activas?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra por usuario (prsn_id)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  prsn_id?: number;
}
