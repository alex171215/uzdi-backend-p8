import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateInfraccionDto {
  @IsString() @IsNotEmpty() @Length(1, 255)
  nombre: string;

  @IsString() @IsNotEmpty() @Length(1, 127)
  categoria: string;

  @IsString() @IsOptional() @Length(0, 50)
  articulo_cona?: string;

  @IsString() @IsOptional()
  descripcion?: string;
}
