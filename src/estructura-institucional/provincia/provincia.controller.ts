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
import { ProvinciaService } from './provincia.service';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Estructura Institucional - Provincias')
@ApiBearerAuth('JWT-auth')
@Controller('provincia')
@UseGuards(RolesGuard)
export class ProvinciaController {
  constructor(private readonly provinciaService: ProvinciaService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva provincia' })
  @ApiResponse({ status: 201, description: 'Provincia creada exitosamente' })
  create(@Body() createProvinciaDto: CreateProvinciaDto) {
    return this.provinciaService.create(createProvinciaDto);
  }

  @Get()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
    Rol.EDUCADOR,
    Rol.JURIDICO,
  )
  @ApiOperation({ summary: 'Listar todas las provincias activas' })
  @ApiResponse({ status: 200, description: 'Listado de provincias' })
  findAll() {
    return this.provinciaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una provincia por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la provincia' })
  findOne(@Param('id') id: string) {
    return this.provinciaService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar datos de una provincia' })
  @ApiResponse({ status: 200, description: 'Provincia actualizada exitosamente' })
  update(
    @Param('id') id: string,
    @Body() updateProvinciaDto: UpdateProvinciaDto,
  ) {
    return this.provinciaService.update(
      parsePositiveInt(id),
      updateProvinciaDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente una provincia' })
  @ApiResponse({ status: 200, description: 'Provincia desactivada' })
  remove(@Param('id') id: string) {
    return this.provinciaService.remove(parsePositiveInt(id));
  }
}
