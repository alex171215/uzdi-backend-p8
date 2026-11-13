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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedidaSocioeducativaService } from './medida-socioeducativa.service';
import { CreateMedidaSocioeducativaDto } from './dto/create-medida-socioeducativa.dto';
import { UpdateMedidaSocioeducativaDto } from './dto/update-medida-socioeducativa.dto';
import { EstadoQueryDto } from '../../common/dto/estado-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

// Roles con permiso para consultar las medidas socioeducativas
const LECTURA = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.TRABAJADOR_SOCIAL,
  Rol.PSICOLOGO,
  Rol.EDUCADOR,
  Rol.JURIDICO,
  Rol.JUEZ,
  Rol.COORDINADOR,
];

// Roles autorizados para gestionar el catalogo de medidas socioeducativas
const ESCRITURA_JUDICIAL = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.JURIDICO,
  Rol.JUEZ,
];

// Controlador REST para el catalogo de tipos de medidas socioeducativas segun CONA
@ApiTags('Medidas Socioeducativas')
@ApiBearerAuth('JWT-auth')
@Controller('medida-socioeducativa')
@UseGuards(RolesGuard)
export class MedidaSocioeducativaController {
  constructor(
    private readonly medidaSocioeducativaService: MedidaSocioeducativaService,
  ) {}

  // Endpoint para registrar un nuevo tipo de medida socioeducativa
  @Post()
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Crear una nueva medida socioeducativa' })
  @ApiResponse({ status: 201, description: 'Medida creada exitosamente' })
  create(@Body() createMedidaSocioeducativaDto: CreateMedidaSocioeducativaDto) {
    return this.medidaSocioeducativaService.create(
      createMedidaSocioeducativaDto,
    );
  }

  // Endpoint para listar las medidas socioeducativas con soporte de filtro de inactivos
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar medidas socioeducativas' })
  @ApiQuery({ name: 'incluirInactivos', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Listado de medidas' })
  findAll(@Query() query: EstadoQueryDto) {
    return this.medidaSocioeducativaService.findAll(query.incluirInactivos);
  }

  // Endpoint para consultar un tipo de medida por su ID
  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener detalle de una medida socioeducativa' })
  @ApiResponse({ status: 200, description: 'Detalle de la medida' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.findOne(id);
  }

  // Endpoint para listar los expedientes donde se aplico este tipo de medida
  @Get(':id/expedientes')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar expedientes vinculados a una medida' })
  @ApiResponse({ status: 200, description: 'Expedientes asociados' })
  findExpedientes(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.findExpedientes(id);
  }

  // Endpoint PUT para actualizacion completa de la medida socioeducativa
  @Put(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar completamente el tipo de medida (PUT)' })
  @ApiResponse({ status: 200, description: 'Tipo de medida actualizado exitosamente' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidaSocioeducativaDto: UpdateMedidaSocioeducativaDto,
  ) {
    return this.medidaSocioeducativaService.update(
      id,
      updateMedidaSocioeducativaDto,
    );
  }

  // Endpoint PATCH para actualizacion parcial de la medida socioeducativa
  @Patch(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar parcialmente el tipo de medida (PATCH)' })
  @ApiResponse({ status: 200, description: 'Tipo de medida actualizado exitosamente' })
  updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidaSocioeducativaDto: UpdateMedidaSocioeducativaDto,
  ) {
    return this.medidaSocioeducativaService.update(
      id,
      updateMedidaSocioeducativaDto,
    );
  }

  // Endpoint para dar de baja logica una medida socioeducativa
  @Delete(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Desactivar lógicamente una medida socioeducativa' })
  @ApiResponse({ status: 200, description: 'Medida desactivada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.remove(id);
  }
}
