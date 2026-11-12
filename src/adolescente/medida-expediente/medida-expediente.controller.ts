import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MedidaExpedienteService } from './medida-expediente.service';
import { CreateMedidaExpedienteDto } from './dto/create-medida-expediente.dto';
import { UpdateMedidaExpedienteDto } from './dto/update-medida-expediente.dto';
import { QueryMedidaExpedienteDto } from './dto/query-medida-expediente.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

// Roles autorizados a consultar las medidas socioeducativas del expediente
const LECTURA = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.TRABAJADOR_SOCIAL,
  Rol.PSICOLOGO,
  Rol.EDUCADOR,
  Rol.JURIDICO,
  Rol.COORDINADOR,
];

// Roles autorizados con competencia judicial para asignar o modificar medidas (CONA)
const ESCRITURA_JUDICIAL = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.JURIDICO,
];

// Controlador REST para la administracion de medidas asignadas a expedientes
@ApiTags('Medidas Expediente')
@ApiBearerAuth('JWT-auth')
@Controller('medida-expediente')
@UseGuards(RolesGuard)
export class MedidaExpedienteController {
  constructor(
    private readonly medidaExpedienteService: MedidaExpedienteService,
  ) {}

  // Endpoint para vincular una medida socioeducativa con orden secuencial a la causa
  @Post()
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Asignar una medida socioeducativa al expediente (CONA)' })
  @ApiResponse({ status: 201, description: 'Medida asignada exitosamente al expediente' })
  create(@Body() dto: CreateMedidaExpedienteDto) {
    return this.medidaExpedienteService.create(dto);
  }

  // Endpoint para listar medidas con filtros opcionales por causa o tipo de medida
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar medidas de expedientes con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de medidas recuperado exitosamente' })
  findAll(@Query() query: QueryMedidaExpedienteDto) {
    return this.medidaExpedienteService.findAll(query);
  }

  // Endpoint para consultar el detalle de una medida asignada por su ID
  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Consultar una medida asignada por su identificador' })
  @ApiResponse({ status: 200, description: 'Medida recuperada exitosamente' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidaExpedienteService.findOne(id);
  }

  // Endpoint PUT para actualizacion completa de la medida socioeducativa
  @Put(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar completamente la medida socioeducativa (PUT)' })
  @ApiResponse({ status: 200, description: 'Medida actualizada exitosamente' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedidaExpedienteDto,
  ) {
    return this.medidaExpedienteService.update(id, dto);
  }

  // Endpoint PATCH para actualizacion parcial de fechas o estado de cumplimiento
  @Patch(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar parcialmente la medida socioeducativa (PATCH)' })
  @ApiResponse({ status: 200, description: 'Medida actualizada exitosamente' })
  updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedidaExpedienteDto,
  ) {
    return this.medidaExpedienteService.update(id, dto);
  }

  // Endpoint para dar de baja logica una medida de un expediente
  @Delete(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Inactivar logicamente una medida de expediente (DELETE)' })
  @ApiResponse({ status: 200, description: 'Medida inactivada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medidaExpedienteService.remove(id);
  }
}
