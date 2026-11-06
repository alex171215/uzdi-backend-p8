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
import { UzdiService } from './uzdi.service';
import { CreateUzdiDto } from './dto/create-uzdi.dto';
import { UpdateUzdiDto } from './dto/update-uzdi.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';
import { FilterUzdiDto } from './dto/filter-uzdi.dto';

@Controller('uzdi')
@UseGuards(RolesGuard)
export class UzdiController {
  constructor(private readonly uzdiService: UzdiService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  create(@Body() createUzdiDto: CreateUzdiDto) {
    return this.uzdiService.create(createUzdiDto);
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
  findAll(@Query() query: FilterUzdiDto) {
    return this.uzdiService.findAll(
      query.cntn_id ? parsePositiveInt(query.cntn_id) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uzdiService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  update(@Param('id') id: string, @Body() updateUzdiDto: UpdateUzdiDto) {
    return this.uzdiService.update(parsePositiveInt(id), updateUzdiDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.uzdiService.remove(parsePositiveInt(id));
  }
}
