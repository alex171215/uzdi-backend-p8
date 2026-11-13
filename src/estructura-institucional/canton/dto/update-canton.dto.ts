import { PartialType } from '@nestjs/swagger';
import { CreateCantonDto } from './create-canton.dto';

export class UpdateCantonDto extends PartialType(CreateCantonDto) {}