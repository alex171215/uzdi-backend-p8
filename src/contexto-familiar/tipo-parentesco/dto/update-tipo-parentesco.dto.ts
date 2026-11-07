import { PartialType } from '@nestjs/swagger';
import { CreateTipoParentescoDto } from './create-tipo-parentesco.dto';

export class UpdateTipoParentescoDto extends PartialType(CreateTipoParentescoDto) {}
