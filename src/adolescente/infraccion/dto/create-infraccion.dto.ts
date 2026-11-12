import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO para registrar un delito o infraccion tipificada en el catalogo
export class CreateInfraccionDto {
  // Nombre o tipificacion del delito (ej. Robo simple, Hurtos, etc.)
  @ApiProperty({ description: 'Nombre de la infraccion tipificada', example: 'Robo simple' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombre: string;

  // Categoria de la infraccion segun el codigo penal
  @ApiProperty({ description: 'Categoria del delito', example: 'Contra el derecho a la propiedad' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 127)
  categoria: string;

  // Articulo correspondiente del Codigo de la Niñez y Adolescencia o COIP
  @ApiPropertyOptional({ description: 'Articulo legal aplicable del CONA/COIP', example: 'Art. 305' })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  articulo_cona?: string;

  // Descripcion detallada de los elementos de la infraccion
  @ApiPropertyOptional({ description: 'Descripcion detallada de la infraccion', example: 'Apoderamiento ilegitimo de cosa ajena con fuerza' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
