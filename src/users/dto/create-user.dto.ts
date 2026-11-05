import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @IsString()
  @IsIn(['M', 'F', 'O'], { message: 'El sexo debe ser M, F u O' })
  @IsOptional()
  sexo?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El login es obligatorio' })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsInt()
  @IsOptional()
  uzdi_id?: number;

  @IsInt()
  @IsOptional()
  tppr_id?: number;

  @IsInt({ each: true })
  @IsOptional()
  roles_ids?: number[];

  @IsString()
  @IsOptional()
  observaciones?: string;
}
