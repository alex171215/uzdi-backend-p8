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
import { TipoParentescoService } from './tipo-parentesco.service';
import { CreateTipoParentescoDto } from './dto/create-tipo-parentesco.dto';
import { UpdateTipoParentescoDto } from './dto/update-tipo-parentesco.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Contexto Familiar - Tipos de Parentesco')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('tipo-parentesco')
export class TipoParentescoController {
  constructor(private readonly tipoParentescoService: TipoParentescoService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear nuevo tipo de parentesco' })
  @ApiResponse({ status: 201, description: 'Tipo de parentesco creado' })
  create(@Body() createTipoParentescoDto: CreateTipoParentescoDto) {
    return this.tipoParentescoService.create(createTipoParentescoDto);
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
  @ApiOperation({ summary: 'Listar todos los tipos de parentesco activos' })
  @ApiResponse({ status: 200, description: 'Listado de parentescos' })
  findAll() {
    return this.tipoParentescoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de parentesco por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de parentesco encontrado' })
  findOne(@Param('id') id: string) {
    return this.tipoParentescoService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar tipo de parentesco' })
  @ApiResponse({ status: 200, description: 'Tipo de parentesco actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateTipoParentescoDto: UpdateTipoParentescoDto,
  ) {
    return this.tipoParentescoService.update(
      parsePositiveInt(id),
      updateTipoParentescoDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Inactivar tipo de parentesco (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Tipo de parentesco inactivado' })
  remove(@Param('id') id: string) {
    return this.tipoParentescoService.remove(parsePositiveInt(id));
  }
}
