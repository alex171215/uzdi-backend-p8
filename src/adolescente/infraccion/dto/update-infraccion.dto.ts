import { PartialType } from '@nestjs/mapped-types';
import { CreateInfraccionDto } from './create-infraccion.dto';

export class UpdateInfraccionDto extends PartialType(CreateInfraccionDto) {}