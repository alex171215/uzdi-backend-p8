import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMedidaExpedienteDto {
  @ApiProperty({ description: 'Filtrar medidas por ID de expediente', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  expe_id?: number;

  @ApiProperty({ description: 'Filtrar medidas por ID de catálogo de medida', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  mdso_id?: number;
}
