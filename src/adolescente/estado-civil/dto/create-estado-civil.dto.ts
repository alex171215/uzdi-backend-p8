import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateEstadoCivilDto {
  @IsString() @IsNotEmpty() @Length(1, 100)
  nombre: string;
}
