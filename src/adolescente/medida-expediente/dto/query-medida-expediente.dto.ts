import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryMedidaExpedienteDto {
  @ApiProperty({ description: 'Filtrar medidas por ID de expediente', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  expe_id?: number;

  @ApiProperty({ description: 'Filtrar medidas por ID de catálogo de medida', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  mdso_id?: number;
}

