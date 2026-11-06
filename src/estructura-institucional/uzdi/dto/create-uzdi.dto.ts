import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
  Min,
  Matches,
  IsEmail,
} from 'class-validator';

export class CreateUzdiDto {
  @IsInt()
  @Min(1)
  cntn_id: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Matches(/^[\p{L}\p{M}\p{N} ./'-]+$/u)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M}\p{N} ./'-]+$/u)
  zona: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  direccion?: string;

  @IsString()
  @IsOptional()
  @Length(0, 20)
  @Matches(/^\+?[0-9 ()-]+$/)
  telefono?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  @IsEmail()
  correo?: string;
}
