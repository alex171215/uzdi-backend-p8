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

@Controller('expediente')
@UseGuards(RolesGuard)
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedienteService.create(createExpedienteDto);
  }

  // filtros opcionales: ?adlc_id=&infc_id=&uzdi_id=
  @Get()
  @Roles(...LECTURA)
  findAll(@Query() query: QueryExpedienteDto) {
    return this.expedienteService.findAll(query);
  }

  // trae el expediente con sus medidas ordenadas
  @Get(':id')
  @Roles(...LECTURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpedienteDto: UpdateExpedienteDto,
  ) {
    return this.expedienteService.update(id, updateExpedienteDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.remove(id);
  }
}
