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
import { RepresentanteService } from './representante.service';
import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Contexto Familiar - Representantes')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('representante')
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Post()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
    Rol.EDUCADOR,
    Rol.JURIDICO,
  )
  @ApiOperation({ summary: 'Registrar nuevo representante legal o tutor' })
  @ApiResponse({ status: 201, description: 'Representante registrado' })
  create(@Body() createRepresentanteDto: CreateRepresentanteDto) {
    return this.representanteService.create(createRepresentanteDto);
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
  @ApiOperation({ summary: 'Listar todos los representantes activos' })
  @ApiResponse({ status: 200, description: 'Listado de representantes' })
  findAll() {
    return this.representanteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar representante por ID' })
  @ApiResponse({ status: 200, description: 'Representante encontrado' })
  findOne(@Param('id') id: string) {
    return this.representanteService.findOne(parsePositiveInt(id));
  }

  @Get('cedula/:cedula')
  @ApiOperation({ summary: 'Consultar representante por número de cédula' })
  @ApiResponse({ status: 200, description: 'Representante encontrado' })
  findByCedula(@Param('cedula') cedula: string) {
    return this.representanteService.findByCedula(cedula);
  }

  @Patch(':id')
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
  )
  @ApiOperation({ summary: 'Actualizar datos de un representante' })
  @ApiResponse({ status: 200, description: 'Representante actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateRepresentanteDto: UpdateRepresentanteDto,
  ) {
    return this.representanteService.update(
      parsePositiveInt(id),
      updateRepresentanteDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Inactivar representante (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Representante inactivado' })
  remove(@Param('id') id: string) {
    return this.representanteService.remove(parsePositiveInt(id));
  }
}
