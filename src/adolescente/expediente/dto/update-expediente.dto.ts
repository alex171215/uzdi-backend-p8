import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateExpedienteDto } from './create-expediente.dto';

// DTO para actualizar los datos de una causa judicial existente
export class UpdateExpedienteDto extends PartialType(CreateExpedienteDto) {
  // Estado logico del expediente judicial (V=activo, F=inactivo)
  @ApiPropertyOptional({ description: 'Estado logico del expediente', example: true })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
