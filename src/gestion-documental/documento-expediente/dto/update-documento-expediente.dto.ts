import { PartialType } from '@nestjs/swagger';
import { CreateDocumentoExpedienteDto } from './create-documento-expediente.dto';

export class UpdateDocumentoExpedienteDto extends PartialType(
  CreateDocumentoExpedienteDto,
) {}
