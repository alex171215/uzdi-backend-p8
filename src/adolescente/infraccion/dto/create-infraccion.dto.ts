import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

// DTO para registrar un delito o infraccion tipificada en el catalogo
export class CreateInfraccionDto {
  // Nombre o tipificacion del delito (ej. Robo simple, Hurtos, etc.)
  @ApiProperty({
    description: 'Nombre o tipificación penal/socioeducativa de la infracción',
    example: 'Robo simple',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombre: string;

  // Categoria de la infraccion segun el codigo penal
  @ApiProperty({
    description: 'Categoría o gravedad de la infracción',
    example: 'Delito contra la propiedad',
    maxLength: 127,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 127)
  categoria: string;

  // Articulo correspondiente del Codigo de la Niñez y Adolescencia o COIP
  @ApiProperty({
    description: 'Artículo del Código Orgánico de la Niñez y Adolescencia o COIP',
    example: 'Art. 189',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  articulo_cona?: string;

  // Descripcion detallada de los elementos de la infraccion
  @ApiProperty({
    description: 'Descripción detallada de la conducta tipificada',
    example: 'Apoderamiento ilegítimo de cosa mueble ajena sin violencia física',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
