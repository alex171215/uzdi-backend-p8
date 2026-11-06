import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateNacionalidadDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nombre: string;
}
