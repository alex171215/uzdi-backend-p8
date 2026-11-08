import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class SearchAdolescenteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[\p{L}\p{M}\p{N} ./'-]+$/u, {
    message:
      'q solo admite letras, números, espacios y signos propios de nombres',
  })
  q: string;
}
