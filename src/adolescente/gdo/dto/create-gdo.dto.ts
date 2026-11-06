import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateGdoDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Matches(/^[\p{L}\p{M}\p{N} ./'-]+$/u)
  nombre: string;
}
