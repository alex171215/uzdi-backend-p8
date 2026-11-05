import { PartialType } from '@nestjs/mapped-types';
import { CreateMedidaSocioeducativaDto } from './create-medida-socioeducativa.dto';

export class UpdateMedidaSocioeducativaDto extends PartialType(CreateMedidaSocioeducativaDto) {}
