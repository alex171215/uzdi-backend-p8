import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ESTADOS_TRAMITE_DOCUMENTO } from '../entities/documento-expediente.entity';

export class CreateDocumentoExpedienteDto {
  @ApiProperty({ example: 1, description: 'ID del expediente judicial' })
  @IsNotEmpty({ message: 'El id del expediente es obligatorio' })
  @IsInt({ message: 'El id del expediente debe ser un número entero' })
  @Min(1, { message: 'El id del expediente debe ser mayor a 0' })
  expe_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del profesional que registra el documento',
  })
  @IsNotEmpty({ message: 'El id del responsable es obligatorio' })
  @IsInt({ message: 'El id del responsable debe ser un número entero' })
  @Min(1, { message: 'El id del responsable debe ser mayor a 0' })
  prsn_id: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de documento catalogado' })
  @IsNotEmpty({ message: 'El id del tipo de documento es obligatorio' })
  @IsInt({ message: 'El id del tipo de documento debe ser un número entero' })
  @Min(1, { message: 'El id del tipo de documento debe ser mayor a 0' })
  tpdc_id: number;

  @ApiProperty({
    example: true,
    description:
      'Indica si es un documento habilitante indispensable para el expediente',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'es_habilitante debe ser un valor booleano' })
  es_habilitante?: boolean;

  @ApiProperty({
    example: 'pendiente',
    description: 'Estado del trámite documental',
    enum: ESTADOS_TRAMITE_DOCUMENTO,
    default: 'pendiente',
    required: false,
  })
  @IsOptional()
  @IsIn([...ESTADOS_TRAMITE_DOCUMENTO], {
    message: `estado_tramite debe ser uno de: ${ESTADOS_TRAMITE_DOCUMENTO.join(', ')}`,
  })
  estado_tramite?: string;

  @ApiProperty({
    example: 'OFI-2026-0045-JNA',
    description: 'Código o número oficial del documento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El número de documento no puede exceder 100 caracteres' })
  numero_documento?: string;

  @ApiProperty({
    example: '2026-02-20',
    description: 'Fecha de emisión del documento (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'fecha_documento debe tener formato YYYY-MM-DD' })
  fecha_documento?: string;

  @ApiProperty({
    example: 'Juzgado Primero de la Familia, Niñez y Adolescencia',
    description: 'Entidad o autoridad emisora del documento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El emisor debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El emisor no puede exceder 255 caracteres' })
  emisor?: string;

  @ApiProperty({
    example: 'Documento original foliado en expediente físico',
    description: 'Observaciones o notas documentales',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}
