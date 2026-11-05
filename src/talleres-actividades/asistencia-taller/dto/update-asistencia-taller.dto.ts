import { PartialType } from '@nestjs/mapped-types';
import { CreateAsistenciaTallerDto } from './create-asistencia-taller.dto';

export class UpdateAsistenciaTallerDto extends PartialType(CreateAsistenciaTallerDto) {}