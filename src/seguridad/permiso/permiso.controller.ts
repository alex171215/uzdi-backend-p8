import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermisoService } from './permiso.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { AsignarAccionesDto } from './dto/asignar-acciones.dto';
import { PermisoQueryDto } from './dto/permiso-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

/** seguridad.prms — Matriz RBAC perfil ↔ acción. */
@ApiTags('Usuarios y Seguridad')
@ApiBearerAuth('JWT-auth')
@Controller('permiso')
@Roles(Rol.ADMINISTRADOR)
export class PermisoController {
  constructor(private readonly permisoService: PermisoService) {}

  @Post()
  @ApiOperation({ summary: 'Otorgar una acción a un perfil' })
  create(@Body() dto: CreatePermisoDto) {
    return this.permisoService.create(dto);
  }

  @Post('perfil/:prflId/acciones')
  @ApiOperation({ summary: 'Asignar varias acciones a un perfil' })
  asignar(
    @Param('prflId', ParseIntPipe) prflId: number,
    @Body() dto: AsignarAccionesDto,
  ) {
    return this.permisoService.asignarAcciones(prflId, dto.accn_ids);
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar matriz de permisos (?prfl_id=&accn_id=)',
  })
  findAll(@Query() q: PermisoQueryDto) {
    return this.permisoService.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un permiso' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permisoService.findOne(id);
  }

  @Delete('perfil/:prflId/acciones/:accnId')
  @ApiOperation({ summary: 'Revocar una acción a un perfil' })
  revocar(
    @Param('prflId', ParseIntPipe) prflId: number,
    @Param('accnId', ParseIntPipe) accnId: number,
  ) {
    return this.permisoService.revocar(prflId, accnId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revocar permiso por prms_id (borrado lógico)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permisoService.remove(id);
  }
}
