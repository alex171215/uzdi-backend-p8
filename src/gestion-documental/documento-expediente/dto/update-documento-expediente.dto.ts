import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoExpedienteDto } from './create-documento-expediente.dto';

export class UpdateDocumentoExpedienteDto extends PartialType(CreateDocumentoExpedienteDto) {}