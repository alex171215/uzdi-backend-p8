import { PartialType } from '@nestjs/swagger';
import { CreateGdoDto } from './create-gdo.dto';

export class UpdateGdoDto extends PartialType(CreateGdoDto) {}