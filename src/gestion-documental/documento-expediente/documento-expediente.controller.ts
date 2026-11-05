import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DocumentoExpedienteService } from './documento-expediente.service';
import { CreateDocumentoExpedienteDto } from './dto/create-documento-expediente.dto';
import { UpdateDocumentoExpedienteDto } from './dto/update-documento-expediente.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@Controller('documento-expediente')
@UseGuards(RolesGuard)
export class DocumentoExpedienteController {
  constructor(private readonly documentoExpedienteService: DocumentoExpedienteService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createDocumentoExpedienteDto: CreateDocumentoExpedienteDto) {
    return this.documentoExpedienteService.create(createDocumentoExpedienteDto);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO, Rol.EDUCADOR, Rol.JURIDICO)
  findAll() {
    return this.documentoExpedienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentoExpedienteService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateDocumentoExpedienteDto: UpdateDocumentoExpedienteDto) {
    return this.documentoExpedienteService.update(+id, updateDocumentoExpedienteDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.documentoExpedienteService.remove(+id);
  }
}
