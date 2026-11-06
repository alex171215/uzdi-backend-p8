import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExpedienteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  adlc_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  infc_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  uzdi_id?: number;
}
