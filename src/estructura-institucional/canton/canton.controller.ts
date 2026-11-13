import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CantonService } from './canton.service';
import { CreateCantonDto } from './dto/create-canton.dto';
import { UpdateCantonDto } from './dto/update-canton.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';
import { FilterCantonDto } from './dto/filter-canton.dto';

@ApiTags('Estructura Institucional - Cantones')
@ApiBearerAuth('JWT-auth')
@Controller('canton')
@UseGuards(RolesGuard)
export class CantonController {
  constructor(private readonly cantonService: CantonService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo cantón' })
  @ApiResponse({ status: 201, description: 'Cantón creado exitosamente' })
  create(@Body() createCantonDto: CreateCantonDto) {
    return this.cantonService.create(createCantonDto);
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
  @ApiOperation({ summary: 'Listar todos los cantones activos (filtrable por prov_id)' })
  @ApiQuery({ name: 'prov_id', required: false, type: Number, description: 'Filtrar por ID de provincia' })
  @ApiResponse({ status: 200, description: 'Listado de cantones' })
  findAll(@Query() query: FilterCantonDto) {
    return this.cantonService.findAll(
      query.prov_id ? parsePositiveInt(query.prov_id) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un cantón por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del cantón' })
  findOne(@Param('id') id: string) {
    return this.cantonService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un cantón existente' })
  @ApiResponse({ status: 200, description: 'Cantón actualizado exitosamente' })
  update(@Param('id') id: string, @Body() updateCantonDto: UpdateCantonDto) {
    return this.cantonService.update(parsePositiveInt(id), updateCantonDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente un cantón' })
  @ApiResponse({ status: 200, description: 'Cantón desactivado' })
  remove(@Param('id') id: string) {
    return this.cantonService.remove(parsePositiveInt(id));
  }
}
