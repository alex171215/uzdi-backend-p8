import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TipoParentescoService } from './tipo-parentesco.service';
import { CreateTipoParentescoDto } from './dto/create-tipo-parentesco.dto';
import { UpdateTipoParentescoDto } from './dto/update-tipo-parentesco.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('tipo-parentesco')
@UseGuards(RolesGuard)
export class TipoParentescoController {
  constructor(private readonly tipoParentescoService: TipoParentescoService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createTipoParentescoDto: CreateTipoParentescoDto) {
    return this.tipoParentescoService.create(createTipoParentescoDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.tipoParentescoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoParentescoService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateTipoParentescoDto: UpdateTipoParentescoDto) {
    return this.tipoParentescoService.update(+id, updateTipoParentescoDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.tipoParentescoService.remove(+id);
  }
}
