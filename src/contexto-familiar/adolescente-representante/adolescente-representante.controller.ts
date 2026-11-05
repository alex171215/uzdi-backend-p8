import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdolescenteRepresentanteService } from './adolescente-representante.service';
import { CreateAdolescenteRepresentanteDto } from './dto/create-adolescente-representante.dto';
import { UpdateAdolescenteRepresentanteDto } from './dto/update-adolescente-representante.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('adolescente-representante')
@UseGuards(RolesGuard)
export class AdolescenteRepresentanteController {
  constructor(private readonly adolescenteRepresentanteService: AdolescenteRepresentanteService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createAdolescenteRepresentanteDto: CreateAdolescenteRepresentanteDto) {
    return this.adolescenteRepresentanteService.create(createAdolescenteRepresentanteDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.adolescenteRepresentanteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adolescenteRepresentanteService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateAdolescenteRepresentanteDto: UpdateAdolescenteRepresentanteDto) {
    return this.adolescenteRepresentanteService.update(+id, updateAdolescenteRepresentanteDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.adolescenteRepresentanteService.remove(+id);
  }
}
