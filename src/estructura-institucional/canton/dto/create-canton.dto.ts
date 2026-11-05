import { IsString, IsNotEmpty, Length, IsInt } from 'class-validator';

export class CreateCantonDto {
  @IsInt()
  prov_id: number;

  @IsString() @IsNotEmpty() @Length(1, 100)
  nombre: string;
}
