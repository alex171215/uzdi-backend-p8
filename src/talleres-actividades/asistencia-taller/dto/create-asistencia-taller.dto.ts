import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAsistenciaTallerDto {
  @ApiProperty({ example: 1, description: 'ID del taller' })
  @IsNotEmpty({ message: 'El id del taller es obligatorio' })
  @IsInt({ message: 'El id del taller debe ser un número entero' })
  @Min(1, { message: 'El id del taller debe ser mayor a 0' })
  tall_id: number;

  @ApiProperty({
    example: 'adolescente',
    description: 'Tipo de asistente ("adolescente" o "representante")',
    enum: ['adolescente', 'representante'],
  })
  @IsNotEmpty({ message: 'El tipo de asistente es obligatorio' })
  @IsIn(['adolescente', 'representante'], {
    message: 'El tipo de asistente debe ser "adolescente" o "representante"',
  })
  tipo_asistente: 'adolescente' | 'representante';

  @ApiProperty({
    example: 1,
    description:
      'ID del adolescente (obligatorio si tipo_asistente es "adolescente", debe ser nulo si es "representante")',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El id del adolescente debe ser un número entero' })
  @Min(1, { message: 'El id del adolescente debe ser mayor a 0' })
  adlc_id?: number | null;

  @ApiProperty({
    example: 1,
    description:
      'ID de adolescente_representante (obligatorio si tipo_asistente es "representante", debe ser nulo si es "adolescente")',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El id de adolescente_representante debe ser un número entero' })
  @Min(1, { message: 'El id de adolescente_representante debe ser mayor a 0' })
  adre_id?: number | null;

  @ApiProperty({
    example: true,
    description: 'Indica si asistió efectivamente al taller',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'asistio debe ser un valor booleano' })
  asistio?: boolean;

  @ApiProperty({
    example: 'Participó activamente en las dinámicas grupales',
    description: 'Observaciones de la asistencia o justificativo',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}
