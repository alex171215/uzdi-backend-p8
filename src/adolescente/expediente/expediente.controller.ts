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
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { QueryExpedienteDto } from './dto/query-expediente.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

// Roles con autorizacion para consultar causas judiciales
const LECTURA = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.TRABAJADOR_SOCIAL,
  Rol.PSICOLOGO,
  Rol.EDUCADOR,
  Rol.JURIDICO,
  Rol.COORDINADOR,
];

// Roles autorizados para crear o modificar causas judiciales segun competencia legal
const ESCRITURA_JUDICIAL = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.JURIDICO,
];

// Controlador REST para la administracion de expedientes judiciales
@ApiTags('Expedientes')
@ApiBearerAuth('JWT-auth')
@Controller('expediente')
@UseGuards(RolesGuard)
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  // Endpoint para crear una causa judicial asociada a un adolescente
  @Post()
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Crear un nuevo expediente judicial' })
  @ApiResponse({ status: 201, description: 'Expediente creado exitosamente' })
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedienteService.create(createExpedienteDto);
  }

  // Endpoint para listar causas con filtros de busqueda opcionales
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar expedientes activos con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de expedientes encontrados' })
  findAll(@Query() query: QueryExpedienteDto) {
    return this.expedienteService.findAll(query);
  }

  // Endpoint para obtener la causa completa con sus medidas ordenadas por CONA
  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Consultar un expediente con sus medidas socioeducativas' })
  @ApiResponse({ status: 200, description: 'Expediente recuperado exitosamente' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.findOne(id);
  }

  // Endpoint PUT para reemplazo o actualizacion procesal completa del expediente
  @Put(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar completamente los datos de un expediente (PUT)' })
  @ApiResponse({ status: 200, description: 'Expediente actualizado exitosamente' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpedienteDto: UpdateExpedienteDto,
  ) {
    return this.expedienteService.update(id, updateExpedienteDto);
  }

  // Endpoint PATCH para modificacion parcial de datos del expediente
  @Patch(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar parcialmente un expediente (PATCH)' })
  @ApiResponse({ status: 200, description: 'Expediente actualizado exitosamente' })
  updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpedienteDto: UpdateExpedienteDto,
  ) {
    return this.expedienteService.update(id, updateExpedienteDto);
  }

  // Endpoint para dar de baja logica un expediente judicial
  @Delete(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Inactivar logicamente un expediente (DELETE)' })
  @ApiResponse({ status: 200, description: 'Expediente inactivado exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.remove(id);
  }
}
