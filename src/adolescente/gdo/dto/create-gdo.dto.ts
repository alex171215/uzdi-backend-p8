import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateGdoDto {
  @IsString() @IsNotEmpty() @Length(1, 255)
  nombre: string;
}
