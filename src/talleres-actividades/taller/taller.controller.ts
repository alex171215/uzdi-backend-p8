import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TallerService } from './taller.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('taller')
@UseGuards(RolesGuard)
export class TallerController {
  constructor(private readonly tallerService: TallerService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.create(createTallerDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.tallerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tallerService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateTallerDto: UpdateTallerDto) {
    return this.tallerService.update(+id, updateTallerDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.tallerService.remove(+id);
  }
}
