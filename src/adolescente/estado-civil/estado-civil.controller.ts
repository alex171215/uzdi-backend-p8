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
import { EstadoCivilService } from './estado-civil.service';
import { CreateEstadoCivilDto } from './dto/create-estado-civil.dto';
import { UpdateEstadoCivilDto } from './dto/update-estado-civil.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Catálogos - Estados Civiles')
@ApiBearerAuth('JWT-auth')
@Controller('estado-civil')
@UseGuards(RolesGuard)
export class EstadoCivilController {
  constructor(private readonly estadoCivilService: EstadoCivilService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo estado civil' })
  @ApiResponse({ status: 201, description: 'Estado civil creado exitosamente' })
  create(@Body() createEstadoCivilDto: CreateEstadoCivilDto) {
    return this.estadoCivilService.create(createEstadoCivilDto);
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
  @ApiOperation({ summary: 'Listar estados civiles activos' })
  @ApiResponse({ status: 200, description: 'Listado de estados civiles' })
  findAll() {
    return this.estadoCivilService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un estado civil por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del estado civil' })
  findOne(@Param('id') id: string) {
    return this.estadoCivilService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un estado civil' })
  @ApiResponse({ status: 200, description: 'Estado civil actualizado exitosamente' })
  update(
    @Param('id') id: string,
    @Body() updateEstadoCivilDto: UpdateEstadoCivilDto,
  ) {
    return this.estadoCivilService.update(
      parsePositiveInt(id),
      updateEstadoCivilDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente un estado civil' })
  @ApiResponse({ status: 200, description: 'Estado civil desactivado' })
  remove(@Param('id') id: string) {
    return this.estadoCivilService.remove(parsePositiveInt(id));
  }
}
