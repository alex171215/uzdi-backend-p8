import { PartialType } from '@nestjs/swagger';
import { CreateUzdiDto } from './create-uzdi.dto';

export class UpdateUzdiDto extends PartialType(CreateUzdiDto) { }