import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AsignarPerfilesDto } from './dto/asignar-perfiles.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '../common/enums/rol.enum';
import {
  UsuarioActual,
  type UsuarioToken,
} from '../common/decorators/usuario-actual.decorator';

/**
 * seguridad.prsn — Acciones RBAC: users.consultar | users.crear | users.actualizar | users.eliminar.
 * @Roles es el respaldo si las acciones no están registradas en seguridad.accn.
 */
@ApiTags('Usuarios y Seguridad')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Registrar usuario (exige perfil institucional activo, RF-12 → RF-01)',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Listar usuarios activos' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiQuery({ name: 'q', example: 'perez' })
  @ApiOperation({ summary: 'Buscar por nombres, apellidos, login o correo' })
  search(@Query('q') query: string) {
    return this.usersService.search(query);
  }

  @Get(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Detalle de un usuario' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get(':id/perfiles')
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({
    summary: 'Perfiles institucionales asignados al usuario (seguridad.prpf)',
  })
  perfiles(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.listarPerfiles(id);
  }

  @Put(':id/perfiles')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reemplazar los perfiles asignados al usuario' })
  asignarPerfiles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarPerfilesDto,
  ) {
    return this.usersService.asignarPerfiles(id, dto.perfiles_ids);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Actualizar usuario (incluye restablecer contraseña)',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Desactivar usuario (borrado lógico; su token deja de servir)',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.usersService.remove(id, usuario?.sub);
  }
}
