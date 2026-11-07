import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiPropertyOptional({
    description:
      'Opcional. Si se envía debe ser el mismo usuario del token (para cambiar la clave de otro usuario use PATCH /users/:id)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 'Admin.Uzdi2026' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  currentPassword: string;

  @ApiProperty({ example: 'NuevaClave.2026' })
  @IsString()
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
