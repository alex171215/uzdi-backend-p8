import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CantonService } from './canton.service';
import { CreateCantonDto } from './dto/create-canton.dto';
import { UpdateCantonDto } from './dto/update-canton.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';
import { FilterCantonDto } from './dto/filter-canton.dto';

@Controller('canton')
@UseGuards(RolesGuard)
export class CantonController {
  constructor(private readonly cantonService: CantonService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createCantonDto: CreateCantonDto) {
    return this.cantonService.create(createCantonDto);
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
  findAll(@Query() query: FilterCantonDto) {
    return this.cantonService.findAll(
      query.prov_id ? parsePositiveInt(query.prov_id) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cantonService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateCantonDto: UpdateCantonDto) {
    return this.cantonService.update(parsePositiveInt(id), updateCantonDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.cantonService.remove(parsePositiveInt(id));
  }
}
