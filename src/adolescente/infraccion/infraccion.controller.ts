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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InfraccionService } from './infraccion.service';
import { CreateInfraccionDto } from './dto/create-infraccion.dto';
import { UpdateInfraccionDto } from './dto/update-infraccion.dto';
import { EstadoQueryDto } from '../../common/dto/estado-query.dto';
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

@ApiTags('Catálogos - Infracciones')
@ApiBearerAuth('JWT-auth')
@Controller('infraccion')
@UseGuards(RolesGuard)
export class InfraccionController {
  constructor(private readonly infraccionService: InfraccionService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva infracción' })
  @ApiResponse({ status: 201, description: 'Infracción creada exitosamente' })
  create(@Body() createInfraccionDto: CreateInfraccionDto) {
    return this.infraccionService.create(createInfraccionDto);
  }

  // ?incluirInactivos=true para ver tambien las desactivadas
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar infracciones' })
  @ApiQuery({ name: 'incluirInactivos', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Listado de infracciones' })
  findAll(@Query() query: EstadoQueryDto) {
    return this.infraccionService.findAll(query.incluirInactivos);
  }

  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener detalle de una infracción por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la infracción' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.findOne(id);
  }

  // expedientes que tienen esta infraccion
  @Get(':id/expedientes')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar expedientes vinculados a una infracción' })
  @ApiResponse({ status: 200, description: 'Expedientes asociados' })
  findExpedientes(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.findExpedientes(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una infracción' })
  @ApiResponse({ status: 200, description: 'Infracción actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInfraccionDto: UpdateInfraccionDto,
  ) {
    return this.infraccionService.update(id, updateInfraccionDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente una infracción' })
  @ApiResponse({ status: 200, description: 'Infracción desactivada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.infraccionService.remove(id);
  }
}
