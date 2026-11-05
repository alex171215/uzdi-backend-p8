import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateNacionalidadDto {
  @IsString() @IsNotEmpty() @Length(1, 100)
  nombre: string;
}
