import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PersonaService } from './persona.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '../../common/enums/rol.enum';

@ApiTags('Usuarios y Seguridad')
@ApiBearerAuth('JWT-auth')
@Controller('persona')
@Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar personas activas (para altas usar POST /users)',
  })
  findAll() {
    return this.personaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una persona' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findOne(id);
  }
}
