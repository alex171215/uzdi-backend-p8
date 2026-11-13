import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExpedienteDto {
  @ApiProperty({ description: 'Filtrar por ID del adolescente', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  adlc_id?: number;

  @ApiProperty({ description: 'Filtrar por ID de la infracción', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  infc_id?: number;

  @ApiProperty({ description: 'Filtrar por ID de sede UZDI', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  uzdi_id?: number;
}
