import { PartialType } from '@nestjs/mapped-types';
import { CreateNacionalidadDto } from './create-nacionalidad.dto';

export class UpdateNacionalidadDto extends PartialType(CreateNacionalidadDto) {}