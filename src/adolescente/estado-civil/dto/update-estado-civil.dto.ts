import { PartialType } from '@nestjs/swagger';
import { CreateEstadoCivilDto } from './create-estado-civil.dto';

export class UpdateEstadoCivilDto extends PartialType(CreateEstadoCivilDto) {}