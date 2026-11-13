import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { QueryExpedienteDto } from './dto/query-expediente.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

const LECTURA = [
  Rol.ADMINISTRADOR,
  Rol.SUPERADMINISTRADOR,
  Rol.TRABAJADOR_SOCIAL,
  Rol.PSICOLOGO,
  Rol.EDUCADOR,
  Rol.JURIDICO,
];

@ApiTags('Expedientes Judiciales')
@ApiBearerAuth('JWT-auth')
@Controller('expediente')
@UseGuards(RolesGuard)
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Aperturar un nuevo expediente judicial' })
  @ApiResponse({ status: 201, description: 'Expediente creado exitosamente' })
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedienteService.create(createExpedienteDto);
  }

  // filtros opcionales: ?adlc_id=&infc_id=&uzdi_id=
  @Get()
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Listar expedientes judiciales con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de expedientes' })
  findAll(@Query() query: QueryExpedienteDto) {
    return this.expedienteService.findAll(query);
  }

  // trae el expediente con sus medidas ordenadas
  @Get(':id')
  @Roles(...LECTURA)
  @ApiOperation({ summary: 'Obtener detalle de un expediente con sus medidas socioeducativas' })
  @ApiResponse({ status: 200, description: 'Detalle del expediente' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un expediente judicial' })
  @ApiResponse({ status: 200, description: 'Expediente actualizado exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpedienteDto: UpdateExpedienteDto,
  ) {
    return this.expedienteService.update(id, updateExpedienteDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente un expediente judicial' })
  @ApiResponse({ status: 200, description: 'Expediente desactivado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.remove(id);
  }
}
