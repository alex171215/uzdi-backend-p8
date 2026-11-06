import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedidaSocioeducativaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombre: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  duracion_meses?: number;
}
