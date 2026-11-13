import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { Expediente } from './entities/expediente.entity';
import { Infraccion } from '../infraccion/entities/infraccion.entity';
import { Adolescente } from '../adolescente/entities/adolescente.entity';
import { Uzdi } from '../../estructura-institucional/uzdi/entities/uzdi.entity';

// Modulo para la gestion de causas judiciales y expedientes
@Module({
  imports: [TypeOrmModule.forFeature([Expediente, Infraccion, Adolescente, Uzdi])],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
  exports: [ExpedienteService],
})
export class ExpedienteModule {}
