import { PartialType } from '@nestjs/swagger';
import { CreateNacionalidadDto } from './create-nacionalidad.dto';

export class UpdateNacionalidadDto extends PartialType(CreateNacionalidadDto) {}