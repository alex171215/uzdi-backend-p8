import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdolescenteService } from './adolescente.service';
import { CreateAdolescenteDto } from './dto/create-adolescente.dto';
import { UpdateAdolescenteDto } from './dto/update-adolescente.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Adolescentes')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('adolescente')
export class AdolescenteController {
  constructor(private readonly adolescenteService: AdolescenteService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Registrar un nuevo adolescente' })
  @ApiResponse({ status: 201, description: 'Adolescente registrado exitosamente' })
  create(@Body() createAdolescenteDto: CreateAdolescenteDto) {
    return this.adolescenteService.create(createAdolescenteDto);
  }

  @Get()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
    Rol.EDUCADOR,
    Rol.JURIDICO,
  )
  @ApiOperation({ summary: 'Listar todos los adolescentes activos' })
  @ApiResponse({ status: 200, description: 'Listado de adolescentes' })
  findAll() {
    return this.adolescenteService.findAll();
  }

  @Get('search')
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
    Rol.EDUCADOR,
    Rol.JURIDICO,
  )
  @ApiOperation({ summary: 'Buscar adolescentes activos por coincidencia en nombre, apellido o cédula' })
  @ApiQuery({ name: 'q', required: true, description: 'Texto de búsqueda (nombre, apellido o cédula)' })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda' })
  search(@Query('q') q: string) {
    return this.adolescenteService.search(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar ficha de adolescente por ID' })
  @ApiResponse({ status: 200, description: 'Adolescente encontrado' })
  findOne(@Param('id') id: string) {
    return this.adolescenteService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar datos de un adolescente' })
  @ApiResponse({ status: 200, description: 'Adolescente actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateAdolescenteDto: UpdateAdolescenteDto,
  ) {
    return this.adolescenteService.update(
      parsePositiveInt(id),
      updateAdolescenteDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Inactivar adolescente (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Adolescente inactivado' })
  remove(@Param('id') id: string) {
    return this.adolescenteService.remove(parsePositiveInt(id));
  }
}
