import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, IsIn, MinLength } from 'class-validator';

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
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsInt()
  @IsOptional()
  uzdi_id?: number;

  /**
   * RF-12 antes de RF-01: todo usuario debe darse de alta con un
   * tipo de persona / perfil institucional activo ya registrado.
   */
  @IsInt({ message: 'tppr_id debe ser un número entero' })
  @IsNotEmpty({ message: 'Debe asignar un perfil institucional (tppr_id) antes de registrar al usuario' })
  tppr_id: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
