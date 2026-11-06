import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateExpedienteDto } from './create-expediente.dto';

export class UpdateExpedienteDto extends PartialType(CreateExpedienteDto) {
  // para activar o desactivar el expediente (V/F)
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
