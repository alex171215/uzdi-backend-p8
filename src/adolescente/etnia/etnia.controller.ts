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
import { EtniaService } from './etnia.service';
import { CreateEtniaDto } from './dto/create-etnia.dto';
import { UpdateEtniaDto } from './dto/update-etnia.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@Controller('etnia')
@UseGuards(RolesGuard)
export class EtniaController {
  constructor(private readonly etniaService: EtniaService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createEtniaDto: CreateEtniaDto) {
    return this.etniaService.create(createEtniaDto);
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
    return this.etniaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.etniaService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateEtniaDto: UpdateEtniaDto) {
    return this.etniaService.update(parsePositiveInt(id), updateEtniaDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.etniaService.remove(parsePositiveInt(id));
  }
}
