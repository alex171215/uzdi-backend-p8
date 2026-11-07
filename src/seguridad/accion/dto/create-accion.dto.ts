import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAccionDto {
  @ApiProperty({
    example: 'reportes.exportar',
    description: 'Nombre único con formato <recurso>.<operación> en minúsculas',
  })
  @IsString()
  @MaxLength(63, { message: 'El nombre admite máximo 63 caracteres' })
  @Matches(/^[a-z0-9-]+\.[a-z0-9-]+$/, {
    message:
      'El nombre debe tener el formato recurso.operacion en minúsculas (ej. adolescente.crear)',
  })
  nombre: string;

  @ApiPropertyOptional({ example: 'Exportar reportes SNAI' })
  @IsOptional()
  @IsString()
  @MaxLength(63, { message: 'La descripción admite máximo 63 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    example: 1,
    description: '1 = la acción se audita, 0 = no',
  })
  @IsOptional()
  @IsIn([0, 1], { message: 'auditable debe ser 0 o 1' })
  auditable?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  moduloId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  controladorId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  tipoAccionId?: number;
}
