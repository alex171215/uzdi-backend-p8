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
import { EtniaService } from './etnia.service';
import { CreateEtniaDto } from './dto/create-etnia.dto';
import { UpdateEtniaDto } from './dto/update-etnia.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

@ApiTags('Catálogos - Etnias')
@ApiBearerAuth('JWT-auth')
@Controller('etnia')
@UseGuards(RolesGuard)
export class EtniaController {
  constructor(private readonly etniaService: EtniaService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva etnia' })
  @ApiResponse({ status: 201, description: 'Etnia creada exitosamente' })
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
  @ApiOperation({ summary: 'Listar etnias activas' })
  @ApiResponse({ status: 200, description: 'Listado de etnias' })
  findAll() {
    return this.etniaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una etnia por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la etnia' })
  findOne(@Param('id') id: string) {
    return this.etniaService.findOne(parsePositiveInt(id));
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una etnia' })
  @ApiResponse({ status: 200, description: 'Etnia actualizada exitosamente' })
  update(@Param('id') id: string, @Body() updateEtniaDto: UpdateEtniaDto) {
    return this.etniaService.update(parsePositiveInt(id), updateEtniaDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar lógicamente una etnia' })
  @ApiResponse({ status: 200, description: 'Etnia desactivada' })
  remove(@Param('id') id: string) {
    return this.etniaService.remove(parsePositiveInt(id));
  }
}
