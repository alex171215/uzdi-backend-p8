import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepresentanteService } from './representante.service';
import { RepresentanteController } from './representante.controller';
import { Representante } from './entities/representante.entity';
import { Canton } from '../../estructura-institucional/canton/entities/canton.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Representante, Canton])],
  controllers: [RepresentanteController],
  providers: [RepresentanteService],
  exports: [RepresentanteService],
})
export class RepresentanteModule {}
