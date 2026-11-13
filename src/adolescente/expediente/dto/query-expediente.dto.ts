import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryExpedienteDto {
  @ApiProperty({ description: 'Filtrar por ID del adolescente', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  adlc_id?: number;

  @ApiProperty({ description: 'Filtrar por ID de la infracción', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  infc_id?: number;

  @ApiProperty({ description: 'Filtrar por ID de sede UZDI', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  uzdi_id?: number;
}

