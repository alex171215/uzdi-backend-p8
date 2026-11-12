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
  Rol.COORDINADOR,
];

// Roles autorizados para gestionar el catalogo de infracciones
const ESCRITURA_JUDICIAL = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.JURIDICO,
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
  @ApiOperation({ summary: 'Registrar una nueva infraccion en el catalogo' })
  @ApiResponse({ status: 201, description: 'Infraccion creada exitosamente' })
  create(@Body() createInfraccionDto: CreateInfraccionDto) {
    return this.infraccionService.create(createInfraccionDto);
  }

  // Endpoint para listar infracciones con soporte para incluir inactivas
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar infracciones del catalogo' })
  @ApiResponse({ status: 200, description: 'Listado de infracciones obtenido' })
  findAll(@Query() query: EstadoQueryDto) {
    return this.infraccionService.findAll(query.incluirInactivos);
  }

  // Endpoint para consultar una infraccion por su ID
  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Consultar una infraccion por su identificador' })
  @ApiResponse({ status: 200, description: 'Infraccion obtenida exitosamente' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.findOne(id);
  }

  // Endpoint para listar todos los expedientes judiciales asociados a esta infraccion
  @Get(':id/expedientes')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar expedientes vinculados a esta infraccion' })
  @ApiResponse({ status: 200, description: 'Expedientes asociados obtenidos' })
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
  @ApiOperation({ summary: 'Inactivar logicamente una infraccion (DELETE)' })
  @ApiResponse({ status: 200, description: 'Infraccion inactivada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.remove(id);
  }
}
