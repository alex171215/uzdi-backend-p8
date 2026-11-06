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
import { EstadoCivilService } from './estado-civil.service';
import { CreateEstadoCivilDto } from './dto/create-estado-civil.dto';
import { UpdateEstadoCivilDto } from './dto/update-estado-civil.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@Controller('estado-civil')
@UseGuards(RolesGuard)
export class EstadoCivilController {
  constructor(private readonly estadoCivilService: EstadoCivilService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createEstadoCivilDto: CreateEstadoCivilDto) {
    return this.estadoCivilService.create(createEstadoCivilDto);
  }

  @Get()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.TRABAJADOR_SOCIAL,
    Rol.PSICOLOGO,
    Rol.EDUCADOR,
    Rol.JURIDICO,
  )
  findAll() {
    return this.estadoCivilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoCivilService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(
    @Param('id') id: string,
    @Body() updateEstadoCivilDto: UpdateEstadoCivilDto,
  ) {
    return this.estadoCivilService.update(
      parsePositiveInt(id),
      updateEstadoCivilDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.estadoCivilService.remove(parsePositiveInt(id));
  }
}
