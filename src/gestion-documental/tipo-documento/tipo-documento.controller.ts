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
import { TipoDocumentoService } from './tipo-documento.service';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Gestión Documental - Tipos de Documento')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('tipo-documento')
export class TipoDocumentoController {
  constructor(private readonly tipoDocumentoService: TipoDocumentoService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.JURIDICO)
  @ApiOperation({ summary: 'Registrar un nuevo tipo de documento' })
  @ApiResponse({ status: 201, description: 'Tipo de documento creado' })
  create(@Body() createTipoDocumentoDto: CreateTipoDocumentoDto) {
    return this.tipoDocumentoService.create(createTipoDocumentoDto);
  }

  @Get()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.JURIDICO,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
    Rol.EDUCADOR,
  )
  @ApiOperation({ summary: 'Listar todos los tipos de documento activos' })
  @ApiResponse({ status: 200, description: 'Listado de tipos de documento' })
  findAll() {
    return this.tipoDocumentoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar tipo de documento por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de documento encontrado' })
  findOne(@Param('id') id: string) {
    return this.tipoDocumentoService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.JURIDICO)
  @ApiOperation({ summary: 'Actualizar tipo de documento' })
  @ApiResponse({ status: 200, description: 'Tipo de documento actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateTipoDocumentoDto: UpdateTipoDocumentoDto,
  ) {
    return this.tipoDocumentoService.update(
      parsePositiveInt(id),
      updateTipoDocumentoDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Inactivar tipo de documento (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Tipo de documento inactivado' })
  remove(@Param('id') id: string) {
    return this.tipoDocumentoService.remove(parsePositiveInt(id));
  }
}
