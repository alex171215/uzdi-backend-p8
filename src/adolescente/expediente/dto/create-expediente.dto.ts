import { IsString, IsNotEmpty, IsOptional, IsDateString, IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpedienteDto {
  @IsInt() @Type(() => Number)
  adlc_id: number;

  @IsInt() @Type(() => Number)
  uzdi_id: number;

  @IsInt() @Type(() => Number)
  infc_id: number;

  @IsInt() @Type(() => Number)
  mdso_id: number;

  @IsString() @IsNotEmpty() @IsIn(['En proceso', 'Atraso', 'Incomparecencia'])
  estado: string;

  @IsDateString()
  fecha_inicio_medida: string;

  @IsDateString() @IsOptional()
  fecha_fin_medida?: string;
}
