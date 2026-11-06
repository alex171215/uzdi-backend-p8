import { IsOptional, Matches } from 'class-validator';

export class FilterCantonDto {
  @IsOptional()
  @Matches(/^[1-9]\d*$/, { message: 'prov_id debe ser un entero positivo' })
  prov_id?: string;
}
