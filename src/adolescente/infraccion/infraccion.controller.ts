import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InfraccionService } from './infraccion.service';
import { CreateInfraccionDto } from './dto/create-infraccion.dto';
import { UpdateInfraccionDto } from './dto/update-infraccion.dto';
import { EstadoQueryDto } from '../../common/dto/estado-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

const LECTURA = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.TRABAJADOR_SOCIAL,
  Rol.PSICOLOGO,
  Rol.EDUCADOR,
  Rol.JURIDICO,
];

@Controller('infraccion')
@UseGuards(RolesGuard)
export class InfraccionController {
  constructor(private readonly infraccionService: InfraccionService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createInfraccionDto: CreateInfraccionDto) {
    return this.infraccionService.create(createInfraccionDto);
  }

  // ?incluirInactivos=true para ver tambien las desactivadas
  @Get()
  @Roles(...LECTURA)
  findAll(@Query() query: EstadoQueryDto) {
    return this.infraccionService.findAll(query.incluirInactivos);
  }

  @Get(':id')
  @Roles(...LECTURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.findOne(id);
  }

  // expedientes que tienen esta infraccion
  @Get(':id/expedientes')
  @Roles(...LECTURA)
  findExpedientes(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.findExpedientes(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInfraccionDto: UpdateInfraccionDto,
  ) {
    return this.infraccionService.update(id, updateInfraccionDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.remove(id);
  }
}
