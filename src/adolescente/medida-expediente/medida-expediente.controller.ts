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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedidaExpedienteService } from './medida-expediente.service';
import { CreateMedidaExpedienteDto } from './dto/create-medida-expediente.dto';
import { UpdateMedidaExpedienteDto } from './dto/update-medida-expediente.dto';
import { QueryMedidaExpedienteDto } from './dto/query-medida-expediente.dto';
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
const ESCRITURA = [Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.JURIDICO];

@ApiTags('Medidas por Expediente')
@ApiBearerAuth('JWT-auth')
@Controller('medida-expediente')
@UseGuards(RolesGuard)
export class MedidaExpedienteController {
  constructor(
    private readonly medidaExpedienteService: MedidaExpedienteService,
  ) {}

  @Post()
  @Roles(...ESCRITURA)
  @ApiOperation({ summary: 'Asignar una medida socioeducativa a un expediente' })
  @ApiResponse({ status: 201, description: 'Medida asignada exitosamente' })
  create(@Body() dto: CreateMedidaExpedienteDto) {
    return this.medidaExpedienteService.create(dto);
  }

  // filtros opcionales: ?expe_id=&mdso_id=
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar medidas asignadas con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de medidas asignadas' })
  findAll(@Query() query: QueryMedidaExpedienteDto) {
    return this.medidaExpedienteService.findAll(query);
  }

  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener detalle de una medida asignada' })
  @ApiResponse({ status: 200, description: 'Detalle de la medida asignada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidaExpedienteService.findOne(id);
  }

  @Patch(':id')
  @Roles(...ESCRITURA)
  @ApiOperation({ summary: 'Actualizar seguimiento o estado de una medida asignada' })
  @ApiResponse({ status: 200, description: 'Medida asignada actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedidaExpedienteDto,
  ) {
    return this.medidaExpedienteService.update(id, dto);
  }

  @Delete(':id')
  @Roles(...ESCRITURA)
  @ApiOperation({ summary: 'Desactivar lógicamente una medida asignada' })
  @ApiResponse({ status: 200, description: 'Medida asignada desactivada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medidaExpedienteService.remove(id);
  }
}
