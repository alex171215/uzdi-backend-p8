import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePerfilDto {
  @ApiProperty({
    example: 'AUDIT',
    description: 'Código único de 2 a 5 letras mayúsculas',
  })
  @IsString()
  @Matches(/^[A-Z]{2,5}$/, {
    message: 'El código debe tener de 2 a 5 letras mayúsculas (ej. ADM, LEGAL)',
  })
  codigo: string;

  @ApiProperty({ example: 'Auditor interno' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del perfil es obligatorio' })
  @MaxLength(63, { message: 'El nombre admite máximo 63 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Revisión de bitácoras y sesiones' })
  @IsOptional()
  @IsString()
  @MaxLength(63, { message: 'La descripción admite máximo 63 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({ example: 'Creado para fiscalización SNAI' })
  @IsOptional()
  @IsString()
  @MaxLength(127, {
    message: 'Las observaciones admiten máximo 127 caracteres',
  })
  observaciones?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'prfl_id del perfil padre (jerarquía)',
  })
  @IsOptional()
  @IsInt({ message: 'padreId debe ser un entero' })
  @Min(1)
  padreId?: number;
}
