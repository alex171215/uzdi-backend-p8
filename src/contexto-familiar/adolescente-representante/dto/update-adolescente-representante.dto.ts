import { PartialType } from '@nestjs/mapped-types';
import { CreateAdolescenteRepresentanteDto } from './create-adolescente-representante.dto';

export class UpdateAdolescenteRepresentanteDto extends PartialType(CreateAdolescenteRepresentanteDto) {}