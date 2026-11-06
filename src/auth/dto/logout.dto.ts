import { IsInt, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @IsInt({ message: 'sesionId debe ser un número entero' })
  @IsNotEmpty({ message: 'El identificador de sesión es obligatorio' })
  sesionId: number;
}
