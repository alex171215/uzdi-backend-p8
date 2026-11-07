import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AsistenciaTallerService } from './asistencia-taller.service';
import { CreateAsistenciaTallerDto } from './dto/create-asistencia-taller.dto';
import { UpdateAsistenciaTallerDto } from './dto/update-asistencia-taller.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Talleres y Actividades - Asistencia')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('asistencia-taller')
export class AsistenciaTallerController {
  constructor(private readonly service: AsistenciaTallerService) {}

  @Post()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.EDUCADOR,
    Rol.PSICOLOGO,
    Rol.TRABAJADOR_SOCIAL,
  )
  @ApiOperation({
    summary:
      'Registrar asistencia a taller (valida restricción: adolescente o representante)',
  })
  @ApiResponse({ status: 201, description: 'Asistencia registrada exitosamente' })
  create(@Body() createDto: CreateAsistenciaTallerDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.EDUCADOR,
    Rol.PSICOLOGO,
    Rol.TRABAJADOR_SOCIAL,
    Rol.JURIDICO,
  )
  @ApiOperation({ summary: 'Listar registros de asistencia activos' })
  @ApiResponse({ status: 200, description: 'Listado de asistencias' })
  findAll() {
    return this.service.findAll();
  }

  @Get('taller/:tall_id')
  @ApiOperation({ summary: 'Consultar listado de asistencia para un taller específico' })
  @ApiResponse({ status: 200, description: 'Asistencias del taller' })
  findByTaller(@Param('tall_id') tall_id: string) {
    return this.service.findByTaller(parsePositiveInt(tall_id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar registro de asistencia por ID' })
  @ApiResponse({ status: 200, description: 'Registro de asistencia encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.EDUCADOR,
    Rol.PSICOLOGO,
    Rol.TRABAJADOR_SOCIAL,
  )
  @ApiOperation({ summary: 'Actualizar estado de asistencia u observaciones' })
  @ApiResponse({ status: 200, description: 'Registro actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAsistenciaTallerDto,
  ) {
    return this.service.update(parsePositiveInt(id), updateDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Inactivar registro de asistencia (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Registro inactivado' })
  remove(@Param('id') id: string) {
    return this.service.remove(parsePositiveInt(id));
  }
}
