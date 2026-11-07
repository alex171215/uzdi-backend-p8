import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Login o correo' })
  @IsString()
  @IsNotEmpty({ message: 'El login o correo es obligatorio' })
  login: string;

  @ApiProperty({ example: 'Admin.Uzdi2026' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  /**
   * Perfil (seguridad.prfl) con el que el usuario abre la sesión. Debe estar
   * asignado al usuario (seguridad.prpf). Si no se envía, se usa el primero asignado.
   */
  @ApiPropertyOptional({
    example: 1,
    description: 'Perfil con el que entra (debe estar asignado)',
  })
  @IsInt()
  @IsOptional()
  prfl_id?: number;
}
