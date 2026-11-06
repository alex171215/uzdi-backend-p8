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
import { MedidaSocioeducativaService } from './medida-socioeducativa.service';
import { CreateMedidaSocioeducativaDto } from './dto/create-medida-socioeducativa.dto';
import { UpdateMedidaSocioeducativaDto } from './dto/update-medida-socioeducativa.dto';
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

@Controller('medida-socioeducativa')
@UseGuards(RolesGuard)
export class MedidaSocioeducativaController {
  constructor(
    private readonly medidaSocioeducativaService: MedidaSocioeducativaService,
  ) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createMedidaSocioeducativaDto: CreateMedidaSocioeducativaDto) {
    return this.medidaSocioeducativaService.create(
      createMedidaSocioeducativaDto,
    );
  }

  // ?incluirInactivos=true para ver tambien las desactivadas
  @Get()
  @Roles(...LECTURA)
  findAll(@Query() query: EstadoQueryDto) {
    return this.medidaSocioeducativaService.findAll(query.incluirInactivos);
  }

  @Get(':id')
  @Roles(...LECTURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.findOne(id);
  }

  // expedientes donde se uso esta medida
  @Get(':id/expedientes')
  @Roles(...LECTURA)
  findExpedientes(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.findExpedientes(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidaSocioeducativaDto: UpdateMedidaSocioeducativaDto,
  ) {
    return this.medidaSocioeducativaService.update(
      id,
      updateMedidaSocioeducativaDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.remove(id);
  }
}
