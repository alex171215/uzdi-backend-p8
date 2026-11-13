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
import { MedidaSocioeducativaService } from './medida-socioeducativa.service';
import { CreateMedidaSocioeducativaDto } from './dto/create-medida-socioeducativa.dto';
import { UpdateMedidaSocioeducativaDto } from './dto/update-medida-socioeducativa.dto';
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

@ApiTags('Catálogos - Medidas Socioeducativas')
@ApiBearerAuth('JWT-auth')
@Controller('medida-socioeducativa')
@UseGuards(RolesGuard)
export class MedidaSocioeducativaController {
  constructor(
    private readonly medidaSocioeducativaService: MedidaSocioeducativaService,
  ) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva medida socioeducativa' })
  @ApiResponse({ status: 201, description: 'Medida creada exitosamente' })
  create(@Body() createMedidaSocioeducativaDto: CreateMedidaSocioeducativaDto) {
    return this.medidaSocioeducativaService.create(
      createMedidaSocioeducativaDto,
    );
  }

  // ?incluirInactivos=true para ver tambien las desactivadas
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar medidas socioeducativas' })
  @ApiQuery({ name: 'incluirInactivos', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Listado de medidas' })
  findAll(@Query() query: EstadoQueryDto) {
    return this.medidaSocioeducativaService.findAll(query.incluirInactivos);
  }

  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener detalle de una medida socioeducativa' })
  @ApiResponse({ status: 200, description: 'Detalle de la medida' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.findOne(id);
  }

  // expedientes donde se uso esta medida
  @Get(':id/expedientes')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar expedientes vinculados a una medida' })
  @ApiResponse({ status: 200, description: 'Expedientes asociados' })
  findExpedientes(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.findExpedientes(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una medida socioeducativa' })
  @ApiResponse({ status: 200, description: 'Medida actualizada exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidaSocioeducativaDto: UpdateMedidaSocioeducativaDto,
  ) {
    return this.medidaSocioeducativaService.update(
      id,
      updateMedidaSocioeducativaDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente una medida socioeducativa' })
  @ApiResponse({ status: 200, description: 'Medida desactivada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medidaSocioeducativaService.remove(id);
  }
}
