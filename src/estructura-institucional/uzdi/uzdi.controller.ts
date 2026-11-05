import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UzdiService } from './uzdi.service';
import { CreateUzdiDto } from './dto/create-uzdi.dto';
import { UpdateUzdiDto } from './dto/update-uzdi.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('uzdi')
@UseGuards(RolesGuard)
export class UzdiController {
  constructor(private readonly uzdiService: UzdiService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createUzdiDto: CreateUzdiDto) {
    return this.uzdiService.create(createUzdiDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.uzdiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uzdiService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateUzdiDto: UpdateUzdiDto) {
    return this.uzdiService.update(+id, updateUzdiDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.uzdiService.remove(+id);
  }
}
