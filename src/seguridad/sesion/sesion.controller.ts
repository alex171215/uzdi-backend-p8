import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SesionService } from './sesion.service';
import { SesionQueryDto } from './dto/sesion-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@ApiTags('Usuarios y Seguridad')
@ApiBearerAuth('JWT-auth')
@Controller('sesion')
export class SesionController {
  constructor(private readonly sesionService: SesionService) {}

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Bitácora de sesiones (?activas=true&prsn_id=)' })
  findAll(@Query() q: SesionQueryDto) {
    return this.sesionService.findAll(q);
  }

  @Get(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Detalle de una sesión' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sesionService.findOne(id);
  }

  @Patch(':id/cerrar')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Forzar cierre de una sesión (invalida su token)' })
  cerrar(@Param('id', ParseIntPipe) id: number) {
    return this.sesionService.cerrar(id);
  }
}
