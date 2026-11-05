import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateTipoDocumentoDto {
  @IsString() @IsNotEmpty() @Length(1, 255)
  nombre: string;

  @IsString() @IsOptional()
  descripcion?: string;
}
