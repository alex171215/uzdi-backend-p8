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
import { NacionalidadService } from './nacionalidad.service';
import { CreateNacionalidadDto } from './dto/create-nacionalidad.dto';
import { UpdateNacionalidadDto } from './dto/update-nacionalidad.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@Controller('nacionalidad')
@UseGuards(RolesGuard)
export class NacionalidadController {
  constructor(private readonly nacionalidadService: NacionalidadService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createNacionalidadDto: CreateNacionalidadDto) {
    return this.nacionalidadService.create(createNacionalidadDto);
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
    return this.nacionalidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nacionalidadService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(
    @Param('id') id: string,
    @Body() updateNacionalidadDto: UpdateNacionalidadDto,
  ) {
    return this.nacionalidadService.update(
      parsePositiveInt(id),
      updateNacionalidadDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.nacionalidadService.remove(parsePositiveInt(id));
  }
}
