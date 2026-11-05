import { PartialType } from '@nestjs/mapped-types';
import { CreateGdoDto } from './create-gdo.dto';

export class UpdateGdoDto extends PartialType(CreateGdoDto) {}