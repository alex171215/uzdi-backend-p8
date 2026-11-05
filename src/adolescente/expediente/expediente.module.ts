import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { Expediente } from './entities/expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente])],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
  exports: [ExpedienteService]
})
export class ExpedienteModule {}
