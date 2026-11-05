import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MedidaSocioeducativaService } from './medida-socioeducativa.service';
import { CreateMedidaSocioeducativaDto } from './dto/create-medida-socioeducativa.dto';
import { UpdateMedidaSocioeducativaDto } from './dto/update-medida-socioeducativa.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('medida-socioeducativa')
@UseGuards(RolesGuard)
export class MedidaSocioeducativaController {
  constructor(private readonly medidaSocioeducativaService: MedidaSocioeducativaService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createMedidaSocioeducativaDto: CreateMedidaSocioeducativaDto) {
    return this.medidaSocioeducativaService.create(createMedidaSocioeducativaDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.medidaSocioeducativaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medidaSocioeducativaService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateMedidaSocioeducativaDto: UpdateMedidaSocioeducativaDto) {
    return this.medidaSocioeducativaService.update(+id, updateMedidaSocioeducativaDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.medidaSocioeducativaService.remove(+id);
  }
}
