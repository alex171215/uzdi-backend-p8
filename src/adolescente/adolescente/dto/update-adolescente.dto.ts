import { PartialType } from '@nestjs/mapped-types';
import { CreateAdolescenteDto } from './create-adolescente.dto';

export class UpdateAdolescenteDto extends PartialType(CreateAdolescenteDto) {}
