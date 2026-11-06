import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Adolescente } from '../adolescente/adolescente/entities/adolescente.entity';
import { Expediente } from '../adolescente/expediente/entities/expediente.entity';
import { Uzdi } from '../estructura-institucional/uzdi/entities/uzdi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Adolescente, Expediente, Uzdi])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
