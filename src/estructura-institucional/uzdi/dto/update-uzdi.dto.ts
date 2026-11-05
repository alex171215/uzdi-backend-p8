import { PartialType } from '@nestjs/mapped-types';
import { CreateUzdiDto } from './create-uzdi.dto';

export class UpdateUzdiDto extends PartialType(CreateUzdiDto) {}