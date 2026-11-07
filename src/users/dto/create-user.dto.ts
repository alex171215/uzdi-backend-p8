import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsInt,
  IsIn,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Lucía' })
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres: string;

  @ApiProperty({ example: 'Mora' })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @ApiPropertyOptional({ enum: ['M', 'F', 'O'], example: 'F' })
  @IsString()
  @IsIn(['M', 'F', 'O'], { message: 'El sexo debe ser M, F u O' })
  @IsOptional()
  sexo?: string;

  @ApiPropertyOptional({ example: 'Av. Cevallos y Montalvo, Ambato' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ example: '0991234567' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'lucia.mora@uzdi.gob.ec' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @ApiProperty({ example: 'lmora' })
  @IsString()
  @IsNotEmpty({ message: 'El login es obligatorio' })
  login: string;

  @ApiProperty({ example: 'Lucia.2026', minLength: 8 })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: 1, description: 'UZDI donde trabaja' })
  @IsInt()
  @IsOptional()
  uzdi_id?: number;

  /**
   * RF-12 antes de RF-01: todo usuario debe darse de alta con un
   * tipo de persona / perfil institucional activo ya registrado.
   */
  @ApiProperty({
    example: 1,
    description:
      'seguridad.tipo_persona (1 Técnico, 2 Coordinador, 3 Administrativo, 4 Director, 5 Otro)',
  })
  @IsInt({ message: 'tppr_id debe ser un número entero' })
  @IsNotEmpty({
    message:
      'Debe asignar un perfil institucional (tppr_id) antes de registrar al usuario',
  })
  tppr_id: number;

  @ApiPropertyOptional({ example: 'Trabajadora social de la UZDI Ambato' })
  @IsString()
  @IsOptional()
  observaciones?: string;

  /**
   * RF-12 → RF-01: perfiles de seguridad.prfl con los que el usuario podrá
   * iniciar sesión (ej. [3] = LEGAL). Deben existir y estar activos.
   */
  @ApiProperty({
    example: [4],
    type: [Number],
    description:
      'Perfiles (seguridad.prfl): 1 ADM, 2 CORD, 3 LEGAL, 4 TSOC, 5 PSIC, 6 EDUC, 7 CONS',
  })
  @IsArray({ message: 'perfiles_ids debe ser una lista de prfl_id' })
  @ArrayNotEmpty({
    message:
      'Debe asignar al menos un perfil institucional (perfiles_ids) antes de registrar al usuario',
  })
  @ArrayMaxSize(20)
  @IsInt({ each: true, message: 'Cada prfl_id debe ser un entero' })
  perfiles_ids: number[];
}
