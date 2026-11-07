import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTipoDocumentoDto {
  @ApiProperty({
    example: 'Resolución Judicial de Medida',
    description: 'Nombre o denominación del tipo de documento',
  })
  @IsNotEmpty({ message: 'El nombre del tipo de documento es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  nombre: string;

  @ApiProperty({
    example: 'Auto resolutivo emitido por juez de la niñez y adolescencia',
    description: 'Descripción del alcance o propósito del documento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}
