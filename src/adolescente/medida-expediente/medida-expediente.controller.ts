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
import { MedidaExpedienteService } from './medida-expediente.service';
import { CreateMedidaExpedienteDto } from './dto/create-medida-expediente.dto';
import { UpdateMedidaExpedienteDto } from './dto/update-medida-expediente.dto';
import { QueryMedidaExpedienteDto } from './dto/query-medida-expediente.dto';
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
const ESCRITURA = [Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.JURIDICO];

@Controller('medida-expediente')
@UseGuards(RolesGuard)
export class MedidaExpedienteController {
  constructor(
    private readonly medidaExpedienteService: MedidaExpedienteService,
  ) {}

  @Post()
  @Roles(...ESCRITURA)
  create(@Body() dto: CreateMedidaExpedienteDto) {
    return this.medidaExpedienteService.create(dto);
  }

  // filtros opcionales: ?expe_id=&mdso_id=
  @Get()
  @Roles(...LECTURA)
  findAll(@Query() query: QueryMedidaExpedienteDto) {
    return this.medidaExpedienteService.findAll(query);
  }

  @Get(':id')
  @Roles(...LECTURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidaExpedienteService.findOne(id);
  }

  @Patch(':id')
  @Roles(...ESCRITURA)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedidaExpedienteDto,
  ) {
    return this.medidaExpedienteService.update(id, dto);
  }

  @Delete(':id')
  @Roles(...ESCRITURA)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medidaExpedienteService.remove(id);
  }
}
