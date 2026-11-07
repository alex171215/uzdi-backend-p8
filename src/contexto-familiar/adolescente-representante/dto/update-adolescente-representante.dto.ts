import { PartialType } from '@nestjs/swagger';
import { CreateAdolescenteRepresentanteDto } from './create-adolescente-representante.dto';

export class UpdateAdolescenteRepresentanteDto extends PartialType(
  CreateAdolescenteRepresentanteDto,
) { }
