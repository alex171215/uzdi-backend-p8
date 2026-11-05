import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AsistenciaTallerService } from './asistencia-taller.service';
import { CreateAsistenciaTallerDto } from './dto/create-asistencia-taller.dto';
import { UpdateAsistenciaTallerDto } from './dto/update-asistencia-taller.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('asistencia-taller')
@UseGuards(RolesGuard)
export class AsistenciaTallerController {
  constructor(private readonly asistenciaTallerService: AsistenciaTallerService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createAsistenciaTallerDto: CreateAsistenciaTallerDto) {
    return this.asistenciaTallerService.create(createAsistenciaTallerDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.asistenciaTallerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asistenciaTallerService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateAsistenciaTallerDto: UpdateAsistenciaTallerDto) {
    return this.asistenciaTallerService.update(+id, updateAsistenciaTallerDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.asistenciaTallerService.remove(+id);
  }
}
