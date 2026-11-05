import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateTipoParentescoDto {
  @IsString() @IsNotEmpty() @Length(1, 100)
  nombre: string;
}
