import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateEtniaDto {
  @IsString() @IsNotEmpty() @Length(1, 100)
  nombre: string;
}
