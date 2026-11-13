import { PartialType } from '@nestjs/swagger';
import { CreateAdolescenteDto } from './create-adolescente.dto';

export class UpdateAdolescenteDto extends PartialType(CreateAdolescenteDto) {}
