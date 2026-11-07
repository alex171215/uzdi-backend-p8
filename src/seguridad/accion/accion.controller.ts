import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccionService } from './accion.service';
import { CreateAccionDto } from './dto/create-accion.dto';
import { UpdateAccionDto } from './dto/update-accion.dto';
import { AccionQueryDto } from './dto/accion-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

/** seguridad.accn — Catálogo de acciones sobre las que se otorgan permisos. */
@ApiTags('Usuarios y Seguridad')
@ApiBearerAuth('JWT-auth')
@Controller('accion')
@Roles(Rol.ADMINISTRADOR)
export class AccionController {
  constructor(private readonly accionService: AccionService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar acción' })
  create(@Body() dto: CreateAccionDto) {
    return this.accionService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar acciones (filtro ?q= y ?incluirInactivos=true)',
  })
  findAll(@Query() q: AccionQueryDto) {
    return this.accionService.findAll(q.incluirInactivos, q.q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una acción' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accionService.detalle(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar acción' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAccionDto) {
    return this.accionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar acción (borrado lógico)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accionService.remove(id);
  }
}
