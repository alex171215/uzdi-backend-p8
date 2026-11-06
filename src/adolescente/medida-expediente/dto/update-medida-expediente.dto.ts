import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMedidaExpedienteDto } from './create-medida-expediente.dto';

// no dejamos cambiar el expe_id, si la medida es de otro expediente se crea una nueva
export class UpdateMedidaExpedienteDto extends PartialType(
  OmitType(CreateMedidaExpedienteDto, ['expe_id'] as const),
) {
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
