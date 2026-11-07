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
import { PerfilService } from './perfil.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { EstadoQueryDto } from '../../common/dto/estado-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

/**
 * seguridad.prfl — Acción RBAC: perfil.consultar | perfil.crear | perfil.actualizar | perfil.eliminar
 * (@Roles solo se usa si la acción no está registrada en seguridad.accn).
 */
@ApiTags('Usuarios y Seguridad')
@ApiBearerAuth('JWT-auth')
@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear perfil institucional' })
  create(@Body() dto: CreatePerfilDto) {
    return this.perfilService.create(dto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Listar perfiles (activos por defecto)' })
  findAll(@Query() q: EstadoQueryDto) {
    return this.perfilService.findAll(q.incluirInactivos);
  }

  @Get(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Detalle de un perfil' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.perfilService.detalle(id);
  }

  @Get(':id/permisos')
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({
    summary: 'Acciones habilitadas para el perfil (seguridad.prms)',
  })
  permisos(@Param('id', ParseIntPipe) id: number) {
    return this.perfilService.permisos(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar perfil' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePerfilDto) {
    return this.perfilService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar perfil (borrado lógico)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.perfilService.remove(id);
  }
}
