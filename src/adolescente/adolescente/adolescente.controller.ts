import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdolescenteService } from './adolescente.service';
import { CreateAdolescenteDto } from './dto/create-adolescente.dto';
import { UpdateAdolescenteDto } from './dto/update-adolescente.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('adolescente')
@UseGuards(RolesGuard)
export class AdolescenteController {
  constructor(private readonly adolescenteService: AdolescenteService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createAdolescenteDto: CreateAdolescenteDto) {
    return this.adolescenteService.create(createAdolescenteDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.adolescenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adolescenteService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateAdolescenteDto: UpdateAdolescenteDto) {
    return this.adolescenteService.update(+id, updateAdolescenteDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.adolescenteService.remove(+id);
  }
}
