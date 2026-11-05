import { PartialType } from '@nestjs/mapped-types';
import { CreateEtniaDto } from './create-etnia.dto';

export class UpdateEtniaDto extends PartialType(CreateEtniaDto) {}