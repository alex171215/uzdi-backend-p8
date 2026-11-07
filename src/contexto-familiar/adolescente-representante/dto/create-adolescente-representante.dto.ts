import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateAdolescenteRepresentanteDto {
  @ApiProperty({ example: 1, description: 'ID del adolescente infractor' })
  @IsNotEmpty({ message: 'El id del adolescente es obligatorio' })
  @IsInt({ message: 'El id del adolescente debe ser entero' })
  @Min(1, { message: 'El id del adolescente debe ser mayor a 0' })
  adlc_id: number;

  @ApiProperty({ example: 1, description: 'ID del representante legal' })
  @IsNotEmpty({ message: 'El id del representante es obligatorio' })
  @IsInt({ message: 'El id del representante debe ser entero' })
  @Min(1, { message: 'El id del representante debe ser mayor a 0' })
  repr_id: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de parentesco (madre, padre, tutor, etc.)' })
  @IsNotEmpty({ message: 'El id del tipo de parentesco es obligatorio' })
  @IsInt({ message: 'El id del tipo de parentesco debe ser entero' })
  @Min(1, { message: 'El id del tipo de parentesco debe ser mayor a 0' })
  tprt_id: number;

  @ApiProperty({
    example: true,
    description: 'Indica si este representante es el referente principal del adolescente',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'es_referente debe ser un valor booleano' })
  es_referente?: boolean;

  @ApiProperty({
    example: '2026-01-15',
    description: 'Fecha en la que inicia la tutoría o representación',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'fecha_inicio debe tener formato YYYY-MM-DD' })
  fecha_inicio?: string;

  @ApiProperty({
    example: '2026-12-31',
    description: 'Fecha de finalización de la tutoría',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'fecha_fin debe tener formato YYYY-MM-DD' })
  fecha_fin?: string;
}
