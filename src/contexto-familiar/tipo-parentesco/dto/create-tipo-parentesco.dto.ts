import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoParentescoDto {
  @ApiProperty({ example: 'Madre', description: 'Nombre descriptivo del parentesco' })
  @IsNotEmpty({ message: 'El nombre del tipo de parentesco es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;
}
