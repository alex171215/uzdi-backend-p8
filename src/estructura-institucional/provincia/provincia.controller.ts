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
import { ProvinciaService } from './provincia.service';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@Controller('provincia')
@UseGuards(RolesGuard)
export class ProvinciaController {
  constructor(private readonly provinciaService: ProvinciaService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createProvinciaDto: CreateProvinciaDto) {
    return this.provinciaService.create(createProvinciaDto);
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
    return this.provinciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.provinciaService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(
    @Param('id') id: string,
    @Body() updateProvinciaDto: UpdateProvinciaDto,
  ) {
    return this.provinciaService.update(
      parsePositiveInt(id),
      updateProvinciaDto,
    );
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.provinciaService.remove(parsePositiveInt(id));
  }
}
