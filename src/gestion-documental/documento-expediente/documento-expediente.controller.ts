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
import { DocumentoExpedienteService } from './documento-expediente.service';
import { CreateDocumentoExpedienteDto } from './dto/create-documento-expediente.dto';
import { UpdateDocumentoExpedienteDto } from './dto/update-documento-expediente.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Gestión Documental - Documentos del Expediente')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('documento-expediente')
export class DocumentoExpedienteController {
  constructor(private readonly service: DocumentoExpedienteService) {}

  @Post()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.JURIDICO,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
  )
  @ApiOperation({ summary: 'Registrar documento o evidencia en un expediente judicial' })
  @ApiResponse({ status: 201, description: 'Documento registrado exitosamente' })
  create(@Body() createDto: CreateDocumentoExpedienteDto) {
    return this.service.create(createDto);
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
  @ApiOperation({ summary: 'Listar todos los documentos de expedientes activos' })
  @ApiResponse({ status: 200, description: 'Listado de documentos' })
  findAll() {
    return this.service.findAll();
  }

  @Get('expediente/:expe_id')
  @ApiOperation({ summary: 'Listar documentos vinculados a un expediente específico' })
  @ApiResponse({ status: 200, description: 'Documentos del expediente' })
  findByExpediente(@Param('expe_id') expe_id: string) {
    return this.service.findByExpediente(parsePositiveInt(expe_id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar documento de expediente por ID' })
  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.JURIDICO,
    Rol.TRABAJADOR_SOCIAL,
  )
  @ApiOperation({ summary: 'Actualizar estado de trámite o datos del documento' })
  @ApiResponse({ status: 200, description: 'Documento actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentoExpedienteDto,
  ) {
    return this.service.update(parsePositiveInt(id), updateDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR, Rol.JURIDICO)
  @ApiOperation({ summary: 'Inactivar documento de expediente (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Documento inactivado' })
  remove(@Param('id') id: string) {
    return this.service.remove(parsePositiveInt(id));
  }
}
