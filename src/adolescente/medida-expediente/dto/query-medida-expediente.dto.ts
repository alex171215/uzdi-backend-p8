import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMedidaExpedienteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  expe_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  mdso_id?: number;
}
