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
import { GdoService } from './gdo.service';
import { CreateGdoDto } from './dto/create-gdo.dto';
import { UpdateGdoDto } from './dto/update-gdo.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Catálogos - Grupos Delictivos Organizados (GDO)')
@ApiBearerAuth('JWT-auth')
@Controller('gdo')
@UseGuards(RolesGuard)
export class GdoController {
  constructor(private readonly gdoService: GdoService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Registrar un nuevo GDO en catálogo' })
  @ApiResponse({ status: 201, description: 'GDO registrado exitosamente' })
  create(@Body() createGdoDto: CreateGdoDto) {
    return this.gdoService.create(createGdoDto);
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
  @ApiOperation({ summary: 'Listar GDOs activos' })
  @ApiResponse({ status: 200, description: 'Listado de GDOs' })
  findAll() {
    return this.gdoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un GDO por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del GDO' })
  findOne(@Param('id') id: string) {
    return this.gdoService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un GDO' })
  @ApiResponse({ status: 200, description: 'GDO actualizado exitosamente' })
  update(@Param('id') id: string, @Body() updateGdoDto: UpdateGdoDto) {
    return this.gdoService.update(parsePositiveInt(id), updateGdoDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente un GDO' })
  @ApiResponse({ status: 200, description: 'GDO desactivado' })
  remove(@Param('id') id: string) {
    return this.gdoService.remove(parsePositiveInt(id));
  }
}
