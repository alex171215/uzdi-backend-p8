import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateExpedienteDto } from './create-expediente.dto';

// DTO para actualizar los datos de una causa judicial existente
export class UpdateExpedienteDto extends PartialType(CreateExpedienteDto) {
  // Estado logico del expediente judicial (true=activo, false=inactivo)
  @ApiProperty({
    description: 'Estado activo/inactivo del expediente',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
