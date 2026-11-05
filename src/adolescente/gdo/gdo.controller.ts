import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GdoService } from './gdo.service';
import { CreateGdoDto } from './dto/create-gdo.dto';
import { UpdateGdoDto } from './dto/update-gdo.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('gdo')
@UseGuards(RolesGuard)
export class GdoController {
  constructor(private readonly gdoService: GdoService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createGdoDto: CreateGdoDto) {
    return this.gdoService.create(createGdoDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.gdoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gdoService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateGdoDto: UpdateGdoDto) {
    return this.gdoService.update(+id, updateGdoDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.gdoService.remove(+id);
  }
}
