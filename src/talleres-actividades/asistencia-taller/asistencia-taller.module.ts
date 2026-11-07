import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciaTallerService } from './asistencia-taller.service';
import { AsistenciaTallerController } from './asistencia-taller.controller';
import { AsistenciaTaller } from './entities/asistencia-taller.entity';
import { Taller } from '../taller/entities/taller.entity';
import { Adolescente } from '../../adolescente/adolescente/entities/adolescente.entity';
import { AdolescenteRepresentante } from '../../contexto-familiar/adolescente-representante/entities/adolescente-representante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AsistenciaTaller,
      Taller,
      Adolescente,
      AdolescenteRepresentante,
    ]),
  ],
  controllers: [AsistenciaTallerController],
  providers: [AsistenciaTallerService],
  exports: [AsistenciaTallerService],
})
export class AsistenciaTallerModule {}
