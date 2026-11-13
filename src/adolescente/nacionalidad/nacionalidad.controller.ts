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
import { NacionalidadService } from './nacionalidad.service';
import { CreateNacionalidadDto } from './dto/create-nacionalidad.dto';
import { UpdateNacionalidadDto } from './dto/update-nacionalidad.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Catálogos - Nacionalidades')
@ApiBearerAuth('JWT-auth')
@Controller('nacionalidad')
@UseGuards(RolesGuard)
export class NacionalidadController {
  constructor(private readonly nacionalidadService: NacionalidadService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva nacionalidad' })
  @ApiResponse({ status: 201, description: 'Nacionalidad creada exitosamente' })
  create(@Body() createNacionalidadDto: CreateNacionalidadDto) {
    return this.nacionalidadService.create(createNacionalidadDto);
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
  @ApiOperation({ summary: 'Listar nacionalidades activas' })
  @ApiResponse({ status: 200, description: 'Listado de nacionalidades' })
  findAll() {
    return this.nacionalidadService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una nacionalidad por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la nacionalidad' })
  findOne(@Param('id') id: string) {
    return this.nacionalidadService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una nacionalidad' })
  @ApiResponse({ status: 200, description: 'Nacionalidad actualizada exitosamente' })
  update(
    @Param('id') id: string,
    @Body() updateNacionalidadDto: UpdateNacionalidadDto,
  ) {
    return this.nacionalidadService.update(
      parsePositiveInt(id),
      updateNacionalidadDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente una nacionalidad' })
  @ApiResponse({ status: 200, description: 'Nacionalidad desactivada' })
  remove(@Param('id') id: string) {
    return this.nacionalidadService.remove(parsePositiveInt(id));
  }
}
