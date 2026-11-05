import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoParentescoDto } from './create-tipo-parentesco.dto';

export class UpdateTipoParentescoDto extends PartialType(CreateTipoParentescoDto) {}