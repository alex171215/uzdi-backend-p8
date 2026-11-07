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
import { AdolescenteRepresentanteService } from './adolescente-representante.service';
import { CreateAdolescenteRepresentanteDto } from './dto/create-adolescente-representante.dto';
import { UpdateAdolescenteRepresentanteDto } from './dto/update-adolescente-representante.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Contexto Familiar - Adolescente Representante')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('adolescente-representante')
export class AdolescenteRepresentanteController {
  constructor(
    private readonly service: AdolescenteRepresentanteService,
  ) {}

  @Post()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
    Rol.EDUCADOR,
    Rol.JURIDICO,
  )
  @ApiOperation({ summary: 'Vincular un representante legal o tutor a un adolescente' })
  @ApiResponse({ status: 201, description: 'Vínculo creado exitosamente' })
  create(@Body() createDto: CreateAdolescenteRepresentanteDto) {
    return this.service.create(createDto);
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
  @ApiOperation({ summary: 'Listar todos los vínculos de adolescentes y representantes' })
  @ApiResponse({ status: 200, description: 'Listado de vínculos' })
  findAll() {
    return this.service.findAll();
  }

  @Get('adolescente/:adlc_id')
  @ApiOperation({ summary: 'Listar los representantes legales asociados a un adolescente' })
  @ApiResponse({ status: 200, description: 'Representantes del adolescente' })
  findByAdolescente(@Param('adlc_id') adlc_id: string) {
    return this.service.findByAdolescente(parsePositiveInt(adlc_id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un vínculo por su ID' })
  @ApiResponse({ status: 200, description: 'Vínculo encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
  )
  @ApiOperation({ summary: 'Actualizar un vínculo adolescente-representante' })
  @ApiResponse({ status: 200, description: 'Vínculo actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdolescenteRepresentanteDto,
  ) {
    return this.service.update(parsePositiveInt(id), updateDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Inactivar vínculo adolescente-representante (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Vínculo inactivado' })
  remove(@Param('id') id: string) {
    return this.service.remove(parsePositiveInt(id));
  }
}
