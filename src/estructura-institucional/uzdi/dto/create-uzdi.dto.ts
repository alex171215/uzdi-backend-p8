import { IsString, IsNotEmpty, IsOptional, Length, IsInt } from 'class-validator';

export class CreateUzdiDto {
  @IsInt()
  cntn_id: number;

  @IsString() @IsNotEmpty() @Length(1, 255)
  nombre: string;

  @IsString() @IsNotEmpty() @Length(1, 100)
  zona: string;

  @IsString() @IsOptional() @Length(0, 255)
  direccion?: string;

  @IsString() @IsOptional() @Length(0, 20)
  telefono?: string;

  @IsString() @IsOptional() @Length(0, 100)
  correo?: string;
}
