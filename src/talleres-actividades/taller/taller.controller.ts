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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TallerService } from './taller.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Talleres y Actividades - Talleres')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('taller')
export class TallerController {
  constructor(private readonly tallerService: TallerService) {}

  @Post()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.EDUCADOR,
    Rol.PSICOLOGO,
    Rol.TRABAJADOR_SOCIAL,
  )
  @ApiOperation({ summary: 'Planificar y registrar un nuevo taller formativo' })
  @ApiResponse({ status: 201, description: 'Taller registrado' })
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.create(createTallerDto);
  }

  @Get()
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.COORDINADOR,
    Rol.EDUCADOR,
    Rol.PSICOLOGO,
    Rol.TRABAJADOR_SOCIAL,
    Rol.JURIDICO,
  )
  @ApiOperation({ summary: 'Listar todos los talleres activos' })
  @ApiResponse({ status: 200, description: 'Listado de talleres' })
  findAll() {
    return this.tallerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar información detallada de un taller por ID' })
  @ApiResponse({ status: 200, description: 'Taller encontrado' })
  findOne(@Param('id') id: string) {
    return this.tallerService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(
    Rol.ADMINISTRADOR,
    Rol.SUPERADMINISTRADOR,
    Rol.EDUCADOR,
    Rol.PSICOLOGO,
    Rol.TRABAJADOR_SOCIAL,
  )
  @ApiOperation({ summary: 'Actualizar información de un taller' })
  @ApiResponse({ status: 200, description: 'Taller actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateTallerDto: UpdateTallerDto,
  ) {
    return this.tallerService.update(parsePositiveInt(id), updateTallerDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR)
  @ApiOperation({ summary: 'Inactivar taller (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Taller inactivado' })
  remove(@Param('id') id: string) {
    return this.tallerService.remove(parsePositiveInt(id));
  }
}
