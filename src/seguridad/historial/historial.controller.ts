import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('historial')
@UseGuards(RolesGuard)
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createHistorialDto: CreateHistorialDto) {
    return this.historialService.create(createHistorialDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.historialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateHistorialDto: UpdateHistorialDto) {
    return this.historialService.update(+id, updateHistorialDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.historialService.remove(+id);
  }
}
