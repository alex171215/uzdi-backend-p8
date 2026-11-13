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
import { InfraccionService } from './infraccion.service';
import { CreateInfraccionDto } from './dto/create-infraccion.dto';
import { UpdateInfraccionDto } from './dto/update-infraccion.dto';
import { EstadoQueryDto } from '../../common/dto/estado-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

// Roles con permiso para consultar el catalogo de delitos
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

// Roles autorizados para gestionar el catalogo de infracciones
const ESCRITURA_JUDICIAL = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.JURIDICO,
  Rol.JUEZ,
];

// Controlador REST para el catalogo de infracciones tipificadas
@ApiTags('Infracciones')
@ApiBearerAuth('JWT-auth')
@Controller('infraccion')
@UseGuards(RolesGuard)
export class InfraccionController {
  constructor(private readonly infraccionService: InfraccionService) {}

  // Endpoint para registrar una nueva infraccion en el catalogo
  @Post()
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Crear una nueva infracción' })
  @ApiResponse({ status: 201, description: 'Infracción creada exitosamente' })
  create(@Body() createInfraccionDto: CreateInfraccionDto) {
    return this.infraccionService.create(createInfraccionDto);
  }

  // Endpoint para listar infracciones con soporte para incluir inactivas
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar infracciones' })
  @ApiQuery({ name: 'incluirInactivos', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Listado de infracciones' })
  findAll(@Query() query: EstadoQueryDto) {
    return this.infraccionService.findAll(query.incluirInactivos);
  }

  // Endpoint para consultar una infraccion por su ID
  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener detalle de una infracción por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la infracción' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.findOne(id);
  }

  // Endpoint para listar todos los expedientes judiciales asociados a esta infraccion
  @Get(':id/expedientes')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar expedientes vinculados a una infracción' })
  @ApiResponse({ status: 200, description: 'Expedientes asociados' })
  findExpedientes(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.findExpedientes(id);
  }

  // Endpoint PUT para actualizacion completa de la infraccion
  @Put(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar completamente una infraccion (PUT)' })
  @ApiResponse({ status: 200, description: 'Infraccion actualizada exitosamente' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInfraccionDto: UpdateInfraccionDto,
  ) {
    return this.infraccionService.update(id, updateInfraccionDto);
  }

  // Endpoint PATCH para actualizacion parcial de la infraccion
  @Patch(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Actualizar parcialmente una infraccion (PATCH)' })
  @ApiResponse({ status: 200, description: 'Infraccion actualizada exitosamente' })
  updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInfraccionDto: UpdateInfraccionDto,
  ) {
    return this.infraccionService.update(id, updateInfraccionDto);
  }

  // Endpoint para dar de baja logica una infraccion
  @Delete(':id')
  @Roles(...ESCRITURA_JUDICIAL)
  @ApiOperation({ summary: 'Desactivar lógicamente una infracción' })
  @ApiResponse({ status: 200, description: 'Infracción desactivada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.remove(id);
  }
}
