import { IsOptional, Matches } from 'class-validator';

export class FilterUzdiDto {
  @IsOptional()
  @Matches(/^[1-9]\d*$/, { message: 'cntn_id debe ser un entero positivo' })
  cntn_id?: string;
}
