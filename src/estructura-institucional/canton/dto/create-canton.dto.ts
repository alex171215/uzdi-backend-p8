import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateCantonDto {
  @IsInt()
  @Min(1)
  prov_id: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nombre: string;
}
