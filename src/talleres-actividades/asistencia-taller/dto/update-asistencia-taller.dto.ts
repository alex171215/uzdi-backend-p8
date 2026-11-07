import { PartialType } from '@nestjs/swagger';
import { CreateAsistenciaTallerDto } from './create-asistencia-taller.dto';

export class UpdateAsistenciaTallerDto extends PartialType(
  CreateAsistenciaTallerDto,
) {}
