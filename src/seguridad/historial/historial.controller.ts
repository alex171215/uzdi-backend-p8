import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HistorialService } from './historial.service';
import { HistorialQueryDto } from './dto/historial-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

/** Auditoría inmutable: no hay POST/PATCH/DELETE. */
@ApiTags('Usuarios y Seguridad')
@ApiBearerAuth('JWT-auth')
@Controller('historial')
@Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get()
  @ApiOperation({
    summary:
      'Consultar auditoría (filtros por tabla, registro, usuario, acción y fechas)',
  })
  findAll(@Query() q: HistorialQueryDto) {
    return this.historialService.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un registro de auditoría' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findOne(id);
  }
}
