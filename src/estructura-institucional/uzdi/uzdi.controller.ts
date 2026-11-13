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
import { UzdiService } from './uzdi.service';
import { CreateUzdiDto } from './dto/create-uzdi.dto';
import { UpdateUzdiDto } from './dto/update-uzdi.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';
import { FilterUzdiDto } from './dto/filter-uzdi.dto';

@ApiTags('Estructura Institucional - Sedes UZDI')
@ApiBearerAuth('JWT-auth')
@Controller('uzdi')
@UseGuards(RolesGuard)
export class UzdiController {
  constructor(private readonly uzdiService: UzdiService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva sede UZDI' })
  @ApiResponse({ status: 201, description: 'Sede UZDI creada exitosamente' })
  create(@Body() createUzdiDto: CreateUzdiDto) {
    return this.uzdiService.create(createUzdiDto);
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
  @ApiOperation({ summary: 'Listar todas las sedes UZDI activas (filtrable por cntn_id)' })
  @ApiQuery({ name: 'cntn_id', required: false, type: Number, description: 'Filtrar por ID de cantón' })
  @ApiResponse({ status: 200, description: 'Listado de sedes UZDI' })
  findAll(@Query() query: FilterUzdiDto) {
    return this.uzdiService.findAll(
      query.cntn_id ? parsePositiveInt(query.cntn_id) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una sede UZDI por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la sede UZDI' })
  findOne(@Param('id') id: string) {
    return this.uzdiService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una sede UZDI' })
  @ApiResponse({ status: 200, description: 'Sede UZDI actualizada exitosamente' })
  update(@Param('id') id: string, @Body() updateUzdiDto: UpdateUzdiDto) {
    return this.uzdiService.update(parsePositiveInt(id), updateUzdiDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente una sede UZDI' })
  @ApiResponse({ status: 200, description: 'Sede UZDI desactivada' })
  remove(@Param('id') id: string) {
    return this.uzdiService.remove(parsePositiveInt(id));
  }
}
