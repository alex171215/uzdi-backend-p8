import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El login o correo es obligatorio' })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  /**
   * Perfil (seguridad.prfl) con el que el usuario abre la sesión. Debe estar
   * asignado al usuario (seguridad.prpf). Si no se envía, se usa el primero asignado.
   */
  @IsInt()
  @IsOptional()
  prfl_id?: number;
}
